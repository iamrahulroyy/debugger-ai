# PromptForge Extension

Chrome extension (Manifest v3) for PromptForge OS.

## Architecture

| Folder | Responsibility |
|--------|----------------|
| `popup/` | Configuration UI only |
| `background/` | API calls + state sync |
| `content/` | DOM injection only |

## Install

1. Build: `pnpm build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/`

## Features

- Quick prompt generation from popup
- Inject prompts into ChatGPT, Claude, Gemini
- Persists last used settings
