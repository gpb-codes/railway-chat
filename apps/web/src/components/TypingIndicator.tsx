'use client';

interface TypingIndicatorProps {
  usernames: string[];
}

export default function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const text = usernames.length === 1
    ? `${usernames[0]} esta escribiendo`
    : usernames.length === 2
    ? `${usernames[0]} y ${usernames[1]} estan escribiendo`
    : `${usernames[0]} y ${usernames.length - 1} personas mas estan escribiendo`;

  return (
    <div className="px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {text}
        </span>
      </div>
    </div>
  );
}
