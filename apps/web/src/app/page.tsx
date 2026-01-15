'use client';

import { useState } from 'react';
import PromptForm from '@/components/PromptForm';
import PromptOutput from '@/components/PromptOutput';
import { api, type PromptSchema, type GenerateResponse, type LintResponse } from '@/lib/api-client';

export default function Home() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [lintResult, setLintResult] = useState<LintResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (schema: PromptSchema) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLintResult(null);

    try {
      // Lint first (for quality score)
      const lint = await api.lint(schema);
      setLintResult(lint);

      // Then generate
      const generated = await api.generate(schema);
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PromptForge OS</h1>
              <p className="text-xs text-gray-400">Structured Prompt Engineering</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/templates" className="text-gray-400 hover:text-white transition-colors">
              Templates
            </a>
            <a href="http://localhost:8000/docs" target="_blank" className="text-gray-400 hover:text-white transition-colors">
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Structured</span> Prompts
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Eliminate vague prompts. Define role, expertise, tone, and constraints with precision.
            Generate production-ready prompts every time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Prompt Schema</h3>
            <PromptForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Output */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {lintResult && lintResult.warnings.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
                <h4 className="text-yellow-400 font-medium mb-2">Quality Warnings</h4>
                <ul className="space-y-1 text-sm text-yellow-300/80">
                  {lintResult.warnings.map((w, i) => (
                    <li key={i}>• {w.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {result && (
              <PromptOutput
                prompt={result.prompt}
                tokenEstimate={result.tokenEstimate}
                score={lintResult?.score}
              />
            )}

            {!result && !loading && !error && (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500">Fill in the schema and generate your prompt</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
