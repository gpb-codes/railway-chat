'use client';

import { useEffect, useRef } from 'react';
import { formatTime } from '@/lib/utils';

interface MessageListProps {
  messages: any[];
  currentUser: any;
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isSystemMessage = (msg: any) => msg.type === 'join' || msg.type === 'leave';

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        <p>No hay mensajes aún. ¡Envía el primero!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, i) => {
        if (isSystemMessage(msg)) {
          return (
            <div key={i} className="text-center text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
              {msg.content}
            </div>
          );
        }

        const isOwn = msg.userId === currentUser?.id;

        return (
          <div
            key={msg.id || i}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-xl px-4 py-2 ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
              style={{
                background: isOwn ? 'var(--message-own)' : 'var(--message-other)',
              }}
            >
              {!isOwn && (
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                  {msg.username || msg.user?.username}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className="text-[10px] mt-1 opacity-60 text-right">
                {formatTime(msg.timestamp || msg.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
