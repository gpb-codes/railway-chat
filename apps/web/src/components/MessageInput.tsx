'use client';

import { useState, useRef, useEffect } from 'react';
import { SendIcon, SmileIcon } from './Icons';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
}

export default function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const commonEmojis = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '💯', '✨', '🙌', '😎', '🤔', '😍', '🥳', '💪', '🚀', '⭐'];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      <div
        className="flex gap-2 items-end rounded-xl px-3 py-2 transition-all duration-200"
        style={{
          background: 'var(--bg-tertiary)',
          border: `1px solid ${isFocused ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isFocused ? '0 0 0 3px var(--accent-muted)' : 'none',
        }}
      >
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: showEmoji ? 'var(--accent)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SmileIcon size={20} />
          </button>

          {showEmoji && (
            <div
              className="absolute bottom-full left-0 mb-2 p-3 rounded-xl animate-slide-up z-20"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="grid grid-cols-8 gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl p-1.5 rounded-lg transition-all hover:scale-110"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Escribe un mensaje..."
          className="flex-1 resize-none bg-transparent border-0 outline-none p-1.5 text-sm"
          rows={1}
          style={{
            color: 'var(--text-primary)',
            minHeight: '24px',
            maxHeight: '120px',
            boxShadow: 'none',
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="p-2 rounded-lg text-white transition-all duration-200"
          style={{
            background: message.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
            color: message.trim() ? 'white' : 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            if (message.trim()) e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            if (message.trim()) e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          <SendIcon size={18} />
        </button>
      </div>

      <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-muted)' }}>
        <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          Enter
        </kbd>
        {' '}para enviar,{' '}
        <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          Shift+Enter
        </kbd>
        {' '}nueva linea
      </p>
    </div>
  );
}
