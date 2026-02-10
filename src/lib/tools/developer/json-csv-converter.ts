/**
 * JSON to CSV Converter
 * 
 * Converts JSON arrays to CSV format.
 */

import type { ToolResult, JSONToCSVResult } from '@/lib/types';

export interface JSONToCSVInput {
    json: string;
    delimiter?: string;
    includeHeaders?: boolean;
    flattenObjects?: boolean;
}

/**
 * Convert JSON to CSV
 */
export function jsonToCSV(input: JSONToCSVInput): ToolResult<JSONToCSVResult> {
    const startTime = performance.now();

    const {
        json,
        delimiter = ',',
        includeHeaders = true,
        flattenObjects = true
    } = input;

    if (!json || json.trim().length === 0) {
        return {
            success: false,
            error: 'JSON input is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        const parsed = JSON.parse(json);

        // Ensure we have an array
        let dataArray: unknown[];
        if (Array.isArray(parsed)) {
            dataArray = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
            // Single object - convert to array
            dataArray = [parsed];
        } else {
            return {
                success: true,
                data: {
                    isValid: false,
                    error: 'JSON must be an array or object',
                },
                processingTime: performance.now() - startTime,
            };
        }

        if (dataArray.length === 0) {
            return {
                success: true,
                data: {
                    isValid: true,
                    csv: '',
                    headers: [],
                    rowCount: 0,
                },
                processingTime: performance.now() - startTime,
            };
        }

        // Flatten objects if needed
        const flattenedData = flattenObjects
            ? dataArray.map(item => flattenObject(item as Record<string, unknown>))
            : dataArray as Record<string, unknown>[];

        // Extract all unique headers
        const headersSet = new Set<string>();
        for (const item of flattenedData) {
            if (typeof item === 'object' && item !== null) {
                for (const key of Object.keys(item)) {
                    headersSet.add(key);
                }
            }
        }
        const headers = Array.from(headersSet);

        // Build CSV rows
        const rows: string[] = [];

        if (includeHeaders) {
            rows.push(headers.map(h => escapeCSVValue(h, delimiter)).join(delimiter));
        }

        for (const item of flattenedData) {
            const row = headers.map(header => {
                const value = (item as Record<string, unknown>)[header];
                return escapeCSVValue(formatValue(value), delimiter);
            });
            rows.push(row.join(delimiter));
        }

        const csv = rows.join('\n');

        return {
            success: true,
            data: {
                isValid: true,
                csv,
                headers,
                rowCount: flattenedData.length,
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
 * Flatten nested objects with dot notation
 */
function flattenObject(
    obj: Record<string, unknown>,
    prefix: string = ''
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

/**
 * Format a value for CSV
 */
function formatValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

/**
 * Escape CSV value
 */
function escapeCSVValue(value: string, delimiter: string): string {
    // Check if escaping is needed
    const needsQuoting =
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes('\n') ||
        value.includes('\r');

    if (needsQuoting) {
        // Escape double quotes by doubling them
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
    }

    return value;
}

/**
 * Convert CSV to JSON
 */
export function csvToJSON(
    csv: string,
    options?: { delimiter?: string; hasHeaders?: boolean }
): ToolResult<unknown[]> {
    const { delimiter = ',', hasHeaders = true } = options || {};

    if (!csv || csv.trim().length === 0) {
        return {
            success: false,
            error: 'CSV input is required',
        };
    }

    try {
        const lines = parseCSVLines(csv, delimiter);

        if (lines.length === 0) {
            return { success: true, data: [] };
        }

        if (hasHeaders) {
            const headers = lines[0];
            const data: Record<string, string>[] = [];

            for (let i = 1; i < lines.length; i++) {
                const row: Record<string, string> = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = lines[i][j] || '';
                }
                data.push(row);
            }

            return { success: true, data };
        } else {
            return { success: true, data: lines };
        }
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Parse CSV lines handling quoted values
 */
function parseCSVLines(csv: string, delimiter: string): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];

        if (insideQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote
                    currentValue += '"';
                    i++;
                } else {
                    // End of quoted value
                    insideQuotes = false;
                }
            } else {
                currentValue += char;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
            } else if (char === delimiter) {
                currentLine.push(currentValue);
                currentValue = '';
            } else if (char === '\n') {
                currentLine.push(currentValue);
                lines.push(currentLine);
                currentLine = [];
                currentValue = '';
            } else if (char !== '\r') {
                currentValue += char;
            }
        }
    }

    // Add last value and line
    if (currentValue || currentLine.length > 0) {
        currentLine.push(currentValue);
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Get CSV statistics
 */
export function getCSVStats(csv: string, delimiter: string = ','): {
    rowCount: number;
    columnCount: number;
    headers: string[];
    emptyCells: number;
} {
    const lines = parseCSVLines(csv, delimiter);

    if (lines.length === 0) {
        return { rowCount: 0, columnCount: 0, headers: [], emptyCells: 0 };
    }

    const headers = lines[0];
    let emptyCells = 0;

    for (const line of lines) {
        for (const cell of line) {
            if (!cell.trim()) {
                emptyCells++;
            }
        }
    }

    return {
        rowCount: lines.length - 1, // Exclude header row
        columnCount: headers.length,
        headers,
        emptyCells,
    };
}
