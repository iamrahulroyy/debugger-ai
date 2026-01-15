'use client';

interface PromptOutputProps {
    prompt: string;
    tokenEstimate: number;
    score?: number;
}

export default function PromptOutput({ prompt, tokenEstimate, score }: PromptOutputProps) {
    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(prompt);
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium text-gray-300">Generated Prompt</h3>
                    <span className="text-xs text-gray-500">~{tokenEstimate} tokens</span>
                    {score !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded ${score >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                            Quality: {score}/100
                        </span>
                    )}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    Copy
                </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-mono">
                    {prompt}
                </pre>
            </div>
        </div>
    );
}
