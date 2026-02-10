'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Share2, ThumbsUp, Flag, Twitter, Link2, CheckCircle2,
    Facebook, Linkedin, Copy, X
} from 'lucide-react';

interface ToolActionsProps {
    toolName: string;
    toolSlug: string;
}

export function ToolActions({ toolName, toolSlug }: ToolActionsProps) {
    const [showShare, setShowShare] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [helpful, setHelpful] = React.useState(false);

    const shareUrl = `https://toolify.app/tools/${toolSlug}`;
    const shareText = `Check out ${toolName} - Free online tool by Toolify!`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: toolName,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setShowShare(true);
        }
    };

    const shareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleHelpful = () => {
        setHelpful(true);
        // Could add analytics here
    };

    const reportIssue = () => {
        const mailtoUrl = `mailto:support@toolify.app?subject=Issue with ${toolName}&body=I found an issue with the ${toolName} tool at ${shareUrl}%0D%0A%0D%0APlease describe the issue:%0D%0A`;
        window.location.href = mailtoUrl;
    };

    return (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <div className="flex space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className={helpful ? 'text-emerald-600' : 'text-slate-500'}
                    onClick={handleHelpful}
                    disabled={helpful}
                >
                    {helpful ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Thanks!
                        </>
                    ) : (
                        <>
                            <ThumbsUp className="h-4 w-4 mr-2" /> Helpful
                        </>
                    )}
                </Button>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500"
                        onClick={shareNative}
                    >
                        <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>

                    {/* Share Dropdown */}
                    {showShare && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowShare(false)}
                            />
                            <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 min-w-64">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-800">Share this tool</h4>
                                    <button onClick={() => setShowShare(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={shareTwitter}
                                        className="flex-1"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={shareFacebook}
                                        className="flex-1"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={shareLinkedIn}
                                        className="flex-1"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200"
                                    />
                                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                        {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-500"
                onClick={reportIssue}
            >
                <Flag className="h-4 w-4 mr-2" /> Report Issue
            </Button>
        </div>
    );
}
