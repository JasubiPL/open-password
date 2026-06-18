/**
 * Catálogo para autocompletar entradas:
 *  - `brand`: apps con logo de marca (FontAwesome6 brands) + URL de login.
 *  - `category`: iconos genéricos (Ionicons) para servicios sin logo propio
 *    (bancos, telecom, gobierno…), p. ej. fintech MX que no están en el set.
 *
 * Los logos full-color y la cobertura de marcas custom (Izzi, Bitso, BBVA…)
 * quedan para la Fase 5. Por ahora: marcas que existan en FontAwesome + categorías.
 */
export type IconSet = 'fa6' | 'ion';

export interface Platform {
  id: string;
  name: string;
  /** Nombre del glifo (FontAwesome6 brands si `iconSet='fa6'`; Ionicons si `'ion'`). */
  icon: string;
  iconSet: IconSet;
  /** Color de marca / categoría (ajustado para verse sobre fondo oscuro). */
  color: string;
  /** URL de login a autocompletar (solo marcas). */
  url?: string;
  kind: 'brand' | 'category';
}

/** Apps con logo de marca disponible en FontAwesome6. */
export const BRANDS: Platform[] = [
  { id: 'google', name: 'Google', icon: 'google', iconSet: 'fa6', color: '#4285F4', url: 'https://accounts.google.com', kind: 'brand' },
  { id: 'outlook', name: 'Outlook', icon: 'microsoft', iconSet: 'fa6', color: '#0A84FF', url: 'https://outlook.live.com', kind: 'brand' },
  { id: 'apple', name: 'Apple', icon: 'apple', iconSet: 'fa6', color: '#E7E9EA', url: 'https://appleid.apple.com', kind: 'brand' },
  { id: 'windows', name: 'Windows', icon: 'windows', iconSet: 'fa6', color: '#0A84FF', url: 'https://account.microsoft.com', kind: 'brand' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', iconSet: 'fa6', color: '#E4405F', url: 'https://instagram.com', kind: 'brand' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', iconSet: 'fa6', color: '#1877F2', url: 'https://facebook.com', kind: 'brand' },
  { id: 'x', name: 'X (Twitter)', icon: 'x-twitter', iconSet: 'fa6', color: '#E7E9EA', url: 'https://x.com', kind: 'brand' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', iconSet: 'fa6', color: '#25D366', url: 'https://web.whatsapp.com', kind: 'brand' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', iconSet: 'fa6', color: '#0A85C2', url: 'https://linkedin.com/login', kind: 'brand' },
  { id: 'github', name: 'GitHub', icon: 'github', iconSet: 'fa6', color: '#E7E9EA', url: 'https://github.com/login', kind: 'brand' },
  { id: 'discord', name: 'Discord', icon: 'discord', iconSet: 'fa6', color: '#5865F2', url: 'https://discord.com/login', kind: 'brand' },
  { id: 'twitch', name: 'Twitch', icon: 'twitch', iconSet: 'fa6', color: '#9146FF', url: 'https://twitch.tv/login', kind: 'brand' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', iconSet: 'fa6', color: '#FF0000', url: 'https://youtube.com', kind: 'brand' },
  { id: 'spotify', name: 'Spotify', icon: 'spotify', iconSet: 'fa6', color: '#1DB954', url: 'https://accounts.spotify.com', kind: 'brand' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', iconSet: 'fa6', color: '#E7E9EA', url: 'https://tiktok.com/login', kind: 'brand' },
  { id: 'reddit', name: 'Reddit', icon: 'reddit', iconSet: 'fa6', color: '#FF4500', url: 'https://reddit.com/login', kind: 'brand' },
  { id: 'amazon', name: 'Amazon', icon: 'amazon', iconSet: 'fa6', color: '#FF9900', url: 'https://amazon.com', kind: 'brand' },
  { id: 'aws', name: 'AWS', icon: 'aws', iconSet: 'fa6', color: '#FF9900', url: 'https://console.aws.amazon.com', kind: 'brand' },
  { id: 'paypal', name: 'PayPal', icon: 'paypal', iconSet: 'fa6', color: '#3B97D3', url: 'https://paypal.com/signin', kind: 'brand' },
  { id: 'uber', name: 'Uber', icon: 'uber', iconSet: 'fa6', color: '#E7E9EA', url: 'https://auth.uber.com', kind: 'brand' },
  { id: 'steam', name: 'Steam', icon: 'steam', iconSet: 'fa6', color: '#C7D5E0', url: 'https://store.steampowered.com/login', kind: 'brand' },
  { id: 'unity', name: 'Unity', icon: 'unity', iconSet: 'fa6', color: '#E7E9EA', url: 'https://id.unity.com', kind: 'brand' },
  { id: 'dropbox', name: 'Dropbox', icon: 'dropbox', iconSet: 'fa6', color: '#0061FF', url: 'https://dropbox.com/login', kind: 'brand' },
];

/** Categorías genéricas (Ionicons) para servicios sin logo de marca. */
export const CATEGORIES: Platform[] = [
  { id: 'cat-bank', name: 'Banco', icon: 'card', iconSet: 'ion', color: '#3FB950', kind: 'category' },
  { id: 'cat-finance', name: 'Finanzas / Inversiones', icon: 'trending-up', iconSet: 'ion', color: '#3FB950', kind: 'category' },
  { id: 'cat-crypto', name: 'Cripto', icon: 'logo-bitcoin', iconSet: 'ion', color: '#F7931A', kind: 'category' },
  { id: 'cat-telecom', name: 'Telecomunicaciones', icon: 'cellular', iconSet: 'ion', color: '#58A6FF', kind: 'category' },
  { id: 'cat-streaming', name: 'Streaming / TV', icon: 'tv', iconSet: 'ion', color: '#E50914', kind: 'category' },
  { id: 'cat-shopping', name: 'Compras', icon: 'cart', iconSet: 'ion', color: '#E3742F', kind: 'category' },
  { id: 'cat-work', name: 'Trabajo', icon: 'briefcase', iconSet: 'ion', color: '#A371F7', kind: 'category' },
  { id: 'cat-social', name: 'Redes sociales', icon: 'people', iconSet: 'ion', color: '#DB61A2', kind: 'category' },
  { id: 'cat-email', name: 'Correo', icon: 'mail', iconSet: 'ion', color: '#58A6FF', kind: 'category' },
  { id: 'cat-education', name: 'Educación', icon: 'school', iconSet: 'ion', color: '#D29922', kind: 'category' },
  { id: 'cat-gaming', name: 'Juegos', icon: 'game-controller', iconSet: 'ion', color: '#A371F7', kind: 'category' },
  { id: 'cat-gov', name: 'Gobierno / Trámites', icon: 'business', iconSet: 'ion', color: '#8B98A5', kind: 'category' },
  { id: 'cat-health', name: 'Salud', icon: 'medkit', iconSet: 'ion', color: '#F85149', kind: 'category' },
  { id: 'cat-insurance', name: 'Seguros', icon: 'shield-checkmark', iconSet: 'ion', color: '#3FB950', kind: 'category' },
  { id: 'cat-transport', name: 'Transporte / Viajes', icon: 'car', iconSet: 'ion', color: '#58A6FF', kind: 'category' },
  { id: 'cat-home', name: 'Hogar / Servicios', icon: 'home', iconSet: 'ion', color: '#2DD4BF', kind: 'category' },
];

const BY_ID = new Map([...BRANDS, ...CATEGORIES].map((p) => [p.id, p]));

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? BY_ID.get(id) : undefined;
}
