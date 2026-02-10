/**
 * Base64 Encode / Decode
 * 
 * Encodes and decodes Base64 strings with support for URL-safe variant.
 */

import type { ToolResult, Base64Result } from '@/lib/types';

export interface Base64Input {
    input: string;
    operation: 'encode' | 'decode';
    urlSafe?: boolean;
}

/**
 * Encode or decode Base64
 */
export function processBase64(input: Base64Input): ToolResult<Base64Result> {
    const startTime = performance.now();

    const { input: text, operation, urlSafe = false } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Input is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        let output: string;
        let byteSize: number | undefined;

        if (operation === 'encode') {
            // Encode string to Base64
            output = stringToBase64(text);
            byteSize = new TextEncoder().encode(text).length;

            if (urlSafe) {
                output = toUrlSafe(output);
            }
        } else {
            // Decode Base64 to string
            let base64Input = text;

            if (urlSafe) {
                base64Input = fromUrlSafe(base64Input);
            }

            // Add padding if needed
            base64Input = addPadding(base64Input);

            output = base64ToString(base64Input);
            byteSize = new TextEncoder().encode(output).length;
        }

        return {
            success: true,
            data: {
                input: text,
                output,
                operation,
                isValid: true,
                byteSize,
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
 * Encode string to Base64
 */
export function encodeBase64(text: string, urlSafe: boolean = false): string {
    let encoded = stringToBase64(text);

    if (urlSafe) {
        encoded = toUrlSafe(encoded);
    }

    return encoded;
}

/**
 * Decode Base64 to string
 */
export function decodeBase64(base64: string, urlSafe: boolean = false): string {
    let input = base64;

    if (urlSafe) {
        input = fromUrlSafe(input);
    }

    input = addPadding(input);

    return base64ToString(input);
}

/**
 * Convert string to Base64 (handling Unicode)
 */
function stringToBase64(str: string): string {
    // Handle Unicode by encoding to UTF-8 first
    const bytes = new TextEncoder().encode(str);
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
}

/**
 * Convert Base64 to string (handling Unicode)
 */
function base64ToString(base64: string): string {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

/**
 * Convert Base64 to URL-safe variant
 */
function toUrlSafe(base64: string): string {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Convert URL-safe Base64 back to standard
 */
function fromUrlSafe(urlSafe: string): string {
    return urlSafe
        .replace(/-/g, '+')
        .replace(/_/g, '/');
}

/**
 * Add padding to Base64 if needed
 */
function addPadding(base64: string): string {
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
        return base64 + '='.repeat(padding);
    }
    return base64;
}

/**
 * Validate Base64 string
 */
export function isValidBase64(input: string, urlSafe: boolean = false): boolean {
    try {
        let base64 = input;

        if (urlSafe) {
            base64 = fromUrlSafe(base64);
        }

        base64 = addPadding(base64);

        // Check for valid Base64 characters
        const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Pattern.test(base64)) {
            return false;
        }

        // Try to decode
        atob(base64);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get Base64 encoding info
 */
export function getBase64Info(input: string): {
    inputLength: number;
    encodedLength: number;
    ratio: number;
    byteSize: number;
} {
    const bytes = new TextEncoder().encode(input);
    const encoded = stringToBase64(input);

    return {
        inputLength: input.length,
        encodedLength: encoded.length,
        ratio: Math.round((encoded.length / input.length) * 100) / 100,
        byteSize: bytes.length,
    };
}

/**
 * Batch encode multiple strings
 */
export function batchEncode(inputs: string[], urlSafe: boolean = false): string[] {
    return inputs.map(input => encodeBase64(input, urlSafe));
}

/**
 * Batch decode multiple strings
 */
export function batchDecode(inputs: string[], urlSafe: boolean = false): string[] {
    return inputs.map(input => {
        try {
            return decodeBase64(input, urlSafe);
        } catch {
            return '';
        }
    });
}
