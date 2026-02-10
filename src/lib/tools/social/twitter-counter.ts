/**
 * Twitter/X Character Counter
 * 
 * Counts characters for Twitter/X posts with URL shortening awareness.
 */

import { extractUrls, extractHashtags, extractMentions } from '@/lib/utils/text-analysis';
import type { ToolResult, TwitterCountResult } from '@/lib/types';

export interface TwitterCountInput {
    text: string;
}

// Twitter limits
const MAX_LENGTH = 280;
const URL_LENGTH = 23; // Twitter shortens all URLs to 23 characters

/**
 * Check Twitter/X character count
 */
export function checkTwitterCount(input: TwitterCountInput): ToolResult<TwitterCountResult> {
    const startTime = performance.now();

    const { text } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Extract URLs
    const urls = extractUrls(text);
    const urlCount = urls.length;

    // Calculate URL character reduction
    // Each URL is replaced with a 23-character t.co link
    let urlCharacterReduction = 0;
    for (const url of urls) {
        if (url.length > URL_LENGTH) {
            urlCharacterReduction += url.length - URL_LENGTH;
        }
    }

    // Calculate effective length
    const rawLength = text.length;
    const effectiveLength = rawLength - urlCharacterReduction;

    const remaining = MAX_LENGTH - effectiveLength;
    const isWithinLimit = effectiveLength <= MAX_LENGTH;

    // Count hashtags and mentions
    const hashtags = extractHashtags(text);
    const mentions = extractMentions(text);

    // Calculate thread count if over limit
    const threadCount = effectiveLength <= MAX_LENGTH
        ? 1
        : Math.ceil(effectiveLength / (MAX_LENGTH - 10)); // -10 for thread numbering

    return {
        success: true,
        data: {
            text,
            length: rawLength,
            maxLength: MAX_LENGTH,
            remaining,
            isWithinLimit,
            urlCount,
            urlCharacterReduction,
            effectiveLength,
            hashtagCount: hashtags.length,
            mentionCount: mentions.length,
            threadCount,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Analyze tweet for best practices
 */
export function analyzeTweet(text: string): {
    effectiveLength: number;
    isWithinLimit: boolean;
    hashtags: string[];
    mentions: string[];
    urls: string[];
    hasMedia: boolean;
    suggestions: string[];
} {
    const urls = extractUrls(text);
    const hashtags = extractHashtags(text);
    const mentions = extractMentions(text);

    // Calculate effective length
    let effectiveLength = text.length;
    for (const url of urls) {
        if (url.length > URL_LENGTH) {
            effectiveLength -= (url.length - URL_LENGTH);
        }
    }

    // Check for media indicators
    const hasMedia = /\.(jpg|jpeg|png|gif|mp4|mov)/i.test(text) ||
        text.includes('[image]') ||
        text.includes('[video]');

    const suggestions: string[] = [];

    if (hashtags.length > 3) {
        suggestions.push('Use 1-3 hashtags for best engagement');
    }

    if (hashtags.length === 0) {
        suggestions.push('Add 1-2 relevant hashtags for discoverability');
    }

    if (text === text.toUpperCase() && text.length > 10) {
        suggestions.push('Avoid ALL CAPS - it reads as shouting');
    }

    if (effectiveLength > MAX_LENGTH) {
        suggestions.push(`Shorten by ${effectiveLength - MAX_LENGTH} characters or create a thread`);
    }

    if (text.length < 100 && urls.length === 0) {
        suggestions.push('Shorter tweets often get more engagement');
    }

    if (mentions.length > 5) {
        suggestions.push('Too many mentions may look spammy');
    }

    return {
        effectiveLength,
        isWithinLimit: effectiveLength <= MAX_LENGTH,
        hashtags,
        mentions,
        urls,
        hasMedia,
        suggestions,
    };
}

/**
 * Split text into thread
 */
export function createThread(text: string, addNumbers: boolean = true): string[] {
    if (text.length <= MAX_LENGTH) {
        return [text];
    }

    const tweets: string[] = [];
    const words = text.split(/\s+/);

    // Reserve space for numbering
    const effectiveMax = addNumbers ? MAX_LENGTH - 10 : MAX_LENGTH;

    let currentTweet = '';

    for (const word of words) {
        const testTweet = currentTweet ? `${currentTweet} ${word}` : word;

        if (testTweet.length <= effectiveMax) {
            currentTweet = testTweet;
        } else {
            if (currentTweet) {
                tweets.push(currentTweet);
            }
            currentTweet = word;
        }
    }

    if (currentTweet) {
        tweets.push(currentTweet);
    }

    // Add numbering
    if (addNumbers && tweets.length > 1) {
        return tweets.map((tweet, i) => `${i + 1}/${tweets.length} ${tweet}`);
    }

    return tweets;
}

/**
 * Get optimal tweet length
 */
export function getOptimalLength(): { min: number; max: number; recommended: number } {
    return {
        min: 71,
        max: 100,
        recommended: 80,
    };
}
