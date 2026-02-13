'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Globe, Search, Clock, Shield, Server, FileText, Link2,
    CheckCircle2, XCircle, AlertTriangle, ExternalLink, Copy, Info,
    Gauge, Lock, Image as ImageIcon, Download
} from 'lucide-react';

interface AnalysisResult {
    url: string;
    status: 'success' | 'error';
    loadTime?: number;
    headers?: Record<string, string>;
    meta?: {
        title?: string;
        description?: string;
        keywords?: string;
        robots?: string;
        canonical?: string;
        ogImage?: string;
        ogTitle?: string;
        ogDescription?: string;
        favicon?: string;
    };
    ssl?: boolean;
    redirects?: number;
    contentLength?: number;
    server?: string;
    contentType?: string;
    error?: string;
    pageContent?: string;
}



export function WebsiteAnalyzer() {
    const [url, setUrl] = React.useState('');
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<AnalysisResult | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const extractMeta = (html: string, targetUrl: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const getMeta = (name: string): string | undefined => {
            const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            return meta?.getAttribute('content') || undefined;
        };

        const getLink = (rel: string): string | undefined => {
            const link = doc.querySelector(`link[rel="${rel}"]`);
            const href = link?.getAttribute('href');
            if (href && !href.startsWith('http')) {
                try {
                    return new URL(href, targetUrl).href;
                } catch {
                    return href;
                }
            }
            return href || undefined;
        };

        return {
            title: doc.querySelector('title')?.textContent || undefined,
            description: getMeta('description'),
            keywords: getMeta('keywords'),
            robots: getMeta('robots'),
            ogTitle: getMeta('og:title'),
            ogDescription: getMeta('og:description'),
            ogImage: getMeta('og:image'),
            canonical: getLink('canonical'),
            favicon: getLink('icon') || getLink('shortcut icon'),
        };
    };

    const analyzeWebsite = async () => {
        if (!url.trim()) return;

        setAnalyzing(true);
        setResult(null);
        setProgress(10);

        try {
            // Normalize URL
            let targetUrl = url.trim();
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }

            setProgress(30);

            const response = await fetch(`/api/analyze?url=${encodeURIComponent(targetUrl)}`);
            const data = await response.json();

            setProgress(90);

            if (response.ok) {
                setResult(data);
            } else {
                throw new Error(data.error || 'Failed to analyze website');
            }
        } catch (error) {
            setResult({
                url: url,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to analyze website',
            });
        }

        setProgress(100);
        setAnalyzing(false);
    };

    const copyResults = async () => {
        if (!result) return;
        const text = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadReport = () => {
        if (!result) return;
        const report = JSON.stringify(result, null, 2);
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `website-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-indigo-500" />
                    Enter Website URL
                </h3>
                <div className="flex gap-3">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="example.com or https://example.com"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && analyzeWebsite()}
                    />
                    <Button
                        onClick={analyzeWebsite}
                        disabled={analyzing || !url.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 px-6"
                    >
                        {analyzing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-2" />
                                Analyze
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Progress Bar */}
            {analyzing && (
                <Card className="p-6 bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <div>
                            <p className="font-medium text-indigo-700">Analyzing website...</p>
                            <p className="text-sm text-indigo-600">Fetching content and extracting metadata...</p>
                        </div>
                    </div>
                    <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            )}

            {/* Results */}
            {result && result.status === 'success' && (
                <div className="space-y-4">
                    {/* Summary Card */}
                    <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <h3 className="font-semibold text-emerald-800">Analysis Complete</h3>
                                    <p className="text-sm text-emerald-600 truncate max-w-md">{result.url}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={copyResults}>
                                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={downloadReport}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/60 rounded-lg p-3 text-center">
                                <Clock className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Load Time</p>
                                <p className="text-lg font-bold text-slate-800">{result.loadTime}ms</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 text-center">
                                <Lock className={`h-5 w-5 mx-auto mb-1 ${result.ssl ? 'text-emerald-500' : 'text-red-500'}`} />
                                <p className="text-xs text-slate-500">SSL</p>
                                <p className="text-lg font-bold text-slate-800">{result.ssl ? 'Secure' : 'None'}</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 text-center">
                                <FileText className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Size</p>
                                <p className="text-lg font-bold text-slate-800">{result.contentLength ? `${Math.round(result.contentLength / 1024)}KB` : 'N/A'}</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 text-center">
                                <Server className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Server</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{result.server || 'Unknown'}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Meta Tags */}
                    {result.meta && (
                        <Card className="p-4 bg-white border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                                Meta Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                {result.meta.title && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Title</span>
                                        <p className="text-slate-800 font-medium mt-1">{result.meta.title}</p>
                                    </div>
                                )}
                                {result.meta.description && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Description</span>
                                        <p className="text-slate-800 mt-1">{result.meta.description}</p>
                                    </div>
                                )}
                                {result.meta.ogTitle && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <span className="text-xs text-blue-500 uppercase tracking-wider">Open Graph Title</span>
                                        <p className="text-slate-800 mt-1">{result.meta.ogTitle}</p>
                                    </div>
                                )}
                                {result.meta.ogImage && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <span className="text-xs text-blue-500 uppercase tracking-wider">Open Graph Image</span>
                                        <div className="mt-2">
                                            <img
                                                src={result.meta.ogImage}
                                                alt="OG Preview"
                                                className="max-h-40 rounded border border-blue-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <p className="text-xs text-slate-500 mt-1 truncate">{result.meta.ogImage}</p>
                                        </div>
                                    </div>
                                )}
                                {result.meta.robots && (
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">Robots</span>
                                        <span className="text-slate-800 font-mono text-xs">{result.meta.robots}</span>
                                    </div>
                                )}
                                {result.meta.canonical && (
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">Canonical</span>
                                        <a href={result.meta.canonical} target="_blank" rel="noopener" className="text-indigo-600 text-xs hover:underline truncate max-w-xs">
                                            {result.meta.canonical}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Headers */}
                    {result.headers && Object.keys(result.headers).length > 0 && (
                        <Card className="p-4 bg-white border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                                <Server className="h-4 w-4 mr-2 text-indigo-500" />
                                HTTP Headers
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-64">
                                {Object.entries(result.headers).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 py-1 border-b border-slate-200 last:border-0">
                                        <span className="text-indigo-600 font-medium min-w-40">{key}:</span>
                                        <span className="text-slate-700 break-all">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Error */}
            {result && result.status === 'error' && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Analysis Failed</h3>
                            <p className="text-sm text-red-700">{result.error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">How It Works</h4>
                        <p className="text-sm text-blue-700">
                            This analyzer fetches website content using our secure server-side engine to extract detailed meta tags,
                            headers, and SEO metrics. It respects robots.txt and identifies as 'ToolifyBot'.
                            Some websites may block automated requests.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
