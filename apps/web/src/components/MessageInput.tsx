'use client';

import { useState, useRef } from 'react';
import { SendIcon } from './Icons';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="p-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter nueva línea)"
          className="flex-1 resize-none"
          rows={1}
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="px-4 py-2 rounded-lg font-medium text-white text-sm flex items-center gap-2"
          style={{
            background: message.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            opacity: message.trim() ? 1 : 0.5,
          }}
        >
          <SendIcon size={16} />
          Enviar
        </button>
      </div>
    </div>
  );
}
