'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { compareTexts, getDiffStats } from '@/lib/tools/text/diff-checker';
import { cn } from '@/lib/utils';
import { GitCompare, Plus, Minus, Equal, Copy, Check } from 'lucide-react';

export function DiffChecker() {
    const [original, setOriginal] = React.useState('');
    const [modified, setModified] = React.useState('');
    const [ignoreWhitespace, setIgnoreWhitespace] = React.useState(false);
    const [ignoreCase, setIgnoreCase] = React.useState(false);
    const [result, setResult] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any>(null);

    const handleCompare = () => {
        if (!original && !modified) {
            setResult(null);
            setStats(null);
            return;
        }
        const data = compareTexts({ original, modified, ignoreWhitespace, ignoreCase });
        if (data.success && data.data) {
            setResult(data.data);
            setStats(getDiffStats(original, modified));
        }
    };

    React.useEffect(() => {
        handleCompare();
    }, [original, modified, ignoreWhitespace, ignoreCase]);

    const renderDiff = () => {
        if (!result || !result.changes) return null;

        return result.changes.map((change: any, i: number) => (
            <div
                key={i}
                className={cn(
                    "px-3 py-1 font-mono text-sm flex items-start",
                    change.type === 'added' && "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500",
                    change.type === 'removed' && "bg-rose-50 text-rose-800 border-l-4 border-rose-500",
                    change.type === 'unchanged' && "bg-white text-slate-600"
                )}
            >
                <span className="w-6 shrink-0 text-xs opacity-60">
                    {change.type === 'added' ? <Plus className="h-3 w-3" /> :
                        change.type === 'removed' ? <Minus className="h-3 w-3" /> : ''}
                </span>
                <span className="break-all whitespace-pre-wrap">{change.value || '\u00A0'}</span>
            </div>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Options */}
            <div className="flex justify-center flex-wrap gap-4">
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={ignoreWhitespace}
                        onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ignore Whitespace</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={ignoreCase}
                        onChange={(e) => setIgnoreCase(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ignore Case</span>
                </label>
            </div>

            {/* Input Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-rose-50 px-4 py-2 border-b border-rose-200">
                        <span className="text-sm font-medium text-rose-700">Original Text</span>
                    </div>
                    <textarea
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        placeholder="Paste original text here..."
                        className="w-full h-48 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200">
                        <span className="text-sm font-medium text-emerald-700">Modified Text</span>
                    </div>
                    <textarea
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        placeholder="Paste modified text here..."
                        className="w-full h-48 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Added" value={result?.additions || 0} color="emerald" icon={<Plus className="h-4 w-4" />} />
                    <StatCard label="Removed" value={result?.deletions || 0} color="rose" icon={<Minus className="h-4 w-4" />} />
                    <StatCard label="Unchanged" value={result?.unchanged || 0} color="slate" icon={<Equal className="h-4 w-4" />} />
                    <StatCard label="Similarity" value={`${Math.round(result?.similarity || 0)}%`} color="indigo" icon={<GitCompare className="h-4 w-4" />} />
                </div>
            )}

            {/* Diff Output */}
            {result && result.changes && result.changes.length > 0 && (
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Differences</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {renderDiff()}
                    </div>
                </Card>
            )}

            {/* Identical */}
            {stats?.isIdentical && (
                <Card className="p-6 bg-emerald-50 border border-emerald-200 text-center">
                    <Check className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-bold text-emerald-800">Texts are Identical</h3>
                    <p className="text-sm text-emerald-700">No differences found</p>
                </Card>
            )}
        </div>
    );
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
        rose: 'bg-rose-50 border-rose-200 text-rose-600',
        slate: 'bg-slate-50 border-slate-200 text-slate-600',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    };

    return (
        <Card className={cn("p-3 border text-center", colors[color])}>
            <div className="flex items-center justify-center space-x-1 mb-1">
                {icon}
                <span className="text-xl font-bold">{value}</span>
            </div>
            <div className="text-xs opacity-80">{label}</div>
        </Card>
    );
}
