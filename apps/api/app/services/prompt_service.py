"""
Prompt Service

Business logic for prompt validation, linting, generation, and template management.
"""

import json
from pathlib import Path
from typing import List, Optional

from app.models.prompt import (
    PromptSchemaRequest,
    ValidationResponse,
    ValidationError,
    LintResponse,
    LintWarning,
    GenerateResponse,
    TemplateResponse,
    TemplateSummary,
)

# Templates directory (relative to monorepo root)
TEMPLATES_DIR = (
    Path(__file__).parent.parent.parent.parent.parent
    / "packages"
    / "schema"
    / "templates"
)


class PromptService:
    """Service for prompt operations."""

    def validate(self, request: PromptSchemaRequest) -> ValidationResponse:
        """
        Validate prompt schema for structural correctness.
        Hard fail - schema is either valid or invalid.
        """
        errors: List[ValidationError] = []

        # Required field checks
        if not request.role.strip():
            errors.append(
                ValidationError(
                    field="role", message="Role cannot be empty", code="REQUIRED"
                )
            )

        if not request.domain.strip():
            errors.append(
                ValidationError(
                    field="domain", message="Domain cannot be empty", code="REQUIRED"
                )
            )

        if len(request.objective) < 10:
            errors.append(
                ValidationError(
                    field="objective",
                    message="Objective must be at least 10 characters",
                    code="MIN_LENGTH",
                )
            )

        # Schema version check
        if request.schema_version != "1.0":
            errors.append(
                ValidationError(
                    field="schema_version",
                    message=f"Unsupported schema version: {request.schema_version}",
                    code="INVALID_VERSION",
                )
            )

        return ValidationResponse(valid=len(errors) == 0, errors=errors)

    def lint(self, request: PromptSchemaRequest) -> LintResponse:
        """
        Lint prompt schema for quality issues.
        Soft fail - returns warnings and quality score.
        """
        warnings: List[LintWarning] = []
        score = 100

        # Check objective quality
        if len(request.objective) < 50:
            warnings.append(
                LintWarning(
                    field="objective",
                    message="Objective is brief. Consider adding more detail.",
                    severity="warning",
                    suggestion="A detailed objective (50+ chars) leads to better outputs.",
                )
            )
            score -= 10

        # Check for constraints
        if not request.constraints or len(request.constraints) == 0:
            warnings.append(
                LintWarning(
                    field="constraints",
                    message="No constraints specified.",
                    severity="info",
                    suggestion="Constraints help control output behavior.",
                )
            )
            score -= 5

        # Check for context
        if not request.context:
            warnings.append(
                LintWarning(
                    field="context",
                    message="No additional context provided.",
                    severity="info",
                    suggestion="Context can improve response relevance.",
                )
            )
            score -= 5

        # Check output format
        if not request.output_format:
            warnings.append(
                LintWarning(
                    field="output_format",
                    message="No output format specified. Defaults will be used.",
                    severity="info",
                )
            )

        # Expertise vs tone mismatch
        if request.expertise_level == "BEGINNER" and request.tone == "STRICT":
            warnings.append(
                LintWarning(
                    field="tone",
                    message="STRICT tone may be overwhelming for BEGINNER expertise level.",
                    severity="warning",
                    suggestion="Consider FRIENDLY or NEUTRAL tone for beginners.",
                )
            )
            score -= 10

        return LintResponse(passed=score >= 70, warnings=warnings, score=max(0, score))

    def generate(self, request: PromptSchemaRequest) -> GenerateResponse:
        """
        Generate formatted prompt text from schema.
        """
        sections = []

        # Role & Context
        sections.append(
            f"## Role\nYou are a {request.role} with expertise in {request.domain}."
        )

        if request.audience:
            sections.append(f"Your audience is: {request.audience}")

        # Expertise Level
        expertise_descriptions = {
            "BEGINNER": "Use simple vocabulary, provide thorough explanations, and include basic examples.",
            "INTERMEDIATE": "Use standard terminology, provide clear explanations with relevant examples.",
            "ADVANCED": "Use technical vocabulary freely, focus on depth and nuance.",
            "EXPERT": "Assume deep domain knowledge. Be precise and technical.",
        }
        sections.append(
            f"## Expertise Level\n{expertise_descriptions.get(request.expertise_level, '')}"
        )

        # Tone & Style
        sections.append(
            f"## Tone & Style\n- Tone: {request.tone}\n- Writing Style: {request.writing_style}"
        )

        # Objective
        sections.append(f"## Objective\n{request.objective}")

        # Context
        if request.context:
            sections.append(f"## Context\n{request.context}")

        # Constraints
        if request.constraints:
            constraints_text = "\n".join(f"- {c}" for c in request.constraints)
            sections.append(f"## Constraints (Non-negotiable)\n{constraints_text}")

        # Output Format
        if request.output_format:
            format_rules = []
            if request.output_format.use_headings:
                format_rules.append("Use headings to organize")
            if request.output_format.use_lists:
                format_rules.append("Use lists where appropriate")
            if request.output_format.use_code_blocks:
                format_rules.append("Use code blocks for code")
            else:
                format_rules.append("No code blocks")
            if not request.output_format.allow_emojis:
                format_rules.append("No emojis")
            if request.output_format.max_length:
                format_rules.append(f"Maximum {request.output_format.max_length} words")

            if format_rules:
                sections.append(
                    f"## Output Format\n" + "\n".join(f"- {r}" for r in format_rules)
                )

        prompt = "\n\n".join(sections)

        # Rough token estimate (1 token ≈ 4 chars)
        token_estimate = len(prompt) // 4

        return GenerateResponse(
            prompt=prompt,
            token_estimate=token_estimate,
            metadata={
                "schema_version": request.schema_version,
                "sections": len(sections),
            },
        )

    def list_templates(self) -> List[TemplateSummary]:
        """List all available templates."""
        templates = []

        if TEMPLATES_DIR.exists():
            for file in TEMPLATES_DIR.glob("*.json"):
                try:
                    data = json.loads(file.read_text())
                    templates.append(
                        TemplateSummary(
                            id=data["id"],
                            name=data["name"],
                            description=data["description"],
                            category=data.get("category", "general"),
                        )
                    )
                except (json.JSONDecodeError, KeyError):
                    continue

        return templates

    def get_template(self, template_id: str) -> Optional[TemplateResponse]:
        """Get a specific template by ID."""
        if not TEMPLATES_DIR.exists():
            return None

        template_file = TEMPLATES_DIR / f"{template_id}.json"
        if not template_file.exists():
            return None

        try:
            data = json.loads(template_file.read_text())
            return TemplateResponse(
                id=data["id"],
                name=data["name"],
                description=data["description"],
                category=data.get("category", "general"),
                schema=data["schema"],
            )
        except (json.JSONDecodeError, KeyError):
            return None
