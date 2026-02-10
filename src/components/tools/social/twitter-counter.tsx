'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkTwitterCount, analyzeTweet, createThread, getOptimalLength } from '@/lib/tools/social/twitter-counter';
import { cn } from '@/lib/utils';
import { Twitter, CheckCircle2, XCircle, Hash, AtSign, Link2, Copy, Check } from 'lucide-react';

export function TwitterCounter() {
    const [text, setText] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [analysis, setAnalysis] = React.useState<any>(null);
    const [thread, setThread] = React.useState<string[]>([]);
    const [copied, setCopied] = React.useState(false);
    const optimal = getOptimalLength();

    React.useEffect(() => {
        if (text) {
            const data = checkTwitterCount({ text });
            if (data.success && data.data) {
                setResult(data.data);
                setAnalysis(analyzeTweet(text));
                if (data.data.effectiveLength > 280) {
                    setThread(createThread(text));
                } else {
                    setThread([]);
                }
            }
        } else {
            setResult(null);
            setAnalysis(null);
            setThread([]);
        }
    }, [text]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getProgressColor = () => {
        if (!result) return 'bg-slate-300';
        const percent = (result.effectiveLength / 280) * 100;
        if (percent <= 80) return 'bg-emerald-500';
        if (percent <= 100) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Compose Tweet</label>
                    {text && (
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            Copy
                        </Button>
                    )}
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-base"
                />

                {/* Character Progress Bar */}
                <div className="mt-3">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all", getProgressColor())}
                            style={{ width: `${Math.min((result?.effectiveLength || 0) / 280 * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                        <span>{result?.effectiveLength || 0} / 280</span>
                        <span className={cn(
                            result?.remaining < 0 ? "text-rose-600 font-bold" :
                                result?.remaining < 20 ? "text-amber-600" : "text-slate-500"
                        )}>
                            {result?.remaining > 0 ? `${result.remaining} remaining` : result?.remaining < 0 ? `${Math.abs(result.remaining)} over` : ''}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Status Card */}
            {result && (
                <Card className={cn(
                    "p-4 border shadow-sm flex items-center justify-between",
                    result.isWithinLimit ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                )}>
                    <div className="flex items-center space-x-3">
                        {result.isWithinLimit ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                            <XCircle className="h-6 w-6 text-rose-600" />
                        )}
                        <div>
                            <h3 className={cn("font-bold", result.isWithinLimit ? "text-emerald-800" : "text-rose-800")}>
                                {result.isWithinLimit ? 'Ready to Tweet!' : `${result.threadCount} Tweets Needed`}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-slate-600">
                            <Hash className="h-4 w-4 mr-1" />
                            <span>{result.hashtagCount}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                            <AtSign className="h-4 w-4 mr-1" />
                            <span>{result.mentionCount}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                            <Link2 className="h-4 w-4 mr-1" />
                            <span>{result.urlCount}</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* URL Savings */}
            {result && result.urlCharacterReduction > 0 && (
                <Card className="p-3 bg-blue-50 border border-blue-200 text-sm text-blue-700">
                    ℹ️ URLs are shortened to 23 characters by Twitter. You save <strong>{result.urlCharacterReduction}</strong> characters.
                </Card>
            )}

            {/* Thread Preview */}
            {thread.length > 1 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3">Thread Preview ({thread.length} tweets)</h4>
                    <div className="space-y-3">
                        {thread.map((tweet, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-start space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-300 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900">{tweet}</p>
                                        <p className="text-xs text-slate-500 mt-1">{tweet.length}/280</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Suggestions */}
            {analysis && analysis.suggestions.length > 0 && (
                <Card className="p-4 bg-amber-50 border border-amber-200">
                    <h4 className="font-bold text-amber-800 mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                        {analysis.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="text-sm text-amber-700">• {suggestion}</li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}
