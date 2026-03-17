## Plan: Route Mode And Safe/Fast Split

Add a primary transportation selector with four options (`foot`, `metro`, `bus`, `car`) on the route-selection screen, and refactor route generation so every selected mode yields two variants: Zenit as the safest route available for that mode, and Standard as the fastest route for that mode. Because the current stack has no crowd-density or live street-activity data, implement safety as a heuristic using route geometry and transit characteristics now, while leaving a clean seam for a future external safety data source.

**Steps**
1. Phase 1: Define the new route model. Introduce transport-mode and route-variant types, extend the route result shape to carry `primaryMode`, `variant`, and any scoring metadata needed by the UI, and update storage helpers so the selected route and selected variant remain consistent across pages. This blocks all later steps.
2. Phase 2: Refactor the routing orchestrator in `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\lib\routing.ts`. Change `fetchSafeAndFastRoutes(origin, destination)` into a mode-aware entry point that accepts `foot | metro | bus | car` and returns `{ safe, fast }` for the chosen mode only. This depends on step 1.
3. In the same refactor, split mode behavior explicitly:
   Safe/fast for `foot`: use OSRM foot alternatives for both results, rank Zenit by the safest walking heuristic available and Standard by shortest duration.
   Safe/fast for `car`: use OSRM car alternatives for both results, rank Zenit by the existing low-turn / low-backtracking heuristic and Standard by shortest duration.
   Safe/fast for `metro`: fetch transit itineraries with walking plus transit, score Zenit by metro preference plus reduced walking/transfers, and score Standard by shortest duration.
   Safe/fast for `bus`: fetch transit itineraries with walking plus transit, score Zenit by bus preference plus reduced walking/transfers, and score Standard by shortest duration.
4. Phase 3: Extend the transit pipeline in `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\lib\transit.ts` and `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\supabase\functions\tmb-planner\index.ts`. Pass a mode-preference payload through the edge function, allow TMB planner requests to vary by selected primary mode, and return enough itinerary detail to score both a safe and a fast option from the same response. This can start in parallel with step 2 after step 1 is done.
5. For transit scoring, avoid hard-coding “metro only” or “bus only” unless the upstream API forces it. Recommended ranking rule:
   `metro` Zenit: prefer itineraries containing `SUBWAY`, then minimize walking distance and transfer count, then minimize duration.
   `bus` Zenit: prefer itineraries containing `BUS`, then minimize walking distance and transfer count, then minimize duration.
   Fast transit: always minimize total duration first.
   If the API exposes usable mode filters, apply them as a first pass; otherwise keep the request broad and rank itineraries client-side/server-side.
6. Phase 4: Update the route-selection UI in `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\pages\MapRoutes.tsx`. Add a four-option transportation toggle above the route cards, keep the existing Zenit vs Standard card selection below it, and refetch routes whenever the selected transport mode changes. This depends on steps 2 and 4.
7. Use the existing `ToggleGroup` pattern from `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\components\ui\toggle-group.tsx` for the selector. Keep the bottom-sheet interaction intact, reset the selected card safely if the newly fetched mode has only one valid result, and add a small loading state for recalculation after a mode switch.
8. Update route presentation in `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\components\RouteCard.tsx` so each card reflects the selected primary mode. Zenit should describe why it is considered safer for that mode; Standard should describe why it is faster. Replace current fixed tag text where it incorrectly assumes transit for fast or walking for safe.
9. Phase 5: Update downstream consumers, primarily `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\pages\MapRouteDetails.tsx`, so the details page and any stored session data reflect both the chosen primary mode and the chosen Zenit/Standard variant. This depends on step 1 and should happen after step 6.
10. Phase 6: Revisit safety percentages and labels. Do not leave `95%` and `73%` as global constants once route meanings become mode-dependent. Either compute mode-specific heuristic scores from ranking inputs or present qualitative labels such as “Más segura” and “Más rápida” until a defensible numeric model exists. This can run in parallel with steps 8 and 9.
11. Phase 7: Add regression coverage. Extend or add tests around routing selection logic so each primary mode returns the correct safe/fast pair and transit ranking behaves correctly for metro and bus preference. If the project lacks unit coverage around these modules, start with pure-function tests for the ranking/scoring helpers rather than UI-heavy tests.

**Relevant files**
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\lib\routing.ts` — main route orchestrator, OSRM candidate generation, current Zenit-vs-fast selection logic, session storage helpers.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\lib\transit.ts` — TMB planner client, itinerary parsing, transit leg shape.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\supabase\functions\tmb-planner\index.ts` — edge-function proxy to TMB, currently hard-coded to `TRANSIT,WALK`.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\pages\MapRoutes.tsx` — transport-mode toggle, fetch lifecycle, selected-card state, continue action.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\components\RouteCard.tsx` — card copy, tags, icons, transit summary.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\components\ui\toggle-group.tsx` — existing selector primitive to reuse.
- `c:\Users\arthu\Documents\INTERCÂMBIO\1. BAU\TFM\zenit-your-nighttime-companion\src\pages\MapRouteDetails.tsx` — downstream selected-route presentation.

**Verification**
1. Validate mode switching on the route screen: each of the four selections triggers a recalculation and still renders two cards whenever both variants exist.
2. Validate route semantics per mode:
   `foot`: Zenit and Standard are both walking routes, with Zenit ranked by the walking-safety heuristic and Standard by shorter duration.
   `car`: Zenit and Standard are both car routes, with Zenit straighter and Standard faster.
   `metro`: both variants include walking plus transit, Zenit prefers metro-heavy itineraries, Standard is the fastest itinerary.
   `bus`: both variants include walking plus transit, Zenit prefers bus-heavy itineraries, Standard is the fastest itinerary.
3. Verify session persistence by selecting each mode and variant, continuing to the details page, and confirming the stored route matches the user’s last choice.
4. Run existing tests and add targeted tests for route-ranking helpers, especially mode-specific transit preference and fallback behavior when TMB returns no itineraries.
5. Manually test fallback paths: TMB unavailable, no preferred transit itinerary found, and only one route candidate available from OSRM.

**Decisions**
- Included: a four-option primary transportation selector applied to both route variants on the route-selection screen.
- Included: Zenit remains the safer option and Standard remains the faster option for the currently selected primary mode.
- Included: `metro` and `bus` mean preferred transit mode plus walking, not strict exclusivity, unless TMB filtering proves reliable enough to enforce preference upstream.
- Included: safety is implemented as a best-available heuristic using current routing and itinerary signals.
- Excluded for this change: integrating third-party live crowd, lighting, crime, or pedestrian-density datasets. That requires a separate product and data decision.

**Further Considerations**
1. If product needs truly “more people and movement” routing rather than a heuristic proxy, add a follow-up phase to source and fuse street-activity data, then replace the temporary safety scorer with that dataset-backed model.
2. If users may switch modes often, consider caching results per `(origin, destination, primaryMode)` to reduce repeated API calls and keep the bottom-sheet interaction responsive.
