/**
 * Catálogo de plataformas comunes para autocompletar al crear una entrada:
 * icono de marca (FontAwesome6 brands), color de marca y URL de inicio de sesión.
 *
 * Los iconos son monocromáticos en el color oficial de cada marca. Los logos
 * full-color (gradientes, etc.) requieren SVG y se reservan para la Fase 5.
 */
export interface Platform {
  id: string;
  name: string;
  /** Nombre del glifo de FontAwesome6 (brands). */
  icon: string;
  /** Color de marca (ajustado para verse sobre fondo oscuro cuando hace falta). */
  color: string;
  /** URL de inicio de sesión que se autocompleta. */
  url: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'google', name: 'Google', icon: 'google', color: '#4285F4', url: 'https://accounts.google.com' },
  { id: 'outlook', name: 'Outlook', icon: 'microsoft', color: '#0A84FF', url: 'https://outlook.live.com' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F', url: 'https://instagram.com' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2', url: 'https://facebook.com' },
  { id: 'x', name: 'X', icon: 'x-twitter', color: '#E7E9EA', url: 'https://x.com' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', url: 'https://web.whatsapp.com' },
  { id: 'apple', name: 'Apple', icon: 'apple', color: '#E7E9EA', url: 'https://appleid.apple.com' },
  { id: 'amazon', name: 'Amazon', icon: 'amazon', color: '#FF9900', url: 'https://amazon.com' },
  { id: 'github', name: 'GitHub', icon: 'github', color: '#E7E9EA', url: 'https://github.com/login' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A85C2', url: 'https://linkedin.com/login' },
  { id: 'spotify', name: 'Spotify', icon: 'spotify', color: '#1DB954', url: 'https://accounts.spotify.com' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000', url: 'https://youtube.com' },
  { id: 'netflix', name: 'Netflix', icon: 'film', color: '#E50914', url: 'https://netflix.com/login' },
  { id: 'paypal', name: 'PayPal', icon: 'paypal', color: '#3B97D3', url: 'https://paypal.com/signin' },
  { id: 'discord', name: 'Discord', icon: 'discord', color: '#5865F2', url: 'https://discord.com/login' },
  { id: 'twitch', name: 'Twitch', icon: 'twitch', color: '#9146FF', url: 'https://twitch.tv/login' },
  { id: 'reddit', name: 'Reddit', icon: 'reddit', color: '#FF4500', url: 'https://reddit.com/login' },
  { id: 'dropbox', name: 'Dropbox', icon: 'dropbox', color: '#0061FF', url: 'https://dropbox.com/login' },
  { id: 'steam', name: 'Steam', icon: 'steam', color: '#C7D5E0', url: 'https://store.steampowered.com/login' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', color: '#E7E9EA', url: 'https://tiktok.com/login' },
];

const PLATFORM_BY_ID = new Map(PLATFORMS.map((p) => [p.id, p]));

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? PLATFORM_BY_ID.get(id) : undefined;
}
