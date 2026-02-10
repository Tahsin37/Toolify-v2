'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { optimizeSlug, validateSlug, generateSlugVariations } from '@/lib/tools/seo/slug-optimizer';
import { cn } from '@/lib/utils';
import { Link2, CheckCircle2, AlertTriangle, Copy, Check, Wand2 } from 'lucide-react';

export function SlugOptimizer() {
    const [text, setText] = React.useState('');
    const [removeStopWords, setRemoveStopWords] = React.useState(true);
    const [maxLength, setMaxLength] = React.useState(60);
    const [result, setResult] = React.useState<any>(null);
    const [variations, setVariations] = React.useState<string[]>([]);
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleOptimize = () => {
        if (!text.trim()) return;
        const data = optimizeSlug({ text, removeStopWords, maxLength });
        if (data.success) {
            setResult(data.data);
            setVariations(generateSlugVariations(text));
        }
    };

    const handleCopy = (slug: string) => {
        navigator.clipboard.writeText(slug);
        setCopied(slug);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title or Text to Convert</label>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g., How to Optimize Your Website for SEO in 2024"
                        className="text-base h-12"
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={removeStopWords}
                            onChange={(e) => setRemoveStopWords(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Remove Stop Words</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-700">Max Length:</span>
                        <select
                            value={maxLength}
                            onChange={(e) => setMaxLength(Number(e.target.value))}
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1 text-slate-900 bg-white focus:ring-indigo-500"
                        >
                            <option value={40}>40</option>
                            <option value={50}>50</option>
                            <option value={60}>60</option>
                            <option value={75}>75</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Button onClick={handleOptimize} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Wand2 className="h-4 w-4 mr-2" />
                Optimize Slug
            </Button>

            {result && (
                <>
                    {/* Result */}
                    <Card className={cn(
                        "p-5 border shadow-sm",
                        result.isOptimal ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                {result.isOptimal ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                )}
                                <span className={cn("text-sm font-medium", result.isOptimal ? "text-emerald-700" : "text-amber-700")}>
                                    {result.isOptimal ? 'Optimal Slug' : 'Optimized (Review Recommended)'}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500">{result.length}/{maxLength} chars</span>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <Link2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <code className="text-lg font-mono text-slate-900 truncate">{result.optimized}</code>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleCopy(result.optimized)}>
                                    {copied === result.optimized ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {result.changes.length > 0 && (
                            <div>
                                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Changes Made</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.changes.map((change: string, i: number) => (
                                        <span key={i} className="text-xs bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-600">
                                            {change}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Variations */}
                    {variations.length > 1 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-3">Alternative Slugs</h4>
                            <div className="space-y-2">
                                {variations.map((slug, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <code className="text-sm font-mono text-slate-700 truncate flex-1">{slug}</code>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy(slug)}>
                                            {copied === slug ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Before/After */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Comparison</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                                <span className="text-xs text-rose-600 font-medium">Before</span>
                                <p className="text-sm text-slate-700 mt-1 break-words">{result.original}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <span className="text-xs text-emerald-600 font-medium">After</span>
                                <code className="text-sm text-slate-700 mt-1 block break-all font-mono">{result.optimized}</code>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
