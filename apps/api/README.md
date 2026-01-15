# PromptForge API

FastAPI backend for PromptForge OS. **This is the authority** for all prompt operations.

## Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `POST /prompts/validate` | Hard fail | Structural correctness |
| `POST /prompts/lint` | Soft fail | Quality warnings (score 0-100) |
| `POST /prompts/generate` | — | Generate formatted prompt |
| `GET /prompts/templates` | — | List templates |
| `GET /prompts/templates/{id}` | — | Get template |

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: <http://localhost:8000/docs>

## Authority Rule

> Frontend sends schema → API validates → API generates  
> Frontend **never** assembles final prompts locally.
