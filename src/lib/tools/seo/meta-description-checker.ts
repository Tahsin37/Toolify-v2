/**
 * Meta Description Pixel Checker
 * 
 * Analyzes meta descriptions for optimal length in Google SERP.
 * Google truncates descriptions around 920px on desktop, 680px on mobile.
 */

import {
    calculateDescriptionPixelWidth,
    truncateToPixelWidth,
    willBeTruncated,
    SERP_LIMITS
} from '@/lib/utils/pixel-width';
import type { ToolResult, MetaDescriptionResult } from '@/lib/types';

export interface MetaDescriptionInput {
    description: string;
}

/**
 * Check meta description length and pixel width
 */
export function checkMetaDescription(input: MetaDescriptionInput): ToolResult<MetaDescriptionResult> {
    const startTime = performance.now();

    const { description } = input;

    if (!description || description.trim().length === 0) {
        return {
            success: false,
            error: 'Description is required',
            processingTime: performance.now() - startTime,
        };
    }

    const pixelWidth = calculateDescriptionPixelWidth(description);
    const maxPixelWidth = SERP_LIMITS.description.desktop;
    const mobileMaxWidth = SERP_LIMITS.description.mobile;
    const characterCount = description.length;
    const maxCharacterCount = SERP_LIMITS.description.maxCharacters;
    const isTruncated = willBeTruncated(description, maxPixelWidth, SERP_LIMITS.description.fontSize);
    const percentUsed = Math.round((pixelWidth / maxPixelWidth) * 100);

    // Generate previews
    const desktopPreview = isTruncated
        ? truncateToPixelWidth(description, maxPixelWidth, SERP_LIMITS.description.fontSize)
        : description;

    const mobilePreview = willBeTruncated(description, mobileMaxWidth, SERP_LIMITS.description.fontSize)
        ? truncateToPixelWidth(description, mobileMaxWidth, SERP_LIMITS.description.fontSize)
        : description;

    // Generate recommendation
    let recommendation: string;
    if (pixelWidth < 400) {
        recommendation = 'Description is too short. Aim for 150-160 characters for better CTR.';
    } else if (pixelWidth <= maxPixelWidth) {
        recommendation = 'Excellent! Your description fits within Google\'s display limit.';
    } else if (pixelWidth <= 1000) {
        recommendation = 'Description may be slightly truncated on desktop. Consider shortening.';
    } else {
        recommendation = 'Description will be significantly truncated. Reduce length to under 160 characters.';
    }

    const warnings: string[] = [];
    if (characterCount > 160) {
        warnings.push('Character count exceeds recommended 160 characters');
    }
    if (characterCount < 120) {
        warnings.push('Description is shorter than recommended 120 character minimum');
    }
    if (pixelWidth > maxPixelWidth) {
        warnings.push(`Description exceeds ${maxPixelWidth}px desktop limit by ${pixelWidth - maxPixelWidth}px`);
    }

    return {
        success: true,
        data: {
            text: description,
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
 * Batch check multiple descriptions
 */
export function checkMetaDescriptions(descriptions: string[]): ToolResult<MetaDescriptionResult[]> {
    const startTime = performance.now();

    const results: MetaDescriptionResult[] = [];

    for (const description of descriptions) {
        const result = checkMetaDescription({ description });
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
 * Get optimal description length suggestion
 */
export function suggestDescriptionLength(description: string): {
    current: number;
    optimal: { min: number; max: number };
    adjustment: number;
} {
    const pixelWidth = calculateDescriptionPixelWidth(description);

    return {
        current: pixelWidth,
        optimal: { min: 600, max: 920 },
        adjustment: pixelWidth > 920 ? pixelWidth - 920 : 0,
    };
}
