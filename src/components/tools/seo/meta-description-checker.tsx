'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkMetaDescription } from '@/lib/tools/seo/meta-description-checker';
import { cn } from '@/lib/utils';
import { Info, Monitor, Smartphone } from 'lucide-react';

export function MetaDescriptionChecker() {
    const [description, setDescription] = React.useState('');
    const [result, setResult] = React.useState<any>(null);

    React.useEffect(() => {
        if (description.trim()) {
            const data = checkMetaDescription({ description });
            if (data.success) {
                setResult(data.data);
            }
        } else {
            setResult(null);
        }
    }, [description]);

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Meta Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter your meta description here..."
                    className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base leading-relaxed"
                    maxLength={300}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>{description.length} characters</span>
                    <span>Recommended: 150-160 characters</span>
                </div>
            </Card>

            {result && (
                <>
                    {/* Analysis Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Characters" value={result.characterCount} max={160} />
                        <StatCard label="Pixel Width" value={`${result.pixelWidth}px`} />
                        <StatCard label="% Used" value={`${result.percentUsed}%`} status={result.percentUsed <= 100 ? 'good' : 'warning'} />
                        <StatCard label="Status" value={result.isTruncated ? 'Truncated' : 'OK'} status={result.isTruncated ? 'warning' : 'good'} />
                    </div>

                    {/* Recommendation */}
                    <Card className={cn(
                        "p-4 border shadow-sm",
                        result.isTruncated
                            ? "bg-amber-50 border-amber-200"
                            : "bg-emerald-50 border-emerald-200"
                    )}>
                        <div className="flex items-start space-x-3">
                            <Info className={cn("h-5 w-5 mt-0.5", result.isTruncated ? "text-amber-600" : "text-emerald-600")} />
                            <p className={cn("text-sm font-medium", result.isTruncated ? "text-amber-800" : "text-emerald-800")}>
                                {result.recommendation}
                            </p>
                        </div>
                    </Card>

                    {/* SERP Previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Desktop Preview */}
                        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center space-x-2 text-slate-500 mb-4">
                                <Monitor className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Desktop Preview</span>
                            </div>
                            <div className="font-arial">
                                <div className="text-[#202124] text-xs mb-1 flex items-center">
                                    <div className="h-5 w-5 rounded-full bg-[#f1f3f4] mr-2 flex items-center justify-center text-[10px]">G</div>
                                    <span>example.com</span>
                                </div>
                                <h3 className="text-[#1a0dab] text-lg hover:underline cursor-pointer">Your Page Title Here</h3>
                                <p className="text-[#4d5156] text-sm mt-1 leading-snug">
                                    {result.desktopPreview}
                                </p>
                            </div>
                        </Card>

                        {/* Mobile Preview */}
                        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center space-x-2 text-slate-500 mb-4">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Mobile Preview</span>
                            </div>
                            <div className="font-arial max-w-[320px]">
                                <div className="text-[#202124] text-xs mb-1 flex items-center">
                                    <div className="h-5 w-5 rounded-full bg-[#f1f3f4] mr-2 flex items-center justify-center text-[10px]">G</div>
                                    <span>example.com</span>
                                </div>
                                <h3 className="text-[#1a0dab] text-base hover:underline cursor-pointer">Your Page Title Here</h3>
                                <p className="text-[#4d5156] text-sm mt-1 leading-snug">
                                    {result.mobilePreview}
                                </p>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ label, value, max, status }: { label: string; value: string | number; max?: number; status?: 'good' | 'warning' }) {
    return (
        <Card className={cn(
            "p-4 bg-white border text-center shadow-sm",
            status === 'good' && "border-emerald-200",
            status === 'warning' && "border-amber-200"
        )}>
            <div className={cn(
                "text-2xl font-bold mb-1",
                status === 'good' && "text-emerald-600",
                status === 'warning' && "text-amber-600",
                !status && "text-slate-900"
            )}>
                {value}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        </Card>
    );
}
