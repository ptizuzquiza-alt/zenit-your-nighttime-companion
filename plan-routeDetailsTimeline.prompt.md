## Plan: Route Steps Timeline Redesign

Replace the current horizontal route-step cards with a vertical timeline layout that matches the reference image: start marker on top, destination marker at the bottom, and intermediate turn rows with vertically centered arrow circles. The distance should sit between instruction rows with 1rem spacing, and the text hierarchy/colors should be adjusted to mirror the screenshot.

**Steps**
1. Refactor the step row component in [src/components/DirectionCard.tsx](src/components/DirectionCard.tsx) so it can render three row types: start, intermediate step, and destination.
2. Rebuild the steps section in [src/pages/MapRoutes.tsx](src/pages/MapRoutes.tsx) as a timeline rather than the current card list, inserting the walked distance between instruction rows.
3. Swap the first and last row markers to use the current-location and destination vectors, and keep the turn arrows for intermediate rows.
4. Tune spacing, alignment, and typography so the icon circles sit vertically centered with the text, and the distance lines use 1rem margins.
5. Replace or narrow the current direction-card styling in [src/index.css](src/index.css) if the existing horizontal card rules conflict with the new timeline layout.
6. Validate the result on a narrow mobile viewport so the panel still fits above the bottom action bar without clipping the destination row.

**Decisions**
- This should be a presentation-only change; route generation and routing logic stay untouched.
- A timeline-specific layout is the right fit here, rather than trying to force the existing card layout to behave like a stepper.
- The endpoint icons should be visually distinct from the intermediate turn icons, matching the reference design.

**Verification**
- Compare the rendered panel against the reference image for icon placement, text hierarchy, and distance spacing.
- Test at least one route with short and long segments to confirm meters and kilometers both render correctly.
- Check a mobile viewport to ensure the bottom action bar remains usable and the destination row is fully visible.
