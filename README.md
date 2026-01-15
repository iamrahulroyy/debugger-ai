# PromptForge OS

A production-grade monorepo for structured prompt engineering.

```
promptforge-os/
├── packages/
│   ├── schema/         # JSON Schema (SSOT)
│   ├── contracts/      # TypeScript types
│   └── py-contracts/   # Python models
│
├── apps/
│   ├── api/            # FastAPI backend
│   ├── web/            # Next.js frontend
│   └── extension/      # Chrome extension
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start API
cd apps/api && pip install -r requirements.txt && uvicorn app.main:app --reload

# Start Web (new terminal)
cd apps/web && pnpm dev

# Load Extension
# 1. Build: cd apps/extension && pnpm build
# 2. Open chrome://extensions/
# 3. Enable Developer mode → Load unpacked → select dist/
```

## Architecture

| Layer | Description |
|-------|-------------|
| **Schema** | JSON Schema as single source of truth |
| **Contracts** | Generated TypeScript + Python adapters |
| **API** | Backend authority for validation, linting, generation |
| **Web** | Orchestration only - delegates all logic to API |
| **Extension** | popup (UI), background (API calls), content (DOM injection) |

## Key Invariants

1. **Adapters must never be manually edited.** All changes originate from `packages/schema`.
2. **Frontend never validates locally.** All operations go through the API.
3. **Schema versioning.** Every prompt carries `schemaVersion: "1.0"`.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /prompts/validate` | Structural correctness (hard fail) |
| `POST /prompts/lint` | Quality warnings (soft fail, 0-100 score) |
| `POST /prompts/generate` | Generate formatted prompt |
| `GET /prompts/templates` | List templates |

## Development

```bash
# Regenerate TypeScript/Python from JSON Schema
pnpm generate
```
