---
date: 2026-04-26
title: "Fixing touch interaction for panel height adjustment"
tags: [copilot, chat-export]
workspace: "zenit-tests"
---

# Fixing touch interaction for panel height adjustment

**User**
This page has a handle that is supposed to change a pannel's height when dragged or clicked. It works when using a mouse in a desktop browser, but it doesn't when the interaction is through touches. I can see that it actually moves the entire page down, instead of the pannel, and it oftens lead the user to reload the page in some browsers like Firefox or Chrome for mobile. I need you to fix this unintended behaviour so the user may be able to use the handle properly

**Copilot**


> **[runSubagent]** Used tool


> **[copilot_findTextInFiles]** Searched for regex `zenit-bottom-sheet|zenit-sheet-handle|bottom.sheet|sheet.handle`, 20 results


> **[copilot_findTextInFiles]** Searched for regex `touch-action|overscroll|pointer-event|user-select`, 20 results


> **[copilot_findFiles]** Searched for files matching `**/sheet.tsx`, 2 matches


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#1-1), lines 1 to 200


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#131-131), lines 131 to 300


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#200-200), lines 200 to 242


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#1-1), lines 1 to 50


> **[copilot_findTextInFiles]** Searched for regex `preventDefault|stopPropagation|e\.touch|touchstart|touchmove|touchend` (`**/src/pages/MapRoutes.tsx`), 11 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/Navigation.tsx#200-200), lines 200 to 250


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/components/ZenitMap.tsx#1-1), lines 1 to 50


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#200-200), lines 200 to 350


> **[copilot_findTextInFiles]** Searched for regex `overflow|scroll|height.*100|vh|relative|fixed` (`**/src/index.css`), 2 results


> **[copilot_findTextInFiles]** Searched for regex `touch-action|pointer-events|user-select|overscroll|setPointerCapture|preventDefault|stopPropagation` (`**/src/**`), 20 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/App.tsx)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#100-100), lines 100 to 120


> **[copilot_findTextInFiles]** Searched for regex `body|html|@layer|@supports` (`**/src/**/*.css`), 10 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#50-50), lines 50 to 100


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#107-107), lines 107 to 120


> **[copilot_findTextInFiles]** Searched for regex `const.*panelHeight|style=|className=.*overflow` (`**/src/pages/MapRoutes.tsx`), 13 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#350-350), lines 350 to 397


> **[copilot_findTextInFiles]** Searched for regex `MapRouteDetails|MapRoute|MapIdle|Navigation\.tsx` (`**/src/pages/**`), 10 results


> **[copilot_listDirectory]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/test/example.test.ts)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#230-230), lines 230 to 270


> **[copilot_findTextInFiles]** Searched for regex `screenY|clientY|preventDefault|e\.touch` (`**/src/pages/MapRoutes.tsx`), 7 results


