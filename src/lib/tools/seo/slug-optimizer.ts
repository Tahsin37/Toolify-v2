/**
 * SEO Slug Optimizer
 * 
 * Generates and optimizes URL slugs for SEO best practices.
 */

import { STOP_WORDS } from '@/lib/utils/text-analysis';
import type { ToolResult, SlugOptimizeResult } from '@/lib/types';

export interface SlugOptimizerInput {
    text: string;
    removeStopWords?: boolean;
    maxLength?: number;
    separator?: string;
}

// Characters to remove from slugs
const INVALID_CHARS_PATTERN = /[^\w\s-]/g;
const MULTIPLE_HYPHENS_PATTERN = /-+/g;
const WHITESPACE_PATTERN = /\s+/g;

/**
 * Optimize a string into an SEO-friendly slug
 */
export function optimizeSlug(input: SlugOptimizerInput): ToolResult<SlugOptimizeResult> {
    const startTime = performance.now();

    const {
        text,
        removeStopWords = true,
        maxLength = 60,
        separator = '-'
    } = input;

    if (!text || text.trim().length === 0) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    const original = text.trim();
    const changes: string[] = [];

    let slug = original.toLowerCase();

    // Track original for comparison
    const beforeProcessing = slug;

    // Remove special characters but keep letters, numbers, spaces, and hyphens
    slug = slug.replace(INVALID_CHARS_PATTERN, '');
    if (slug !== beforeProcessing) {
        changes.push('Removed special characters');
    }

    // Normalize whitespace
    const beforeWhitespace = slug;
    slug = slug.replace(WHITESPACE_PATTERN, ' ').trim();
    if (slug !== beforeWhitespace) {
        changes.push('Normalized whitespace');
    }

    // Remove stop words if requested
    if (removeStopWords) {
        const words = slug.split(' ');
        const filteredWords = words.filter(word => !STOP_WORDS.has(word) && word.length > 0);

        // Only apply if we still have words left
        if (filteredWords.length > 0) {
            const beforeStopWords = slug;
            slug = filteredWords.join(' ');
            if (slug !== beforeStopWords) {
                changes.push('Removed stop words');
            }
        }
    }

    // Replace spaces with separator
    slug = slug.replace(WHITESPACE_PATTERN, separator);

    // Clean up multiple consecutive separators
    const separatorPattern = new RegExp(`${escapeRegex(separator)}+`, 'g');
    slug = slug.replace(separatorPattern, separator);

    // Trim separators from ends
    const trimPattern = new RegExp(`^${escapeRegex(separator)}+|${escapeRegex(separator)}+$`, 'g');
    slug = slug.replace(trimPattern, '');

    // Enforce max length (try to break at word boundary)
    if (slug.length > maxLength) {
        const truncated = slug.substring(0, maxLength);
        const lastSeparatorIndex = truncated.lastIndexOf(separator);

        if (lastSeparatorIndex > maxLength * 0.5) {
            slug = truncated.substring(0, lastSeparatorIndex);
        } else {
            slug = truncated;
        }

        changes.push(`Truncated to ${maxLength} characters`);
    }

    // Ensure no trailing separator after truncation
    slug = slug.replace(trimPattern, '');

    const isOptimal =
        slug.length <= maxLength &&
        slug.length >= 10 &&
        !MULTIPLE_HYPHENS_PATTERN.test(slug) &&
        slug === slug.toLowerCase();

    return {
        success: true,
        data: {
            original,
            optimized: slug,
            length: slug.length,
            maxRecommendedLength: maxLength,
            changes,
            isOptimal,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate an existing slug
 */
export function validateSlug(slug: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
} {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for uppercase letters
    if (slug !== slug.toLowerCase()) {
        issues.push('Contains uppercase letters');
        suggestions.push('Convert to lowercase');
    }

    // Check for spaces
    if (WHITESPACE_PATTERN.test(slug)) {
        issues.push('Contains spaces');
        suggestions.push('Replace spaces with hyphens');
    }

    // Check for special characters
    if (/[^\w-]/.test(slug)) {
        issues.push('Contains special characters');
        suggestions.push('Remove special characters');
    }

    // Check for multiple consecutive hyphens
    if (MULTIPLE_HYPHENS_PATTERN.test(slug)) {
        issues.push('Contains consecutive hyphens');
        suggestions.push('Replace with single hyphens');
    }

    // Check length
    if (slug.length > 60) {
        issues.push('Too long (over 60 characters)');
        suggestions.push('Shorten to under 60 characters');
    } else if (slug.length < 3) {
        issues.push('Too short (under 3 characters)');
        suggestions.push('Add more descriptive words');
    }

    // Check for leading/trailing hyphens
    if (slug.startsWith('-') || slug.endsWith('-')) {
        issues.push('Has leading or trailing hyphens');
        suggestions.push('Remove hyphens from ends');
    }

    // Check for numbers only
    if (/^\d+$/.test(slug)) {
        issues.push('Contains only numbers');
        suggestions.push('Add descriptive text');
    }

    return {
        isValid: issues.length === 0,
        issues,
        suggestions,
    };
}

/**
 * Compare two slugs and determine which is better for SEO
 */
export function compareSlug(slug1: string, slug2: string): {
    winner: 1 | 2 | 0;
    analysis: {
        slug1Score: number;
        slug2Score: number;
        slug1Issues: string[];
        slug2Issues: string[];
    };
} {
    const validation1 = validateSlug(slug1);
    const validation2 = validateSlug(slug2);

    // Score (lower is better)
    const score1 = validation1.issues.length + (slug1.length > 60 ? 2 : 0);
    const score2 = validation2.issues.length + (slug2.length > 60 ? 2 : 0);

    return {
        winner: score1 < score2 ? 1 : score2 < score1 ? 2 : 0,
        analysis: {
            slug1Score: score1,
            slug2Score: score2,
            slug1Issues: validation1.issues,
            slug2Issues: validation2.issues,
        },
    };
}

/**
 * Generate multiple slug variations
 */
export function generateSlugVariations(text: string): string[] {
    const variations: string[] = [];

    // Standard optimization
    const standard = optimizeSlug({ text, removeStopWords: true });
    if (standard.success && standard.data) {
        variations.push(standard.data.optimized);
    }

    // With stop words
    const withStopWords = optimizeSlug({ text, removeStopWords: false });
    if (withStopWords.success && withStopWords.data &&
        !variations.includes(withStopWords.data.optimized)) {
        variations.push(withStopWords.data.optimized);
    }

    // Shorter version
    const shorter = optimizeSlug({ text, removeStopWords: true, maxLength: 40 });
    if (shorter.success && shorter.data &&
        !variations.includes(shorter.data.optimized)) {
        variations.push(shorter.data.optimized);
    }

    return variations;
}
