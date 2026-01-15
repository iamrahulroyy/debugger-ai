'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Template, type GenerateResponse } from '@/lib/api-client';
import PromptOutput from '@/components/PromptOutput';
import Link from 'next/link';

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState<Template | null>(null);
    const [result, setResult] = useState<GenerateResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            api.getTemplate(params.id as string)
                .then(setTemplate)
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    const handleGenerate = async () => {
        if (!template) return;

        setGenerating(true);
        try {
            const generated = await api.generate(template.schema);
            setResult(generated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500">Loading template...</div>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 mb-4">{error || 'Template not found'}</div>
                    <Link href="/templates" className="text-indigo-400 hover:underline">
                        ← Back to templates
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
            {/* Header */}
            <header className="border-b border-gray-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">PromptForge OS</h1>
                            <p className="text-xs text-gray-400">Structured Prompt Engineering</p>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/templates" className="text-gray-400 hover:text-white mb-8 inline-block">
                    ← Back to templates
                </Link>

                <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-8 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{template.name}</h2>
                    <p className="text-gray-400 mb-6">{template.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Role</div>
                            <div className="text-sm text-white">{template.schema.role}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Domain</div>
                            <div className="text-sm text-white">{template.schema.domain}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Tone</div>
                            <div className="text-sm text-white">{template.schema.tone}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Expertise</div>
                            <div className="text-sm text-white">{template.schema.expertiseLevel}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50"
                    >
                        {generating ? 'Generating...' : 'Generate Prompt'}
                    </button>
                </div>

                {result && (
                    <PromptOutput prompt={result.prompt} tokenEstimate={result.tokenEstimate} />
                )}
            </main>
        </div>
    );
}
