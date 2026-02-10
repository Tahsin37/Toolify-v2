'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { analyzeKeywordDensity, getOptimalDensity } from '@/lib/tools/seo/keyword-density';
import { cn } from '@/lib/utils';
import { Search, BarChart3, Target, TrendingUp } from 'lucide-react';

export function KeywordDensity() {
    const [content, setContent] = React.useState('');
    const [targetKeyword, setTargetKeyword] = React.useState('');
    const [isHtml, setIsHtml] = React.useState(false);
    const [result, setResult] = React.useState<any>(null);

    const handleAnalyze = () => {
        if (!content.trim()) return;
        const data = analyzeKeywordDensity({
            content,
            targetKeyword: targetKeyword.trim() || undefined,
            isHtml,
            includeStopWords: false,
            topCount: 15
        });
        if (data.success) {
            setResult(data.data);
        }
    };

    const optimal = getOptimalDensity();

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Content to Analyze</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your content here..."
                        className="w-full h-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Keyword (optional)</label>
                        <Input
                            value={targetKeyword}
                            onChange={(e) => setTargetKeyword(e.target.value)}
                            placeholder="e.g., SEO optimization"
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center space-x-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={isHtml}
                                onChange={(e) => setIsHtml(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Content is HTML</span>
                        </label>
                    </div>
                </div>
            </Card>

            <Button onClick={handleAnalyze} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Search className="h-4 w-4 mr-2" />
                Analyze Keyword Density
            </Button>

            {result && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{result.totalWords}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Words</div>
                        </Card>
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{result.uniqueWords}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Unique Words</div>
                        </Card>
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {result.totalWords > 0 ? Math.round((result.uniqueWords / result.totalWords) * 100) : 0}%
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Vocabulary Richness</div>
                        </Card>
                    </div>

                    {/* Target Keyword Result */}
                    {result.targetKeyword && (
                        <Card className={cn(
                            "p-5 border shadow-sm",
                            result.targetKeyword.density >= optimal.min && result.targetKeyword.density <= optimal.max
                                ? "bg-emerald-50 border-emerald-200"
                                : result.targetKeyword.density > optimal.max
                                    ? "bg-rose-50 border-rose-200"
                                    : "bg-amber-50 border-amber-200"
                        )}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <Target className={cn(
                                        "h-8 w-8",
                                        result.targetKeyword.density >= optimal.min && result.targetKeyword.density <= optimal.max
                                            ? "text-emerald-600"
                                            : result.targetKeyword.density > optimal.max
                                                ? "text-rose-600"
                                                : "text-amber-600"
                                    )} />
                                    <div>
                                        <h3 className="font-bold text-slate-900">"{result.targetKeyword.keyword}"</h3>
                                        <p className="text-sm text-slate-600">Found {result.targetKeyword.count} times</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-slate-900">{result.targetKeyword.density}%</div>
                                    <div className="text-xs text-slate-500">Density</div>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-700">{result.targetKeyword.recommendation}</p>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all",
                                        result.targetKeyword.density <= optimal.max ? "bg-emerald-500" : "bg-rose-500"
                                    )}
                                    style={{ width: `${Math.min(result.targetKeyword.density / 5 * 100, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0%</span>
                                <span className="text-emerald-600 font-medium">{optimal.min}% - {optimal.max}% optimal</span>
                                <span>5%+</span>
                            </div>
                        </Card>
                    )}

                    {/* Keyword Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <KeywordTable title="Single Words" items={result.singleWords} />
                        <KeywordTable title="Two-Word Phrases" items={result.twoWordPhrases} />
                        <KeywordTable title="Three-Word Phrases" items={result.threeWordPhrases} />
                    </div>
                </>
            )}
        </div>
    );
}

function KeywordTable({ title, items }: { title: string; items: any[] }) {
    return (
        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
                {title}
            </h4>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-2 py-1.5 text-left text-slate-600 font-medium">Keyword</th>
                            <th className="px-2 py-1.5 text-right text-slate-600 font-medium">Count</th>
                            <th className="px-2 py-1.5 text-right text-slate-600 font-medium">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.slice(0, 10).map((item: any, i: number) => (
                            <tr key={i} className="border-t border-slate-100">
                                <td className="px-2 py-1.5 text-slate-700 font-medium">{item.keyword}</td>
                                <td className="px-2 py-1.5 text-right text-slate-500">{item.count}</td>
                                <td className="px-2 py-1.5 text-right text-indigo-600 font-medium">{item.density}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
