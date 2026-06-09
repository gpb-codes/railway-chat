'use client';

import { OnlineUser } from '@/lib/websocket';
import { UsersIcon, SearchIcon } from './Icons';
import { useState } from 'react';

interface UserListProps {
  users: OnlineUser[];
}

export default function UserList({ users }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div
      className="w-60 flex flex-col h-full"
      style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
    >
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          <UsersIcon size={16} style={{ color: 'var(--accent)' }} />
          Usuarios Online
        </h3>
        <div className="relative">
          <SearchIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full text-xs py-2 pl-8 pr-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs font-medium px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
        </p>

        <div className="space-y-1">
          {sortedUsers.map((u) => (
            <div
              key={u.userId}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-default"
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: 'var(--success)', borderColor: 'var(--bg-secondary)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {u.username}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  En linea
                </p>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && searchQuery && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Sin resultados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