> **[copilot_memory]** Created memory file [](file:///c%3A/Users/arthu/AppData/Roaming/Code/User/workspaceStorage/feb84190914ef2668a3cf2af2a5312d5/GitHub.copilot-chat/memory-tool/memories/NmNkMWI1NjMtOWI5OC00ZWU2LWI2YTYtZDJhYTI5MDI2N2Jl/bottom_sheet_touch_bug_analysis.md)
Discovery found a likely root cause around missing touch-default suppression; I’ll quickly verify the actual code in your workspace files before drafting the final execution plan.

> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#1-1), lines 1 to 260


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#170-170), lines 170 to 242


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/Navigation.tsx#150-150), lines 150 to 280
I’ve confirmed your workspace code matches the touch-default issue: the handle uses pointer events but never blocks native touch scrolling, and the handle CSS doesn’t disable browser touch gestures. I’ll now write a concrete, step-by-step implementation plan scoped to this page and include verification steps for mobile browsers.

> **[copilot_memory]** Created memory file [](file:///c%3A/Users/arthu/AppData/Roaming/Code/User/workspaceStorage/feb84190914ef2668a3cf2af2a5312d5/GitHub.copilot-chat/memory-tool/memories/NmNkMWI1NjMtOWI5OC00ZWU2LWI2YTYtZDJhYTI5MDI2N2Jl/plan.md)
## Plan: Fix MapRoutes Touch Handle Drag

Stop native touch scrolling and pull-to-refresh from hijacking the panel handle gesture, so touch drag and tap only control the panel state in MapRoutes. The recommended approach is to keep the current panel-state logic intact and only harden touch input handling at the handle layer.

**Steps**
1. Confirm existing drag and tap flow in  and keep state transitions unchanged.
2. Update pointer handlers in .
3. Add touch-default suppression in handle pointer down and pointer move for the active pointer .
3. Add touch-default suppression in handle pointer down and pointer move for the active pointer in .
4. Keep pointer up/cancel cleanup consistent so no stale drag state remains in .
5. Add touch gesture CSS constraint to the shared handle class in  so browsers do not treat handle drags as page scroll.
6. Verify tap behavior still toggles panel state through existing click guard logic in .
7. Run repo checks and mobile manual validation for Chrome/Firefox/Safari.

**Relevant files**
-  — handle pointer flow, drag threshold logic, click-vs-drag behavior.
-  — shared sheet handle style where touch gesture policy is applied.

**Verification**
1. Touch-drag up and down on the handle transitions panel state correctly.
2. Touch interaction on the handle no longer moves the full page or triggers pull-to-refresh.
3. Quick tap on handle still toggles state without drag side effects.
4. Expanded panel content remains scrollable as expected.
5. Run configured lint/tests to ensure no regressions in the page behavior.

**Decisions**
- Included: fix scoped to MapRoutes, as requested.
- Excluded: similar touch hardening in other pages unless you want it included now.
- Behavioral intent preserved: existing panel thresholds and transition sequence remain unchanged.

The plan is saved in /memories/session/plan.md and ready for handoff or revision.

**User**
This page has a handle that is supposed to change a pannel's height when dragged or clicked. It works when using a mouse in a desktop browser, but it doesn't when the interaction is through touches. I can see that it actually moves the entire page down, instead of the pannel, and it oftens lead the user to reload the page in some browsers like Firefox or Chrome for mobile. I need you to fix this unintended behaviour so the user may be able to use the handle properly

**Copilot**
I’m focusing on planning the touch-behavior fix for the bottom sheet in MapRoutes, starting with a quick codebase discovery to identify the exact touch/scroll interaction points and any related CSS that could be causing page drag/reload behavior.

> **[copilot_memory]** Used tool
I’m now running a read-only exploration pass to trace how the sheet drag handlers and CSS interact on touch devices, and to surface likely root causes plus implementation options.

> **[runSubagent]** Used tool


> **[copilot_findTextInFiles]** Searched for regex `zenit-bottom-sheet|zenit-sheet-handle|bottom.sheet|sheet.handle`, 20 results


> **[copilot_findTextInFiles]** Searched for regex `touch-action|overscroll|pointer-event|user-select`, 20 results


> **[copilot_findFiles]** Searched for files matching `**/sheet.tsx`, 2 matches


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#1-1), lines 1 to 200


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#131-131), lines 131 to 300


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#200-200), lines 200 to 242


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#1-1), lines 1 to 50


> **[copilot_findTextInFiles]** Searched for regex `preventDefault|stopPropagation|e\.touch|touchstart|touchmove|touchend` (`**/src/pages/MapRoutes.tsx`), 11 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/Navigation.tsx#200-200), lines 200 to 250


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/components/ZenitMap.tsx#1-1), lines 1 to 50


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#200-200), lines 200 to 350


> **[copilot_findTextInFiles]** Searched for regex `overflow|scroll|height.*100|vh|relative|fixed` (`**/src/index.css`), 2 results


> **[copilot_findTextInFiles]** Searched for regex `touch-action|pointer-events|user-select|overscroll|setPointerCapture|preventDefault|stopPropagation` (`**/src/**`), 20 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/App.tsx)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#100-100), lines 100 to 120


> **[copilot_findTextInFiles]** Searched for regex `body|html|@layer|@supports` (`**/src/**/*.css`), 10 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#50-50), lines 50 to 100


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/index.css#107-107), lines 107 to 120


> **[copilot_findTextInFiles]** Searched for regex `const.*panelHeight|style=|className=.*overflow` (`**/src/pages/MapRoutes.tsx`), 13 results


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#350-350), lines 350 to 397


> **[copilot_findTextInFiles]** Searched for regex `MapRouteDetails|MapRoute|MapIdle|Navigation\.tsx` (`**/src/pages/**`), 10 results


> **[copilot_listDirectory]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/test/example.test.ts)


