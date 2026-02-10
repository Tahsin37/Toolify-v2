'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { countCharacters, getCharacterBreakdown, getAllPlatformLimits } from '@/lib/tools/text/character-counter';
import { cn } from '@/lib/utils';
import { Hash, CheckCircle, XCircle } from 'lucide-react';

export function CharacterCounter() {
    const [text, setText] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [breakdown, setBreakdown] = React.useState<any>(null);

    React.useEffect(() => {
        if (text) {
            const data = countCharacters({ text });
            if (data.success && data.data) {
                setResult(data.data);
                setBreakdown(getCharacterBreakdown(text));
            }
        } else {
            setResult(null);
            setBreakdown(null);
        }
    }, [text]);

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter or Paste Text</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your text here..."
                    className="w-full h-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-base"
                />
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <StatCard label="Characters" value={result?.total ?? 0} />
                <StatCard label="No Spaces" value={result?.withoutSpaces ?? 0} />
                <StatCard label="Letters" value={result?.letters ?? 0} />
                <StatCard label="Numbers" value={result?.numbers ?? 0} />
                <StatCard label="Spaces" value={result?.spaces ?? 0} />
                <StatCard label="Symbols" value={result?.symbols ?? 0} />
            </div>

            {/* Breakdown */}
            {breakdown && breakdown.breakdown.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3">Character Breakdown</h4>
                    <div className="space-y-2">
                        {breakdown.breakdown.map((item: any, i: number) => (
                            <div key={i} className="flex items-center">
                                <span className="text-sm text-slate-600 w-24">{item.category}</span>
                                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden mx-3">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-slate-900 font-medium w-16 text-right">
                                    {item.count} ({item.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Platform Limits */}
            {result && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3">Platform Limits</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                        {result.platformLimits.map((pl: any) => (
                            <div
                                key={pl.platform}
                                className={cn(
                                    "p-3 rounded-lg border text-sm",
                                    pl.isWithinLimit ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-700 truncate">{pl.platform}</span>
                                    {pl.isWithinLimit ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-rose-600" />
                                    )}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {result.total}/{pl.limit} ({pl.percentUsed}%)
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            pl.percentUsed <= 80 ? "bg-emerald-500" :
                                                pl.percentUsed <= 100 ? "bg-amber-500" : "bg-rose-500"
                                        )}
                                        style={{ width: `${Math.min(pl.percentUsed, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-indigo-600">{value.toLocaleString()}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}
