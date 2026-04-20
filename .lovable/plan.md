

## Plan: Redesign Route Selection Screen and Skip Route Details

### Summary
Merge the route details functionality directly into the `MapRoutes` page, skip the intermediate `MapRouteDetails` screen, and add the new UI elements from the designs: expandable route steps panel, dismissible Zenit banner, info popup, and fixed bottom button bar.

### What changes

**1. Fix build errors** — Install missing `leaflet`, `@types/leaflet`, `@supabase/supabase-js`.

**2. Update `src/lib/routing.ts`**
- Add `steps=true` to OSRM requests and parse step-by-step instructions (street name, distance, maneuver type/direction).
- Add `RouteStep` interface and `steps` field to `RouteResult`.

**3. Redesign `src/pages/MapRoutes.tsx`** — This becomes the single screen between search and navigation. The layout has three layers:

```text
┌─────────────────────────────┐
│        Map (full screen)    │
│                       (i)   │  ← round info button
├─────────────────────────────┤
│ Expandable panel (drag up)  │
│  ┌─ Dismissible banner ───┐ │
│  │ "Ruta Zenit prioriza…" X│ │  ← localStorage persisted dismiss
│  └─────────────────────────┘ │
│  2.5 km · 31 min             │
│  Llegada a las 22:31         │
│  ── Pasos ──                 │
│  Step 1: Dirígete hacia...   │
│  Step 2: Gira a la derecha   │
├─────────────────────────────┤
│ [Compartir ruta] [Iniciar]  │  ← fixed bottom bar, always visible
└─────────────────────────────┘
```

- **Fixed bottom bar** (`z-[1001]`): Two full-width stacked buttons — "Compartir ruta" (secondary, opens ShareRouteModal) and "Iniciar trayecto" (primary, stores route + navigates to `/navigation`).
- **Expandable steps panel**: Behind the fixed bar. Collapsed: shows route name + summary (distance, duration, ETA). Expanded: scrollable list of OSRM steps with direction icons and street names. Draggable with touch gestures (reuse existing pattern).
- **Dismissible Zenit banner**: Lighter card inside the panel explaining the route. X button dismisses it and sets `localStorage.setItem('zenit_banner_dismissed', 'true')` so it never reappears.
- **Info button**: Round `(i)` button on the map that opens the "Sobre tu ruta" modal.
- The "Continuar" button and current `handleContinue` navigating to `/route-details` are replaced — selecting a route now shows steps inline; the primary button goes straight to `/navigation`.

**4. Create `src/components/RouteInfoModal.tsx`**
- Centered dialog: title "Sobre tu ruta", body explaining Ruta Zenit criteria (buena iluminación, calles anchas, vías principales), close button.

**5. Remove `/route-details` route**
- Remove the route from `App.tsx`.
- Delete `src/pages/MapRouteDetails.tsx` (its share functionality moves into `MapRoutes`).

### Files affected

| File | Action |
|------|--------|
| `package.json` | Add `leaflet`, `@types/leaflet`, `@supabase/supabase-js` |
| `src/lib/routing.ts` | Add `RouteStep`, fetch OSRM steps |
| `src/pages/MapRoutes.tsx` | Full redesign with 3-layer layout, share, steps, banner |
| `src/components/RouteInfoModal.tsx` | New — "Sobre tu ruta" popup |
| `src/App.tsx` | Remove `/route-details` route |
| `src/pages/MapRouteDetails.tsx` | Delete |

