'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ChatSocket, OnlineUser } from '@/lib/websocket';
import ChatSidebar from '@/components/ChatSidebar';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import UserList from '@/components/UserList';
import { UsersIcon } from '@/components/Icons';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const sock = new ChatSocket(WS_URL);
    sock.connect(user.username, user.id);

    sock.on('message', (msg: any) => {
      if (msg.type === 'online_users') {
        setOnlineUsers(msg.users);
      } else {
        const normalized = {
          id: msg.id || crypto.randomUUID(),
          type: msg.type || 'message',
          content: msg.content,
          username: msg.username || msg.user?.username || 'unknown',
          userId: msg.userId || msg.user?.id || '',
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          user: msg.user || { id: msg.userId, username: msg.username },
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev;
          return [...prev, normalized];
        });
      }
    });

    sock.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    setSocket(sock);

    return () => sock.disconnect();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api.getChannels().then((data) => {
      setChannels([...data.joined, ...data.available]);
      if (data.joined.length > 0 && !activeChannel) {
        setActiveChannel(data.joined[0].id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeChannel) return;
    socket?.joinRoom(activeChannel);
    api.getMessages(activeChannel).then(setMessages);
  }, [activeChannel, socket]);

  const handleSendMessage = async (content: string) => {
    if (!socket || !activeChannel) return;
    try {
      const saved = await api.sendMessage(activeChannel, content);
      const msg = {
        id: saved.id,
        type: 'message',
        content: saved.content,
        username: saved.user?.username || user.username,
        userId: saved.user?.id || user.id,
        timestamp: saved.createdAt,
        user: saved.user,
      };
      setMessages((prev) => [...prev, msg]);
      socket.sendMessage(activeChannel, msg);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleCreateChannel = async (name: string) => {
    const ch = await api.createChannel(name);
    setChannels((prev) => [...prev, ch]);
    setActiveChannel(ch.id);
  };

  if (!user) return null;

  return (
    <div className="h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <ChatSidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        onCreateChannel={handleCreateChannel}
        username={user.username}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div>
            <h2 className="font-semibold"># {channels.find(c => c.id === activeChannel)?.name || 'Seleccionar canal'}</h2>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {onlineUsers.length} usuario(s) online
            </span>
          </div>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 rounded-lg"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <UsersIcon size={18} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <MessageList messages={messages} currentUser={user} />
            <MessageInput onSend={handleSendMessage} />
          </div>

          {showUsers && (
            <UserList users={onlineUsers} />
          )}
        </div>
      </div>
    </div>
  );
}
