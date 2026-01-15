# PromptForge Schema

**Single source of truth** for the PromptForge OS prompt schema.

## Files

| File | Purpose |
|------|---------|
| `prompt.schema.json` | Main prompt schema definition |
| `template.schema.json` | Template wrapper schema |
| `templates/` | Pre-built prompt templates |
| `generate.ts` | Codegen for TS/Python adapters |

## Usage

### Generate Adapters

```bash
pnpm generate
```

This generates:

- `packages/contracts/src/types.generated.ts`
- `packages/py-contracts/promptforge_contracts/models.generated.py`

### Verify No Drift

```bash
pnpm generate && git diff --exit-code
```

## Invariant

> **Adapters must never be manually edited. All changes originate from `packages/schema`.**
