/**
 * YouTube Description Character Counter
 * 
 * Analyzes YouTube video descriptions with above-fold preview.
 */

import { extractUrls, extractHashtags } from '@/lib/utils/text-analysis';
import type { ToolResult, YouTubeDescriptionResult } from '@/lib/types';

export interface YouTubeDescriptionInput {
    description: string;
}

// YouTube description limits
const MAX_LENGTH = 5000;
const ABOVE_FOLD_LENGTH = 100; // Characters shown before "Show more"

/**
 * Check YouTube description
 */
export function checkYouTubeDescription(input: YouTubeDescriptionInput): ToolResult<YouTubeDescriptionResult> {
    const startTime = performance.now();

    const { description } = input;

    if (description === undefined || description === null) {
        return {
            success: false,
            error: 'Description is required',
            processingTime: performance.now() - startTime,
        };
    }

    const length = description.length;
    const remaining = MAX_LENGTH - length;
    const isWithinLimit = length <= MAX_LENGTH;

    // Extract above-fold preview
    const aboveFoldText = description.substring(0, ABOVE_FOLD_LENGTH);
    const aboveFoldLength = Math.min(length, ABOVE_FOLD_LENGTH);

    // Count links and hashtags
    const links = extractUrls(description);
    const hashtags = extractHashtags(description);

    // Generate recommendation
    let recommendation: string;
    if (length === 0) {
        recommendation = 'Add a description to improve video discoverability.';
    } else if (length < 150) {
        recommendation = 'Description is too short. Add more context and keywords.';
    } else if (length < 500) {
        recommendation = 'Good start! Consider adding more detail, timestamps, or links.';
    } else if (length <= 2000) {
        recommendation = 'Great description length! Good for SEO.';
    } else if (length <= MAX_LENGTH) {
        recommendation = 'Comprehensive description. Ensure the most important info is above the fold.';
    } else {
        recommendation = `Description exceeds ${MAX_LENGTH} character limit. Must shorten by ${-remaining} characters.`;
    }

    return {
        success: true,
        data: {
            text: description,
            length,
            maxLength: MAX_LENGTH,
            remaining,
            isWithinLimit,
            aboveFoldLength,
            aboveFoldText,
            linkCount: links.length,
            hashtagCount: hashtags.length,
            recommendation,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Analyze description for SEO
 */
export function analyzeYouTubeDescription(description: string): {
    length: number;
    paragraphs: number;
    links: string[];
    hashtags: string[];
    hasTimestamps: boolean;
    hasCallToAction: boolean;
    suggestions: string[];
} {
    const lines = description.split('\n');
    const paragraphs = lines.filter(l => l.trim().length > 0).length;
    const links = extractUrls(description);
    const hashtags = extractHashtags(description);

    // Check for timestamps (00:00 format)
    const hasTimestamps = /\d{1,2}:\d{2}/.test(description);

    // Check for common CTAs
    const ctaPatterns = [
        /subscribe/i,
        /like/i,
        /comment/i,
        /share/i,
        /click/i,
        /check out/i,
        /follow/i,
        /join/i,
    ];
    const hasCallToAction = ctaPatterns.some(p => p.test(description));

    const suggestions: string[] = [];

    // First 100 chars analysis
    const aboveFold = description.substring(0, 100);
    if (!aboveFold.includes(' ') && description.length > 0) {
        suggestions.push('Add spaces - text appears as one block');
    }

    if (description.length < 250) {
        suggestions.push('Add more content (aim for 250+ characters minimum)');
    }

    if (!hasTimestamps && description.length > 500) {
        suggestions.push('Consider adding timestamps for longer videos');
    }

    if (!hasCallToAction) {
        suggestions.push('Add a call-to-action (subscribe, like, comment)');
    }

    if (links.length === 0) {
        suggestions.push('Include relevant links (social media, website)');
    }

    if (hashtags.length === 0) {
        suggestions.push('Add 3-5 relevant hashtags at the end');
    } else if (hashtags.length > 15) {
        suggestions.push('Too many hashtags - stick to 3-15');
    }

    return {
        length: description.length,
        paragraphs,
        links,
        hashtags,
        hasTimestamps,
        hasCallToAction,
        suggestions,
    };
}

/**
 * Generate description template
 */
export function generateDescriptionTemplate(options: {
    videoTopic: string;
    channelName?: string;
    websiteUrl?: string;
    socialLinks?: Record<string, string>;
}): string {
    const { videoTopic, channelName, websiteUrl, socialLinks } = options;

    const lines: string[] = [];

    lines.push(`In this video, we explore ${videoTopic}.`);
    lines.push('');
    lines.push('🔔 Subscribe for more content!');
    lines.push('');
    lines.push('⏱️ TIMESTAMPS');
    lines.push('00:00 - Introduction');
    lines.push('01:00 - Main Content');
    lines.push('05:00 - Summary');
    lines.push('');

    if (websiteUrl || socialLinks) {
        lines.push('🔗 LINKS');
        if (websiteUrl) {
            lines.push(`Website: ${websiteUrl}`);
        }
        if (socialLinks) {
            for (const [platform, url] of Object.entries(socialLinks)) {
                lines.push(`${platform}: ${url}`);
            }
        }
        lines.push('');
    }

    lines.push('📝 ABOUT');
    lines.push(channelName ? `${channelName} creates...` : 'This channel creates...');
    lines.push('');
    lines.push('#shorts #youtube #video');

    return lines.join('\n');
}
