/**
 * Case Converter
 * 
 * Converts text between various case formats.
 */

import type { ToolResult, CaseConvertResult, CaseType } from '@/lib/types';

export interface CaseConverterInput {
    text: string;
    caseType: CaseType;
}

/**
 * Convert text to specified case type
 */
export function convertCase(input: CaseConverterInput): ToolResult<CaseConvertResult> {
    const startTime = performance.now();

    const { text, caseType } = input;

    if (!text) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    let converted: string;

    switch (caseType) {
        case 'uppercase':
            converted = toUpperCase(text);
            break;
        case 'lowercase':
            converted = toLowerCase(text);
            break;
        case 'titlecase':
            converted = toTitleCase(text);
            break;
        case 'sentencecase':
            converted = toSentenceCase(text);
            break;
        case 'camelcase':
            converted = toCamelCase(text);
            break;
        case 'pascalcase':
            converted = toPascalCase(text);
            break;
        case 'snakecase':
            converted = toSnakeCase(text);
            break;
        case 'kebabcase':
            converted = toKebabCase(text);
            break;
        case 'togglecase':
            converted = toToggleCase(text);
            break;
        default:
            return {
                success: false,
                error: `Unknown case type: ${caseType}`,
                processingTime: performance.now() - startTime,
            };
    }

    return {
        success: true,
        data: {
            original: text,
            converted,
            caseType,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Convert to UPPERCASE
 */
export function toUpperCase(text: string): string {
    return text.toUpperCase();
}

/**
 * Convert to lowercase
 */
export function toLowerCase(text: string): string {
    return text.toLowerCase();
}

/**
 * Convert to Title Case
 */
export function toTitleCase(text: string): string {
    // Words that should not be capitalized (unless first word)
    const exceptions = new Set([
        'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in',
        'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet',
    ]);

    return text
        .toLowerCase()
        .split(/(\s+)/)
        .map((word, index, arr) => {
            // Always capitalize first and last word
            if (index === 0 || index === arr.length - 1) {
                return capitalizeFirst(word);
            }

            // Don't capitalize exceptions
            if (exceptions.has(word.toLowerCase())) {
                return word;
            }

            return capitalizeFirst(word);
        })
        .join('');
}

/**
 * Convert to Sentence case
 */
export function toSentenceCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
            return separator + letter.toUpperCase();
        });
}

/**
 * Convert to camelCase
 */
export function toCamelCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Convert to PascalCase
 */
export function toPascalCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
}

/**
 * Convert to tOGGLE cASE
 */
export function toToggleCase(text: string): string {
    return text
        .split('')
        .map(char => {
            if (char === char.toUpperCase()) {
                return char.toLowerCase();
            }
            return char.toUpperCase();
        })
        .join('');
}

/**
 * Capitalize first letter of a word
 */
function capitalizeFirst(word: string): string {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Convert all case types at once
 */
export function convertAllCases(text: string): Record<CaseType, string> {
    return {
        uppercase: toUpperCase(text),
        lowercase: toLowerCase(text),
        titlecase: toTitleCase(text),
        sentencecase: toSentenceCase(text),
        camelcase: toCamelCase(text),
        pascalcase: toPascalCase(text),
        snakecase: toSnakeCase(text),
        kebabcase: toKebabCase(text),
        togglecase: toToggleCase(text),
    };
}

/**
 * Detect case type of text
 */
export function detectCase(text: string): CaseType | 'mixed' {
    if (!text) return 'mixed';

    if (text === text.toUpperCase() && text !== text.toLowerCase()) {
        return 'uppercase';
    }

    if (text === text.toLowerCase()) {
        return 'lowercase';
    }

    if (/^[a-z][a-zA-Z0-9]*$/.test(text) && /[A-Z]/.test(text)) {
        return 'camelcase';
    }

    if (/^[A-Z][a-zA-Z0-9]*$/.test(text) && /[a-z]/.test(text)) {
        return 'pascalcase';
    }

    if (/^[a-z0-9]+(_[a-z0-9]+)*$/.test(text)) {
        return 'snakecase';
    }

    if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(text)) {
        return 'kebabcase';
    }

    return 'mixed';
}
