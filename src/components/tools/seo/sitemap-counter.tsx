'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyzeSitemap, getSitemapStats } from '@/lib/tools/seo/sitemap-counter';
import { cn } from '@/lib/utils';
import { FileCode, CheckCircle2, XCircle, AlertTriangle, Link2, ExternalLink, Copy, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SitemapCounter() {
    const [content, setContent] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any>(null);
    const [allUrls, setAllUrls] = React.useState<string[]>([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const URLS_PER_PAGE = 50;

    const handleAnalyze = () => {
        if (!content.trim()) return;
        const data = analyzeSitemap({ content });
        if (data.success) {
            setResult(data.data);
            setStats(getSitemapStats(content));
            // Extract ALL URLs for display
            const locPattern = /<loc>\s*([^<]+)\s*<\/loc>/gi;
            const urls: string[] = [];
            let match;
            while ((match = locPattern.exec(content)) !== null) {
                urls.push(match[1].trim());
            }
            setAllUrls(urls);
            setCurrentPage(1);
            setSearchQuery('');
        }
    };

    // Filter URLs based on search
    const filteredUrls = searchQuery
        ? allUrls.filter(url => url.toLowerCase().includes(searchQuery.toLowerCase()))
        : allUrls;

    // Pagination
    const totalPages = Math.ceil(filteredUrls.length / URLS_PER_PAGE);
    const paginatedUrls = filteredUrls.slice((currentPage - 1) * URLS_PER_PAGE, currentPage * URLS_PER_PAGE);

    const copyAllUrls = () => {
        navigator.clipboard.writeText(filteredUrls.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadUrls = () => {
        const blob = new Blob([filteredUrls.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap-urls.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                    <FileCode className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">sitemap.xml</span>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your XML sitemap content here..."
                    className="w-full h-56 px-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                />
            </Card>

            <Button onClick={handleAnalyze} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Link2 className="h-4 w-4 mr-2" />
                Analyze Sitemap
            </Button>

            {result && (
                <>
                    {/* Status Banner */}
                    <Card className={cn(
                        "p-5 border shadow-sm flex items-center space-x-4",
                        result.isValid ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                    )}>
                        {result.isValid ? (
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        ) : (
                            <XCircle className="h-8 w-8 text-rose-600" />
                        )}
                        <div>
                            <h3 className={cn("text-xl font-bold", result.isValid ? "text-emerald-800" : "text-rose-800")}>
                                {result.isValid ? 'Valid Sitemap' : 'Invalid Sitemap'}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {allUrls.length} URL{allUrls.length !== 1 ? 's' : ''} found
                                {stats?.isSitemapIndex && ' (Sitemap Index)'}
                            </p>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Total URLs" value={stats.totalUrls} />
                            <StatCard label="Unique URLs" value={stats.uniqueUrls} status={stats.duplicates === 0 ? 'good' : 'warning'} />
                            <StatCard label="Duplicates" value={stats.duplicates} status={stats.duplicates === 0 ? 'good' : 'warning'} />
                            <StatCard label="Type" value={stats.isSitemapIndex ? 'Index' : 'Urlset'} />
                        </div>
                    )}

                    {/* Features Check */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-3">
                            <FeatureCard label="lastmod" has={stats.hasLastmod} />
                            <FeatureCard label="priority" has={stats.hasPriority} />
                            <FeatureCard label="changefreq" has={stats.hasChangefreq} />
                        </div>
                    )}

                    {/* Errors */}
                    {result.errors.length > 0 && (
                        <Card className="p-4 bg-rose-50 border border-rose-200">
                            <h4 className="font-bold text-rose-800 mb-2 flex items-center">
                                <XCircle className="h-4 w-4 mr-2" /> Validation Errors
                            </h4>
                            <ul className="space-y-1">
                                {result.errors.map((error: string, i: number) => (
                                    <li key={i} className="text-sm text-rose-700">{error}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* ALL URLs List with Search & Pagination */}
                    {allUrls.length > 0 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-900">
                                    All URLs ({filteredUrls.length})
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={copyAllUrls}>
                                        {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        <span className="ml-1">{copied ? 'Copied!' : 'Copy All'}</span>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={downloadUrls}>
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search URLs..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="pl-10"
                                />
                            </div>

                            {/* URL List */}
                            <div className="max-h-80 overflow-y-auto space-y-1 mb-4">
                                {paginatedUrls.map((url: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 group">
                                        <span className="text-xs text-slate-400 mr-2 w-8">{(currentPage - 1) * URLS_PER_PAGE + i + 1}.</span>
                                        <code className="text-sm text-slate-700 truncate flex-1">{url}</code>
                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 ml-2">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Showing {(currentPage - 1) * URLS_PER_PAGE + 1}-{Math.min(currentPage * URLS_PER_PAGE, filteredUrls.length)} of {filteredUrls.length}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-slate-700 px-2">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Nested Sitemaps (for sitemap index) */}
                    {result.nestedSitemaps.length > 0 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-3">Nested Sitemaps ({result.nestedSitemaps.length})</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {result.nestedSitemaps.map((url: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                                        <code className="text-sm text-indigo-700 truncate flex-1">{url}</code>
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 ml-2">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

function StatCard({ label, value, status }: { label: string; value: string | number; status?: 'good' | 'warning' }) {
    return (
        <Card className={cn(
            "p-3 text-center border shadow-sm",
            status === 'good' && "bg-emerald-50 border-emerald-200",
            status === 'warning' && "bg-amber-50 border-amber-200",
            !status && "bg-white border-slate-200"
        )}>
            <div className={cn(
                "text-xl font-bold mb-0.5",
                status === 'good' && "text-emerald-600",
                status === 'warning' && "text-amber-600",
                !status && "text-slate-900"
            )}>{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}

function FeatureCard({ label, has }: { label: string; has: boolean }) {
    return (
        <Card className={cn(
            "p-3 text-center border shadow-sm",
            has ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
        )}>
            <div className={cn("text-sm font-medium", has ? "text-emerald-600" : "text-slate-400")}>
                {has ? '✓' : '✗'} {label}
            </div>
        </Card>
    );
}
