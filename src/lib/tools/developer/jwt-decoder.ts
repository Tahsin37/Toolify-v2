/**
 * JWT Decoder
 * 
 * Decodes and analyzes JSON Web Tokens.
 */

import type { ToolResult, JWTDecodeResult, JWTHeader, JWTPayload } from '@/lib/types';

export interface JWTDecoderInput {
    token: string;
}

/**
 * Decode JWT token
 */
export function decodeJWT(input: JWTDecoderInput): ToolResult<JWTDecodeResult> {
    const startTime = performance.now();

    const { token } = input;

    if (!token || token.trim().length === 0) {
        return {
            success: false,
            error: 'JWT token is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        const parts = token.split('.');

        if (parts.length !== 3) {
            return {
                success: true,
                data: {
                    isValid: false,
                    error: `Invalid JWT format: expected 3 parts, got ${parts.length}`,
                },
                processingTime: performance.now() - startTime,
            };
        }

        // Decode header
        const header = decodeBase64Url(parts[0]) as JWTHeader;

        // Decode payload
        const payload = decodeBase64Url(parts[1]) as JWTPayload;

        // Signature (just store as string, we can't verify without the secret)
        const signature = parts[2];

        // Check expiration
        let isExpired: boolean | undefined;
        let expiresAt: Date | undefined;
        let issuedAt: Date | undefined;

        if (payload.exp) {
            expiresAt = new Date(payload.exp * 1000);
            isExpired = expiresAt < new Date();
        }

        if (payload.iat) {
            issuedAt = new Date(payload.iat * 1000);
        }

        return {
            success: true,
            data: {
                isValid: true,
                header,
                payload,
                signature,
                isExpired,
                expiresAt,
                issuedAt,
            },
            processingTime: performance.now() - startTime,
        };
    } catch (e) {
        return {
            success: true,
            data: {
                isValid: false,
                error: (e as Error).message,
            },
            processingTime: performance.now() - startTime,
        };
    }
}

/**
 * Decode Base64URL encoded string
 */
function decodeBase64Url(str: string): unknown {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
        base64 += '='.repeat(padding);
    }

    // Decode
    const decoded = atob(base64);

    // Parse as JSON
    return JSON.parse(decoded);
}

/**
 * Get JWT expiration status
 */
export function getJWTExpirationStatus(token: string): {
    isExpired: boolean;
    expiresAt?: Date;
    expiresIn?: string;
    issuedAt?: Date;
    validFor?: string;
} {
    const result = decodeJWT({ token });

    if (!result.success || !result.data?.isValid || !result.data.payload) {
        return { isExpired: true };
    }

    const { payload } = result.data;
    const now = new Date();

    let expiresAt: Date | undefined;
    let expiresIn: string | undefined;
    let isExpired = false;

    if (payload.exp) {
        expiresAt = new Date(payload.exp * 1000);
        isExpired = expiresAt < now;

        if (!isExpired) {
            const diff = expiresAt.getTime() - now.getTime();
            expiresIn = formatDuration(diff);
        }
    }

    let issuedAt: Date | undefined;
    let validFor: string | undefined;

    if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000);

        if (payload.exp) {
            const duration = (payload.exp - payload.iat) * 1000;
            validFor = formatDuration(duration);
        }
    }

    return {
        isExpired,
        expiresAt,
        expiresIn,
        issuedAt,
        validFor,
    };
}

/**
 * Format duration in human readable format
 */
function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Validate JWT structure (not signature)
 */
export function validateJWTStructure(token: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    const parts = token.split('.');

    if (parts.length !== 3) {
        errors.push(`Invalid structure: expected 3 parts separated by dots, got ${parts.length}`);
        return { isValid: false, errors };
    }

    // Check header
    try {
        const header = decodeBase64Url(parts[0]) as JWTHeader;
        if (!header.alg) {
            errors.push('Header missing required "alg" claim');
        }
    } catch {
        errors.push('Invalid header: not valid Base64URL JSON');
    }

    // Check payload
    try {
        decodeBase64Url(parts[1]);
    } catch {
        errors.push('Invalid payload: not valid Base64URL JSON');
    }

    // Check signature is present
    if (!parts[2]) {
        errors.push('Missing signature');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Get algorithm info
 */
export function getAlgorithmInfo(alg: string): {
    name: string;
    type: 'symmetric' | 'asymmetric' | 'none';
    description: string;
} {
    const algorithms: Record<string, { name: string; type: 'symmetric' | 'asymmetric' | 'none'; description: string }> = {
        HS256: { name: 'HMAC SHA-256', type: 'symmetric', description: 'Symmetric algorithm using SHA-256 hash' },
        HS384: { name: 'HMAC SHA-384', type: 'symmetric', description: 'Symmetric algorithm using SHA-384 hash' },
        HS512: { name: 'HMAC SHA-512', type: 'symmetric', description: 'Symmetric algorithm using SHA-512 hash' },
        RS256: { name: 'RSA SHA-256', type: 'asymmetric', description: 'RSA signature with SHA-256' },
        RS384: { name: 'RSA SHA-384', type: 'asymmetric', description: 'RSA signature with SHA-384' },
        RS512: { name: 'RSA SHA-512', type: 'asymmetric', description: 'RSA signature with SHA-512' },
        ES256: { name: 'ECDSA P-256', type: 'asymmetric', description: 'ECDSA signature using P-256 curve' },
        ES384: { name: 'ECDSA P-384', type: 'asymmetric', description: 'ECDSA signature using P-384 curve' },
        ES512: { name: 'ECDSA P-521', type: 'asymmetric', description: 'ECDSA signature using P-521 curve' },
        PS256: { name: 'RSA-PSS SHA-256', type: 'asymmetric', description: 'RSA-PSS signature with SHA-256' },
        PS384: { name: 'RSA-PSS SHA-384', type: 'asymmetric', description: 'RSA-PSS signature with SHA-384' },
        PS512: { name: 'RSA-PSS SHA-512', type: 'asymmetric', description: 'RSA-PSS signature with SHA-512' },
        none: { name: 'None', type: 'none', description: 'No digital signature (unsafe!)' },
    };

    return algorithms[alg] || { name: 'Unknown', type: 'none', description: 'Unknown algorithm' };
}

/**
 * Explain standard JWT claims
 */
export function explainClaim(claim: string): string {
    const claims: Record<string, string> = {
        iss: 'Issuer - identifies the principal that issued the JWT',
        sub: 'Subject - identifies the principal that is the subject of the JWT',
        aud: 'Audience - identifies the recipients that the JWT is intended for',
        exp: 'Expiration Time - identifies the time after which the JWT must not be accepted',
        nbf: 'Not Before - identifies the time before which the JWT must not be accepted',
        iat: 'Issued At - identifies the time at which the JWT was issued',
        jti: 'JWT ID - provides a unique identifier for the JWT',
    };

    return claims[claim] || 'Custom claim';
}
