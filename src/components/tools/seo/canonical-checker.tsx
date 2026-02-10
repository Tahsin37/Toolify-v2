'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkCanonical, generateCanonicalTag } from '@/lib/tools/seo/canonical-checker';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Link2, Copy, Check, ExternalLink } from 'lucide-react';

export function CanonicalChecker() {
    const [html, setHtml] = React.useState('');
    const [pageUrl, setPageUrl] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);

    const handleCheck = () => {
        if (!html.trim() || !pageUrl.trim()) return;
        const data = checkCanonical({ html, pageUrl });
        if (data.success) {
            setResult(data.data);
        }
    };

    const handleCopyTag = () => {
        const tag = generateCanonicalTag(pageUrl);
        navigator.clipboard.writeText(tag);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Inputs */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Page URL</label>
                    <Input
                        value={pageUrl}
                        onChange={(e) => setPageUrl(e.target.value)}
                        placeholder="https://example.com/page"
                        className="text-base"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">HTML Content</label>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="Paste your HTML <head> content here..."
                        className="w-full h-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                </div>
            </Card>

            <Button onClick={handleCheck} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Link2 className="h-4 w-4 mr-2" />
                Check Canonical URL
            </Button>

            {result && (
                <>
                    {/* Status Banner */}
                    <Card className={cn(
                        "p-5 border shadow-sm",
                        result.hasCanonical && result.issues.length === 0
                            ? "bg-emerald-50 border-emerald-200"
                            : result.hasCanonical
                                ? "bg-amber-50 border-amber-200"
                                : "bg-rose-50 border-rose-200"
                    )}>
                        <div className="flex items-start space-x-4">
                            {result.hasCanonical && result.issues.length === 0 ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5" />
                            ) : result.hasCanonical ? (
                                <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
                            ) : (
                                <XCircle className="h-6 w-6 text-rose-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <h3 className={cn(
                                    "font-bold text-lg",
                                    result.hasCanonical && result.issues.length === 0 ? "text-emerald-800" :
                                        result.hasCanonical ? "text-amber-800" : "text-rose-800"
                                )}>
                                    {result.hasCanonical ? 'Canonical Tag Found' : 'No Canonical Tag'}
                                </h3>
                                {result.canonicalUrl && (
                                    <div className="mt-2 flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-2">
                                        <code className="text-sm text-slate-700 flex-1 truncate">{result.canonicalUrl}</code>
                                        <a href={result.canonicalUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                                {result.isSelfReferencing && (
                                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                        Self-Referencing ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Issues */}
                    {result.issues.length > 0 && (
                        <Card className="p-4 bg-rose-50 border border-rose-200">
                            <h4 className="font-bold text-rose-800 mb-2">Issues Found</h4>
                            <ul className="space-y-1">
                                {result.issues.map((issue: string, i: number) => (
                                    <li key={i} className="text-sm text-rose-700 flex items-start">
                                        <XCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <Card className="p-4 bg-blue-50 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2">Recommendations</h4>
                            <ul className="space-y-1">
                                {result.recommendations.map((rec: string, i: number) => (
                                    <li key={i} className="text-sm text-blue-700">{rec}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Generate Tag Helper */}
                    {!result.hasCanonical && (
                        <Card className="p-4 bg-slate-50 border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-2">Generate Canonical Tag</h4>
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-slate-700 truncate">
                                    {generateCanonicalTag(pageUrl)}
                                </code>
                                <Button variant="outline" size="sm" onClick={handleCopyTag}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
