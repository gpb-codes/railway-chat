'use client';

import { useState } from 'react';
import { HashIcon, PlusIcon, LogoutIcon, SettingsIcon, HashIconSmall } from './Icons';

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
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  const handleCreate = () => {
    if (newChannel.trim()) {
      const slug = newChannel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (slug) {
        onCreateChannel(slug);
        setNewChannel('');
        setShowCreate(false);
      }
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-72 flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'var(--accent)' }}>
            RC
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Railway Chat
            </h1>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              @{username}
            </p>
          </div>
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Canales
          </span>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {showCreate && (
          <div className="flex gap-2 px-2 mb-3 animate-fade-in">
            <input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="nuevo-canal"
              className="flex-1 text-xs py-2 px-3"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
            >
              <PlusIcon size={14} />
            </button>
          </div>
        )}

        <div className="space-y-1">
          {channels.map((ch) => {
            const isActive = activeChannel === ch.id;
            const isHovered = hoveredChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                onMouseEnter={() => setHoveredChannel(ch.id)}
                onMouseLeave={() => setHoveredChannel(null)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-150"
                style={{
                  background: isActive ? 'var(--accent-muted)' : isHovered ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                }}
              >
                <HashIconSmall
                  size={16}
                  className="flex-shrink-0"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                />
                <span className="truncate flex-1">{ch.name}</span>
                {ch._count && ch._count.messages > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: isActive ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {ch._count.messages}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="w-full text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger-muted)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogoutIcon size={16} />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
