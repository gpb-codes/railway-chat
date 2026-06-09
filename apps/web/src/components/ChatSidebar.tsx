'use client';

import { useState } from 'react';

interface ChatSidebarProps {
  channels: any[];
  activeChannel: string;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string) => void;
  username: string;
}

export default function ChatSidebar({ channels, activeChannel, onSelectChannel, onCreateChannel, username }: ChatSidebarProps) {
  const [newChannel, setNewChannel] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (newChannel.trim()) {
      onCreateChannel(newChannel.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewChannel('');
      setShowCreate(false);
    }
  };

  return (
    <div className="w-64 flex flex-col" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>ChatApp</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>@{username}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Canales</span>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-lg leading-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            +
          </button>
        </div>

        {showCreate && (
          <div className="flex gap-1 px-2 mb-2">
            <input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="nuevo-canal"
              className="flex-1 text-xs py-1 px-2"
            />
            <button
              onClick={handleCreate}
              className="text-xs px-2 py-1 rounded"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              +
            </button>
          </div>
        )}

        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChannel(ch.id)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2"
            style={{
              background: activeChannel === ch.id ? 'var(--bg-tertiary)' : 'transparent',
              color: activeChannel === ch.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>#</span>
            <span className="truncate">{ch.name}</span>
            {ch._count && (
              <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
                {ch._count.messages}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="w-full text-sm py-2 rounded-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
