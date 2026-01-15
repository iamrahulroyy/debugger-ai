"""
Prompt API Routes

Endpoints:
- POST /validate  → Structural correctness (hard fail)
- POST /lint      → Quality warnings (soft fail)
- POST /generate  → Generate formatted prompt text
- GET  /templates → List available templates
- GET  /templates/{id} → Get specific template
"""

from typing import List
from fastapi import APIRouter, HTTPException

from app.models.prompt import (
    PromptSchemaRequest,
    ValidationResponse,
    LintResponse,
    GenerateResponse,
    TemplateResponse,
    TemplateSummary,
)
from app.services.prompt_service import PromptService

router = APIRouter()
service = PromptService()


@router.post("/validate", response_model=ValidationResponse)
async def validate_prompt(request: PromptSchemaRequest) -> ValidationResponse:
    """
    Validate prompt schema for structural correctness.

    Returns hard failure if schema is invalid.
    """
    return service.validate(request)


@router.post("/lint", response_model=LintResponse)
async def lint_prompt(request: PromptSchemaRequest) -> LintResponse:
    """
    Lint prompt schema for quality issues.

    Returns soft warnings - schema may still be valid but could be improved.
    """
    return service.lint(request)


@router.post("/generate", response_model=GenerateResponse)
async def generate_prompt(request: PromptSchemaRequest) -> GenerateResponse:
    """
    Generate formatted prompt text from schema.

    Validates first, then generates the final prompt string.
    """
    # Validate first
    validation = service.validate(request)
    if not validation.valid:
        raise HTTPException(status_code=400, detail=validation.errors)

    return service.generate(request)


@router.get("/templates", response_model=List[TemplateSummary])
async def list_templates() -> List[TemplateSummary]:
    """List all available prompt templates."""
    return service.list_templates()


@router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str) -> TemplateResponse:
    """Get a specific template by ID."""
    template = service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=404, detail=f"Template '{template_id}' not found"
        )
    return template
