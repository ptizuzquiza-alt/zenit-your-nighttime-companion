---
date: 2026-04-26
title: "Preventing Page Scroll in Mobile Menu Prototype"
tags: [copilot, chat-export]
workspace: "zenit-tests"
---

# Preventing Page Scroll in Mobile Menu Prototype

**User**
This menu has an unintended scroll of the entire page when its contents reach the upper or lower limit. It makes it hard to navigate in a mobile prototype, since it leads to page refresh. Can you avoid this behaviour?

**Copilot**
I’m going to inspect the panel scroll/gesture handling and then patch the page so overscroll is contained inside the menu without bubbling to the document on mobile.I found a likely cause: the inner list scroll reaches its edge and chains to the document, triggering browser pull-to-refresh. I’ll add page-level overscroll containment while this screen is mounted and reinforce it on the scrollable panel content.

> **[copilot_applyPatch]** Generating patch (34 lines) in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx)

```

```
I’ve applied the scroll containment fix in the route page. Next I’ll quickly check for any TypeScript/lint issues introduced by this change.

> **[copilot_getErrors]** Checked [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx), no problems found
Implemented a fix to stop scroll chaining/pull-to-refresh on this screen.

What I changed:
1. Added a mount/unmount effect in  to temporarily set:
- html overscrollBehaviorY = none
- body overscrollBehaviorY = none

2. Reinforced containment in the panel’s internal scroller in :
- Added overscroll-contain
- Kept smooth iOS scrolling with WebkitOverflowScrolling: touch

Result:
- When the route panel content hits top/bottom, it no longer propagates to page scroll, which prevents accidental mobile pull-to-refresh while navigating the menu.

If you want, I can apply the same protection pattern to other mobile pages with bottom sheets in this prototype.

