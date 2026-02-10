'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkNoindex, generateRobotsMetaTag, explainDirective } from '@/lib/tools/seo/noindex-checker';
import { cn } from '@/lib/utils';
import { Shield, ShieldOff, ShieldAlert, Copy, Check, HelpCircle } from 'lucide-react';

export function NoindexChecker() {
    const [html, setHtml] = React.useState('');
    const [xRobotsTag, setXRobotsTag] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);

    const handleCheck = () => {
        if (!html.trim()) return;
        const data = checkNoindex({ html, xRobotsTag: xRobotsTag.trim() || undefined });
        if (data.success) {
            setResult(data.data);
        }
    };

    const handleCopyTag = () => {
        const tag = generateRobotsMetaTag({ index: true, follow: true });
        navigator.clipboard.writeText(tag);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">HTML Content</label>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="Paste your HTML <head> content here..."
                        className="w-full h-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        X-Robots-Tag Header (optional)
                    </label>
                    <input
                        type="text"
                        value={xRobotsTag}
                        onChange={(e) => setXRobotsTag(e.target.value)}
                        placeholder="e.g., noindex, nofollow"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
            </Card>

            <Button onClick={handleCheck} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Shield className="h-4 w-4 mr-2" />
                Check Indexability
            </Button>

            {result && (
                <>
                    {/* Main Status */}
                    <Card className={cn(
                        "p-6 border shadow-sm",
                        result.isIndexable ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                    )}>
                        <div className="flex items-start space-x-4">
                            {result.isIndexable ? (
                                <Shield className="h-10 w-10 text-emerald-600" />
                            ) : (
                                <ShieldOff className="h-10 w-10 text-rose-600" />
                            )}
                            <div className="flex-1">
                                <h3 className={cn("text-xl font-bold", result.isIndexable ? "text-emerald-800" : "text-rose-800")}>
                                    {result.isIndexable ? 'Page is Indexable' : 'Page is NOT Indexable'}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {result.isIndexable
                                        ? 'Search engines can index and display this page in results.'
                                        : 'Search engines will not index this page.'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Directive Status Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DirectiveCard label="Index" isBlocked={result.hasNoindex} />
                        <DirectiveCard label="Follow" isBlocked={result.hasNofollow} />
                        <DirectiveCard label="Archive" isBlocked={result.hasNoarchive} />
                        <DirectiveCard label="Snippet" isBlocked={result.hasNosnippet} />
                    </div>

                    {/* Summary */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Analysis Summary</h4>
                        <ul className="space-y-2">
                            {result.summary.map((line: string, i: number) => (
                                <li key={i} className="text-sm text-slate-700">{line}</li>
                            ))}
                        </ul>
                    </Card>

                    {/* Meta Tags Found */}
                    {result.metaTags.length > 0 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-3">Robots Meta Tags Found</h4>
                            <div className="space-y-3">
                                {result.metaTags.map((tag: any, i: number) => (
                                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <code className="text-sm font-mono text-indigo-600">{tag.name}</code>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tag.directives.map((d: string, j: number) => (
                                                <span key={j} className={cn(
                                                    "text-xs px-2 py-1 rounded-full font-medium",
                                                    d.startsWith('no') ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Helper */}
                    <Card className="p-4 bg-blue-50 border border-blue-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-bold text-blue-800 mb-1">Need to Allow Indexing?</h4>
                                <code className="text-xs text-blue-700 font-mono">{generateRobotsMetaTag({ index: true, follow: true })}</code>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCopyTag}>
                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

function DirectiveCard({ label, isBlocked }: { label: string; isBlocked: boolean }) {
    return (
        <Card className={cn(
            "p-3 text-center border shadow-sm",
            isBlocked ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
        )}>
            <div className={cn("text-lg font-bold mb-1", isBlocked ? "text-rose-600" : "text-emerald-600")}>
                {isBlocked ? 'Blocked' : 'Allowed'}
            </div>
            <div className="text-xs text-slate-600">{label}</div>
        </Card>
    );
}
