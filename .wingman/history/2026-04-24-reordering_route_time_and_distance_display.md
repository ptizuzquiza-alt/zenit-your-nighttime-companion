---
date: 2026-04-24
title: "Reordering route time and distance display"
tags: [copilot, chat-export]
workspace: "zenit-your-nighttime-companion"
---

# Reordering route time and distance display

**User**
Near this line of code is a command to present an estimated distance and time for the route. I need you to switch their places, to show firstly the time and secondly the distance

**Copilot**
The user wants me to switch the places of distance and time in the MapRoutes.tsx file, near line 213. 

Looking at the code, line 213 is just `loading`. Let me search for where distance and time are displayed together.

Looking at the MapRoutes.tsx file provided, I can see around line 180-190:
```tsx
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {formatDistance(currentRouteData.distance)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDuration(currentRouteData.duration)}
                  </span>
                </div>
```

This section shows distance first, then time. The user wants to switch them so time appears first, then distance.

I need to replace this section to swap the order. Let me use the replace_string_in_file tool to make this change.I'll find and switch the order of distance and time display in your MapRoutes file. 

> **[copilot_replaceString]** Replacing 9 lines with 9 lines in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/zenit-your-nighttime-companion/src/pages/MapRoutes.tsx)

```

```
Perfect! The swap has been made. Now the route display will show time first, then distance. The change has been successfully applied to the file.Done! I've switched the order so the estimated time now displays first, followed by the distance. The route details will now show as "X min · X km" instead of "X km · X min".

