/**
 * JSON Formatter & Validator
 * 
 * Formats, validates, and analyzes JSON data.
 */

import type { ToolResult, JSONFormatResult } from '@/lib/types';

export interface JSONFormatterInput {
    json: string;
    indentSpaces?: number;
}

/**
 * Format and validate JSON
 */
export function formatJSON(input: JSONFormatterInput): ToolResult<JSONFormatResult> {
    const startTime = performance.now();

    const { json, indentSpaces = 2 } = input;

    if (!json || json.trim().length === 0) {
        return {
            success: false,
            error: 'JSON input is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        const parsed = JSON.parse(json);
        const formatted = JSON.stringify(parsed, null, indentSpaces);
        const minified = JSON.stringify(parsed);

        // Analyze structure
        const stats = analyzeJSONStructure(parsed);

        return {
            success: true,
            data: {
                isValid: true,
                formatted,
                minified,
                stats,
            },
            processingTime: performance.now() - startTime,
        };
    } catch (e) {
        const error = e as Error;
        const errorInfo = parseJSONError(error.message, json);

        return {
            success: true,
            data: {
                isValid: false,
                error: errorInfo,
            },
            processingTime: performance.now() - startTime,
        };
    }
}

/**
 * Parse JSON error message to extract line/column
 */
function parseJSONError(message: string, json: string): {
    message: string;
    line?: number;
    column?: number;
} {
    // Try to extract position from error message
    const positionMatch = message.match(/position (\d+)/);

    if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const { line, column } = getLineColumn(json, position);

        return {
            message,
            line,
            column,
        };
    }

    return { message };
}

/**
 * Convert position to line/column
 */
function getLineColumn(text: string, position: number): { line: number; column: number } {
    const lines = text.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    return { line, column };
}

/**
 * Analyze JSON structure
 */
function analyzeJSONStructure(value: unknown): {
    keys: number;
    depth: number;
    arrays: number;
    objects: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
} {
    const stats = {
        keys: 0,
        depth: 0,
        arrays: 0,
        objects: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0,
    };

    function traverse(val: unknown, currentDepth: number): void {
        stats.depth = Math.max(stats.depth, currentDepth);

        if (val === null) {
            stats.nulls++;
        } else if (Array.isArray(val)) {
            stats.arrays++;
            for (const item of val) {
                traverse(item, currentDepth + 1);
            }
        } else if (typeof val === 'object') {
            stats.objects++;
            const keys = Object.keys(val as object);
            stats.keys += keys.length;
            for (const key of keys) {
                traverse((val as Record<string, unknown>)[key], currentDepth + 1);
            }
        } else if (typeof val === 'string') {
            stats.strings++;
        } else if (typeof val === 'number') {
            stats.numbers++;
        } else if (typeof val === 'boolean') {
            stats.booleans++;
        }
    }

    traverse(value, 0);
    return stats;
}

/**
 * Validate JSON string
 */
export function validateJSON(json: string): {
    isValid: boolean;
    error?: string;
    errorPosition?: { line: number; column: number };
} {
    try {
        JSON.parse(json);
        return { isValid: true };
    } catch (e) {
        const error = e as Error;
        const errorInfo = parseJSONError(error.message, json);

        return {
            isValid: false,
            error: errorInfo.message,
            errorPosition: errorInfo.line ? { line: errorInfo.line, column: errorInfo.column || 1 } : undefined,
        };
    }
}

/**
 * Minify JSON
 */
export function minifyJSON(json: string): ToolResult<string> {
    try {
        const parsed = JSON.parse(json);
        return {
            success: true,
            data: JSON.stringify(parsed),
        };
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Sort JSON keys alphabetically
 */
export function sortJSONKeys(json: string): ToolResult<string> {
    try {
        const parsed = JSON.parse(json);
        const sorted = sortObjectKeys(parsed);
        return {
            success: true,
            data: JSON.stringify(sorted, null, 2),
        };
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Recursively sort object keys
 */
function sortObjectKeys(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as object).sort();

    for (const key of keys) {
        sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }

    return sorted;
}

/**
 * Get JSON path to a value
 */
export function getJSONPaths(json: string): string[] {
    try {
        const parsed = JSON.parse(json);
        const paths: string[] = [];

        function traverse(value: unknown, path: string): void {
            paths.push(path || '$');

            if (value === null || typeof value !== 'object') {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    traverse(item, `${path}[${index}]`);
                });
            } else {
                for (const key of Object.keys(value)) {
                    const newPath = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
                        ? `${path}.${key}`
                        : `${path}["${key}"]`;
                    traverse((value as Record<string, unknown>)[key], newPath);
                }
            }
        }

        traverse(parsed, '$');
        return paths;
    } catch {
        return [];
    }
}

/**
 * Compare two JSON objects
 */
export function compareJSON(json1: string, json2: string): {
    isEqual: boolean;
    differences: string[];
} {
    try {
        const obj1 = JSON.parse(json1);
        const obj2 = JSON.parse(json2);

        const differences: string[] = [];

        function compare(val1: unknown, val2: unknown, path: string): void {
            if (val1 === val2) return;

            if (typeof val1 !== typeof val2) {
                differences.push(`${path}: type changed from ${typeof val1} to ${typeof val2}`);
                return;
            }

            if (val1 === null || val2 === null) {
                if (val1 !== val2) {
                    differences.push(`${path}: ${JSON.stringify(val1)} → ${JSON.stringify(val2)}`);
                }
                return;
            }

            if (Array.isArray(val1) && Array.isArray(val2)) {
                if (val1.length !== val2.length) {
                    differences.push(`${path}: array length changed from ${val1.length} to ${val2.length}`);
                }
                const maxLen = Math.max(val1.length, val2.length);
                for (let i = 0; i < maxLen; i++) {
                    compare(val1[i], val2[i], `${path}[${i}]`);
                }
                return;
            }

            if (typeof val1 === 'object' && typeof val2 === 'object') {
                const keys1 = Object.keys(val1);
                const keys2 = Object.keys(val2);
                const allKeys = new Set([...keys1, ...keys2]);

                for (const key of allKeys) {
                    const newPath = `${path}.${key}`;
                    if (!(key in (val1 as object))) {
                        differences.push(`${newPath}: added`);
                    } else if (!(key in (val2 as object))) {
                        differences.push(`${newPath}: removed`);
                    } else {
                        compare(
                            (val1 as Record<string, unknown>)[key],
                            (val2 as Record<string, unknown>)[key],
                            newPath
                        );
                    }
                }
                return;
            }

            differences.push(`${path}: ${JSON.stringify(val1)} → ${JSON.stringify(val2)}`);
        }

        compare(obj1, obj2, '$');

        return {
            isEqual: differences.length === 0,
            differences,
        };
    } catch (e) {
        return {
            isEqual: false,
            differences: [`Parse error: ${(e as Error).message}`],
        };
    }
}
