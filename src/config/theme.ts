/**
 * ═══════════════════════════════════════════════════════════
 *  ZENIT — CONFIGURACIÓN DE TEMA
 *  Cambia los valores aquí para personalizar toda la app.
 * ═══════════════════════════════════════════════════════════
 */

// ─── TIPOGRAFÍAS ────────────────────────────────────────────
// Google Fonts URL (se importa en index.css)
export const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
export const FONT_FAMILY_HEADING = "'Inter', system-ui, sans-serif";
export const FONT_FAMILY_BODY = "'Inter', system-ui, sans-serif";

// ─── COLORES PRINCIPALES (formato HSL sin "hsl()") ─────────
// Fondo oscuro principal — actualmente #1F193D
export const COLOR_BACKGROUND = '249 42% 12%';
// Texto principal
export const COLOR_FOREGROUND = '0 0% 98%';

// Tarjetas / superficies
export const COLOR_CARD = '249 40% 15%';
export const COLOR_SURFACE = '249 40% 15%';
export const COLOR_SURFACE_LIGHT = '249 35% 20%';

// Morado primario (botones, acentos, anillos)
export const COLOR_PRIMARY = '265 90% 60%';
export const COLOR_PRIMARY_LIGHT = '265 80% 70%';

// Amarillo / Accent (marcadores, ruta Zenit)
export const COLOR_ACCENT = '45 100% 50%';

// Colores secundarios
export const COLOR_SECONDARY = '249 35% 26%';
export const COLOR_MUTED = '249 35% 24%';
export const COLOR_MUTED_FG = '249 20% 60%';
export const COLOR_BORDER = '249 30% 26%';

// Colores funcionales
export const COLOR_DESTRUCTIVE = '0 84% 60%';
export const COLOR_GREEN = '145 70% 50%';
export const COLOR_BLUE = '220 80% 60%';

// ─── COLORES DEL MAPA ──────────────────────────────────────
// Color de fondo del contenedor del mapa (mientras cargan los tiles)
export const MAP_BACKGROUND = '249 42% 17%';

// Filtro CSS para dar tinte a los tiles del mapa
// Ajusta sepia, hue-rotate, saturate y brightness para cambiar el tono
export const MAP_TILE_FILTER = 'sepia(0.3) hue-rotate(45deg) saturate(1.8) brightness(0.85)';

// Color de la ruta Zenit (segura) — amarillo
export const MAP_ROUTE_SAFE_COLOR = '#FFD700';
// Color de la ruta estándar (rápida) — lila
export const MAP_ROUTE_FAST_COLOR = '#a78bfa';
// Color del marcador de origen
export const MAP_MARKER_ORIGIN_COLOR = '#FFCC00';
// Color de marcadores de amigos
export const MAP_MARKER_FRIEND_COLOR = '#a78bfa';

// ─── GRADIENTES ─────────────────────────────────────────────
export const GRADIENT_PRIMARY = `linear-gradient(135deg, hsl(${COLOR_PRIMARY}), hsl(280 80% 50%))`;
export const GRADIENT_SAFE = `linear-gradient(135deg, hsl(${COLOR_GREEN} / 0.8), hsl(160 70% 40%))`;

// ─── SOMBRAS ────────────────────────────────────────────────
export const SHADOW_CARD = '0 4px 20px -4px hsla(249, 42%, 5%, 0.5)';
export const SHADOW_GLOW = `0 0 30px -5px hsl(${COLOR_PRIMARY} / 0.3)`;

// ─── RADIO DE BORDES ────────────────────────────────────────
export const BORDER_RADIUS = '1rem';
