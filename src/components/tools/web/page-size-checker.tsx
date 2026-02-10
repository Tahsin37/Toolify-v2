'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkPageSize, formatBytes, getSizeBreakdown, estimateLoadTime } from '@/lib/tools/web/page-size-checker';
import { cn } from '@/lib/utils';
import { FileCode, Gauge, Zap, AlertTriangle, CheckCircle2, Clock, Wifi } from 'lucide-react';
import type { PageSizeResult } from '@/lib/types';

export function PageSizeChecker() {
    const [html, setHtml] = React.useState('');
    const [result, setResult] = React.useState<PageSizeResult | null>(null);
    const [breakdown, setBreakdown] = React.useState<ReturnType<typeof getSizeBreakdown> | null>(null);
    const [loadTimes, setLoadTimes] = React.useState<ReturnType<typeof estimateLoadTime> | null>(null);

    const handleCheck = () => {
        if (!html.trim()) return;
        const data = checkPageSize({ html });
        if (data.success && data.data) {
            setResult(data.data);
            setBreakdown(getSizeBreakdown(html));
            setLoadTimes(estimateLoadTime(data.data.totalSize));
        }
    };

    const loadExample = () => {
        setHtml(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is an example HTML page to test the page size checker.</p>
        <script>
            console.log('Hello World');
        </script>
    </div>
</body>
</html>`);
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'needs-improvement': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'poor': return 'text-rose-600 bg-rose-50 border-rose-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'excellent': return <Zap className="h-6 w-6 text-emerald-600" />;
            case 'good': return <CheckCircle2 className="h-6 w-6 text-blue-600" />;
            case 'needs-improvement': return <AlertTriangle className="h-6 w-6 text-amber-600" />;
            case 'poor': return <AlertTriangle className="h-6 w-6 text-rose-600" />;
            default: return <Gauge className="h-6 w-6 text-slate-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FileCode className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">HTML Content</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadExample} className="text-xs">
                        Load Example
                    </Button>
                </div>
                <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="Paste your HTML content here..."
                    className="w-full h-48 px-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                />
            </Card>

            <Button onClick={handleCheck} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Gauge className="h-4 w-4 mr-2" />
                Check Page Size
            </Button>

            {result && (
                <>
                    {/* Performance Rating */}
                    <Card className={cn("p-6 border shadow-sm", getRatingColor(result.performance.rating))}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {getRatingIcon(result.performance.rating)}
                                <div>
                                    <h3 className="text-lg font-bold capitalize">{result.performance.rating.replace('-', ' ')}</h3>
                                    <p className="text-sm opacity-75">{result.performance.loadTimeEstimate}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">{result.totalSizeFormatted}</div>
                                <div className="text-sm opacity-75">Total Size</div>
                            </div>
                        </div>
                    </Card>

                    {/* Size Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            label="Raw HTML"
                            value={formatBytes(result.breakdown.html)}
                            icon={<FileCode className="h-4 w-4" />}
                        />
                        <StatCard
                            label="Text Content"
                            value={formatBytes(result.breakdown.text)}
                            icon={<FileCode className="h-4 w-4" />}
                        />
                        <StatCard
                            label="Est. Gzipped"
                            value={formatBytes(result.breakdown.estimatedCompressed)}
                            icon={<Zap className="h-4 w-4" />}
                            highlight
                        />
                        <StatCard
                            label="Savings"
                            value={`${Math.round((1 - result.breakdown.estimatedCompressed / result.breakdown.html) * 100)}%`}
                            icon={<Gauge className="h-4 w-4" />}
                            highlight
                        />
                    </div>

                    {/* Detailed Breakdown */}
                    {breakdown && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4">Size Breakdown</h4>
                            <div className="space-y-3">
                                {[
                                    { label: 'Scripts', value: breakdown.scripts, color: 'bg-amber-500' },
                                    { label: 'Styles', value: breakdown.styles, color: 'bg-blue-500' },
                                    { label: 'Content', value: breakdown.content, color: 'bg-emerald-500' },
                                    { label: 'Comments', value: breakdown.comments, color: 'bg-slate-400' },
                                    { label: 'Whitespace', value: breakdown.whitespace, color: 'bg-gray-300' },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">{item.label}</span>
                                            <span className="text-slate-900 font-medium">{formatBytes(item.value)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", item.color)}
                                                style={{ width: `${Math.min((item.value / breakdown.total) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Load Times */}
                    {loadTimes && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                                Estimated Load Times
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Slow 3G', value: loadTimes['3g-slow'], icon: <Wifi className="h-4 w-4 text-rose-500" /> },
                                    { label: '3G', value: loadTimes['3g'], icon: <Wifi className="h-4 w-4 text-amber-500" /> },
                                    { label: '4G', value: loadTimes['4g'], icon: <Wifi className="h-4 w-4 text-blue-500" /> },
                                    { label: 'Broadband', value: loadTimes.broadband, icon: <Wifi className="h-4 w-4 text-emerald-500" /> },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="flex justify-center mb-1">{item.icon}</div>
                                        <div className="text-lg font-bold text-slate-900">{item.value}</div>
                                        <div className="text-xs text-slate-500">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recommendations */}
                    {result.performance.recommendations.length > 0 && (
                        <Card className="p-4 bg-amber-50 border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-3 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Optimization Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {result.performance.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm text-amber-700 flex items-start">
                                        <span className="mr-2">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
    return (
        <Card className={cn(
            "p-4 text-center border shadow-sm",
            highlight ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"
        )}>
            <div className={cn("flex justify-center mb-2", highlight ? "text-indigo-600" : "text-slate-500")}>
                {icon}
            </div>
            <div className={cn("text-xl font-bold mb-1", highlight ? "text-indigo-600" : "text-slate-900")}>
                {value}
            </div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}
