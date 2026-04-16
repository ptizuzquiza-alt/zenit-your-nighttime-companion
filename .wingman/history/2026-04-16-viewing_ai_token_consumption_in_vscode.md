---
date: 2026-04-16
title: "Viewing AI token consumption in VSCode"
tags: [copilot, chat-export]
workspace: "zenit-one-route"
---

# Viewing AI token consumption in VSCode

**User**
How can I see in VSCode the AI tokens consumption? I want to know how much is left 

**Copilot**
VS Code does not natively display AI token consumption for Copilot or other AI extensions. Token usage tracking depends on the specific AI service or extension you are using. Here are some general approaches:

1. GitHub Copilot:  
- GitHub Copilot does not show token usage or limits in VS Code. Usage is managed by your GitHub subscription, and there is no visible token quota.

2. OpenAI API (or similar custom AI extensions):  
- Some third-party extensions may show token usage in the status bar or output panel, but this is not standard.
- If you use your own OpenAI API key, you can check usage on the OpenAI dashboard (https://platform.openai.com/usage).

3. Other AI Extensions:  
- Check the extension’s documentation or settings for usage or quota information.
- Some may provide a command or status bar item to show usage.

If you tell me which AI extension or service you are using, I can give more specific instructions.

**User**
Is there an extension for this control in the case of CoPilot?

**Copilot**
There is currently no official or third-party VS Code extension that shows GitHub Copilot token or usage consumption directly in the editor. GitHub Copilot operates on a subscription model, not a token There is currently no official or third-party VS Code extension that shows GitHub Copilot token or usage consumption directly in the editor. GitHub Copilot operates on a subscription model, not a token quota, so usage tracking is not exposed to users.

If you want to monitor Copilot usage or limits:
- You can only manage your subscription and see billing info on your GitHub account settings.
- There is no way to see prompt/response token counts or remaining There is currently no official or third-party VS Code extension that shows GitHub Copilot token or usage consumption directly in the editor. GitHub Copilot operates on a subscription model, not a token quota, so usage tracking is not exposed to users.

If you want to monitor Copilot usage or limits:
- You can only manage your subscription and see billing info on your GitHub account settings.
- There is no way to see prompt/response token counts or remaining quota for Copilot in VS Code.

If you need token-level tracking, you would need to use an OpenAI API key with a compatible extension (not Copilot), and even then, usage is usually tracked on the OpenAI dashboard, not in VS Code.

Let me know if you want recommendations for other AI extensions that support token usage tracking.

