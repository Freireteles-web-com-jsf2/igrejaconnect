import { getAvatarUrl } from '@/react-app/utils/avatarPlaceholder';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

export default function Avatar({ 
  src, 
  name, 
  size = 32, 
  className = '', 
  alt 
}: AvatarProps) {
  const avatarUrl = getAvatarUrl(src, name, size);
  const altText = alt || name || 'Avatar';
  
  return (
    <img
      src={avatarUrl}
      alt={altText}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Componentes pré-configurados para tamanhos comuns
export function AvatarSmall(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size={24} />;
}

export function AvatarMedium(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size={32} />;
}

export function AvatarLarge(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size={48} />;
}

export function AvatarXLarge(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size={64} />;
}