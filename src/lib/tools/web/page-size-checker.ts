/**
 * Page Size Checker
 * 
 * Estimates page size and provides performance recommendations.
 */

import type { ToolResult, PageSizeResult } from '@/lib/types';

export interface PageSizeInput {
    html: string;
}

/**
 * Check page size
 */
export function checkPageSize(input: PageSizeInput): ToolResult<PageSizeResult> {
    const startTime = performance.now();

    const { html } = input;

    if (!html) {
        return {
            success: false,
            error: 'HTML content is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Calculate total size in bytes
    const encoder = new TextEncoder();
    const totalBytes = encoder.encode(html).length;

    // Extract text content (approximate)
    const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const textBytes = encoder.encode(textContent).length;

    // Estimate compressed size (gzip typically achieves 70-90% compression on HTML)
    const estimatedCompressed = Math.round(totalBytes * 0.25);

    // Format size
    const totalSizeFormatted = formatBytes(totalBytes);

    // Performance rating
    let rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    let loadTimeEstimate: string;
    const recommendations: string[] = [];

    if (totalBytes < 50000) { // < 50 KB
        rating = 'excellent';
        loadTimeEstimate = '< 1 second on 3G';
    } else if (totalBytes < 100000) { // < 100 KB
        rating = 'good';
        loadTimeEstimate = '1-2 seconds on 3G';
    } else if (totalBytes < 300000) { // < 300 KB
        rating = 'needs-improvement';
        loadTimeEstimate = '2-5 seconds on 3G';
        recommendations.push('Consider lazy loading images and scripts');
        recommendations.push('Minify HTML, CSS, and JavaScript');
    } else {
        rating = 'poor';
        loadTimeEstimate = '> 5 seconds on 3G';
        recommendations.push('Page size is too large - significant optimization needed');
        recommendations.push('Implement code splitting');
        recommendations.push('Move large content to separate pages');
        recommendations.push('Use CDN for static assets');
    }

    // Additional analysis
    const inlineScriptSize = calculateInlineSize(html, /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi);
    const inlineStyleSize = calculateInlineSize(html, /<style[^>]*>([\s\S]*?)<\/style>/gi);

    if (inlineScriptSize > 10000) {
        recommendations.push('Move inline scripts to external files');
    }

    if (inlineStyleSize > 10000) {
        recommendations.push('Move inline styles to external CSS files');
    }

    // Check for large comments
    const commentSize = calculateInlineSize(html, /<!--[\s\S]*?-->/g);
    if (commentSize > 1000) {
        recommendations.push('Remove HTML comments from production builds');
    }

    return {
        success: true,
        data: {
            totalSize: totalBytes,
            totalSizeFormatted,
            breakdown: {
                html: totalBytes,
                text: textBytes,
                estimatedCompressed,
            },
            performance: {
                rating,
                loadTimeEstimate,
                recommendations,
            },
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Calculate size of matched content
 */
function calculateInlineSize(html: string, pattern: RegExp): number {
    const matches = html.match(pattern) || [];
    const encoder = new TextEncoder();
    return matches.reduce((sum, match) => sum + encoder.encode(match).length, 0);
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Get size breakdown
 */
export function getSizeBreakdown(html: string): {
    total: number;
    scripts: number;
    styles: number;
    content: number;
    comments: number;
    whitespace: number;
} {
    const encoder = new TextEncoder();
    const total = encoder.encode(html).length;

    const scripts = calculateInlineSize(html, /<script[\s\S]*?<\/script>/gi);
    const styles = calculateInlineSize(html, /<style[\s\S]*?<\/style>/gi);
    const comments = calculateInlineSize(html, /<!--[\s\S]*?-->/g);

    // Calculate whitespace
    const withoutWhitespace = html.replace(/\s+/g, ' ');
    const whitespace = total - encoder.encode(withoutWhitespace).length;

    const content = total - scripts - styles - comments;

    return {
        total,
        scripts,
        styles,
        content,
        comments,
        whitespace,
    };
}

/**
 * Estimate load time based on connection speed
 */
export function estimateLoadTime(bytes: number): {
    '3g-slow': string;
    '3g': string;
    '4g': string;
    broadband: string;
} {
    // Connection speeds in bytes per second
    const speeds = {
        '3g-slow': 50 * 1024,    // 50 KB/s
        '3g': 200 * 1024,        // 200 KB/s
        '4g': 1.5 * 1024 * 1024, // 1.5 MB/s
        broadband: 5 * 1024 * 1024, // 5 MB/s
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    };

    return {
        '3g-slow': formatTime(bytes / speeds['3g-slow']),
        '3g': formatTime(bytes / speeds['3g']),
        '4g': formatTime(bytes / speeds['4g']),
        broadband: formatTime(bytes / speeds.broadband),
    };
}
