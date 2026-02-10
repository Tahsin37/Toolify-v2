/**
 * Canonical URL Checker
 * 
 * Analyzes HTML to find and validate canonical URL tags.
 */

import { extractCanonical, extractTags } from '@/lib/utils/html-parser';
import type { ToolResult, CanonicalResult } from '@/lib/types';

export interface CanonicalInput {
    html: string;
    pageUrl: string;
}

/**
 * Check canonical URL in HTML content
 */
export function checkCanonical(input: CanonicalInput): ToolResult<CanonicalResult> {
    const startTime = performance.now();

    const { html, pageUrl } = input;

    if (!html || html.trim().length === 0) {
        return {
            success: false,
            error: 'HTML content is required',
            processingTime: performance.now() - startTime,
        };
    }

    if (!pageUrl || pageUrl.trim().length === 0) {
        return {
            success: false,
            error: 'Page URL is required',
            processingTime: performance.now() - startTime,
        };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Extract canonical URL
    const canonicalUrl = extractCanonical(html);

    // Check if canonical exists
    const hasCanonical = canonicalUrl !== null;

    if (!hasCanonical) {
        issues.push('No canonical URL found');
        recommendations.push('Add a canonical URL to prevent duplicate content issues');
    }

    // Normalize URLs for comparison
    let normalizedPageUrl: URL;
    let normalizedCanonicalUrl: URL | null = null;

    try {
        normalizedPageUrl = new URL(pageUrl);
    } catch {
        return {
            success: false,
            error: 'Invalid page URL format',
            processingTime: performance.now() - startTime,
        };
    }

    if (canonicalUrl) {
        try {
            // Handle relative canonical URLs
            normalizedCanonicalUrl = new URL(canonicalUrl, pageUrl);
        } catch {
            issues.push('Invalid canonical URL format');
        }
    }

    // Check if self-referencing
    const isSelfReferencing = normalizedCanonicalUrl !== null &&
        normalizedCanonicalUrl.href === normalizedPageUrl.href;

    // Additional checks
    if (canonicalUrl && normalizedCanonicalUrl) {
        // Check for protocol mismatch
        if (normalizedCanonicalUrl.protocol !== normalizedPageUrl.protocol) {
            issues.push('Protocol mismatch between canonical and page URL');
            recommendations.push('Ensure both URLs use the same protocol (HTTPS recommended)');
        }

        // Check for www mismatch
        const pageHasWww = normalizedPageUrl.hostname.startsWith('www.');
        const canonicalHasWww = normalizedCanonicalUrl.hostname.startsWith('www.');
        if (pageHasWww !== canonicalHasWww) {
            issues.push('WWW prefix mismatch between canonical and page URL');
        }

        // Check for trailing slash consistency
        const pageHasTrailingSlash = normalizedPageUrl.pathname.endsWith('/');
        const canonicalHasTrailingSlash = normalizedCanonicalUrl.pathname.endsWith('/');
        if (pageHasTrailingSlash !== canonicalHasTrailingSlash &&
            normalizedPageUrl.pathname !== '/' &&
            normalizedCanonicalUrl.pathname !== '/') {
            issues.push('Trailing slash inconsistency between canonical and page URL');
        }

        // Check for cross-domain canonical
        if (normalizedCanonicalUrl.hostname !== normalizedPageUrl.hostname) {
            recommendations.push('Cross-domain canonical detected - ensure this is intentional');
        }

        // Check if canonical uses HTTP while page uses HTTPS
        if (normalizedCanonicalUrl.protocol === 'http:' && normalizedPageUrl.protocol === 'https:') {
            issues.push('Canonical uses HTTP while page uses HTTPS');
            recommendations.push('Update canonical to use HTTPS');
        }
    }

    // Check for multiple canonical tags
    const linkTags = extractTags(html, 'link');
    const canonicalTags = linkTags.filter(tag =>
        tag.attributes.rel?.toLowerCase() === 'canonical'
    );

    if (canonicalTags.length > 1) {
        issues.push(`Multiple canonical tags found (${canonicalTags.length})`);
        recommendations.push('Remove duplicate canonical tags - only one should exist');
    }

    // Add positive recommendations if no issues
    if (issues.length === 0) {
        if (isSelfReferencing) {
            recommendations.push('Self-referencing canonical is correctly implemented');
        } else if (canonicalUrl) {
            recommendations.push('Canonical URL is present and valid');
        }
    }

    return {
        success: true,
        data: {
            hasCanonical,
            canonicalUrl,
            isSelfReferencing,
            pageUrl,
            issues,
            recommendations,
        },
        warnings: issues.length > 0 ? issues : undefined,
        processingTime: performance.now() - startTime,
    };
}

/**
 * Generate canonical tag HTML
 */
export function generateCanonicalTag(url: string): string {
    return `<link rel="canonical" href="${escapeHtml(url)}" />`;
}

/**
 * Normalize URL for canonical comparison
 */
export function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url);

        // Remove trailing slash (except for root)
        if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }

        // Remove default ports
        if ((parsed.protocol === 'https:' && parsed.port === '443') ||
            (parsed.protocol === 'http:' && parsed.port === '80')) {
            parsed.port = '';
        }

        // Sort query parameters
        parsed.searchParams.sort();

        // Remove fragment
        parsed.hash = '';

        return parsed.href;
    } catch {
        return url;
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
