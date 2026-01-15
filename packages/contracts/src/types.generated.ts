/**
 * AUTO-GENERATED - DO NOT EDIT
 * Generated from prompt.schema.json v1.0
 * Run "pnpm generate" from packages/schema to regenerate
 */

// Schema Version
export const SCHEMA_VERSION = "1.0" as const;

export type Audience = "SELF" | "CLIENT" | "STUDENT" | "GENERAL" | "TECHNICAL" | "EXECUTIVE";
export const AudienceValues = ["SELF", "CLIENT", "STUDENT", "GENERAL", "TECHNICAL", "EXECUTIVE"] as const;

export type ExpertiseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export const ExpertiseLevelValues = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export type Tone = "NEUTRAL" | "PROFESSIONAL" | "FRIENDLY" | "STRICT" | "CREATIVE" | "PERSUASIVE";
export const ToneValues = ["NEUTRAL", "PROFESSIONAL", "FRIENDLY", "STRICT", "CREATIVE", "PERSUASIVE"] as const;

export type WritingStyle = "STEP_BY_STEP" | "CONCISE" | "DETAILED" | "STORY_DRIVEN" | "ANALYTICAL";
export const WritingStyleValues = ["STEP_BY_STEP", "CONCISE", "DETAILED", "STORY_DRIVEN", "ANALYTICAL"] as const;

export interface OutputFormat {
    useHeadings?: boolean;
    useLists?: boolean;
    useCodeBlocks?: boolean;
    allowEmojis?: boolean;
    maxLength?: number;
}

export interface PromptSchema {
    /** Schema version for compatibility tracking */
    schemaVersion: "1.0";
    /** The role the assistant should assume */
    role: string;
    /** The domain or field of expertise */
    domain: string;
    /** The intended audience for the response */
    audience?: Audience;
    /** Expertise level determining vocabulary, depth, and explanations */
    expertiseLevel: ExpertiseLevel;
    /** The tone to maintain throughout the response */
    tone: Tone;
    /** The writing style structure for the response */
    writingStyle: WritingStyle;
    /** Clear and specific primary task definition */
    objective: string;
    /** Mandatory constraints that override creativity and tone */
    constraints?: string[];
    /** Output formatting requirements */
    outputFormat?: OutputFormat;
    /** Additional context or background information */
    context?: string;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    category: "technical" | "creative" | "business" | "academic" | "general";
    schema: PromptSchema;
}
