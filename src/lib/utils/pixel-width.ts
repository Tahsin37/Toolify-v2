/**
 * Pixel Width Calculator
 * 
 * Calculates approximate pixel width for text using Arial font metrics.
 * Based on Google SERP rendering (Arial 18px for titles, 14px for descriptions).
 */

// Character width map for Arial at 1px (multiply by font size for actual width)
// These values are approximations based on actual font metrics
const ARIAL_CHAR_WIDTHS: Record<string, number> = {
    // Uppercase letters
    'A': 0.722, 'B': 0.667, 'C': 0.722, 'D': 0.722, 'E': 0.667,
    'F': 0.611, 'G': 0.778, 'H': 0.722, 'I': 0.278, 'J': 0.556,
    'K': 0.722, 'L': 0.611, 'M': 0.833, 'N': 0.722, 'O': 0.778,
    'P': 0.667, 'Q': 0.778, 'R': 0.722, 'S': 0.667, 'T': 0.611,
    'U': 0.722, 'V': 0.667, 'W': 0.944, 'X': 0.667, 'Y': 0.667,
    'Z': 0.611,

    // Lowercase letters
    'a': 0.556, 'b': 0.611, 'c': 0.556, 'd': 0.611, 'e': 0.556,
    'f': 0.333, 'g': 0.611, 'h': 0.611, 'i': 0.278, 'j': 0.278,
    'k': 0.556, 'l': 0.278, 'm': 0.889, 'n': 0.611, 'o': 0.611,
    'p': 0.611, 'q': 0.611, 'r': 0.389, 's': 0.556, 't': 0.333,
    'u': 0.611, 'v': 0.556, 'w': 0.778, 'x': 0.556, 'y': 0.556,
    'z': 0.500,

    // Numbers
    '0': 0.556, '1': 0.556, '2': 0.556, '3': 0.556, '4': 0.556,
    '5': 0.556, '6': 0.556, '7': 0.556, '8': 0.556, '9': 0.556,

    // Common punctuation and symbols
    ' ': 0.278, '!': 0.333, '"': 0.474, '#': 0.556, '$': 0.556,
    '%': 0.889, '&': 0.722, "'": 0.238, '(': 0.333, ')': 0.333,
    '*': 0.389, '+': 0.584, ',': 0.278, '-': 0.333, '.': 0.278,
    '/': 0.278, ':': 0.333, ';': 0.333, '<': 0.584, '=': 0.584,
    '>': 0.584, '?': 0.611, '@': 0.975, '[': 0.333, '\\': 0.278,
    ']': 0.333, '^': 0.584, '_': 0.556, '`': 0.333, '{': 0.389,
    '|': 0.280, '}': 0.389, '~': 0.584,
};

// Default width for unknown characters
const DEFAULT_CHAR_WIDTH = 0.6;

/**
 * Calculate pixel width of a string using Arial font metrics
 * @param text - The text to measure
 * @param fontSize - Font size in pixels (default: 20 for Google title)
 * @returns Pixel width as a number
 */
export function calculatePixelWidth(text: string, fontSize: number = 20): number {
    if (!text) return 0;

    let totalWidth = 0;

    for (const char of text) {
        const charWidth = ARIAL_CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH;
        totalWidth += charWidth * fontSize;
    }

    return Math.round(totalWidth);
}

/**
 * Google SERP pixel limits
 */
export const SERP_LIMITS = {
    title: {
        desktop: 580,
        mobile: 920,
        maxCharacters: 60,
        fontSize: 20,
    },
    description: {
        desktop: 920,
        mobile: 680,
        maxCharacters: 160,
        fontSize: 14,
    },
};

/**
 * Calculate title pixel width for Google SERP
 */
export function calculateTitlePixelWidth(title: string): number {
    return calculatePixelWidth(title, SERP_LIMITS.title.fontSize);
}

/**
 * Calculate description pixel width for Google SERP
 */
export function calculateDescriptionPixelWidth(description: string): number {
    return calculatePixelWidth(description, SERP_LIMITS.description.fontSize);
}

/**
 * Truncate text to fit within pixel width
 */
export function truncateToPixelWidth(
    text: string,
    maxPixelWidth: number,
    fontSize: number = 20,
    ellipsis: string = '...'
): string {
    if (!text) return '';

    const ellipsisWidth = calculatePixelWidth(ellipsis, fontSize);
    const targetWidth = maxPixelWidth - ellipsisWidth;

    let currentWidth = 0;
    let truncatedText = '';

    for (const char of text) {
        const charWidth = (ARIAL_CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH) * fontSize;
        if (currentWidth + charWidth > targetWidth) {
            return truncatedText.trimEnd() + ellipsis;
        }
        currentWidth += charWidth;
        truncatedText += char;
    }

    return text;
}

/**
 * Check if text will be truncated on SERP
 */
export function willBeTruncated(
    text: string,
    maxPixelWidth: number,
    fontSize: number = 20
): boolean {
    return calculatePixelWidth(text, fontSize) > maxPixelWidth;
}
