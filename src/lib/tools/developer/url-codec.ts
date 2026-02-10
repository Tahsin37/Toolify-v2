/**
 * URL Encode / Decode
 * 
 * Encodes and decodes URLs and URL components.
 */

import type { ToolResult, URLCodecResult } from '@/lib/types';

export interface URLCodecInput {
    input: string;
    operation: 'encode' | 'decode';
    encodeMode?: 'component' | 'full' | 'space-only';
}

/**
 * Encode or decode URL
 */
export function processURL(input: URLCodecInput): ToolResult<URLCodecResult> {
    const startTime = performance.now();

    const { input: text, operation, encodeMode = 'component' } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Input is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        let output: string;

        if (operation === 'encode') {
            switch (encodeMode) {
                case 'component':
                    output = encodeURIComponent(text);
                    break;
                case 'full':
                    output = encodeURI(text);
                    break;
                case 'space-only':
                    output = text.replace(/ /g, '%20');
                    break;
                default:
                    output = encodeURIComponent(text);
            }
        } else {
            try {
                // Try decodeURIComponent first
                output = decodeURIComponent(text);
            } catch {
                // Fall back to decodeURI
                output = decodeURI(text);
            }
        }

        return {
            success: true,
            data: {
                input: text,
                output,
                operation,
                isValid: true,
            },
            processingTime: performance.now() - startTime,
        };
    } catch (e) {
        return {
            success: true,
            data: {
                input: text,
                output: '',
                operation,
                isValid: false,
                error: (e as Error).message,
            },
            processingTime: performance.now() - startTime,
        };
    }
}

/**
 * Encode URL component
 */
export function encodeURLComponent(text: string): string {
    return encodeURIComponent(text);
}

/**
 * Decode URL component
 */
export function decodeURLComponent(text: string): string {
    return decodeURIComponent(text);
}

/**
 * Encode full URL
 */
export function encodeFullURL(url: string): string {
    return encodeURI(url);
}

/**
 * Decode full URL
 */
export function decodeFullURL(url: string): string {
    return decodeURI(url);
}

/**
 * Parse URL into components
 */
export function parseURL(url: string): {
    isValid: boolean;
    protocol?: string;
    hostname?: string;
    port?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    searchParams?: Record<string, string>;
    error?: string;
} {
    try {
        const parsed = new URL(url);

        const searchParams: Record<string, string> = {};
        parsed.searchParams.forEach((value, key) => {
            searchParams[key] = value;
        });

        return {
            isValid: true,
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port,
            pathname: parsed.pathname,
            search: parsed.search,
            hash: parsed.hash,
            searchParams,
        };
    } catch (e) {
        return {
            isValid: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Build URL from components
 */
export function buildURL(components: {
    base: string;
    path?: string;
    params?: Record<string, string>;
    hash?: string;
}): string {
    const { base, path, params, hash } = components;

    let url = base;

    // Add path
    if (path) {
        if (!url.endsWith('/') && !path.startsWith('/')) {
            url += '/';
        }
        url += path;
    }

    // Add query parameters
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            searchParams.append(key, value);
        }
        url += '?' + searchParams.toString();
    }

    // Add hash
    if (hash) {
        url += hash.startsWith('#') ? hash : '#' + hash;
    }

    return url;
}

/**
 * Extract query parameters from URL
 */
export function extractQueryParams(url: string): Record<string, string> {
    try {
        const parsed = new URL(url);
        const params: Record<string, string> = {};

        parsed.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    } catch {
        // Try to parse just the query string
        const queryStart = url.indexOf('?');
        if (queryStart === -1) return {};

        const queryString = url.substring(queryStart + 1).split('#')[0];
        const params: Record<string, string> = {};

        for (const pair of queryString.split('&')) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        }

        return params;
    }
}

/**
 * Add or update query parameter
 */
export function setQueryParam(url: string, key: string, value: string): string {
    try {
        const parsed = new URL(url);
        parsed.searchParams.set(key, value);
        return parsed.toString();
    } catch {
        // Handle non-URL strings
        const hasQuery = url.includes('?');
        const separator = hasQuery ? '&' : '?';
        return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
}

/**
 * Remove query parameter
 */
export function removeQueryParam(url: string, key: string): string {
    try {
        const parsed = new URL(url);
        parsed.searchParams.delete(key);
        return parsed.toString();
    } catch {
        return url;
    }
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get URL encoding info
 */
export function getURLEncodingInfo(text: string): {
    original: string;
    encoded: string;
    encodedLength: number;
    percentEncoded: number;
    specialChars: string[];
} {
    const encoded = encodeURIComponent(text);

    // Find characters that were encoded
    const specialChars: string[] = [];
    for (const char of text) {
        if (encodeURIComponent(char) !== char) {
            if (!specialChars.includes(char)) {
                specialChars.push(char);
            }
        }
    }

    // Count percent-encoded sequences
    const percentMatches = encoded.match(/%[0-9A-F]{2}/gi) || [];

    return {
        original: text,
        encoded,
        encodedLength: encoded.length,
        percentEncoded: percentMatches.length,
        specialChars,
    };
}
