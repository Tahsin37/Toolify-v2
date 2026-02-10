'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyzeHeadings, getHeadingStats } from '@/lib/tools/seo/heading-analyzer';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, List, ChevronRight } from 'lucide-react';

export function HeadingAnalyzer() {
    const [html, setHtml] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any>(null);

    const handleAnalyze = () => {
        if (!html.trim()) return;
        const data = analyzeHeadings({ html });
        if (data.success) {
            setResult(data.data);
            setStats(getHeadingStats(html));
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    HTML Content
                </label>
                <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="Paste your HTML content here to analyze heading structure..."
                    className="w-full h-48 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                />
            </Card>

            <Button onClick={handleAnalyze} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <List className="h-4 w-4 mr-2" />
                Analyze Heading Structure
            </Button>

            {result && (
                <>
                    {/* Status Banner */}
                    <Card className={cn(
                        "p-4 border shadow-sm flex items-center space-x-3",
                        result.issues.length === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                        {result.issues.length === 0 ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        )}
                        <div>
                            <h3 className={cn("font-bold", result.issues.length === 0 ? "text-emerald-800" : "text-amber-800")}>
                                {result.issues.length === 0 ? 'Good Heading Structure' : `${result.issues.length} Issue(s) Found`}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {result.headings.length} headings • {result.h1Count} H1 tag(s)
                            </p>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(level => (
                                <Card key={level} className={cn(
                                    "p-3 text-center border shadow-sm",
                                    stats.byLevel[level] > 0 ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div className={cn(
                                        "text-xl font-bold",
                                        stats.byLevel[level] > 0 ? "text-indigo-600" : "text-slate-400"
                                    )}>
                                        {stats.byLevel[level] || 0}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">H{level}</div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Issues */}
                    {result.issues.length > 0 && (
                        <Card className="p-4 bg-amber-50 border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" /> Issues
                            </h4>
                            <ul className="space-y-1">
                                {result.issues.map((issue: string, i: number) => (
                                    <li key={i} className="text-sm text-amber-700">{issue}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Structure Visualization */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Heading Structure</h4>
                        <div className="font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
                            {result.structure.map((line: string, i: number) => {
                                const level = parseInt(line.match(/H(\d)/)?.[1] || '1');
                                const colors = ['text-indigo-600', 'text-blue-600', 'text-cyan-600', 'text-teal-600', 'text-green-600', 'text-slate-500'];
                                return (
                                    <div key={i} className={cn("flex items-center", colors[level - 1])}>
                                        <ChevronRight className="h-3 w-3 mr-1 opacity-50" />
                                        <span className="whitespace-pre">{line}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* All Headings Table */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">All Headings</h4>
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Level</th>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Text</th>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Length</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.headings.map((h: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-100">
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold bg-indigo-100 text-indigo-700 rounded">
                                                    H{h.level}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-slate-700">{h.text}</td>
                                            <td className="px-3 py-2 text-slate-500">{h.text.length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
