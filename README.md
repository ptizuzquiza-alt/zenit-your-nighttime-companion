# Zenit — Tu compañero nocturno

Aplicación móvil web que ayuda a las personas a caminar más seguras de noche en Barcelona. Calcula rutas priorizando calles bien iluminadas, anchas y transitadas, y permite compartir el trayecto en tiempo real con contactos de confianza.

---

## Funcionalidades principales

| Función | Descripción |
|---|---|
| **Ruta Zenit** | Ruta óptima calculada con datos reales de farolas de Barcelona |
| **Transporte público** | Alternativa en metro/bus con desglose de tramos |
| **Compartir ruta** | Comparte tu trayecto en tiempo real con tus contactos |
| **Seguimiento de amigos** | Visualiza en el mapa las rutas activas de tus amigos |
| **Red de confianza** | Gestión de amigos, grupos y solicitudes de amistad |
| **Perfil y privacidad** | Control sobre qué datos se comparten y con quién |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Mapas | Leaflet.js (tiles CartoDB dark) |
| Rutas a pie | OSRM (OpenStreetMap Routing Machine) |
| Base de datos | Supabase (PostgreSQL) |
| QR | `qrcode` |
| Despliegue | Vercel |

---

## Algoritmo de iluminación

La **Ruta Zenit** no es simplemente la ruta más corta. El algoritmo:

1. Solicita hasta 4 rutas alternativas a OSRM + una variante perpendicular
2. Descarga los puntos de luz del área desde Supabase (~28.000 farolas reales del Ajuntament de Barcelona)
3. Puntúa cada ruta: **70 % iluminación** (fracción de la ruta a menos de 30 m de una farola) + **30 % avenidas principales** (pocos giros = calles más transitadas)
4. Devuelve la ruta con mayor puntuación y muestra el porcentaje de iluminación al usuario

Fuente de datos: [Open Data BCN — Punts de llum](https://opendata-ajuntament.barcelona.cat)

---

## Instalación y desarrollo local

```bash
# Clonar el repositorio
git clone <url>

# Instalar dependencias
npm install

# Crear fichero de entorno
cp .env.example .env.local
# Rellenar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY

# Servidor de desarrollo
npm run dev

# Tests
npm test

# Build de producción
npm run build
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave anon/pública de Supabase |

---

## Tests

```bash
npm test
```

Cobertura de las funciones core del algoritmo:

- `scoreLighting` — puntuación de iluminación de una ruta
- `getBoundingBox` — bounding box para la query a Supabase
- `backtrackRatio` — detección de rutas que se alejan del destino
- `turnsPerKm` — métrica de calles principales vs callejones
- `mapManeuverDirection` — interpretación de instrucciones de giro

---

## Estructura del proyecto

```
src/
├── pages/          # Pantallas principales (MapIdle, MapRoutes, Navigation…)
├── components/     # Componentes reutilizables (ZenitMap, DirectionCard…)
├── lib/            # Lógica de negocio (routing.ts, streetlamps.ts, geocoding.ts)
├── config/         # Constantes de tema y contactos
├── integrations/   # Cliente Supabase
└── test/           # Tests unitarios
```

---

## Flujo de usuario

```
Onboarding → Mapa en reposo → Búsqueda de destino
  → Selección de ruta (a pie / transporte público)
  → Compartir ruta con contactos
  → Navegación en tiempo real
  → Confirmación de llegada
```
