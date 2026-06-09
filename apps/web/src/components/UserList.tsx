'use client';

import { OnlineUser } from '@/lib/websocket';

interface UserListProps {
  users: OnlineUser[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div
      className="w-56 overflow-y-auto"
      style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
    >
      <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Usuarios Online ({users.length})
        </h3>
      </div>
      <div className="p-2">
        {users.map((u) => (
          <div
            key={u.userId}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--success)' }}
            />
            <span className="truncate" style={{ color: 'var(--text-primary)' }}>
              {u.username}
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-xs px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
            No hay usuarios online
          </p>
        )}
      </div>
    </div>
  );
}
