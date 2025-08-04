// Utilitário para gerar placeholders de avatar SVG

export function generateAvatarPlaceholder(size: number = 32, name?: string): string {
  // Cores para avatars
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
    '#EF4444', '#6B7280', '#EC4899', '#14B8A6'
  ];
  
  // Selecionar cor baseada no nome ou aleatória
  const colorIndex = name 
    ? name.charCodeAt(0) % colors.length 
    : Math.floor(Math.random() * colors.length);
  const color = colors[colorIndex];
  
  // Iniciais do nome
  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  
  // SVG do avatar
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `;
  
  // Converter para data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getAvatarUrl(avatarUrl?: string | null, name?: string | null, size: number = 32): string {
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  return generateAvatarPlaceholder(size, name || undefined);
}

// Placeholder padrão para usuário sem nome
export const DEFAULT_AVATAR = generateAvatarPlaceholder(32, 'User');

// Placeholders para diferentes tamanhos
export const AVATAR_PLACEHOLDERS = {
  small: generateAvatarPlaceholder(24),
  medium: generateAvatarPlaceholder(32),
  large: generateAvatarPlaceholder(48),
  xlarge: generateAvatarPlaceholder(64),
};