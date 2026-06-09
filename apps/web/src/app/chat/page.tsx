'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ChatSocket, OnlineUser } from '@/lib/websocket';
import ChatSidebar from '@/components/ChatSidebar';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import UserList from '@/components/UserList';
import TypingIndicator from '@/components/TypingIndicator';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ToastContainer, { Toast } from '@/components/ToastContainer';
import { UsersIcon, SearchIcon, CloseIcon, MenuIcon } from '@/components/Icons';

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(stored));
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    setConnectionStatus('connecting');
    const sock = new ChatSocket(WS_URL);
    sock.connect(user.username, user.id);

    sock.on('message', (msg: any) => {
      if (msg.type === 'online_users') {
        setOnlineUsers(msg.users);
      } else if (msg.type === 'typing') {
        if (msg.userId !== user.id) {
          setTypingUsers((prev) => {
            if (!prev.includes(msg.username)) {
              return [...prev, msg.username];
            }
            return prev;
          });
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== msg.username));
          }, 3000);
        }
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

    sock.on('open', () => {
      setConnectionStatus('connected');
    });

    sock.on('close', () => {
      setConnectionStatus('error');
    });

    sock.on('error', () => {
      setConnectionStatus('error');
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
    }).catch(() => {
      addToast('Error al cargar canales', 'error');
    });
  }, [user, activeChannel, addToast]);

  useEffect(() => {
    if (!activeChannel) return;
    socket?.joinRoom(activeChannel);
    setIsSearching(false);
    setSearchResults([]);
    api.getMessages(activeChannel).then(setMessages).catch(() => {
      addToast('Error al cargar mensajes', 'error');
    });
  }, [activeChannel, socket, addToast]);

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
      addToast('Error al enviar mensaje', 'error');
    }
  };

  const handleCreateChannel = async (name: string) => {
    try {
      const ch = await api.createChannel(name);
      setChannels((prev) => [...prev, ch]);
      setActiveChannel(ch.id);
      addToast(`Canal "${name}" creado`, 'success');
    } catch (err) {
      addToast('Error al crear canal', 'error');
    }
  };

  const handleSearch = async (query: string) => {
    if (!activeChannel) return;
    setIsSearching(true);
    try {
      const results = await api.searchMessages(activeChannel, query);
      setSearchResults(results);
      if (results.length === 0) {
        addToast('Sin resultados para la busqueda', 'info');
      }
    } catch (err) {
      addToast('Error al buscar mensajes', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      addToast('Mensaje eliminado', 'success');
    } catch (err) {
      addToast('Error al eliminar mensaje', 'error');
    }
  };

  const handleTyping = () => {
    socket?.sendTyping(activeChannel, user.username);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  if (!user) return null;

  const currentChannel = channels.find(c => c.id === activeChannel);
  const displayedMessages = isSearching ? searchResults : messages;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-200`}>
        <ChatSidebar
          channels={channels}
          activeChannel={activeChannel}
          onSelectChannel={(id) => {
            setActiveChannel(id);
            setShowSidebar(false);
          }}
          onCreateChannel={handleCreateChannel}
          username={user.username}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg lg:hidden transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <h2 className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent)' }}>#</span>
                {currentChannel?.name || 'Seleccionar canal'}
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: connectionStatus === 'connected' ? 'var(--success)' : connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--danger)',
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {connectionStatus === 'connected' ? `${onlineUsers.length} en linea` : connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: showSearch ? 'var(--accent)' : 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {showSearch ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
            </button>
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: showUsers ? 'var(--accent)' : 'var(--text-muted)',
                background: showUsers ? 'var(--accent-muted)' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = showUsers ? 'var(--accent-muted)' : 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = showUsers ? 'var(--accent-muted)' : 'transparent'}
            >
              <UsersIcon size={18} />
            </button>
          </div>
        </div>

        {showSearch && (
          <SearchBar
            onSearch={handleSearch}
            onClose={() => {
              setShowSearch(false);
              setSearchResults([]);
              setIsSearching(false);
            }}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {isSearching && (
              <div className="px-4 py-2 text-xs" style={{ color: 'var(--text-muted)', background: 'var(--accent-muted)' }}>
                {searchResults.length} resultado(s) encontrado(s)
              </div>
            )}

            <MessageList
              messages={displayedMessages}
              currentUser={user}
              onDelete={handleDeleteMessage}
            />

            {typingUsers.length > 0 && !isSearching && (
              <TypingIndicator usernames={typingUsers} />
            )}

            {!isSearching && (
              <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
            )}
          </div>

          {showUsers && (
            <UserList users={onlineUsers} />
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
