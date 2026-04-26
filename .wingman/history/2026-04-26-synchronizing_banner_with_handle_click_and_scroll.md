---
date: 2026-04-26
title: "Synchronizing banner with handle click and scroll"
tags: [copilot, chat-export]
workspace: "zenit-tests"
---

# Synchronizing banner with handle click and scroll

**User**
I need this banner to have the same click and scroll behaviour as the handle located over it.

**Copilot**
I’ll update the banner container so it uses the same pointer/touch/click handlers as the panel handle, then quickly validate there are no TypeScript issues in that I’ll update the banner container so it uses the same pointer/touch/click handlers as the panel handle, then quickly validate there are no TypeScript issues in that file.I found the safest spot: I’m wiring the exact same gesture handlers to the banner wrapper and preventing propagation on the close button so dismiss still works independently.

> **[copilot_applyPatch]** Generating patch (37 lines) in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx)

```

```


> **[copilot_getErrors]** Checked [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx), no problems found
Updated the banner so it now behaves like the drag handle for both tap and swipe gestures.

What changed in :
- Added the same pointer/touch/click handlers used by the handle to the banner wrapper:
  - onPointerDown / onPointerMove / onPointerUp / onPointerCancel
  - onTouchStart / onTouchMove / onTouchEnd / onTouchCancel
  - onClick
- Added the same interaction styles to the banner wrapper:
  - touchAction: none
  - userSelect and WebkitUserSelect disabled
- Kept dismiss behavior isolated:
  - The close button now stops event propagation before dismissing, so closing the banner does not also toggle/drag the panel.

Validation:
- Checked TypeScript/problems for : no errors found.

**User**
It did not change the interactions as intended. I still can only change the pannel states through the handle

**Copilot**
I see the issue: I wired the purple safety card, but your selected “Ruta Zenit” top banner still lacked the gesture handlers. I’m now applying the handle interactions to that top row and isolating the info button click so it doesn’t steal/trigger panel toggles.

> **[copilot_applyPatch]** Generating patch (29 lines) in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx)

```

```
I’ve applied the handlers to the exact top banner section now. I’ll run a quick error check to confirm the file remains clean.

> **[copilot_getErrors]** Checked [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx), no problems found
You were right, the previous change targeted the wrong banner.

I’ve now applied the same interaction handlers as the handle to the top “Ruta Zenit” banner row in , so this section now supports:
- tap-to-toggle panel state
- drag/swipe up-down to change panel state

I also protected the info button in that row so it still only opens the modal:
- click now stops propagation before calling `setShowInfoModal(true)`

Validation:
- No TypeScript/Problems errors in .

If you want, I can also remove the duplicated gesture handlers from the purple safety card and make both zones share one reusable wrapper/helper to keep this file cleaner.

