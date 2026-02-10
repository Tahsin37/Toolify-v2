'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { countHashtags, analyzeHashtags, formatHashtags } from '@/lib/tools/social/hashtag-counter';
import { cn } from '@/lib/utils';
import { Hash, Copy, Check, CheckCircle, XCircle } from 'lucide-react';

export function HashtagCounter() {
    const [text, setText] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [analysis, setAnalysis] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (text.trim()) {
            const data = countHashtags({ text });
            if (data.success && data.data) {
                setResult(data.data);
                setAnalysis(analyzeHashtags(data.data.hashtags));
            }
        } else {
            setResult(null);
            setAnalysis(null);
        }
    }, [text]);

    const handleCopyHashtags = () => {
        if (result?.hashtags) {
            navigator.clipboard.writeText(result.hashtags.join(' '));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter Text with Hashtags</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Check out my new post! #socialmedia #marketing #content #digitalmarketing"
                    className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-base"
                />
            </Card>

            {/* Stats */}
            {result && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total Hashtags" value={result.count} color="indigo" />
                    <StatCard label="Unique" value={result.uniqueCount} color="emerald" />
                    <StatCard label="Duplicates" value={result.duplicates.length} color={result.duplicates.length > 0 ? 'amber' : 'slate'} />
                    <StatCard label="Avg Length" value={analysis?.averageLength || 0} />
                </div>
            )}

            {/* Platform Recommendations */}
            {result && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3">Platform Recommendations</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {result.platformRecommendations.map((pr: any) => (
                            <div
                                key={pr.platform}
                                className={cn(
                                    "p-3 rounded-lg border text-center",
                                    pr.isOptimal ? "bg-emerald-50 border-emerald-200" :
                                        result.count > pr.recommended ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
                                )}
                            >
                                <div className="flex items-center justify-center mb-1">
                                    {pr.isOptimal ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-600 mr-1" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-rose-600 mr-1" />
                                    )}
                                    <span className="font-medium text-slate-700">{pr.platform}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    {result.count}/{pr.recommended} recommended
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Extracted Hashtags */}
            {result && result.hashtags.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900 flex items-center">
                            <Hash className="h-4 w-4 text-indigo-600 mr-2" />
                            Extracted Hashtags
                        </h4>
                        <button onClick={handleCopyHashtags} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                            {copied ? 'Copied!' : 'Copy All'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.uniqueHashtags.map((tag: string, i: number) => (
                            <span
                                key={i}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium",
                                    result.duplicates.includes(tag.toLowerCase())
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-indigo-100 text-indigo-700"
                                )}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Suggestions */}
            {analysis && analysis.suggestions.length > 0 && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                        {analysis.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="text-sm text-blue-700">• {suggestion}</li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}

function StatCard({ label, value, color = 'slate' }: { label: string; value: string | number; color?: string }) {
    const colors: Record<string, string> = {
        slate: 'text-slate-600',
        emerald: 'text-emerald-600',
        indigo: 'text-indigo-600',
        amber: 'text-amber-600',
    };

    return (
        <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
            <div className={cn("text-2xl font-bold", colors[color])}>{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}
