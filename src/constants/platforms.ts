/**
 * Catálogo para autocompletar entradas:
 *  - `brand` + `fa6`: apps con logo de marca de FontAwesome6 + URL de login.
 *  - `brand` + `logo`: logos full-color custom (SVG/PNG en `assets/platform-icons`,
 *    ver `platformLogos.tsx`), p. ej. marcas MX que no están en FontAwesome.
 *  - `category` + `ion`: iconos genéricos (Ionicons) para servicios sin logo propio.
 */
export type IconSet = 'fa6' | 'ion' | 'logo';

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

/**
 * Logos full-color custom (`iconSet: 'logo'`). El `icon` es la clave del registro
 * en `platformLogos.tsx`. El `color` se usa solo como tinte de acento (no afecta
 * al logo, que se dibuja con sus propios colores sobre tile blanco).
 */
export const LOGOS: Platform[] = [
  // Global
  { id: 'netflix', name: 'Netflix', icon: 'netflix', iconSet: 'logo', color: '#E50914', url: 'https://www.netflix.com/login', kind: 'brand' },
  { id: 'disney-plus', name: 'Disney+', icon: 'disney-plus', iconSet: 'logo', color: '#113CCF', url: 'https://www.disneyplus.com', kind: 'brand' },
  { id: 'hbo-max', name: 'HBO Max', icon: 'hbo-max', iconSet: 'logo', color: '#5822B4', url: 'https://www.max.com', kind: 'brand' },
  { id: 'gmail', name: 'Gmail', icon: 'gmail', iconSet: 'logo', color: '#EA4335', url: 'https://mail.google.com', kind: 'brand' },
  { id: 'outlook-web', name: 'Outlook (Web)', icon: 'outlook-web', iconSet: 'logo', color: '#0078D4', url: 'https://outlook.live.com', kind: 'brand' },
  { id: 'playstation', name: 'PlayStation', icon: 'playstation', iconSet: 'logo', color: '#0070D1', url: 'https://www.playstation.com', kind: 'brand' },
  { id: 'xbox', name: 'Xbox', icon: 'xbox', iconSet: 'logo', color: '#107C10', url: 'https://account.xbox.com', kind: 'brand' },
  { id: 'nintendo', name: 'Nintendo', icon: 'nintendo', iconSet: 'logo', color: '#E60012', url: 'https://accounts.nintendo.com', kind: 'brand' },
  { id: 'revolut', name: 'Revolut', icon: 'revolut', iconSet: 'logo', color: '#0066FF', url: 'https://www.revolut.com', kind: 'brand' },
  { id: 'supabase', name: 'Supabase', icon: 'supabase', iconSet: 'logo', color: '#3ECF8E', url: 'https://supabase.com/dashboard/sign-in', kind: 'brand' },
  { id: 'openai', name: 'OpenAI / ChatGPT', icon: 'openai', iconSet: 'logo', color: '#10A37F', url: 'https://chatgpt.com/auth/login', kind: 'brand' },
  { id: 'claude', name: 'Claude', icon: 'claude', iconSet: 'logo', color: '#D97757', url: 'https://claude.ai/login', kind: 'brand' },
  { id: 'gemini', name: 'Gemini', icon: 'gemini', iconSet: 'logo', color: '#1BA1E3', url: 'https://gemini.google.com', kind: 'brand' },
  { id: 'udemy', name: 'Udemy', icon: 'udemy', iconSet: 'logo', color: '#A435F0', url: 'https://www.udemy.com/join/login-popup/', kind: 'brand' },
  { id: 'platzi', name: 'Platzi', icon: 'platzi', iconSet: 'logo', color: '#98CA3F', url: 'https://platzi.com/login', kind: 'brand' },
  { id: 'linux', name: 'Linux', icon: 'linux', iconSet: 'logo', color: '#FCC624', kind: 'brand' },
  { id: 'openclaw', name: 'OpenClaw', icon: 'openclaw', iconSet: 'logo', color: '#00E5CC', kind: 'brand' },
  // México
  { id: 'bbva', name: 'BBVA', icon: 'bbva', iconSet: 'logo', color: '#004481', url: 'https://www.bbva.mx', kind: 'brand' },
  { id: 'hsbc', name: 'HSBC', icon: 'hsbc', iconSet: 'logo', color: '#DB0011', url: 'https://www.hsbc.com.mx', kind: 'brand' },
  { id: 'stori', name: 'Stori', icon: 'stori', iconSet: 'logo', color: '#00C389', url: 'https://www.storicard.com', kind: 'brand' },
  { id: 'bitso', name: 'Bitso', icon: 'bitso', iconSet: 'logo', color: '#14CABF', url: 'https://bitso.com/login', kind: 'brand' },
  { id: 'mercado-pago', name: 'Mercado Pago', icon: 'mercado-pago', iconSet: 'logo', color: '#00B1EA', url: 'https://www.mercadopago.com.mx', kind: 'brand' },
  { id: 'mercado-libre', name: 'Mercado Libre', icon: 'mercado-libre', iconSet: 'logo', color: '#FFE600', url: 'https://www.mercadolibre.com.mx', kind: 'brand' },
  { id: 'gbm', name: 'GBM', icon: 'gbm', iconSet: 'logo', color: '#1B1D23', url: 'https://gbm.com', kind: 'brand' },
  { id: 'cetes', name: 'CetesDirecto', icon: 'cetes', iconSet: 'logo', color: '#9D2449', url: 'https://www.cetesdirecto.com', kind: 'brand' },
  { id: 'infonavit', name: 'Infonavit', icon: 'infonavit', iconSet: 'logo', color: '#E1251B', url: 'https://micuenta.infonavit.org.mx', kind: 'brand' },
  { id: 'didi', name: 'DiDi', icon: 'didi', iconSet: 'logo', color: '#FF7A00', url: 'https://www.didiglobal.com', kind: 'brand' },
  { id: 'izzi', name: 'Izzi', icon: 'izzi', iconSet: 'logo', color: '#00A0E3', url: 'https://www.izzi.mx', kind: 'brand' },
  { id: 'telmex', name: 'Telmex', icon: 'telmex', iconSet: 'logo', color: '#005DAA', url: 'https://www.telmex.com', kind: 'brand' },
  { id: 'gob-mx', name: 'Gobierno de México', icon: 'gob-mx', iconSet: 'logo', color: '#611232', url: 'https://www.gob.mx', kind: 'brand' },
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
  { id: 'cat-dev', name: 'Development', icon: 'code-slash', iconSet: 'ion', color: '#58A6FF', kind: 'category' },
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

const BY_ID = new Map([...BRANDS, ...LOGOS, ...CATEGORIES].map((p) => [p.id, p]));

export function getPlatform(id: string | undefined): Platform | undefined {
  return id ? BY_ID.get(id) : undefined;
}
