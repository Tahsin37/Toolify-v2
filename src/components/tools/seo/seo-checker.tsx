'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Globe, Search, CheckCircle2, XCircle, AlertTriangle,
    Info, Download, TrendingUp, FileText, Link2, Image,
    Smartphone, Zap, Lock, Share2, Type, Code
} from 'lucide-react';

interface SEOCheck {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    impact: 'high' | 'medium' | 'low';
}

interface SEOResult {
    url: string;
    score: number;
    checks: SEOCheck[];
    meta: {
        title?: string;
        titleLength?: number;
        description?: string;
        descriptionLength?: number;
        h1Count?: number;
        h1Text?: string;
        imgAltMissing?: number;
        imgTotal?: number;
        internalLinks?: number;
        externalLinks?: number;
        wordCount?: number;
        loadTime?: number;
    };
}

// CORS proxies
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
];

export function SeoChecker() {
    const [url, setUrl] = React.useState('');
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<SEOResult | null>(null);
    const [progress, setProgress] = React.useState(0);

    const analyzeWebsite = async () => {
        if (!url.trim()) return;

        setAnalyzing(true);
        setResult(null);
        setProgress(10);

        try {
            let targetUrl = url.trim();
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }

            const startTime = performance.now();
            setProgress(20);

            let html = '';
            let fetchSuccess = false;

            for (const proxy of CORS_PROXIES) {
                if (fetchSuccess) break;
                try {
                    const response = await fetch(proxy + encodeURIComponent(targetUrl));
                    if (response.ok) {
                        html = await response.text();
                        fetchSuccess = true;
                    }
                } catch { }
            }

            const loadTime = Math.round(performance.now() - startTime);
            setProgress(50);

            if (!fetchSuccess || !html) {
                throw new Error('Could not fetch website. It may block CORS requests.');
            }

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            setProgress(70);

            // Extract data
            const title = doc.querySelector('title')?.textContent || '';
            const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            const h1Elements = doc.querySelectorAll('h1');
            const images = doc.querySelectorAll('img');
            const imgAltMissing = Array.from(images).filter(img => !img.getAttribute('alt')).length;
            const links = doc.querySelectorAll('a[href]');
            const internalLinks = Array.from(links).filter(a => {
                const href = a.getAttribute('href') || '';
                return href.startsWith('/') || href.startsWith(targetUrl);
            }).length;
            const externalLinks = links.length - internalLinks;
            const bodyText = doc.body?.textContent || '';
            const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

            setProgress(80);

            // Run SEO checks
            const checks: SEOCheck[] = [];

            // Title checks
            if (title) {
                if (title.length >= 50 && title.length <= 60) {
                    checks.push({ name: 'Title Tag', status: 'pass', message: `Perfect length (${title.length} chars)`, impact: 'high' });
                } else if (title.length < 50) {
                    checks.push({ name: 'Title Tag', status: 'warning', message: `Too short (${title.length} chars). Aim for 50-60.`, impact: 'high' });
                } else {
                    checks.push({ name: 'Title Tag', status: 'warning', message: `Too long (${title.length} chars). Aim for 50-60.`, impact: 'high' });
                }
            } else {
                checks.push({ name: 'Title Tag', status: 'fail', message: 'Missing title tag!', impact: 'high' });
            }

            // Description checks
            if (description) {
                if (description.length >= 150 && description.length <= 160) {
                    checks.push({ name: 'Meta Description', status: 'pass', message: `Perfect length (${description.length} chars)`, impact: 'high' });
                } else if (description.length < 150) {
                    checks.push({ name: 'Meta Description', status: 'warning', message: `Too short (${description.length} chars). Aim for 150-160.`, impact: 'high' });
                } else {
                    checks.push({ name: 'Meta Description', status: 'warning', message: `Too long (${description.length} chars). Aim for 150-160.`, impact: 'high' });
                }
            } else {
                checks.push({ name: 'Meta Description', status: 'fail', message: 'Missing meta description!', impact: 'high' });
            }

            // H1 checks
            if (h1Elements.length === 1) {
                checks.push({ name: 'H1 Heading', status: 'pass', message: 'Single H1 tag found', impact: 'high' });
            } else if (h1Elements.length === 0) {
                checks.push({ name: 'H1 Heading', status: 'fail', message: 'No H1 heading found!', impact: 'high' });
            } else {
                checks.push({ name: 'H1 Heading', status: 'warning', message: `${h1Elements.length} H1 tags found. Use only one.`, impact: 'high' });
            }

            // Image alt checks
            if (images.length > 0) {
                if (imgAltMissing === 0) {
                    checks.push({ name: 'Image Alt Tags', status: 'pass', message: `All ${images.length} images have alt text`, impact: 'medium' });
                } else {
                    checks.push({ name: 'Image Alt Tags', status: 'warning', message: `${imgAltMissing} of ${images.length} images missing alt text`, impact: 'medium' });
                }
            }

            // SSL check
            if (targetUrl.startsWith('https://')) {
                checks.push({ name: 'SSL Certificate', status: 'pass', message: 'Site uses HTTPS', impact: 'high' });
            } else {
                checks.push({ name: 'SSL Certificate', status: 'fail', message: 'Site not using HTTPS!', impact: 'high' });
            }

            // Canonical check
            const canonical = doc.querySelector('link[rel="canonical"]');
            if (canonical) {
                checks.push({ name: 'Canonical URL', status: 'pass', message: 'Canonical tag present', impact: 'medium' });
            } else {
                checks.push({ name: 'Canonical URL', status: 'warning', message: 'No canonical URL set', impact: 'medium' });
            }

            // Viewport check
            const viewport = doc.querySelector('meta[name="viewport"]');
            if (viewport) {
                checks.push({ name: 'Mobile Viewport', status: 'pass', message: 'Viewport meta tag present', impact: 'high' });
            } else {
                checks.push({ name: 'Mobile Viewport', status: 'fail', message: 'No viewport meta tag!', impact: 'high' });
            }

            // Open Graph checks
            const ogTitle = doc.querySelector('meta[property="og:title"]');
            const ogDesc = doc.querySelector('meta[property="og:description"]');
            const ogImage = doc.querySelector('meta[property="og:image"]');

            if (ogTitle && ogDesc && ogImage) {
                checks.push({ name: 'Open Graph Tags', status: 'pass', message: 'Complete OG tags present', impact: 'medium' });
            } else if (ogTitle || ogDesc || ogImage) {
                checks.push({ name: 'Open Graph Tags', status: 'warning', message: 'Incomplete OG tags', impact: 'medium' });
            } else {
                checks.push({ name: 'Open Graph Tags', status: 'warning', message: 'No Open Graph tags', impact: 'medium' });
            }

            // Content length check
            if (wordCount >= 300) {
                checks.push({ name: 'Content Length', status: 'pass', message: `${wordCount} words (good amount)`, impact: 'medium' });
            } else {
                checks.push({ name: 'Content Length', status: 'warning', message: `Only ${wordCount} words. Aim for 300+.`, impact: 'medium' });
            }

            // Calculate score
            let score = 0;
            const weights = { high: 15, medium: 8, low: 5 };
            let maxScore = 0;

            checks.forEach(check => {
                maxScore += weights[check.impact];
                if (check.status === 'pass') {
                    score += weights[check.impact];
                } else if (check.status === 'warning') {
                    score += weights[check.impact] * 0.5;
                }
            });

            const finalScore = Math.round((score / maxScore) * 100);

            setProgress(100);
            setResult({
                url: targetUrl,
                score: finalScore,
                checks,
                meta: {
                    title,
                    titleLength: title.length,
                    description,
                    descriptionLength: description.length,
                    h1Count: h1Elements.length,
                    h1Text: h1Elements[0]?.textContent || undefined,
                    imgAltMissing,
                    imgTotal: images.length,
                    internalLinks,
                    externalLinks,
                    wordCount,
                    loadTime,
                },
            });

        } catch (error) {
            setResult({
                url,
                score: 0,
                checks: [{
                    name: 'Error',
                    status: 'fail',
                    message: error instanceof Error ? error.message : 'Failed to analyze',
                    impact: 'high'
                }],
                meta: {}
            });
        }

        setAnalyzing(false);
    };

    const downloadReport = () => {
        if (!result) return;
        const report = JSON.stringify(result, null, 2);
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'pass') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        return <XCircle className="h-5 w-5 text-red-500" />;
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-indigo-500" />
                    Enter Website URL to Check SEO
                </h3>
                <div className="flex gap-3">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="example.com"
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
                                Check SEO
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Progress */}
            {analyzing && (
                <Card className="p-6 bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-medium text-indigo-700">Analyzing SEO...</p>
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
            {result && result.score > 0 && (
                <div className="space-y-4">
                    {/* Score Card */}
                    <Card className="p-6 bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">SEO Score</p>
                                <p className="text-sm text-slate-600 truncate max-w-md">{result.url}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadReport}>
                                <Download className="h-4 w-4 mr-1" /> Export
                            </Button>
                        </div>

                        <div className="flex items-center gap-8">
                            {/* Score Circle */}
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="56"
                                        className="fill-none stroke-slate-200"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        className={`fill-none ${getScoreBg(result.score).replace('bg-', 'stroke-')}`}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(result.score / 100) * 352} 352`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                                        {result.score}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Type className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Title</p>
                                    <p className="font-semibold text-slate-800">{result.meta.titleLength || 0} chars</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Words</p>
                                    <p className="font-semibold text-slate-800">{result.meta.wordCount || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Image className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Images</p>
                                    <p className="font-semibold text-slate-800">{result.meta.imgTotal || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Link2 className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Links</p>
                                    <p className="font-semibold text-slate-800">{(result.meta.internalLinks || 0) + (result.meta.externalLinks || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Checks */}
                    <Card className="p-5 bg-white border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" />
                            SEO Checks ({result.checks.filter(c => c.status === 'pass').length}/{result.checks.length} passed)
                        </h3>
                        <div className="space-y-2">
                            {result.checks.map((check, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${check.status === 'pass' ? 'bg-emerald-50' :
                                        check.status === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <StatusIcon status={check.status} />
                                        <div>
                                            <p className="font-medium text-slate-800">{check.name}</p>
                                            <p className="text-sm text-slate-600">{check.message}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${check.impact === 'high' ? 'bg-red-100 text-red-700' :
                                            check.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                        }`}>
                                        {check.impact} impact
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Meta Details */}
                    {result.meta.title && (
                        <Card className="p-5 bg-white border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                                <Code className="h-4 w-4 mr-2 text-indigo-500" />
                                Page Meta Details
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Title ({result.meta.titleLength} chars)</p>
                                    <p className="text-slate-800">{result.meta.title}</p>
                                </div>
                                {result.meta.description && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description ({result.meta.descriptionLength} chars)</p>
                                        <p className="text-slate-800">{result.meta.description}</p>
                                    </div>
                                )}
                                {result.meta.h1Text && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">H1 Heading</p>
                                        <p className="text-slate-800">{result.meta.h1Text}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Error */}
            {result && result.score === 0 && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Analysis Failed</h3>
                            <p className="text-sm text-red-700">{result.checks[0]?.message}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">SEO Checker</h4>
                        <p className="text-sm text-blue-700">
                            Analyzes your website for key SEO factors: title tags, meta descriptions,
                            headings, images, SSL, mobile-friendliness, and more. Get actionable recommendations
                            to improve your search rankings.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
