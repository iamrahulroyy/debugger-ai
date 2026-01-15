import type { PromptSchema } from './types.generated';
import {
    SCHEMA_VERSION,
    AudienceValues,
    ExpertiseLevelValues,
    ToneValues,
    WritingStyleValues
} from './types.generated';

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

/**
 * Validate a prompt schema object
 * Note: Full validation should be done server-side via /prompts/validate
 * This provides basic client-side checks only
 */
export function validateSchema(schema: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!schema || typeof schema !== 'object') {
        return { valid: false, errors: [{ field: 'root', message: 'Schema must be an object', code: 'INVALID_TYPE' }] };
    }

    const s = schema as Record<string, unknown>;

    // Required fields
    const required = ['schemaVersion', 'role', 'domain', 'expertiseLevel', 'tone', 'writingStyle', 'objective'];
    for (const field of required) {
        if (!s[field]) {
            errors.push({ field, message: `${field} is required`, code: 'REQUIRED' });
        }
    }

    // Schema version
    if (s.schemaVersion && s.schemaVersion !== SCHEMA_VERSION) {
        errors.push({ field: 'schemaVersion', message: `Must be ${SCHEMA_VERSION}`, code: 'INVALID_VERSION' });
    }

    // Enum validations
    if (s.audience && !AudienceValues.includes(s.audience as never)) {
        errors.push({ field: 'audience', message: `Must be one of: ${AudienceValues.join(', ')}`, code: 'INVALID_ENUM' });
    }
    if (s.expertiseLevel && !ExpertiseLevelValues.includes(s.expertiseLevel as never)) {
        errors.push({ field: 'expertiseLevel', message: `Must be one of: ${ExpertiseLevelValues.join(', ')}`, code: 'INVALID_ENUM' });
    }
    if (s.tone && !ToneValues.includes(s.tone as never)) {
        errors.push({ field: 'tone', message: `Must be one of: ${ToneValues.join(', ')}`, code: 'INVALID_ENUM' });
    }
    if (s.writingStyle && !WritingStyleValues.includes(s.writingStyle as never)) {
        errors.push({ field: 'writingStyle', message: `Must be one of: ${WritingStyleValues.join(', ')}`, code: 'INVALID_ENUM' });
    }

    // Objective length
    if (typeof s.objective === 'string' && s.objective.length < 10) {
        errors.push({ field: 'objective', message: 'Objective must be at least 10 characters', code: 'MIN_LENGTH' });
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Create a default prompt schema with required fields
 */
export function createDefaultSchema(): PromptSchema {
    return {
        schemaVersion: '1.0',
        role: '',
        domain: '',
        expertiseLevel: 'INTERMEDIATE',
        tone: 'PROFESSIONAL',
        writingStyle: 'DETAILED',
        objective: '',
    };
}
