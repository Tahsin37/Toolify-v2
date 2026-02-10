/**
 * HTTP Header Viewer
 * 
 * Parses and analyzes HTTP headers.
 */

import type { ToolResult, HTTPHeaderResult, HTTPHeader } from '@/lib/types';

export interface HTTPHeaderInput {
    headers: string;
}

// Header categories
const SECURITY_HEADERS = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
    'cross-origin-embedder-policy',
    'cross-origin-resource-policy',
];

const CACHING_HEADERS = [
    'cache-control',
    'expires',
    'etag',
    'last-modified',
    'age',
    'vary',
];

const CORS_HEADERS = [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'access-control-expose-headers',
    'access-control-max-age',
    'access-control-allow-credentials',
];

/**
 * Parse and analyze HTTP headers
 */
export function parseHTTPHeaders(input: HTTPHeaderInput): ToolResult<HTTPHeaderResult> {
    const startTime = performance.now();

    const { headers: rawHeaders } = input;

    if (!rawHeaders || rawHeaders.trim().length === 0) {
        return {
            success: false,
            error: 'Headers are required',
            processingTime: performance.now() - startTime,
        };
    }

    const parsedHeaders: HTTPHeader[] = [];
    const lines = rawHeaders.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Parse "Header: Value" format
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;

        const name = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        const nameLower = name.toLowerCase();

        // Determine category
        let category: HTTPHeader['category'] = 'other';
        if (SECURITY_HEADERS.includes(nameLower)) {
            category = 'security';
        } else if (CACHING_HEADERS.includes(nameLower)) {
            category = 'caching';
        } else if (CORS_HEADERS.includes(nameLower)) {
            category = 'cors';
        } else if (['content-type', 'content-length', 'connection', 'date', 'server'].includes(nameLower)) {
            category = 'general';
        }

        // Get description
        const description = getHeaderDescription(nameLower);

        parsedHeaders.push({
            name,
            value,
            category,
            description,
        });
    }

    // Calculate security score
    const { score, issues } = calculateSecurityScore(parsedHeaders);

    // Get caching info
    const cachingInfo = analyzeCaching(parsedHeaders);

    return {
        success: true,
        data: {
            headers: parsedHeaders,
            securityScore: score,
            securityIssues: issues,
            cachingInfo,
            rawHeaders,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Calculate security score based on headers
 */
function calculateSecurityScore(headers: HTTPHeader[]): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    const headerNames = headers.map(h => h.name.toLowerCase());

    // Check for essential security headers
    if (!headerNames.includes('content-security-policy')) {
        issues.push('Missing Content-Security-Policy header');
        score -= 20;
    }

    if (!headerNames.includes('strict-transport-security')) {
        issues.push('Missing Strict-Transport-Security (HSTS) header');
        score -= 15;
    }

    if (!headerNames.includes('x-content-type-options')) {
        issues.push('Missing X-Content-Type-Options header');
        score -= 10;
    }

    if (!headerNames.includes('x-frame-options')) {
        issues.push('Missing X-Frame-Options header');
        score -= 10;
    }

    if (!headerNames.includes('referrer-policy')) {
        issues.push('Missing Referrer-Policy header');
        score -= 5;
    }

    // Check for dangerous headers
    const serverHeader = headers.find(h => h.name.toLowerCase() === 'server');
    if (serverHeader && serverHeader.value.match(/\d+\.\d+/)) {
        issues.push('Server header reveals version information');
        score -= 5;
    }

    const xPoweredBy = headers.find(h => h.name.toLowerCase() === 'x-powered-by');
    if (xPoweredBy) {
        issues.push('X-Powered-By header reveals technology stack');
        score -= 5;
    }

    return {
        score: Math.max(0, score),
        issues,
    };
}

/**
 * Analyze caching headers
 */
function analyzeCaching(headers: HTTPHeader[]): string[] {
    const info: string[] = [];

    const cacheControl = headers.find(h => h.name.toLowerCase() === 'cache-control');
    if (cacheControl) {
        const directives = cacheControl.value.split(',').map(d => d.trim());

        if (directives.some(d => d.startsWith('max-age'))) {
            const maxAge = directives.find(d => d.startsWith('max-age'));
            const seconds = parseInt(maxAge?.split('=')[1] || '0', 10);
            info.push(`Cached for ${formatDuration(seconds)}`);
        }

        if (directives.includes('no-cache')) {
            info.push('Revalidation required on each request');
        }

        if (directives.includes('no-store')) {
            info.push('Response cannot be cached');
        }

        if (directives.includes('private')) {
            info.push('Can only be cached by browser, not CDN');
        }

        if (directives.includes('public')) {
            info.push('Can be cached by any cache');
        }
    } else {
        info.push('No Cache-Control header - caching behavior is undefined');
    }

    const etag = headers.find(h => h.name.toLowerCase() === 'etag');
    if (etag) {
        info.push('ETag present - supports conditional requests');
    }

    const lastModified = headers.find(h => h.name.toLowerCase() === 'last-modified');
    if (lastModified) {
        info.push(`Last modified: ${lastModified.value}`);
    }

    return info;
}

/**
 * Format duration in seconds to human readable
 */
function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 604800) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 2592000) return `${Math.round(seconds / 604800)} weeks`;
    return `${Math.round(seconds / 2592000)} months`;
}

/**
 * Get header description
 */
function getHeaderDescription(name: string): string {
    const descriptions: Record<string, string> = {
        'content-type': 'MIME type of the response body',
        'content-length': 'Size of the response body in bytes',
        'cache-control': 'Caching directives for the response',
        'content-security-policy': 'Controls resources the browser can load',
        'strict-transport-security': 'Forces HTTPS connections',
        'x-content-type-options': 'Prevents MIME type sniffing',
        'x-frame-options': 'Controls iframe embedding',
        'x-xss-protection': 'Legacy XSS protection (deprecated)',
        'referrer-policy': 'Controls referer header information',
        'access-control-allow-origin': 'Allowed origins for CORS requests',
        'set-cookie': 'Sets a cookie in the browser',
        'etag': 'Unique identifier for resource version',
        'last-modified': 'Last modification date of resource',
        'expires': 'Date/time after which response is stale',
        'server': 'Server software information',
        'date': 'Date and time the response was generated',
        'connection': 'Connection management options',
        'vary': 'Headers that affect cache validation',
    };

    return descriptions[name] || '';
}

/**
 * Generate recommended security headers
 */
export function getRecommendedSecurityHeaders(): Record<string, string> {
    return {
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
}

/**
 * Format headers for display
 */
export function formatHeaders(headers: HTTPHeader[]): string {
    return headers.map(h => `${h.name}: ${h.value}`).join('\n');
}
