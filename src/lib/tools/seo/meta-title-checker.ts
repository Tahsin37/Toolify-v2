/**
 * Meta Title Pixel Length Checker
 * 
 * Analyzes meta titles for optimal length in Google SERP.
 * Google truncates titles around 580px on desktop, 920px on mobile.
 */

import {
    calculateTitlePixelWidth,
    truncateToPixelWidth,
    willBeTruncated,
    SERP_LIMITS
} from '@/lib/utils/pixel-width';
import type { ToolResult, MetaTitleResult } from '@/lib/types';

export interface MetaTitleInput {
    title: string;
}

/**
 * Check meta title length and pixel width
 */
export function checkMetaTitle(input: MetaTitleInput): ToolResult<MetaTitleResult> {
    const startTime = performance.now();

    const { title } = input;

    if (!title || title.trim().length === 0) {
        return {
            success: false,
            error: 'Title is required',
            processingTime: performance.now() - startTime,
        };
    }

    const pixelWidth = calculateTitlePixelWidth(title);
    const maxPixelWidth = SERP_LIMITS.title.desktop;
    const characterCount = title.length;
    const maxCharacterCount = SERP_LIMITS.title.maxCharacters;
    const isTruncated = willBeTruncated(title, maxPixelWidth, SERP_LIMITS.title.fontSize);
    const percentUsed = Math.round((pixelWidth / maxPixelWidth) * 100);

    // Generate previews
    const desktopPreview = isTruncated
        ? truncateToPixelWidth(title, maxPixelWidth, SERP_LIMITS.title.fontSize)
        : title;

    const mobilePreview = willBeTruncated(title, SERP_LIMITS.title.mobile, SERP_LIMITS.title.fontSize)
        ? truncateToPixelWidth(title, SERP_LIMITS.title.mobile, SERP_LIMITS.title.fontSize)
        : title;

    // Generate recommendation
    let recommendation: string;
    if (pixelWidth < 300) {
        recommendation = 'Title is too short. Aim for 50-60 characters for better CTR.';
    } else if (pixelWidth <= maxPixelWidth) {
        recommendation = 'Perfect! Your title fits within Google\'s display limit.';
    } else if (pixelWidth <= 650) {
        recommendation = 'Title may be slightly truncated on desktop. Consider shortening by a few characters.';
    } else {
        recommendation = 'Title will be significantly truncated. Reduce length to under 60 characters.';
    }

    const warnings: string[] = [];
    if (characterCount > 60) {
        warnings.push('Character count exceeds recommended 60 characters');
    }
    if (pixelWidth > maxPixelWidth) {
        warnings.push(`Title exceeds ${maxPixelWidth}px desktop limit by ${pixelWidth - maxPixelWidth}px`);
    }

    return {
        success: true,
        data: {
            text: title,
            pixelWidth,
            maxPixelWidth,
            characterCount,
            maxCharacterCount,
            isTruncated,
            percentUsed,
            recommendation,
            desktopPreview,
            mobilePreview,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        processingTime: performance.now() - startTime,
    };
}

/**
 * Batch check multiple titles
 */
export function checkMetaTitles(titles: string[]): ToolResult<MetaTitleResult[]> {
    const startTime = performance.now();

    const results: MetaTitleResult[] = [];

    for (const title of titles) {
        const result = checkMetaTitle({ title });
        if (result.success && result.data) {
            results.push(result.data);
        }
    }

    return {
        success: true,
        data: results,
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get optimal title length suggestion
 */
export function suggestTitleLength(title: string): {
    current: number;
    optimal: { min: number; max: number };
    adjustment: number;
} {
    const pixelWidth = calculateTitlePixelWidth(title);

    return {
        current: pixelWidth,
        optimal: { min: 400, max: 580 },
        adjustment: pixelWidth > 580 ? pixelWidth - 580 : 0,
    };
}
