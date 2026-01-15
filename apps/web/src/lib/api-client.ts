/**
 * PromptForge API Client
 * 
 * All prompt operations are delegated to the API.
 * Frontend is orchestration only - no local validation or generation.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PromptSchema {
    schemaVersion: '1.0';
    role: string;
    domain: string;
    audience?: 'SELF' | 'CLIENT' | 'STUDENT' | 'GENERAL' | 'TECHNICAL' | 'EXECUTIVE';
    expertiseLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    tone: 'NEUTRAL' | 'PROFESSIONAL' | 'FRIENDLY' | 'STRICT' | 'CREATIVE' | 'PERSUASIVE';
    writingStyle: 'STEP_BY_STEP' | 'CONCISE' | 'DETAILED' | 'STORY_DRIVEN' | 'ANALYTICAL';
    objective: string;
    constraints?: string[];
    outputFormat?: {
        useHeadings?: boolean;
        useLists?: boolean;
        useCodeBlocks?: boolean;
        allowEmojis?: boolean;
        maxLength?: number;
    };
    context?: string;
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationResponse {
    valid: boolean;
    errors: ValidationError[];
}

export interface LintWarning {
    field: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    suggestion?: string;
}

export interface LintResponse {
    passed: boolean;
    warnings: LintWarning[];
    score: number;
}

export interface GenerateResponse {
    prompt: string;
    tokenEstimate: number;
    metadata: Record<string, unknown>;
}

export interface TemplateSummary {
    id: string;
    name: string;
    description: string;
    category: string;
}

export interface Template extends TemplateSummary {
    schema: PromptSchema;
}

class ApiClient {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${res.status}`);
        }

        return res.json();
    }

    /**
     * Validate prompt schema (hard fail)
     */
    async validate(schema: PromptSchema): Promise<ValidationResponse> {
        return this.request('/prompts/validate', {
            method: 'POST',
            body: JSON.stringify(schema),
        });
    }

    /**
     * Lint prompt schema (soft fail with score)
     */
    async lint(schema: PromptSchema): Promise<LintResponse> {
        return this.request('/prompts/lint', {
            method: 'POST',
            body: JSON.stringify(schema),
        });
    }

    /**
     * Generate formatted prompt from schema
     */
    async generate(schema: PromptSchema): Promise<GenerateResponse> {
        return this.request('/prompts/generate', {
            method: 'POST',
            body: JSON.stringify(schema),
        });
    }

    /**
     * List available templates
     */
    async listTemplates(): Promise<TemplateSummary[]> {
        return this.request('/prompts/templates');
    }

    /**
     * Get a specific template
     */
    async getTemplate(id: string): Promise<Template> {
        return this.request(`/prompts/templates/${id}`);
    }
}

export const api = new ApiClient();
