/**
 * Logos full-color de marcas custom que NO existen en FontAwesome6 (Fase 5).
 *  - SVG → componente nativo (react-native-svg), escala sin pérdida.
 *  - PNG/JPG → asset raster, renderizado con <Image contentFit="contain" />.
 *
 * La clave del registro coincide con el `icon` de la entrada `iconSet: 'logo'`
 * en `platforms.ts`. Todos se dibujan sobre el tile blanco de marca.
 */
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import BbvaLogo from '@/assets/platform-icons/bbva.png';
import BitsoLogo from '@/assets/platform-icons/bitso-icon.svg';
import CetesLogo from '@/assets/platform-icons/cetes.png';
import ClaudeLogo from '@/assets/platform-icons/claude-ai-icon.svg';
import DidiLogo from '@/assets/platform-icons/didi.png';
import DisneyPlusLogo from '@/assets/platform-icons/disneyplus-icon.svg';
import HboMaxLogo from '@/assets/platform-icons/HBO.jpg';
import GbmLogo from '@/assets/platform-icons/gbm-icon.svg';
import GeminiLogo from '@/assets/platform-icons/gemini-icon.svg';
import GmailLogo from '@/assets/platform-icons/gmail-icon.svg';
import GobMxLogo from '@/assets/platform-icons/gobierno-mexico-icon.svg';
import HsbcLogo from '@/assets/platform-icons/hsbc-icon.svg';
import InfonavitLogo from '@/assets/platform-icons/infonavit-icon.svg';
import IzziLogo from '@/assets/platform-icons/izzi-logo-izzi-black.svg';
import LinuxLogo from '@/assets/platform-icons/linux-icon.svg';
import MercadoLibreLogo from '@/assets/platform-icons/mercado-libre.svg';
import MercadoPagoLogo from '@/assets/platform-icons/mercado-pago.svg';
import NetflixLogo from '@/assets/platform-icons/netflix-icon.svg';
import NintendoLogo from '@/assets/platform-icons/nintendo-icon.svg';
import OpenaiLogo from '@/assets/platform-icons/openai-icon.svg';
import OpenclawLogo from '@/assets/platform-icons/openclaw-icon.svg';
import OutlookWebLogo from '@/assets/platform-icons/microsoft-outlook.svg';
import PlatziLogo from '@/assets/platform-icons/platzi-icon.svg';
import PlaystationLogo from '@/assets/platform-icons/playstation.svg';
import RevolutLogo from '@/assets/platform-icons/revolut-icon.svg';
import StoriLogo from '@/assets/platform-icons/stori.jpg';
import SupabaseLogo from '@/assets/platform-icons/supabase-icon.svg';
import TelmexLogo from '@/assets/platform-icons/telmex-from-image.svg';
import UdemyLogo from '@/assets/platform-icons/Udemy-icon.svg';
import XboxLogo from '@/assets/platform-icons/xbox.svg';

/** Logos vectoriales (importados como componentes vía svg-transformer). */
export const SVG_LOGOS: Record<string, FC<SvgProps>> = {
  bitso: BitsoLogo,
  claude: ClaudeLogo,
  'disney-plus': DisneyPlusLogo,
  gbm: GbmLogo,
  gemini: GeminiLogo,
  gmail: GmailLogo,
  'gob-mx': GobMxLogo,
  hsbc: HsbcLogo,
  infonavit: InfonavitLogo,
  izzi: IzziLogo,
  linux: LinuxLogo,
  'mercado-libre': MercadoLibreLogo,
  'mercado-pago': MercadoPagoLogo,
  netflix: NetflixLogo,
  nintendo: NintendoLogo,
  openai: OpenaiLogo,
  openclaw: OpenclawLogo,
  'outlook-web': OutlookWebLogo,
  platzi: PlatziLogo,
  playstation: PlaystationLogo,
  revolut: RevolutLogo,
  supabase: SupabaseLogo,
  telmex: TelmexLogo,
  udemy: UdemyLogo,
  xbox: XboxLogo,
};

/** Logos raster (PNG/JPG) → fuente para <Image>. */
export const RASTER_LOGOS: Record<string, number> = {
  bbva: BbvaLogo,
  cetes: CetesLogo,
  didi: DidiLogo,
  'hbo-max': HboMaxLogo,
  stori: StoriLogo,
};

/**
 * Logos que ya traen su propio fondo de color: en vez del tile blanco se dibujan
 * a sangre sobre un tile del mismo color (el valor es ese color de fondo). El
 * resto se sigue mostrando centrado sobre tile blanco.
 */
export const LOGO_FILL: Record<string, string> = {
  nintendo: '#E60012',
  gbm: '#101117',
  'mercado-libre': '#FFE600',
  'mercado-pago': '#2ABCFF',
  telmex: '#009ADA',
  stori: '#5FCF87',
  'hbo-max': '#000000',
  didi: '#FF4B01',
};
