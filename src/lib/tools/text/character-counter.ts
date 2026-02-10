/**
 * Character Counter (Social Media Aware)
 * 
 * Counts characters with awareness of platform-specific limits.
 */

import { countEmojis } from '@/lib/utils/text-analysis';
import type { ToolResult, CharacterCountResult, PlatformLimit } from '@/lib/types';

export interface CharacterCountInput {
    text: string;
}

// Platform character limits
const PLATFORM_LIMITS: Record<string, number> = {
    'Twitter/X Tweet': 280,
    'Twitter/X DM': 10000,
    'Instagram Caption': 2200,
    'Instagram Bio': 150,
    'Facebook Post': 63206,
    'Facebook Comment': 8000,
    'LinkedIn Post': 3000,
    'LinkedIn Article': 120000,
    'YouTube Title': 100,
    'YouTube Description': 5000,
    'TikTok Caption': 2200,
    'TikTok Bio': 80,
    'Pinterest Pin': 500,
    'Reddit Title': 300,
    'Reddit Comment': 10000,
    'SMS (Single)': 160,
    'SMS (Unicode)': 70,
    'Email Subject': 78,
    'Meta Title': 60,
    'Meta Description': 160,
};

/**
 * Count characters with platform awareness
 */
export function countCharacters(input: CharacterCountInput): ToolResult<CharacterCountResult> {
    const startTime = performance.now();

    const { text } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Total character count
    const total = text.length;

    // Characters without spaces
    const withoutSpaces = text.replace(/\s/g, '').length;

    // Count letters
    const letters = (text.match(/[a-zA-Z]/g) || []).length;

    // Count numbers
    const numbers = (text.match(/\d/g) || []).length;

    // Count spaces
    const spaces = (text.match(/\s/g) || []).length;

    // Count symbols (everything that's not a letter, number, or space)
    const symbols = total - letters - numbers - spaces;

    // Platform limits
    const platformLimits: PlatformLimit[] = Object.entries(PLATFORM_LIMITS).map(
        ([platform, limit]) => ({
            platform,
            limit,
            remaining: limit - total,
            isWithinLimit: total <= limit,
            percentUsed: Math.round((total / limit) * 100),
        })
    );

    return {
        success: true,
        data: {
            total,
            withoutSpaces,
            letters,
            numbers,
            symbols,
            spaces,
            platformLimits,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get character breakdown
 */
export function getCharacterBreakdown(text: string): {
    total: number;
    breakdown: Array<{ category: string; count: number; percentage: number }>;
} {
    const total = text.length;

    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length;
    const emojis = countEmojis(text);
    const other = total - letters - numbers - spaces - punctuation;

    const breakdown = [
        { category: 'Letters', count: letters, percentage: Math.round((letters / total) * 100) || 0 },
        { category: 'Numbers', count: numbers, percentage: Math.round((numbers / total) * 100) || 0 },
        { category: 'Spaces', count: spaces, percentage: Math.round((spaces / total) * 100) || 0 },
        { category: 'Punctuation', count: punctuation, percentage: Math.round((punctuation / total) * 100) || 0 },
        { category: 'Emojis', count: emojis, percentage: Math.round((emojis / total) * 100) || 0 },
        { category: 'Other', count: other, percentage: Math.round((other / total) * 100) || 0 },
    ].filter(item => item.count > 0);

    return { total, breakdown };
}

/**
 * Check specific platform limit
 */
export function checkPlatformLimit(text: string, platform: keyof typeof PLATFORM_LIMITS): {
    platform: string;
    limit: number;
    current: number;
    remaining: number;
    isWithinLimit: boolean;
    percentUsed: number;
    recommendation: string;
} {
    const limit = PLATFORM_LIMITS[platform];
    const current = text.length;
    const remaining = limit - current;
    const isWithinLimit = current <= limit;
    const percentUsed = Math.round((current / limit) * 100);

    let recommendation: string;
    if (percentUsed <= 80) {
        recommendation = 'Good length - you have room for more content if needed.';
    } else if (percentUsed <= 100) {
        recommendation = 'Approaching limit - consider your message carefully.';
    } else {
        recommendation = `Over limit by ${-remaining} characters - must reduce content.`;
    }

    return {
        platform,
        limit,
        current,
        remaining,
        isWithinLimit,
        percentUsed,
        recommendation,
    };
}

/**
 * Get all platform limits (for displaying in UI)
 */
export function getAllPlatformLimits(): Array<{ platform: string; limit: number }> {
    return Object.entries(PLATFORM_LIMITS).map(([platform, limit]) => ({
        platform,
        limit,
    }));
}

/**
 * Split text to fit platform limit
 */
export function splitForPlatform(
    text: string,
    platform: keyof typeof PLATFORM_LIMITS
): string[] {
    const limit = PLATFORM_LIMITS[platform];
    const parts: string[] = [];

    if (text.length <= limit) {
        return [text];
    }

    // Try to split at word boundaries
    const words = text.split(/\s+/);
    let currentPart = '';

    for (const word of words) {
        const testPart = currentPart ? `${currentPart} ${word}` : word;

        if (testPart.length <= limit) {
            currentPart = testPart;
        } else {
            if (currentPart) {
                parts.push(currentPart);
            }
            currentPart = word;
        }
    }

    if (currentPart) {
        parts.push(currentPart);
    }

    return parts;
}
