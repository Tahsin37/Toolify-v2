'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkYouTubeDescription, analyzeYouTubeDescription, generateDescriptionTemplate } from '@/lib/tools/social/youtube-description';
import { cn } from '@/lib/utils';
import { Youtube, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Link2, Hash, Clock, Copy, Check } from 'lucide-react';
import type { YouTubeDescriptionResult } from '@/lib/types';

export function YouTubeDescriptionChecker() {
    const [description, setDescription] = React.useState('');
    const [result, setResult] = React.useState<YouTubeDescriptionResult | null>(null);
    const [analysis, setAnalysis] = React.useState<ReturnType<typeof analyzeYouTubeDescription> | null>(null);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        const data = checkYouTubeDescription({ description });
        if (data.success && data.data) {
            setResult(data.data);
            setAnalysis(analyzeYouTubeDescription(description));
        }
    }, [description]);

    const loadTemplate = () => {
        setDescription(generateDescriptionTemplate({
            videoTopic: 'SEO optimization techniques',
            channelName: 'Your Channel',
            websiteUrl: 'https://example.com',
            socialLinks: {
                Twitter: 'https://twitter.com/example',
                Instagram: 'https://instagram.com/example',
            },
        }));
    };

    const copyDescription = () => {
        navigator.clipboard.writeText(description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Characters"
                    value={result?.length || 0}
                    max={5000}
                    status={!result?.isWithinLimit ? 'error' : result && result.length >= 250 ? 'good' : 'warning'}
                />
                <StatCard
                    label="Links"
                    value={result?.linkCount || 0}
                    icon={<Link2 className="h-4 w-4" />}
                />
                <StatCard
                    label="Hashtags"
                    value={result?.hashtagCount || 0}
                    icon={<Hash className="h-4 w-4" />}
                />
                <StatCard
                    label="Above Fold"
                    value={result?.aboveFoldLength || 0}
                    max={100}
                />
            </div>

            {/* Description Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-red-600 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 text-white" />
                        <span className="text-sm font-bold text-white">Video Description</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={loadTemplate} className="text-white/90 hover:text-white hover:bg-white/20 text-xs">
                            Load Template
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyDescription} className="text-white/90 hover:text-white hover:bg-white/20 text-xs">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter your video description..."
                        className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-mono text-sm"
                    />

                    {/* Character Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className={cn("font-medium",
                                !result?.isWithinLimit ? "text-rose-600" : "text-slate-500"
                            )}>
                                {result?.length || 0} / 5,000 characters
                            </span>
                            <span className="text-slate-400">
                                {result && result.remaining >= 0 ? `${result.remaining.toLocaleString()} remaining` : ''}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300 rounded-full",
                                    !result?.isWithinLimit ? "bg-rose-500" :
                                        result && result.length >= 250 ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                style={{ width: `${Math.min(((result?.length || 0) / 5000) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Above the Fold Preview */}
            {result && description.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm">Above the Fold Preview</h4>
                    <p className="text-sm text-slate-600 italic">
                        "{result.aboveFoldText}"
                        {result.length > 100 && <span className="text-blue-600 cursor-pointer ml-1">...Show more</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        First ~100 characters visible before "Show more"
                    </p>
                </Card>
            )}

            {/* Status */}
            {result && description.length > 0 && (
                <Card className={cn(
                    "p-4 border shadow-sm flex items-center space-x-3",
                    !result.isWithinLimit ? "bg-rose-50 border-rose-200" :
                        result.length >= 500 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                )}>
                    {!result.isWithinLimit ? (
                        <XCircle className="h-5 w-5 text-rose-600" />
                    ) : result.length >= 500 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        !result.isWithinLimit ? "text-rose-700" :
                            result.length >= 500 ? "text-emerald-700" : "text-amber-700"
                    )}>
                        {result.recommendation}
                    </span>
                </Card>
            )}

            {/* Analysis Features */}
            {analysis && description.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <FeatureCard
                        icon={<Clock className="h-4 w-4" />}
                        label="Timestamps"
                        active={analysis.hasTimestamps}
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        label="Call to Action"
                        active={analysis.hasCallToAction}
                    />
                    <FeatureCard
                        icon={<Link2 className="h-4 w-4" />}
                        label={`${analysis.links.length} Link${analysis.links.length !== 1 ? 's' : ''}`}
                        active={analysis.links.length > 0}
                    />
                </div>
            )}

            {/* Suggestions */}
            {analysis && analysis.suggestions.length > 0 && (
                <Card className="p-4 bg-amber-50 border border-amber-200">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Optimization Tips
                    </h4>
                    <ul className="space-y-1">
                        {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-sm text-amber-700">• {s}</li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}

function StatCard({ label, value, max, status, icon }: {
    label: string;
    value: number;
    max?: number;
    status?: 'good' | 'warning' | 'error';
    icon?: React.ReactNode;
}) {
    return (
        <Card className={cn(
            "p-4 text-center border shadow-sm",
            status === 'error' && "bg-rose-50 border-rose-200",
            status === 'warning' && "bg-amber-50 border-amber-200",
            status === 'good' && "bg-emerald-50 border-emerald-200",
            !status && "bg-white border-slate-200"
        )}>
            {icon && <div className="flex justify-center mb-1 text-slate-400">{icon}</div>}
            <div className={cn(
                "text-2xl font-bold",
                status === 'error' && "text-rose-600",
                status === 'warning' && "text-amber-600",
                status === 'good' && "text-emerald-600",
                !status && "text-slate-900"
            )}>
                {value.toLocaleString()}{max ? <span className="text-sm font-normal text-slate-400">/{max.toLocaleString()}</span> : ''}
            </div>
            <div className="text-xs text-slate-500">{label}</div>
        </Card>
    );
}

function FeatureCard({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Card className={cn(
            "p-3 flex items-center space-x-2 border shadow-sm",
            active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
        )}>
            <span className={active ? "text-emerald-600" : "text-slate-400"}>{icon}</span>
            <span className={cn("text-sm font-medium", active ? "text-emerald-700" : "text-slate-500")}>
                {label}
            </span>
            {active && <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-auto" />}
        </Card>
    );
}
