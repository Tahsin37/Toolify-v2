/**
 * Hashtag Counter
 * 
 * Extracts and analyzes hashtags from text.
 */

import { extractHashtags } from '@/lib/utils/text-analysis';
import type { ToolResult, HashtagResult } from '@/lib/types';

export interface HashtagCounterInput {
    text: string;
}

// Platform hashtag recommendations
const PLATFORM_RECOMMENDATIONS: Record<string, number> = {
    Instagram: 30,  // Max 30, recommended 3-5
    Twitter: 3,     // Recommended 1-2
    LinkedIn: 5,    // Recommended 3-5
    TikTok: 5,      // Recommended 3-5
    YouTube: 15,    // Max 15 in description
    Facebook: 3,    // Recommended 1-3
};

/**
 * Count and analyze hashtags
 */
export function countHashtags(input: HashtagCounterInput): ToolResult<HashtagResult> {
    const startTime = performance.now();

    const { text } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Extract all hashtags
    const hashtags = extractHashtags(text);

    // Find unique hashtags
    const uniqueSet = new Set(hashtags.map(h => h.toLowerCase()));
    const uniqueHashtags = Array.from(uniqueSet);

    // Find duplicates
    const counts = new Map<string, number>();
    for (const tag of hashtags) {
        const lower = tag.toLowerCase();
        counts.set(lower, (counts.get(lower) || 0) + 1);
    }

    const duplicates = Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([tag]) => tag);

    // Platform recommendations
    const platformRecommendations = Object.entries(PLATFORM_RECOMMENDATIONS).map(
        ([platform, recommended]) => ({
            platform,
            recommended,
            current: hashtags.length,
            isOptimal: hashtags.length <= recommended && hashtags.length >= 1,
        })
    );

    return {
        success: true,
        data: {
            text,
            hashtags,
            count: hashtags.length,
            uniqueHashtags,
            uniqueCount: uniqueHashtags.length,
            duplicates,
            platformRecommendations,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Analyze hashtag quality
 */
export function analyzeHashtags(hashtags: string[]): {
    averageLength: number;
    longestHashtag: string;
    shortestHashtag: string;
    camelCaseCount: number;
    numbersCount: number;
    suggestions: string[];
} {
    if (hashtags.length === 0) {
        return {
            averageLength: 0,
            longestHashtag: '',
            shortestHashtag: '',
            camelCaseCount: 0,
            numbersCount: 0,
            suggestions: ['Add relevant hashtags to increase discoverability'],
        };
    }

    let totalLength = 0;
    let longestHashtag = hashtags[0];
    let shortestHashtag = hashtags[0];
    let camelCaseCount = 0;
    let numbersCount = 0;

    for (const tag of hashtags) {
        const tagText = tag.replace('#', '');
        totalLength += tagText.length;

        if (tagText.length > longestHashtag.length - 1) {
            longestHashtag = tag;
        }

        if (tagText.length < shortestHashtag.length - 1) {
            shortestHashtag = tag;
        }

        // Check for CamelCase
        if (/[a-z][A-Z]/.test(tagText)) {
            camelCaseCount++;
        }

        // Check for numbers
        if (/\d/.test(tagText)) {
            numbersCount++;
        }
    }

    const averageLength = totalLength / hashtags.length;
    const suggestions: string[] = [];

    // Generate suggestions
    if (averageLength > 20) {
        suggestions.push('Consider using shorter hashtags for better readability');
    }

    if (camelCaseCount < hashtags.length / 2) {
        suggestions.push('Use CamelCase for multi-word hashtags (e.g., #SocialMediaMarketing)');
    }

    const veryLongTags = hashtags.filter(t => t.length > 25);
    if (veryLongTags.length > 0) {
        suggestions.push(`${veryLongTags.length} hashtag(s) are very long - consider shortening`);
    }

    // Detect gibberish/spam hashtags
    const gibberishTags = hashtags.filter(tag => {
        const tagText = tag.replace('#', '');

        // Check for excessive repetition
        if (/(.)\1{3,}/.test(tagText)) return true;

        // Check vowel ratio
        const vowels = tagText.match(/[aeiouAEIOU]/g) || [];
        const letters = tagText.match(/[a-zA-Z]/g) || [];
        if (letters.length > 3 && vowels.length / letters.length < 0.1) return true;

        // Check for too many numbers relative to letters
        const numbers = tagText.match(/\d/g) || [];
        if (letters.length > 0 && numbers.length / tagText.length > 0.5) return true;

        // Check for random special chars (excluding normal ones)
        if (/[^a-zA-Z0-9_]/.test(tagText)) return true;

        return false;
    });

    if (gibberishTags.length > 0) {
        suggestions.push(`${gibberishTags.length} hashtag(s) appear to be invalid or spam - use meaningful tags`);
    }

    // Check for overly generic or spammy patterns
    const spamPatterns = ['follow', 'followback', 'f4f', 'l4l', 'like4like', 'followforfollow'];
    const spamTags = hashtags.filter(tag =>
        spamPatterns.some(pattern => tag.toLowerCase().includes(pattern))
    );
    if (spamTags.length > hashtags.length * 0.3) {
        suggestions.push('Reduce spam-like hashtags (follow4follow, etc.) - use content-specific tags');
    }

    return {
        averageLength: Math.round(averageLength),
        longestHashtag,
        shortestHashtag,
        camelCaseCount,
        numbersCount,
        suggestions,
    };
}

/**
 * Generate related hashtags
 */
export function suggestRelatedHashtags(mainHashtag: string): string[] {
    // This is a simple implementation - in production, you'd use an API
    const baseTerm = mainHashtag.replace('#', '').toLowerCase();

    return [
        `#${baseTerm}`,
        `#${baseTerm}s`,
        `#${baseTerm}life`,
        `#${baseTerm}lover`,
        `#${baseTerm}daily`,
        `#${baseTerm}tips`,
        `#${baseTerm}community`,
        `#${baseTerm}style`,
        `#${baseTerm}inspo`,
        `#${baseTerm}vibes`,
    ].slice(0, 10);
}

/**
 * Get trending hashtag format
 */
export function formatHashtags(tags: string[], options?: {
    addHash?: boolean;
    lowercase?: boolean;
    separator?: string;
}): string {
    const { addHash = true, lowercase = false, separator = ' ' } = options || {};

    return tags
        .map(tag => {
            let formatted = tag.startsWith('#') ? tag : `#${tag}`;
            if (!addHash) {
                formatted = formatted.replace('#', '');
            }
            if (lowercase) {
                formatted = formatted.toLowerCase();
            }
            return formatted;
        })
        .join(separator);
}

/**
 * Remove hashtags from text
 */
export function removeHashtags(text: string): string {
    return text.replace(/#[\w]+/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Extract hashtags with positions
 */
export function extractHashtagsWithPositions(text: string): Array<{
    hashtag: string;
    start: number;
    end: number;
}> {
    const results: Array<{ hashtag: string; start: number; end: number }> = [];
    const pattern = /#[\w]+/g;

    let match;
    while ((match = pattern.exec(text)) !== null) {
        results.push({
            hashtag: match[0],
            start: match.index,
            end: match.index + match[0].length,
        });
    }

    return results;
}
