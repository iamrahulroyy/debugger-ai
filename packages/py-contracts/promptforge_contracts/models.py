"""
AUTO-GENERATED - DO NOT EDIT
Generated from prompt.schema.json v1.0
Run "pnpm generate" from packages/schema to regenerate
"""

from enum import Enum
from typing import Optional, List
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
    
    use_headings: Optional[bool] = True
    use_lists: Optional[bool] = True
    use_code_blocks: Optional[bool] = False
    allow_emojis: Optional[bool] = False
    max_length: Optional[int] = Field(default=None, ge=50)


class PromptSchema(BaseModel):
    """
    PromptForge OS Prompt Schema v1.0
    
    Universal structured prompt schema for enforcing clarity,
    structure, and intent across all AI prompt interactions.
    """
    
    schema_version: str = Field(default=SCHEMA_VERSION, const=True)
    role: str = Field(..., description="The role the assistant should assume")
    domain: str = Field(..., description="The domain or field of expertise")
    audience: Optional[Audience] = Field(default=Audience.GENERAL)
    expertise_level: ExpertiseLevel = Field(..., description="Expertise level determining vocabulary and depth")
    tone: Tone = Field(..., description="The tone to maintain throughout the response")
    writing_style: WritingStyle = Field(..., description="The writing style structure")
    objective: str = Field(..., min_length=10, description="Clear and specific primary task definition")
    constraints: Optional[List[str]] = Field(default=None, description="Mandatory constraints")
    output_format: Optional[OutputFormat] = None
    context: Optional[str] = Field(default=None, description="Additional context or background")

    class Config:
        use_enum_values = True


class PromptTemplate(BaseModel):
    """A pre-built prompt template."""
    
    id: str = Field(..., pattern=r"^[a-z0-9-]+$")
    name: str
    description: str
    category: str = Field(..., pattern=r"^(technical|creative|business|academic|general)$")
    schema_: PromptSchema = Field(..., alias="schema")

    class Config:
        populate_by_name = True
