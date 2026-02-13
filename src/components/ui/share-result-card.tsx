'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, Share2, Twitter, Linkedin } from 'lucide-react';

interface SharedResultCardProps {
    title: string;
    score?: string | number;
    description: string;
    shareUrl?: string; // Optional, defaults to current URL
    shareText?: string; // Text to share
}

export function SharedResultCard({ title, score, description, shareUrl, shareText }: SharedResultCardProps) {
    const [copied, setCopied] = React.useState(false);

    const getShareUrl = () => {
        if (typeof window !== 'undefined') {
            return shareUrl || window.location.href;
        }
        return '';
    };

    const handleCopy = async () => {
        const url = getShareUrl();
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: 'twitter' | 'linkedin') => {
        const url = encodeURIComponent(getShareUrl());
        const text = encodeURIComponent(shareText || `Check out my result on ${title}!`);

        let link = '';
        if (platform === 'twitter') {
            link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        } else if (platform === 'linkedin') {
            link = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }

        window.open(link, '_blank', 'width=600,height=400');
    };

    return (
        <Card className="relative overflow-hidden p-6 border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Share2 className="w-24 h-24 text-indigo-600 transform rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
                        <p className="text-slate-600 max-w-md">{description}</p>
                        {score && (
                            <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-full border border-indigo-100 shadow-sm">
                                <span className="text-sm text-slate-500 mr-2">Result:</span>
                                <span className="text-xl font-bold text-indigo-600">{score}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="bg-white hover:bg-slate-50 min-w-[100px]"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied' : 'Copy Link'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleShare('twitter')}
                            className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white border-transparent"
                        >
                            <Twitter className="w-4 h-4 mr-2" />
                            Tweet
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleShare('linkedin')}
                            className="bg-[#0A66C2] hover:bg-[#004182] text-white border-transparent"
                        >
                            <Linkedin className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
