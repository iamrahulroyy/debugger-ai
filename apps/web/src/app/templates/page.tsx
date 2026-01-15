'use client';

import { useEffect, useState } from 'react';
import { api, type TemplateSummary } from '@/lib/api-client';
import Link from 'next/link';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.listTemplates()
            .then(setTemplates)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const categoryColors: Record<string, string> = {
        technical: 'bg-blue-900/30 text-blue-400 border-blue-800',
        creative: 'bg-purple-900/30 text-purple-400 border-purple-800',
        business: 'bg-green-900/30 text-green-400 border-green-800',
        academic: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
        general: 'bg-gray-800/50 text-gray-400 border-gray-700',
    };

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
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Templates</h2>
                    <p className="text-gray-400">Pre-built prompt schemas for common use cases</p>
                </div>

                {loading && (
                    <div className="text-center py-12 text-gray-500">Loading templates...</div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-400">
                        {error}
                    </div>
                )}

                {!loading && templates.length === 0 && (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-500">No templates available. Make sure the API is running.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Link
                            key={template.id}
                            href={`/templates/${template.id}`}
                            className="group bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                    {template.name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded border ${categoryColors[template.category] || categoryColors.general}`}>
                                    {template.category}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">{template.description}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
