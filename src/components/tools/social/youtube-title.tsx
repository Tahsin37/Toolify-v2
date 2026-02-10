'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkYouTubeTitle, analyzeYouTubeTitle, getYouTubeTitleTips, calculateSEOScore, predictCTRPotential, generateTitleVariations } from '@/lib/tools/social/youtube-title';
import { cn } from '@/lib/utils';
import { Youtube, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Hash, Calendar, Type, Zap, TrendingUp, Copy, Sparkles } from 'lucide-react';
import type { YouTubeTitleResult } from '@/lib/types';

export function YouTubeTitleChecker() {
    const [title, setTitle] = React.useState('');
    const [result, setResult] = React.useState<YouTubeTitleResult | null>(null);
    const [analysis, setAnalysis] = React.useState<ReturnType<typeof analyzeYouTubeTitle> | null>(null);
    const [seoScore, setSeoScore] = React.useState<ReturnType<typeof calculateSEOScore> | null>(null);
    const [ctrPrediction, setCtrPrediction] = React.useState<ReturnType<typeof predictCTRPotential> | null>(null);
    const [showTips, setShowTips] = React.useState(false);
    const [showVariations, setShowVariations] = React.useState(false);

    React.useEffect(() => {
        const data = checkYouTubeTitle({ title });
        if (data.success && data.data) {
            setResult(data.data);
            setAnalysis(analyzeYouTubeTitle(title));
            setSeoScore(calculateSEOScore(title));
            setCtrPrediction(predictCTRPotential(title));
        }
    }, [title]);

    const loadExample = () => {
        setTitle('10 SEO Tips That Will 10x Your Traffic in 2025 (Proven Strategies)');
    };

    const copyTitle = () => {
        navigator.clipboard.writeText(title);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'C': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-rose-600 bg-rose-50 border-rose-200';
        }
    };

    const variations = title.length > 0 ? generateTitleVariations(title) : [];

    return (
        <div className="space-y-6">
            {/* SEO Score Dashboard */}
            {seoScore && title.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* SEO Score */}
                    <Card className={cn("p-4 text-center border shadow-sm", getGradeColor(seoScore.grade))}>
                        <div className="text-3xl font-bold">{seoScore.score}</div>
                        <div className="text-xs font-medium">SEO Score</div>
                        <div className="text-lg font-bold mt-1">Grade {seoScore.grade}</div>
                    </Card>

                    {/* CTR Potential */}
                    <Card className={cn(
                        "p-4 text-center border shadow-sm",
                        ctrPrediction?.rating === 'High' && "bg-emerald-50 border-emerald-200",
                        ctrPrediction?.rating === 'Medium' && "bg-amber-50 border-amber-200",
                        ctrPrediction?.rating === 'Low' && "bg-rose-50 border-rose-200",
                    )}>
                        <TrendingUp className={cn(
                            "h-6 w-6 mx-auto mb-1",
                            ctrPrediction?.rating === 'High' && "text-emerald-600",
                            ctrPrediction?.rating === 'Medium' && "text-amber-600",
                            ctrPrediction?.rating === 'Low' && "text-rose-600",
                        )} />
                        <div className="text-lg font-bold">{ctrPrediction?.rating}</div>
                        <div className="text-xs text-slate-500">CTR Potential</div>
                        <div className="text-sm font-medium mt-1">{ctrPrediction?.percentage}</div>
                    </Card>

                    {/* Characters */}
                    <Card className={cn(
                        "p-4 text-center border shadow-sm",
                        !result?.isWithinLimit ? "bg-rose-50 border-rose-200" :
                            result?.isOptimalLength ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                        <div className={cn(
                            "text-2xl font-bold",
                            !result?.isWithinLimit ? "text-rose-600" :
                                result?.isOptimalLength ? "text-emerald-600" : "text-amber-600"
                        )}>
                            {result?.length || 0}/100
                        </div>
                        <div className="text-xs text-slate-500">Characters</div>
                        <div className="text-sm font-medium mt-1">Optimal: 60-70</div>
                    </Card>

                    {/* Power Words */}
                    <Card className={cn(
                        "p-4 text-center border shadow-sm",
                        (analysis?.powerWordsFound?.length || 0) > 1 ? "bg-emerald-50 border-emerald-200" :
                            (analysis?.powerWordsFound?.length || 0) > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
                    )}>
                        <Zap className={cn(
                            "h-6 w-6 mx-auto mb-1",
                            (analysis?.powerWordsFound?.length || 0) > 1 ? "text-emerald-600" :
                                (analysis?.powerWordsFound?.length || 0) > 0 ? "text-amber-600" : "text-slate-400"
                        )} />
                        <div className="text-lg font-bold">{analysis?.powerWordsFound?.length || 0}</div>
                        <div className="text-xs text-slate-500">Power Words</div>
                    </Card>
                </div>
            )}

            {/* Title Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-red-600 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 text-white" />
                        <span className="text-sm font-bold text-white">YouTube Video Title</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={loadExample} className="text-white/90 hover:text-white hover:bg-white/20 text-xs">
                            Load Example
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyTitle} className="text-white/90 hover:text-white hover:bg-white/20 text-xs">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your video title..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                    />

                    {/* Character Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className={cn("font-medium",
                                !result?.isWithinLimit ? "text-rose-600" :
                                    result?.isOptimalLength ? "text-emerald-600" : "text-amber-600"
                            )}>
                                {result?.length || 0} / 100 characters
                            </span>
                            <span className="text-slate-400">
                                Optimal: 60-70
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                            {/* Optimal zone indicator */}
                            <div className="absolute left-[60%] w-[10%] h-full bg-emerald-200 opacity-50" />
                            <div
                                className={cn(
                                    "h-full transition-all duration-300 rounded-full relative z-10",
                                    !result?.isWithinLimit ? "bg-rose-500" :
                                        result?.isOptimalLength ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                style={{ width: `${Math.min(((result?.length || 0) / 100) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Status & Recommendation */}
            {result && title.length > 0 && (
                <Card className={cn(
                    "p-4 border shadow-sm flex items-center space-x-3",
                    !result.isWithinLimit ? "bg-rose-50 border-rose-200" :
                        result.isOptimalLength ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                )}>
                    {!result.isWithinLimit ? (
                        <XCircle className="h-5 w-5 text-rose-600" />
                    ) : result.isOptimalLength ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        !result.isWithinLimit ? "text-rose-700" :
                            result.isOptimalLength ? "text-emerald-700" : "text-amber-700"
                    )}>
                        {result.recommendation}
                    </span>
                </Card>
            )}

            {/* SEO Score Breakdown */}
            {seoScore && title.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                        SEO Score Breakdown
                    </h4>
                    <div className="space-y-3">
                        {seoScore.breakdown.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700">{item.factor}</span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            item.points >= item.maxPoints * 0.8 ? "text-emerald-600" :
                                                item.points >= item.maxPoints * 0.5 ? "text-amber-600" : "text-rose-600"
                                        )}>
                                            {item.points}/{item.maxPoints}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                item.points >= item.maxPoints * 0.8 ? "bg-emerald-500" :
                                                    item.points >= item.maxPoints * 0.5 ? "bg-amber-500" : "bg-rose-500"
                                            )}
                                            style={{ width: `${(item.points / item.maxPoints) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{item.tip}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Analysis Features */}
            {analysis && title.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FeatureCard icon={<Hash className="h-4 w-4" />} label="Has Numbers" active={analysis.hasNumbers} />
                    <FeatureCard icon={<Calendar className="h-4 w-4" />} label="Has Year" active={analysis.hasYear} />
                    <FeatureCard icon={<Type className="h-4 w-4" />} label="Front-Loaded" active={analysis.startsWithKeyword} />
                    <FeatureCard icon={<CheckCircle2 className="h-4 w-4" />} label="Has Emoji" active={analysis.hasEmoji} />
                </div>
            )}

            {/* Power Words Found */}
            {analysis?.powerWordsFound && analysis.powerWordsFound.length > 0 && (
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Power Words Detected
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.powerWordsFound.map((word, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {word}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Suggestions */}
            {analysis && analysis.suggestions.length > 0 && (
                <Card className="p-4 bg-amber-50 border border-amber-200">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Optimization Suggestions
                    </h4>
                    <ul className="space-y-1">
                        {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-sm text-amber-700">• {s}</li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Title Variations */}
            {variations.length > 0 && (
                <Card className="p-4 bg-slate-50 border border-slate-200">
                    <button
                        onClick={() => setShowVariations(!showVariations)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <span className="font-bold text-slate-900 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                            Generated Title Variations
                        </span>
                        <span className="text-indigo-600 text-sm">{showVariations ? 'Hide' : 'Show'}</span>
                    </button>
                    {showVariations && (
                        <div className="mt-3 space-y-2">
                            {variations.map((v, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTitle(v)}
                                    className="block w-full text-left p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                                >
                                    {v}
                                    <span className="text-slate-400 text-xs ml-2">({v.length} chars)</span>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Tips */}
            <Card className="p-4 bg-slate-50 border border-slate-200">
                <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-bold text-slate-900 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                        YouTube Title Best Practices
                    </span>
                    <span className="text-indigo-600 text-sm">{showTips ? 'Hide' : 'Show'}</span>
                </button>
                {showTips && (
                    <ul className="mt-3 space-y-2">
                        {getYouTubeTitleTips().map((tip, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
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
        </Card>
    );
}