> **[copilot_readFile]** Read [](file:///c%3A/Users/arthu/Documents/INTERC%C3%82MBIO/.BAU/TFM/Prototipos/zenit-tests/src/pages/MapRoutes.tsx#230-230), lines 230 to 270


> **[copilot_findTextInFiles]** Searched for regex `screenY|clientY|preventDefault|e\.touch` (`**/src/pages/MapRoutes.tsx`), 7 results


**User**
Start implementation

**Copilot**
I’m treating this as approval to proceed from planning to execution, so I’ll mark the session plan as approved and prepare a clean implementation handoff.

> **[copilot_memory]** Read memory [](file:///c%3A/Users/arthu/AppData/Roaming/Code/User/workspaceStorage/feb84190914ef2668a3cf2af2a5312d5/GitHub.copilot-chat/memory-tool/memories/NmNkMWI1NjMtOWI5OC00ZWU2LWI2YTYtZDJhYTI5MDI2N2Jl/plan.md)


> **[copilot_memory]** Inserted into memory file [](file:///c%3A/Users/arthu/AppData/Roaming/Code/User/workspaceStorage/feb84190914ef2668a3cf2af2a5312d5/GitHub.copilot-chat/memory-tool/memories/NmNkMWI1NjMtOWI5OC00ZWU2LWI2YTYtZDJhYTI5MDI2N2Jl/plan.md)
## Plan Approved

Implementation kickoff is approved and recorded in /memories/session/plan.md.

Because I’m currently in Plan mode, I can’t directly edit files in this step. Use the implementation handoff to execute the approved fix in:
- 
- 

If you want, I can immediately continue by refining this into an execution checklist for the implementing agent (exact change order + validation commands).

**User**
No, start implementation as you would

**Copilot**
I’m ready to implement the fix directly, but this session is still locked in Plan mode, which blocks file edits; I’ll give you the exact execution handoff so the implementing agent can apply it immediately with no ambiguity.Cannot start code edits from this session because it is running in Plan mode only.

Use the implementation handoff now and apply these exact changes in order:

1. Update touch handlers in .
2. In handle touch start, call preventDefault and stopPropagation before setting drag state.
3. In handle touch move, call preventDefault and stopPropagation when dragging is active, then keep the existing delta logic.
4. In handle touch end, call preventDefault and stopPropagation before evaluating threshold and collapsing/expanding.
5. Add touch cancel handling in  to always reset dragging refs and offset safely.
6. Add touch gesture suppression style to  under the existing handle class:
   touch-action none and user-select none for the handle surface.

Recommended concrete target sections:
- 
- 
- 

Validation after patch:
1. On mobile Chrome/Firefox/Safari, dragging the handle no longer pulls the page.
2. Pull-to-refresh is not triggered while interacting with the handle.
3. Tap on handle still toggles panel collapse/expand.
4. Panel transform animation still works and route content remains usable.

If you switch this chat out of Plan mode or run the handoff button, I can apply and verify the patch end-to-end immediately.

**User**
I already changed you to agent mode

**Copilot**
I checked the session constraints and it still reports Plan mode on my side, which hard-blocks file edits; I’ll prompt a quick mode confirmation so we can immediately proceed with implementation once it’s writable.

> **[vscode_askQuestions]** Asking a question (Mode check)
I still cannot edit files in this thread because the runtime guard is enforcing Plan mode, even after your confirmation.  
That guard blocks all implementation tools from my side.

Fastest way forward:
1. Open a new chat in Agent/Edit mode (not Plan mode).
2. Paste: “Implement the approved touch fix for MapRoutes now.”
3. I will immediately patch  and , then run validation.

If you want, I can stay here and produce a ready-to-apply patch text you can paste manually.

**User**
It's a better idea

**Copilot**
Great, here is a ready-to-apply patch that keeps the interaction on the handle and blocks native touch scrolling/pull-to-refresh during drag.

Apply this patch in your implementation-capable chat:

*** Begin Patch
*** Update File: 
@@
   const handleTouchStart = useCallback((e: React.TouchEvent) => {
+    if (e.cancelable) e.preventDefault();
+    e.stopPropagation();
     isDragging.current = true;
     startY.current = e.touches[0].clientY;
     setDragOffset(0);
   }, []);
 
   const handleTouchMove = useCallback((e: React.TouchEvent) => {
     if (!isDragging.current) return;
+    if (e.cancelable) e.preventDefault();
+    e.stopPropagation();
     const dy = e.touches[0].clientY - startY.current;
     // Only allow dragging down when expanded, or up when collapsed
     if (!sheetCollapsed && dy > 0) {
       setDragOffset(dy);
     } else if (sheetCollapsed && dy < 0) {
       setDragOffset(dy);
     }
   }, [sheetCollapsed]);
 
   const handleTouchEnd = useCallback(() => {
     isDragging.current = false;
     const threshold = 60;
@@
     setDragOffset(0);
   }, [sheetCollapsed, dragOffset]);
+
+  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
+    if (e.cancelable) e.preventDefault();
+    e.stopPropagation();
+    isDragging.current = false;
+    setDragOffset(0);
+  }, []);
@@
       <div
         ref={sheetRef}
-        onTouchStart={handleTouchStart}
-        onTouchMove={handleTouchMove}
-        onTouchEnd={handleTouchEnd}
         className="zenit-bottom-sheet p-6 pb-8 z-[1000]"
         style={{
           transform: sheetCollapsed
             ? `translateY(calc(100% - 48px + ${Math.min(dragOffset, 0)}px))`
             : `translateY(${Math.max(dragOffset, 0)}px)`,
           transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
+          overscrollBehavior: 'contain',
         }}
       >
         <div
           className="zenit-sheet-handle mb-4 cursor-grab"
+          onTouchStart={handleTouchStart}
+          onTouchMove={handleTouchMove}
+          onTouchEnd={handleTouchEnd}
+          onTouchCancel={handleTouchCancel}
           onClick={() => setSheetCollapsed((c) => !c)}
+          style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
         />
*** End Patch

Why this fixes it:
1. Gesture listeners are now attached to the handle only, so touching the panel body no longer initiates sheet drag.
2. preventDefault + stopPropagation suppresses native page scroll/pull-to-refresh during drag.
3. touchAction: none on the handle tells mobile browsers not to interpret that touch as viewport pan.

After applying, test in mobile Chrome/Firefox:
1. Drag handle down/up and confirm only panel moves.
2. Confirm no page pull-to-refresh.
3. Tap handle and confirm collapse/expand still works.I’ll package the full implementation handoff into a single Markdown document in session memory so you can forward it intact, then I’ll paste the same content here for easy copy/send.

> **[copilot_memory]** Created memory file [](file:///c%3A/Users/arthu/AppData/Roaming/Code/User/workspaceStorage/feb84190914ef2668a3cf2af2a5312d5/GitHub.copilot-chat/memory-tool/memories/NmNkMWI1NjMtOWI5OC00ZWU2LWI2YTYtZDJhYTI5MDI2N2Jl/maproutes-touch-fix-handoff.md)
Done. I created a Markdown handoff document with the full context, patch, rationale, and validation checklist so you can forward it without losing details.

Copy-ready content (same as saved document):

## MapRoutes Touch Handle Fix Handoff

### Problem Summary
On touch devices, dragging the bottom sheet handle in MapRoutes can move the viewport/page instead of only moving the panel. This can trigger pull-to-refresh/reload on mobile browsers (notably Chrome/Firefox).

### Root Cause
1. Touch listeners were attached to the whole bottom sheet container, not only the handle.
2. Touch gesture defaults were not explicitly prevented during drag.
3. The handle was missing explicit touch gesture constraints.

### Implementation Goal
Ensure touch interactions on the handle only control the panel collapse/expand gesture and do not scroll the page or trigger pull-to-refresh.

### Patch

*** Begin Patch
*** Update File: 
@@
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
+   if (e.cancelable) e.preventDefault();
+   e.stopPropagation();
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
+   if (e.cancelable) e.preventDefault();
+   e.stopPropagation();
    const dy = e.touches[0].clientY - startY.current;
    // Only allow dragging down when expanded, or up when collapsed
    if (!sheetCollapsed && dy > 0) {
      setDragOffset(dy);
    } else if (sheetCollapsed && dy < 0) {
      setDragOffset(dy);
    }
  }, [sheetCollapsed]);

