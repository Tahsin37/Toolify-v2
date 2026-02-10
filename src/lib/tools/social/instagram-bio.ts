/**
 * Instagram Bio Character Counter
 * 
 * Validates Instagram bios against platform limits.
 */

import { countEmojis } from '@/lib/utils/text-analysis';
import type { ToolResult, InstagramBioResult } from '@/lib/types';

export interface InstagramBioInput {
    bio: string;
}

// Instagram bio limit
const MAX_LENGTH = 150;

/**
 * Check Instagram bio
 */
export function checkInstagramBio(input: InstagramBioInput): ToolResult<InstagramBioResult> {
    const startTime = performance.now();

    const { bio } = input;

    if (bio === undefined || bio === null) {
        return {
            success: false,
            error: 'Bio is required',
            processingTime: performance.now() - startTime,
        };
    }

    const length = bio.length;
    const remaining = MAX_LENGTH - length;
    const isWithinLimit = length <= MAX_LENGTH;

    // Count emojis
    const emojiCount = countEmojis(bio);

    // Count line breaks
    const lineBreaks = (bio.match(/\n/g) || []).length;

    // Generate recommendation
    let recommendation: string;
    if (length === 0) {
        recommendation = 'Add a bio to tell people about yourself.';
    } else if (length < 50) {
        recommendation = 'Bio is short. Add more personality or information.';
    } else if (length <= 100) {
        recommendation = 'Good bio length! You have room for more if needed.';
    } else if (length <= MAX_LENGTH) {
        recommendation = 'Great! Bio is using the available space well.';
    } else {
        recommendation = `Bio exceeds ${MAX_LENGTH} character limit by ${-remaining} characters.`;
    }

    return {
        success: true,
        data: {
            text: bio,
            length,
            maxLength: MAX_LENGTH,
            remaining,
            isWithinLimit,
            emojiCount,
            lineBreaks,
            recommendation,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Analyze Instagram bio for optimization
 */
export function analyzeInstagramBio(bio: string): {
    length: number;
    emojiCount: number;
    lineBreaks: number;
    hasHashtag: boolean;
    hasMention: boolean;
    hasUrl: boolean;
    hasCallToAction: boolean;
    suggestions: string[];
} {
    const emojiCount = countEmojis(bio);
    const lineBreaks = (bio.match(/\n/g) || []).length;
    const hasHashtag = /#[\w]+/.test(bio);
    const hasMention = /@[\w]+/.test(bio);
    const hasUrl = /https?:\/\/|www\./i.test(bio);

    // Check for call-to-action
    const ctaPatterns = [
        /click/i,
        /tap/i,
        /link/i,
        /follow/i,
        /dm/i,
        /shop/i,
        /book/i,
        /contact/i,
        /👇|⬇️|↓/,
    ];
    const hasCallToAction = ctaPatterns.some(p => p.test(bio));

    const suggestions: string[] = [];

    if (bio.length > 0 && emojiCount === 0) {
        suggestions.push('Add emojis to make your bio more visually appealing');
    }

    if (lineBreaks === 0 && bio.length > 50) {
        suggestions.push('Use line breaks to improve readability');
    }

    if (!hasCallToAction) {
        suggestions.push('Add a call-to-action (e.g., "Link in bio 👇")');
    }

    if (bio.length > 100 && lineBreaks < 2) {
        suggestions.push('Break up long bios with more line breaks');
    }

    // Check for branded content
    if (bio.toLowerCase().includes('dm for') || bio.toLowerCase().includes('email for')) {
        suggestions.push('Consider using Instagram\'s built-in contact button instead');
    }

    return {
        length: bio.length,
        emojiCount,
        lineBreaks,
        hasHashtag,
        hasMention,
        hasUrl,
        hasCallToAction,
        suggestions,
    };
}

/**
 * Format Instagram bio with line breaks
 */
export function formatInstagramBio(lines: string[]): string {
    return lines
        .filter(line => line.trim().length > 0)
        .join('\n');
}

/**
 * Generate Instagram bio ideas
 */
export function generateBioIdeas(niche: string): string[] {
    const templates = [
        `✨ ${niche} enthusiast`,
        `📍 Sharing my ${niche} journey`,
        `🎯 ${niche} tips & tricks`,
        `💫 Making ${niche} accessible`,
        `🌟 All things ${niche}`,
    ];

    return templates;
}
