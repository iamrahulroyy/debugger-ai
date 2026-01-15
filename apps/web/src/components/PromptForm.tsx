'use client';

import { useState } from 'react';
import type { PromptSchema } from '@/lib/api-client';

const EXPERTISE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
const TONES = ['NEUTRAL', 'PROFESSIONAL', 'FRIENDLY', 'STRICT', 'CREATIVE', 'PERSUASIVE'] as const;
const WRITING_STYLES = ['STEP_BY_STEP', 'CONCISE', 'DETAILED', 'STORY_DRIVEN', 'ANALYTICAL'] as const;
const AUDIENCES = ['SELF', 'CLIENT', 'STUDENT', 'GENERAL', 'TECHNICAL', 'EXECUTIVE'] as const;

interface PromptFormProps {
    onSubmit: (schema: PromptSchema) => void;
    loading?: boolean;
    initialValues?: Partial<PromptSchema>;
}

export default function PromptForm({ onSubmit, loading, initialValues }: PromptFormProps) {
    const [role, setRole] = useState(initialValues?.role || '');
    const [domain, setDomain] = useState(initialValues?.domain || '');
    const [audience, setAudience] = useState<typeof AUDIENCES[number]>(initialValues?.audience || 'GENERAL');
    const [expertiseLevel, setExpertiseLevel] = useState<typeof EXPERTISE_LEVELS[number]>(initialValues?.expertiseLevel || 'INTERMEDIATE');
    const [tone, setTone] = useState<typeof TONES[number]>(initialValues?.tone || 'PROFESSIONAL');
    const [writingStyle, setWritingStyle] = useState<typeof WRITING_STYLES[number]>(initialValues?.writingStyle || 'DETAILED');
    const [objective, setObjective] = useState(initialValues?.objective || '');
    const [constraints, setConstraints] = useState<string[]>(initialValues?.constraints || []);
    const [newConstraint, setNewConstraint] = useState('');
    const [context, setContext] = useState(initialValues?.context || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const schema: PromptSchema = {
            schemaVersion: '1.0',
            role,
            domain,
            audience,
            expertiseLevel,
            tone,
            writingStyle,
            objective,
            constraints: constraints.length > 0 ? constraints : undefined,
            context: context || undefined,
        };

        onSubmit(schema);
    };

    const addConstraint = () => {
        if (newConstraint.trim()) {
            setConstraints([...constraints, newConstraint.trim()]);
            setNewConstraint('');
        }
    };

    const removeConstraint = (index: number) => {
        setConstraints(constraints.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role & Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Role *</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Software Architect"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Domain *</label>
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g., Software Engineering"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            {/* Expertise & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Expertise Level *</label>
                    <select
                        value={expertiseLevel}
                        onChange={(e) => setExpertiseLevel(e.target.value as typeof EXPERTISE_LEVELS[number])}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {EXPERTISE_LEVELS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Audience</label>
                    <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as typeof AUDIENCES[number])}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {AUDIENCES.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tone & Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Tone *</label>
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as typeof TONES[number])}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {TONES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Writing Style *</label>
                    <select
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value as typeof WRITING_STYLES[number])}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {WRITING_STYLES.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Objective */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Objective *</label>
                <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Clear and specific task definition (minimum 10 characters)"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    required
                    minLength={10}
                />
            </div>

            {/* Context */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Context (Optional)</label>
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Additional background information"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
            </div>

            {/* Constraints */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Constraints</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newConstraint}
                        onChange={(e) => setNewConstraint(e.target.value)}
                        placeholder="Add a constraint..."
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
                    />
                    <button
                        type="button"
                        onClick={addConstraint}
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Add
                    </button>
                </div>
                {constraints.length > 0 && (
                    <ul className="space-y-2">
                        {constraints.map((c, i) => (
                            <li key={i} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                                <span className="flex-1 text-gray-300">{c}</span>
                                <button
                                    type="button"
                                    onClick={() => removeConstraint(i)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Generating...' : 'Generate Prompt'}
            </button>
        </form>
    );
}
