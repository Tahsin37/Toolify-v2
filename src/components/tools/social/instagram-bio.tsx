'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { checkInstagramBio, analyzeInstagramBio, generateBioIdeas } from '@/lib/tools/social/instagram-bio';
import { cn } from '@/lib/utils';
import { Instagram, CheckCircle2, XCircle, Smile, Type, Link2, Hash, AtSign, Lightbulb, Sparkles, ChevronDown } from 'lucide-react';
import type { InstagramBioResult } from '@/lib/types';
import { Button } from '@/components/ui/button';

const SAMPLE_BIOS: Record<string, string> = {
    '📸 Photography': `📸 Capturing moments that matter
🌍 Based in NYC | Available worldwide
🏆 Featured in NatGeo & Vogue
👇 Book your shoot below`,
    '💻 Tech': `💻 Full-Stack Developer | Open Source
🚀 Building tools that help devs ship faster
🎯 React • Node.js • TypeScript
🔗 Latest project 👇`,
    '💪 Fitness': `💪 Certified Personal Trainer
🏋️ Helping you get fit in 12 weeks
📩 DM for coaching plans
🌱 Plant-based athlete | NASM-CPT`,
    '🍳 Food': `🍳 Recipe Creator & Food Stylist
📍 London | Recipe testing kitchen
📕 Cookbook author — "Quick & Healthy"
👇 New recipes every Tuesday & Friday`,
    '✈️ Travel': `✈️ 47 countries and counting
📸 Solo female traveler
💡 Budget travel tips & guides
📩 Collabs: hello@wanderlust.co`,
    '📈 Business': `📈 Entrepreneur | 3x Founder
💰 Helping startups scale to $1M ARR
🎙️ Host of "Startup Stories" podcast
👇 Free growth playbook`,
    '🎵 Music': `🎵 Singer-Songwriter | Producer
🎸 Indie / Alternative
🎧 500K+ streams on Spotify
📩 Booking: music@example.com`,
    '🎨 Art': `🎨 Digital Artist & Illustrator
✏️ Commissions open — DM me
🖼️ Prints available at my shop
🌈 Creating colorful worlds daily`,
};


