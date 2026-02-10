'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { removeDuplicateLines, getLineFrequency, findDuplicates, sortLines, reverseLines, shuffleLines } from '@/lib/tools/text/duplicate-remover';
import { cn } from '@/lib/utils';
import { Copy, Check, Trash2, SortAsc, SortDesc, Shuffle, ArrowDownUp } from 'lucide-react';

export function DuplicateRemover() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [caseSensitive, setCaseSensitive] = React.useState(true);
    const [trimLines, setTrimLines] = React.useState(true);
    const [stats, setStats] = React.useState<any>(null);
    const [duplicates, setDuplicates] = React.useState<any[]>([]);
    const [copied, setCopied] = React.useState(false);

    const handleProcess = () => {
        if (!input.trim()) {
            setOutput('');
            setStats(null);
            setDuplicates([]);
            return;
        }

        const result = removeDuplicateLines({ text: input, caseSensitive, trimLines });
        if (result.success && result.data) {
            setOutput(result.data.cleaned);
            setStats(getLineFrequency(input));
            setDuplicates(findDuplicates(input, caseSensitive));
        }
    };

    React.useEffect(() => {
        handleProcess();
    }, [input, caseSensitive, trimLines]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSort = (asc: boolean) => setOutput(sortLines(output, { ascending: asc }));
    const handleReverse = () => setOutput(reverseLines(output));
    const handleShuffle = () => setOutput(shuffleLines(output));

    return (
        <div className="space-y-6">
            {/* Options */}
            <div className="flex justify-center flex-wrap gap-4">
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => setCaseSensitive(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Case Sensitive</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={trimLines}
                        onChange={(e) => setTrimLines(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Trim Lines</span>
                </label>
            </div>

            {/* Input/Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Original Text</span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your text with duplicate lines..."
                        className="w-full h-56 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Cleaned Text</span>
                        <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleSort(true)} title="Sort A-Z">
                                <SortAsc className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleSort(false)} title="Sort Z-A">
                                <SortDesc className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleReverse} title="Reverse">
                                <ArrowDownUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleShuffle} title="Shuffle">
                                <Shuffle className="h-3 w-3" />
                            </Button>
                            {output && (
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="w-full h-56 px-4 py-3 bg-slate-50 text-slate-900 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard label="Total Lines" value={stats.totalLines} />
                    <StatCard label="Unique Lines" value={stats.uniqueLines} color="emerald" />
                    <StatCard label="Duplicates" value={stats.duplicateLines} color={stats.duplicateLines > 0 ? 'rose' : 'slate'} />
                    <StatCard label="Empty Lines" value={stats.emptyLines} />
                    <StatCard label="Dup %" value={`${stats.duplicatePercentage}%`} color={stats.duplicatePercentage > 20 ? 'amber' : 'slate'} />
                </div>
            )}

            {/* Duplicate Details */}
            {duplicates.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                        <Trash2 className="h-4 w-4 text-rose-600 mr-2" />
                        Duplicates Found ({duplicates.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {duplicates.map((dup, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-rose-50 rounded-lg text-sm">
                                <code className="text-rose-700 truncate flex-1">{dup.line || '(empty line)'}</code>
                                <span className="text-xs text-rose-600 ml-2 shrink-0">×{dup.count}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

function StatCard({ label, value, color = 'slate' }: { label: string; value: string | number; color?: string }) {
    const colors: Record<string, string> = {
        slate: 'text-slate-600',
        emerald: 'text-emerald-600',
        rose: 'text-rose-600',
        amber: 'text-amber-600',
    };

    return (
        <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
            <div className={cn("text-xl font-bold", colors[color])}>{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}
