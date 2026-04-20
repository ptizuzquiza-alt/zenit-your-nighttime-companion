---
date: 2026-04-16
title: "Visual element selection and code mapping in VSCode"
tags: [copilot, chat-export]
workspace: "zenit-one-route"
---

# Visual element selection and code mapping in VSCode

**User**
Is there a way to visually select elements in my prototype and find its corresponding code in VSCode? Currently the app is running locally in a browser window through the command "npm run dev"

**Copilot**
There isn’t a built-in way in VS Code to visually select an element in your running web app and instantly jump to its source code. However, here are some effective workflows and tools you can use:

1. Browser DevTools:  
- Right-click the element in your browser and choose “Inspect” to open DevTools.
- In the Elements panel, you can see the HTML and the applied CSS.
- If you use source maps (enabled by default in Vite/React), you can often click on the filename/line number in the “Sources” or “Styles” panel to open the corresponding file in your code editor (sometimes you need to map your local workspace in DevTools for this to work seamlessly).

2. VS Code Extensions:  
- Extensions like “Live Server” or “Debugger for Chrome” allow you to debug and set breakpoints in your code, and sometimes let you jump from browser to code, but not by direct visual selection.
- “React Developer Tools” (browser extension) lets you inspect React components and see their props/state, and often shows the component name, which you can then search for in your codebase.

3. Workflow Tip:  
- Use the component or class name you see in DevTools or React DevTools to search in VS Code (Ctrl+P or Ctrl+Shift+F).

Summary:  
There’s no direct “click element, jump to code” in VS Code, but using browser DevTools (with source maps), React DevTools, and VS Code’s search features together provides a fast workflow for finding the code behind UI elements. If you want a more integrated solution, let me know your tech stack (React, Vue, etc.) and I can suggest the best available tools or setup guides.