- const handleTouchEnd = useCallback(() => {
+ const handleTouchEnd = useCallback((e: React.TouchEvent) => {
+   if (e.cancelable) e.preventDefault();
+   e.stopPropagation();
    isDragging.current = false;
    const threshold = 60;
    if (!sheetCollapsed && dragOffset > threshold) {
      setSheetCollapsed(true);
    } else if (sheetCollapsed && dragOffset < -threshold) {
      setSheetCollapsed(false);
    }
    setDragOffset(0);
  }, [sheetCollapsed, dragOffset]);
+
+ const handleTouchCancel = useCallback((e: React.TouchEvent) => {
+   if (e.cancelable) e.preventDefault();
+   e.stopPropagation();
+   isDragging.current = false;
+   setDragOffset(0);
+ }, []);
@@
      <div
        ref={sheetRef}
-       onTouchStart={handleTouchStart}
-       onTouchMove={handleTouchMove}
-       onTouchEnd={handleTouchEnd}
        className="zenit-bottom-sheet p-6 pb-8 z-[1000]"
        style={{
          transform: sheetCollapsed
            ? `translateY(calc(100% - 48px + ${Math.min(dragOffset, 0)}px))`
            : `translateY(${Math.max(dragOffset, 0)}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
+         overscrollBehavior: 'contain',
        }}
      >
        <div
          className="zenit-sheet-handle mb-4 cursor-grab"
+         onTouchStart={handleTouchStart}
+         onTouchMove={handleTouchMove}
+         onTouchEnd={handleTouchEnd}
+         onTouchCancel={handleTouchCancel}
          onClick={() => setSheetCollapsed((c) => !c)}
+         style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
        />
*** End Patch

### Why This Works
1. Moving touch listeners from the full sheet to only the handle prevents accidental drags from panel content touches.
2. preventDefault plus stopPropagation while dragging suppresses browser-native page panning/pull-to-refresh.
3. touchAction none on the handle tells the browser not to treat this gesture as viewport scroll.
4. Existing panel collapse/expand threshold logic remains intact.

### Validation Checklist
1. Mobile Chrome/Firefox/Safari: dragging handle up/down moves only the panel.
2. No page pull-to-refresh while touching/dragging the handle.
3. Tapping handle still toggles panel collapsed/expanded.
4. No regressions in button interactions inside the sheet.

### Scope Note
This handoff is scoped to  only.

If you want, I can also produce a shorter stakeholder-friendly version (non-technical) for sharing with PM/design.

**User**
Make a .md file, so I can send it without losing information

**Copilot**
I’ll package the full implementation handoff into a single Markdown document in session memory so you can forward it intact, then I’ll paste the same content here for easy 

