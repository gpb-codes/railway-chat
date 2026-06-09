'use client';

import { useState } from 'react';
import { SearchIcon, CloseIcon } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export default function SearchBar({ onSearch, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 py-2 animate-slide-up"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
    >
      <div className="relative flex-1">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mensajes..."
          className="w-full text-sm py-2 pl-10 pr-3"
          autoFocus
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <CloseIcon size={18} />
      </button>
    </form>
  );
}
