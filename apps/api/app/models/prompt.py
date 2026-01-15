"""
API Request/Response Models

Self-contained models matching the schema definition.
For production, these would be generated from packages/schema.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

SCHEMA_VERSION = "1.0"


class Audience(str, Enum):
    SELF = "SELF"
    CLIENT = "CLIENT"
    STUDENT = "STUDENT"
    GENERAL = "GENERAL"
    TECHNICAL = "TECHNICAL"
    EXECUTIVE = "EXECUTIVE"


class ExpertiseLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class Tone(str, Enum):
    NEUTRAL = "NEUTRAL"
    PROFESSIONAL = "PROFESSIONAL"
    FRIENDLY = "FRIENDLY"
    STRICT = "STRICT"
    CREATIVE = "CREATIVE"
    PERSUASIVE = "PERSUASIVE"


class WritingStyle(str, Enum):
    STEP_BY_STEP = "STEP_BY_STEP"
    CONCISE = "CONCISE"
    DETAILED = "DETAILED"
    STORY_DRIVEN = "STORY_DRIVEN"
    ANALYTICAL = "ANALYTICAL"


class OutputFormat(BaseModel):
    """Output formatting requirements."""

    use_headings: Optional[bool] = Field(default=True, alias="useHeadings")
    use_lists: Optional[bool] = Field(default=True, alias="useLists")
    use_code_blocks: Optional[bool] = Field(default=False, alias="useCodeBlocks")
    allow_emojis: Optional[bool] = Field(default=False, alias="allowEmojis")
    max_length: Optional[int] = Field(default=None, ge=50, alias="maxLength")

    class Config:
        populate_by_name = True


class PromptSchemaRequest(BaseModel):
    """API request for prompt operations."""

    schema_version: str = Field(default=SCHEMA_VERSION, alias="schemaVersion")
    role: str = Field(..., min_length=1)
    domain: str = Field(..., min_length=1)
    audience: Optional[Audience] = Audience.GENERAL
    expertise_level: ExpertiseLevel = Field(..., alias="expertiseLevel")
    tone: Tone
    writing_style: WritingStyle = Field(..., alias="writingStyle")
    objective: str = Field(..., min_length=10)
    constraints: Optional[List[str]] = None
    output_format: Optional[OutputFormat] = Field(default=None, alias="outputFormat")
    context: Optional[str] = None

    class Config:
        populate_by_name = True
        use_enum_values = True


class ValidationError(BaseModel):
    """A single validation error."""

    field: str
    message: str
    code: str


class ValidationResponse(BaseModel):
    """Response from /validate endpoint."""

    valid: bool
    errors: List[ValidationError] = []


class LintWarning(BaseModel):
    """A single lint warning."""

    field: str
    message: str
    severity: str = Field(..., pattern=r"^(info|warning|error)$")
    suggestion: Optional[str] = None


class LintResponse(BaseModel):
    """Response from /lint endpoint."""

    passed: bool
    warnings: List[LintWarning] = []
    score: int = Field(..., ge=0, le=100, description="Quality score 0-100")


class GenerateResponse(BaseModel):
    """Response from /generate endpoint."""

    prompt: str
    token_estimate: int = Field(..., alias="tokenEstimate")
    metadata: Dict[str, Any] = {}

    class Config:
        populate_by_name = True


class TemplateSummary(BaseModel):
    """Summary of a template for listing."""

    id: str
    name: str
    description: str
    category: str


class TemplateResponse(BaseModel):
    """Full template with schema."""

    id: str
    name: str
    description: str
    category: str
    schema_: Dict[str, Any] = Field(..., alias="schema")

    class Config:
        populate_by_name = True
