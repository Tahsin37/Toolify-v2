'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateSerpPreview, getSerpSuggestions } from '@/lib/tools/seo/serp-preview';
import { cn } from '@/lib/utils';
import { Search, Monitor, Smartphone, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

export function SerpPreview() {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [view, setView] = React.useState<'desktop' | 'mobile'>('desktop');

    const handleGenerate = () => {
        if (!title.trim()) return;
        const data = generateSerpPreview({ title, description, url: url || 'https://example.com' });
        if (data.success) {
            setResult(data.data);
            setSuggestions(getSerpSuggestions({ title, description, url: url || 'https://example.com' }));
        }
    };

    // Real-time preview
    React.useEffect(() => {
        if (title.trim()) {
            handleGenerate();
        }
    }, [title, description, url]);

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                        <span>Title Tag</span>
                        <span className={cn("text-xs", title.length > 60 ? "text-amber-600" : "text-slate-500")}>
                            {title.length}/60 chars
                        </span>
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Your Page Title | Brand Name"
                        className="text-base h-12"
                    />
                </div>
                <div>
                    <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                        <span>Meta Description</span>
                        <span className={cn("text-xs", description.length > 160 ? "text-amber-600" : "text-slate-500")}>
                            {description.length}/160 chars
                        </span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A compelling description of your page content..."
                        className="w-full h-24 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/your-page"
                    />
                </div>
            </Card>

            {result && (
                <>
                    {/* View Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setView('desktop')}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    view === 'desktop' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <Monitor className="h-4 w-4" />
                                <span>Desktop</span>
                            </button>
                            <button
                                onClick={() => setView('mobile')}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    view === 'mobile' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <Smartphone className="h-4 w-4" />
                                <span>Mobile</span>
                            </button>
                        </div>
                    </div>

                    {/* SERP Preview */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                        <div className={cn("mx-auto", view === 'mobile' ? "max-w-[360px]" : "max-w-[600px]")}>
                            {/* Google Search Bar Mock */}
                            <div className="flex items-center mb-6 p-2 bg-slate-50 rounded-full border border-slate-200">
                                <Search className="h-4 w-4 text-slate-400 ml-3 mr-2" />
                                <span className="text-sm text-slate-500">{title.split(' ').slice(0, 3).join(' ')}...</span>
                            </div>

                            {/* SERP Result */}
                            <div className="font-sans">
                                {/* Breadcrumb URL */}
                                <div className="flex items-center space-x-2 text-sm mb-1">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {(url || 'https://example.com').replace(/(^\w+:|^)\/\//, '').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-slate-800 text-sm">{result.formattedUrl || 'example.com'}</div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer leading-tight mb-1">
                                    {result.titlePreview}
                                </h3>

                                {/* Description */}
                                <p className="text-[#4d5156] text-sm leading-relaxed">
                                    {result.descriptionPreview || 'No description provided. Add a meta description to improve click-through rates.'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatusCard
                            label="Title"
                            value={`${result.titlePixelWidth}px`}
                            max={result.titleMaxPixelWidth}
                            current={result.titlePixelWidth}
                            isOk={!result.titleIsTruncated}
                        />
                        <StatusCard
                            label="Description"
                            value={`${result.descriptionPixelWidth}px`}
                            max={result.descriptionMaxPixelWidth}
                            current={result.descriptionPixelWidth}
                            isOk={!result.descriptionIsTruncated}
                        />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <Card className="p-4 bg-blue-50 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2" /> Optimization Tips
                            </h4>
                            <ul className="space-y-1">
                                {suggestions.map((s, i) => (
                                    <li key={i} className="text-sm text-blue-700">{s}</li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

function StatusCard({ label, value, max, current, isOk }: { label: string; value: string; max: number; current: number; isOk: boolean }) {
    const percentage = Math.min((current / max) * 100, 100);
    return (
        <Card className={cn("p-4 border shadow-sm", isOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div className="flex items-center space-x-1">
                    {isOk ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    <span className={cn("text-sm font-bold", isOk ? "text-emerald-600" : "text-amber-600")}>{value}</span>
                </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", isOk ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0px</span>
                <span>{max}px limit</span>
            </div>
        </Card>
    );
}
