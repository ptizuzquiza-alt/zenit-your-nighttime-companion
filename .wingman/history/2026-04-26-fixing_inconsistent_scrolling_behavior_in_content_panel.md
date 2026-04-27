---
date: 2026-04-26
title: "Fixing inconsistent scrolling behavior in content panel"
tags: [copilot, chat-export]
workspace: "zenit-tests"
---

# Fixing inconsistent scrolling behavior in content panel

**User**
On another chat, an agent followed this plan and implemented a fix for the handles. Now they work, but the pannel connected to it with the actual content now only has its inner scroll working part of the times, because in others it scrolls the entire page. Fix this behaviour.

**Copilot**
I’m going to inspect the current `MapRoutes` touch/scroll handling and related CSS to isolate why content scroll sometimes bubbles to page scrolling, then I’ll patch the smallest set of files and run checks.I’m gathering the exact event handlers and CSS in the workspace so we can fix scroll chaining without regressing the handle drag behavior.

> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#1-1), lines 1 to 420


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css)
I found the likely root cause: the panel content container can chain overscroll to the viewport on mobile at scroll boundaries. I’m going to lock viewport overscroll while on  and explicitly contain vertical overscroll inside the panel content so inner scrolling stays consistent.

> **[copilot_applyPatch]** Generating patch (47 lines) in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx)

```

```
I’ve applied the containment and viewport scroll-lock changes in ; next I’ll run lint/tests (or at least type/lint checks) to ensure no regressions.

> **[copilot_getErrors]** Checked [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx), no problems found


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/package.json)


> **[run_in_terminal]** Running `npm run lint`
> ```bash
> npm run lint
> ```


> **[run_in_terminal]** Running `npm run lint`
> ```bash
> npm run lint
> ```


