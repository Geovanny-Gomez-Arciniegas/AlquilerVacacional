'use client';

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface UserAvatarProps {
  user?: User | null;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
      {initials}
    </div>
  );
}
