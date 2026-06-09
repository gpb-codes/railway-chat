'use client';

import { useEffect, useRef, useState } from 'react';
import { formatTime } from '@/lib/utils';
import { SmileIcon, ReplyIcon, TrashIcon, EditIcon } from './Icons';

interface MessageListProps {
  messages: any[];
  currentUser: any;
  onDelete?: (id: string) => void;
}

export default function MessageList({ messages, currentUser, onDelete }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const isSystemMessage = (msg: any) => msg.type === 'join' || msg.type === 'leave';

  const shouldShowHeader = (msg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    if (isSystemMessage(msg) || isSystemMessage(prevMsg)) return true;
    if (msg.userId !== prevMsg.userId && msg.user?.id !== prevMsg.user?.id) return true;
    const timeDiff = new Date(msg.timestamp || msg.createdAt).getTime() - new Date(prevMsg.timestamp || prevMsg.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000;
  };

  const quickEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀'];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Sin mensajes aun
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Envia el primer mensaje para iniciar la conversacion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((msg, i) => {
          if (isSystemMessage(msg)) {
            return (
              <div key={msg.id || i} className="text-center py-3 animate-fade-in">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  {msg.content}
                </span>
              </div>
            );
          }

          const isOwn = msg.userId === currentUser?.id || msg.user?.id === currentUser?.id;
          const showHeader = shouldShowHeader(msg, messages[i - 1]);
          const isHovered = hoveredMessage === (msg.id || i);

          return (
            <div
              key={msg.id || i}
              className="group relative animate-fade-in"
              onMouseEnter={() => setHoveredMessage(msg.id || i)}
              onMouseLeave={() => { setHoveredMessage(null); setShowEmojiPicker(null); }}
            >
              {showHeader && (
                <div className={`flex items-start gap-3 pt-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      background: isOwn ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {(msg.user?.username || msg.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                      <span className="text-sm font-semibold" style={{ color: isOwn ? 'var(--accent-hover)' : 'var(--text-primary)' }}>
                        {msg.user?.username || msg.username}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(msg.timestamp || msg.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      style={{
                        background: isOwn ? 'var(--message-own)' : 'var(--message-other)',
                        wordBreak: 'break-word',
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!showHeader && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] group/msg relative ${isOwn ? 'ml-12' : 'ml-12'}`}>
                    <div
                      className="inline-block rounded-2xl px-4 py-1.5 transition-colors duration-150"
                      style={{
                        background: isHovered
                          ? (isOwn ? 'var(--message-own-hover)' : 'var(--message-other-hover)')
                          : (isOwn ? 'var(--message-own)' : 'var(--message-other)'),
                        wordBreak: 'break-word',
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>
                        {msg.content}
                      </p>
                    </div>

                    {isHovered && (
                      <div
                        className="absolute -top-2 flex gap-1 p-1 rounded-lg animate-fade-in"
                        style={{
                          [isOwn ? 'right' : 'left']: '0',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      >
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <SmileIcon size={14} />
                        </button>
                        <button
                          className="p-1.5 rounded-md transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <ReplyIcon size={14} />
                        </button>
                        {isOwn && (
                          <>
                            <button
                              className="p-1.5 rounded-md transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              onClick={() => onDelete?.(msg.id)}
                              className="p-1.5 rounded-md transition-colors"
                              style={{ color: 'var(--danger)' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-muted)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {showEmojiPicker === msg.id && (
                      <div
                        className="absolute -top-12 flex gap-1 p-2 rounded-xl animate-slide-up z-10"
                        style={{
                          [isOwn ? 'right' : 'left']: '0',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                      >
                        {quickEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            className="text-lg hover:scale-125 transition-transform p-1"
                            onClick={() => setShowEmojiPicker(null)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
