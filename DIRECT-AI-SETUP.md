# Direct AI generation setup (v2.0)

The UI supports direct AI generation, but **does not work until a secure backend is deployed**. GitHub Pages cannot securely store an API key.

## Deploy Cloudflare Worker
1. Create a Cloudflare account and a Worker (Workers & Pages > Create > Worker).
2. Replace its code with `backend/worker.js` from this repository, then deploy.
3. Add a Worker **secret** called `OPENAI_API_KEY` (never put it in GitHub, browser code, or a public environment variable).
4. Set `ALLOWED_ORIGIN` to `https://waselghanem33.github.io`. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`; confirm your provider account supports that model.
5. In repository `ai-config.js`, set `window.LDS_AI_ENDPOINT` to the HTTPS Worker URL. Commit the change and wait for GitHub Pages deployment.
6. Open Design Laboratory, select a field's AI Assist, and click Generate directly with AI. Review the suggestion before inserting.

## Security and operations
- The Worker accepts only requests from the configured browser origin; **CORS is not authentication**. An attacker can call the endpoint outside a browser.
- Before exposing the Worker publicly, configure Cloudflare WAF rate limiting, budget alerts and spending limits. Prefer adding Cloudflare Turnstile validation or authenticated access. The example Worker is **not production-abuse-proof**.
- Never expose your API key in `ai-config.js` or any frontend file.
- The browser sends the contextual prompt to the Worker and AI provider only after the professor clicks Generate. Do not include personal or sensitive student data.
- AI output may be inaccurate or cite invented sources. Instructor review is required.
- If the backend is not configured, existing copy-prompt workflow still works.
- Direct AI requests may incur usage costs.
