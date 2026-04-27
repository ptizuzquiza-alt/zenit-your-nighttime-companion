---
date: 2026-04-18
title: "Button background and vector size adjustment"
tags: [copilot, chat-export]
workspace: "zenit-your-nighttime-companion"
---

# Button background and vector size adjustment

**User**
This button needs to don't have a background fill and its inside vector has to be sized 24x24px. Maintain in rem if it was already in rem

**Copilot**
**Inspecting button details**

I need to modify a button, likely in MapRoutes. The user mentioned that the button shouldn’t have a background fill and that its vector needs to be sized 24x24px. I must inspect the current selection around line 202 to find the exact button. It might be related to the share functionality, but I’ll need to confirm that. I’ll read through the file content around lines 180-220 for clarity.Checking the exact button and vector sizing around the selected line.

> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/zenit-your-nighttime-companion/src/pages/MapRoutes.tsx#170-170), lines 170 to 220
**Adjusting button properties**

I need to change the info button for the user. They want no background fill and a vector size of 24x24 px. Currently, the info icon is set to 4.5 units in height and width, while the button has a background fill. I should remove the bg-card/90 from the button and possibly keep the 9x9 dimensions in rem. The icon will need to be set to 6 units, or 1.5 rem. Let's update the class names accordingly!**Refining button appearance**

I’m considering removing the backdrop-blur-xl on the button, since the user specified no background fill. I wonder if I should keep the border, though it seems likely. The new className could be "w-9 h-9 rounded-full bg-transparent border border-border/50 flex items-center justify-center." If the background is transparent, the blur might not be necessary. Still, I could maintain the blur for aesthetic reasons. I’ll finalize the className and work on editing the file accordingly!Found the target button and icon. Updating it to a transparent fill and 24x24px inner icon.

> **[copilot_replaceString]** Replacing 10 lines with 10 lines in [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/zenit-your-nighttime-companion/src/pages/MapRoutes.tsx)

```

```
✅ Updated 

- Removed the button background fill
- Set the inner  icon to `24x24px` via `w-6 h-6`
- Kept sizing in Tailwind spacing units/rem-friendly form

