'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { checkMetaTitle } from '@/lib/tools/seo/meta-title-checker';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, XCircle } from 'lucide-react';
import type { MetaTitleResult } from '@/lib/types';

export function MetaTitleChecker() {
    const [title, setTitle] = React.useState('');
    const [result, setResult] = React.useState<MetaTitleResult | null>(null);

    React.useEffect(() => {
        if (title.trim()) {
            const data = checkMetaTitle({ title });
            if (data.success && data.data) {
                setResult(data.data);
            }
        } else {
            setResult(null);
        }
    }, [title]);

    const isWithinLimit = result ? !result.isTruncated : true;

    return (
        <div className="space-y-8">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        Meta Title
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your page title..."
                        className="text-lg py-6 shadow-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                        maxLength={100}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{title.length} chars</span>
                        <span>Max recommended: 60 chars</span>
                    </div>
                </div>
            </Card>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Analysis Card */}
                    <Card className="p-6 bg-slate-50 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Info className="h-5 w-5 text-indigo-600 mr-2" />
                            Analysis
                        </h3>
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className={cn(
                                "flex items-center p-3 rounded-lg",
                                isWithinLimit ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
                            )}>
                                {isWithinLimit ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-rose-600 mr-2" />
                                )}
                                <span className={cn(
                                    "font-medium",
                                    isWithinLimit ? "text-emerald-700" : "text-rose-700"
                                )}>
                                    {isWithinLimit ? 'Within Google\'s limit' : 'May be truncated'}
                                </span>
                            </div>

                            {/* Pixel Width */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-slate-500">Pixel Width</span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        isWithinLimit ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {result.pixelWidth}px / {result.maxPixelWidth}px
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            result.percentUsed <= 90 ? "bg-emerald-500" :
                                                result.percentUsed <= 100 ? "bg-amber-500" : "bg-rose-500"
                                        )}
                                        style={{ width: `${Math.min(result.percentUsed, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{result.percentUsed}% used</p>
                            </div>

                            {/* Character Count */}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Characters</span>
                                <span className={cn(
                                    "font-medium",
                                    result.characterCount <= 60 ? "text-emerald-600" : "text-amber-600"
                                )}>
                                    {result.characterCount} / {result.maxCharacterCount}
                                </span>
                            </div>

                            {/* Recommendation */}
                            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                                <p className="text-sm text-slate-700 font-medium">
                                    {result.recommendation}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* SERP Preview */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                            Google Preview
                        </h3>

                        <div className="font-arial space-y-4">
                            {/* Desktop Preview */}
                            <div>
                                <p className="text-xs text-slate-400 mb-2">Desktop</p>
                                <div className="p-3 border border-slate-200 rounded-lg">
                                    <div className="text-[#202124] text-xs mb-1 flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-[#f1f3f4] mr-2 flex items-center justify-center text-[10px]">
                                            G
                                        </div>
                                        <span>example.com</span>
                                        <span className="mx-1">›</span>
                                        <span>page-url</span>
                                    </div>
                                    <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer font-normal">
                                        {result.desktopPreview || title || 'Page Title Placeholder'}
                                    </h3>
                                    <p className="text-[#4d5156] text-sm mt-1 line-clamp-2">
                                        This is how your page title will appear in Google search results.
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Preview */}
                            <div>
                                <p className="text-xs text-slate-400 mb-2">Mobile</p>
                                <div className="p-3 border border-slate-200 rounded-lg max-w-[320px]">
                                    <div className="text-[#202124] text-xs mb-1 flex items-center">
                                        <div className="h-5 w-5 rounded-full bg-[#f1f3f4] mr-2 flex items-center justify-center text-[8px]">
                                            G
                                        </div>
                                        <span className="truncate">example.com</span>
                                    </div>
                                    <h3 className="text-[#1a0dab] text-lg hover:underline cursor-pointer font-normal">
                                        {result.mobilePreview || title || 'Page Title Placeholder'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {!result && !title && (
                <Card className="p-12 bg-slate-50 border border-dashed border-slate-300 text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Enter a Meta Title</h3>
                    <p className="text-sm text-slate-500">Type your title above to see the analysis</p>
                </Card>
            )}
        </div>
    );
}