export function InstagramBioChecker() {
    const [bio, setBio] = React.useState('');
    const [result, setResult] = React.useState<InstagramBioResult | null>(null);
    const [analysis, setAnalysis] = React.useState<ReturnType<typeof analyzeInstagramBio> | null>(null);
    const [showIdeas, setShowIdeas] = React.useState(false);

    React.useEffect(() => {
        const data = checkInstagramBio({ bio });
        if (data.success && data.data) {
            setResult(data.data);
            setAnalysis(analyzeInstagramBio(bio));
        }
    }, [bio]);

    const loadExample = (niche?: string) => {
        if (niche && SAMPLE_BIOS[niche]) {
            setBio(SAMPLE_BIOS[niche]);
        } else {
            setBio(`✨ Digital Creator | SEO Expert
📍 San Francisco, CA
🎯 Helping brands grow online
👇 Check my latest tips`);
        }
    };

    const [showSamples, setShowSamples] = React.useState(false);

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Characters"
                    value={result?.length || 0}
                    max={150}
                    status={result?.isWithinLimit ? 'good' : 'error'}
                />
                <StatCard
                    label="Remaining"
                    value={result?.remaining || 150}
                    status={result && result.remaining < 0 ? 'error' : result && result.remaining < 20 ? 'warning' : 'good'}
                />
                <StatCard
                    label="Emojis"
                    value={result?.emojiCount || 0}
                />
                <StatCard
                    label="Lines"
                    value={(result?.lineBreaks || 0) + (bio.length > 0 ? 1 : 0)}
                />
            </div>

            {/* Sample Bios by Niche */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
                <button
                    onClick={() => setShowSamples(!showSamples)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-bold text-purple-900 flex items-center">
                        <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                        Sample Bios by Niche
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-purple-600 transition-transform", showSamples && "rotate-180")} />
                </button>
                {showSamples && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.keys(SAMPLE_BIOS).map(niche => (
                            <Button
                                key={niche}
                                size="sm"
                                variant="outline"
                                onClick={() => loadExample(niche)}
                                className="text-xs bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-900"
                            >
                                {niche}
                            </Button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Bio Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-white" />
                        <span className="text-sm font-bold text-white">Instagram Bio</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => loadExample()} className="text-white/90 hover:text-white hover:bg-white/20 text-xs">
                        Load Example
                    </Button>
                </div>
                <div className="p-4">
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write your Instagram bio here..."
                        className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                        maxLength={200}
                    />

                    {/* Character Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className={cn(
                                "font-medium",
                                !result?.isWithinLimit ? "text-rose-600" :
                                    result.remaining < 20 ? "text-amber-600" : "text-slate-500"
                            )}>
                                {result?.length || 0} / 150 characters
                            </span>
                            <span className="text-slate-400">
                                {result && result.remaining >= 0 ? `${result.remaining} left` : `${Math.abs(result?.remaining || 0)} over`}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300 rounded-full",
                                    !result?.isWithinLimit ? "bg-rose-500" :
                                        result.remaining < 20 ? "bg-amber-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                                )}
                                style={{ width: `${Math.min(((result?.length || 0) / 150) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Status */}
            {result && bio.length > 0 && (
                <Card className={cn(
                    "p-4 border shadow-sm flex items-center space-x-3",
                    result.isWithinLimit ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                )}>
                    {result.isWithinLimit ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                    )}
                    <span className={cn("text-sm", result.isWithinLimit ? "text-emerald-700" : "text-rose-700")}>
                        {result.recommendation}
                    </span>
                </Card>
            )}

            {/* Analysis */}
            {analysis && bio.length > 0 && (
                <>
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FeatureCard
                            icon={<Hash className="h-4 w-4" />}
                            label="Hashtag"
                            active={analysis.hasHashtag}
                        />
                        <FeatureCard
                            icon={<AtSign className="h-4 w-4" />}
                            label="Mention"
                            active={analysis.hasMention}
                        />
                        <FeatureCard
                            icon={<Link2 className="h-4 w-4" />}
                            label="URL"
                            active={analysis.hasUrl}
                        />
                        <FeatureCard
                            icon={<Smile className="h-4 w-4" />}
                            label="CTA"
                            active={analysis.hasCallToAction}
                        />
                    </div>

                    {/* Suggestions */}
                    {analysis.suggestions.length > 0 && (
                        <Card className="p-4 bg-amber-50 border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Suggestions
                            </h4>
                            <ul className="space-y-1">
                                {analysis.suggestions.map((s, i) => (
                                    <li key={i} className="text-sm text-amber-700">• {s}</li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </>
            )}

            {/* Bio Ideas */}
            <Card className="p-4 bg-slate-50 border border-slate-200">
                <button
                    onClick={() => setShowIdeas(!showIdeas)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-bold text-slate-900">Bio Ideas Generator</span>
                    <span className="text-indigo-600 text-sm">{showIdeas ? 'Hide' : 'Show'}</span>
                </button>
                {showIdeas && (
                    <div className="mt-3 space-y-2">
                        {generateBioIdeas('your niche').map((idea, i) => (
                            <button
                                key={i}
                                onClick={() => setBio(idea)}
                                className="block w-full text-left p-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                            >
                                {idea}
                            </button>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function StatCard({ label, value, max, status }: { label: string; value: number; max?: number; status?: 'good' | 'warning' | 'error' }) {
    return (
        <Card className={cn(
            "p-3 text-center border shadow-sm",
            status === 'error' && "bg-rose-50 border-rose-200",
            status === 'warning' && "bg-amber-50 border-amber-200",
            status === 'good' && "bg-emerald-50 border-emerald-200",
            !status && "bg-white border-slate-200"
        )}>
            <div className={cn(
                "text-2xl font-bold",
                status === 'error' && "text-rose-600",
                status === 'warning' && "text-amber-600",
                status === 'good' && "text-emerald-600",
                !status && "text-slate-900"
            )}>
                {value}{max ? `/${max}` : ''}
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
