/**
 * YouTube Title Length Checker - Enhanced Edition
 * 
 * Professional-grade analysis with SEO scoring, power word detection,
 * CTR prediction, and actionable optimization tips.
 */

import type { ToolResult, YouTubeTitleResult } from '@/lib/types';

export interface YouTubeTitleInput {
    title: string;
}

// YouTube title limits
const MAX_LENGTH = 100;
const OPTIMAL_MIN = 60;
const OPTIMAL_MAX = 70;

// Power words that increase CTR
const POWER_WORDS = [
    // Urgency
    'now', 'today', 'instant', 'quick', 'fast', 'hurry', 'limited', 'urgent',
    // Exclusivity  
    'exclusive', 'secret', 'hidden', 'insider', 'private', 'vip',
    // Value
    'free', 'bonus', 'complete', 'ultimate', 'definitive', 'essential',
    // Emotion
    'amazing', 'incredible', 'shocking', 'awesome', 'stunning', 'insane',
    // Results
    'proven', 'guaranteed', 'works', 'results', 'effective', 'powerful',
    // Numbers (patterns)
    'best', 'top', 'worst', 'biggest', 'easiest', 'fastest', 'simplest',
    // Curiosity
    'why', 'how', 'what', 'revealed', 'truth', 'discover', 'learn',
    // Lists
    'tips', 'tricks', 'hacks', 'ways', 'steps', 'methods', 'strategies',
];

// Emotional trigger words
const EMOTIONAL_TRIGGERS = [
    'mistake', 'avoid', 'warning', 'danger', 'never', 'stop', 'before',
    'after', 'changed', 'transform', 'life-changing', 'game-changer',
    'surprised', 'shocked', 'mind-blown', 'unbelievable', 'crazy',
];

// Brackets/parentheses patterns that increase CTR
const BRACKET_PATTERNS = [
    /\[.*?\]/,      // [Tutorial]
    /\(.*?\)/,      // (2025)
    /\|.*$/,        // | Channel Name
];

/**
 * Check YouTube title length
 */
export function checkYouTubeTitle(input: YouTubeTitleInput): ToolResult<YouTubeTitleResult> {
    const startTime = performance.now();

    const { title } = input;

    if (title === undefined || title === null) {
        return {
            success: false,
            error: 'Title is required',
            processingTime: performance.now() - startTime,
        };
    }

    const length = title.length;
    const remaining = MAX_LENGTH - length;
    const isWithinLimit = length <= MAX_LENGTH;
    const isOptimalLength = length >= OPTIMAL_MIN && length <= OPTIMAL_MAX;

    // Generate recommendation
    let recommendation: string;
    if (length === 0) {
        recommendation = 'Enter a title to analyze.';
    } else if (length < 30) {
        recommendation = 'Title is too short. Add more descriptive keywords to improve CTR.';
    } else if (length < OPTIMAL_MIN) {
        recommendation = 'Title is good but could be longer for better discoverability.';
    } else if (length <= OPTIMAL_MAX) {
        recommendation = 'Perfect! Title length is optimal for YouTube SEO.';
    } else if (length <= MAX_LENGTH) {
        recommendation = 'Title is long but within limits. May be truncated in some views.';
    } else {
        recommendation = `Title exceeds ${MAX_LENGTH} character limit by ${-remaining} characters. Must shorten.`;
    }

    return {
        success: true,
        data: {
            text: title,
            length,
            maxLength: MAX_LENGTH,
            remaining,
            isWithinLimit,
            isOptimalLength,
            optimalRange: { min: OPTIMAL_MIN, max: OPTIMAL_MAX },
            recommendation,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get YouTube title best practices
 */
export function getYouTubeTitleTips(): string[] {
    return [
        'Keep titles between 60-70 characters for best results',
        'Front-load important keywords at the beginning',
        'Include numbers when relevant (e.g., "Top 10...", "5 Ways...")',
        'Use power words that trigger emotion (amazing, ultimate, secret)',
        'Add brackets with context: [Tutorial], [2025], [FULL GUIDE]',
        'Include the year for evergreen content freshness',
        'Match title to search intent - what would people search for?',
        'Create curiosity gaps but avoid clickbait',
        'Use sentence case or title case (not ALL CAPS)',
        'Test different title variations using YouTube Studio analytics',
    ];
}

/**
 * Detect gibberish/spam titles
 * Returns a penalty score (0-30) where higher = more gibberish
 */
function detectGibberish(title: string): { penalty: number; reasons: string[] } {
    const reasons: string[] = [];
    let penalty = 0;

    if (!title || title.length === 0) return { penalty: 0, reasons: [] };

    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = title.split(/\s+/).filter(w => w.length > 0);

    // 1. Check for excessive character repetition (aaaaa, !!!!, etc)
    const repeatingPattern = /(.)\1{4,}/g;
    const repeats = title.match(repeatingPattern);
    if (repeats && repeats.length > 0) {
        penalty += 10;
        reasons.push('Excessive repeating characters');
    }

    // 2. Check vowel-consonant ratio (gibberish has unusual ratios)
    const vowels = cleanTitle.match(/[aeiou]/g) || [];
    const consonants = cleanTitle.match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    const vowelRatio = vowels.length / (cleanTitle.length || 1);

    if (vowelRatio < 0.15 || vowelRatio > 0.7) {
        penalty += 8;
        reasons.push('Unusual letter pattern');
    }

    // 3. Check for too many consecutive consonants (common in gibberish)
    const consecutiveConsonants = /[bcdfghjklmnpqrstvwxyz]{6,}/gi;
    if (consecutiveConsonants.test(title)) {
        penalty += 8;
        reasons.push('Too many consecutive consonants');
    }

    // 4. Check for random capitalization (not proper title case)
    const capitalLetters = title.match(/[A-Z]/g) || [];
    const totalLetters = title.match(/[a-zA-Z]/g) || [];
    if (totalLetters.length > 10) {
        const capitalRatio = capitalLetters.length / totalLetters.length;
        // Random mix is suspicious (30-70% capitals)
        if (capitalRatio > 0.3 && capitalRatio < 0.7) {
            penalty += 5;
            reasons.push('Random capitalization');
        }
    }

    // 5. Check if title has at least some recognizable words
    const commonWords = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'how', 'what', 'why', 'when', 'where', 'who', 'best', 'top', 'guide', 'tutorial',
        'review', 'tips', 'tricks', 'learn', 'make', 'get', 'new', 'easy', 'simple',
        'you', 'your', 'this', 'that', 'is', 'are', 'be', 'have', 'do', 'can', 'will'
    ];
    const hasRealWords = words.some(w => commonWords.includes(w.toLowerCase()));
    if (!hasRealWords && words.length > 3) {
        penalty += 12;
        reasons.push('No recognizable words');
    }

    // 6. Check for spam patterns (too many special characters)
    const specialChars = title.match(/[!@#$%^&*()_+=\[\]{}|;:'",.<>?/\\~`-]/g) || [];
    const specialRatio = specialChars.length / title.length;
    if (specialRatio > 0.25) {
        penalty += 10;
        reasons.push('Excessive special characters');
    }

    // 7. Check for single-character "words" (a sign of random text)
    const singleCharWords = words.filter(w => w.length === 1 && !/[aAiI]/.test(w));
    if (singleCharWords.length > words.length * 0.3) {
        penalty += 8;
        reasons.push('Too many single characters');
    }

    // 8. Check average word length (gibberish tends to have very long or very short "words")
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / (words.length || 1);
    if (avgWordLength < 2.5 || avgWordLength > 15) {
        penalty += 6;
        reasons.push('Unusual word length pattern');
    }

    return { penalty: Math.min(penalty, 30), reasons };
}

/**
 * Calculate SEO Score (0-100)
 */
export function calculateSEOScore(title: string): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: Array<{ factor: string; points: number; maxPoints: number; tip: string }>;
} {
    if (!title || title.length === 0) {
        return {
            score: 0,
            grade: 'F',
            breakdown: [],
        };
    }

    const breakdown: Array<{ factor: string; points: number; maxPoints: number; tip: string }> = [];
    let totalPoints = 0;
    const maxPoints = 100;

    const titleLower = title.toLowerCase();
    const words = title.split(/\s+/).filter(w => w.length > 0);

    // 1. Length Score (25 points)
    let lengthPoints = 0;
    if (title.length >= OPTIMAL_MIN && title.length <= OPTIMAL_MAX) {
        lengthPoints = 25;
    } else if (title.length >= 50 && title.length <= 80) {
        lengthPoints = 20;
    } else if (title.length >= 30 && title.length <= MAX_LENGTH) {
        lengthPoints = 15;
    } else if (title.length > 0 && title.length < 30) {
        lengthPoints = 5;
    }
    totalPoints += lengthPoints;
    breakdown.push({
        factor: 'Title Length',
        points: lengthPoints,
        maxPoints: 25,
        tip: lengthPoints < 20 ? 'Aim for 60-70 characters' : 'Great length!',
    });

    // 2. Power Words (20 points)
    const foundPowerWords = POWER_WORDS.filter(pw => titleLower.includes(pw));
    const powerWordPoints = Math.min(foundPowerWords.length * 7, 20);
    totalPoints += powerWordPoints;
    breakdown.push({
        factor: 'Power Words',
        points: powerWordPoints,
        maxPoints: 20,
        tip: powerWordPoints < 14 ? `Add power words: ${POWER_WORDS.slice(0, 5).join(', ')}` : `Found: ${foundPowerWords.join(', ')}`,
    });

    // 3. Numbers (15 points)
    const hasNumber = /\d+/.test(title);
    const numberPoints = hasNumber ? 15 : 0;
    totalPoints += numberPoints;
    breakdown.push({
        factor: 'Numbers',
        points: numberPoints,
        maxPoints: 15,
        tip: numberPoints === 0 ? 'Add a number (e.g., "7 Ways...", "Top 10...")' : 'Great use of numbers!',
    });

    // 4. Emotional Triggers (15 points)
    const foundEmotional = EMOTIONAL_TRIGGERS.filter(et => titleLower.includes(et));
    const emotionalPoints = Math.min(foundEmotional.length * 8, 15);
    totalPoints += emotionalPoints;
    breakdown.push({
        factor: 'Emotional Appeal',
        points: emotionalPoints,
        maxPoints: 15,
        tip: emotionalPoints < 8 ? 'Add emotional triggers to increase clicks' : `Found: ${foundEmotional.join(', ')}`,
    });

    // 5. Brackets/Parentheses (10 points)
    const hasBrackets = BRACKET_PATTERNS.some(pattern => pattern.test(title));
    const bracketPoints = hasBrackets ? 10 : 0;
    totalPoints += bracketPoints;
    breakdown.push({
        factor: 'Brackets/Context',
        points: bracketPoints,
        maxPoints: 10,
        tip: bracketPoints === 0 ? 'Add context in brackets: [Tutorial], [2025]' : 'Good use of brackets!',
    });

    // 6. Keyword Position (10 points) - Main keyword should be early
    const firstWordCapitalized = /^[A-Z]/.test(title);
    const startsWithNumber = /^\d/.test(title);
    const startsWithHow = /^(how|what|why|when|where)/i.test(title);
    const keywordPoints = (firstWordCapitalized || startsWithNumber || startsWithHow) ? 10 : 3;
    totalPoints += keywordPoints;
    breakdown.push({
        factor: 'Keyword Position',
        points: keywordPoints,
        maxPoints: 10,
        tip: keywordPoints < 10 ? 'Put main keyword at the start' : 'Keywords front-loaded!',
    });

    // 7. Readability (5 points)
    const isAllCaps = title === title.toUpperCase() && title.length > 3;
    const hasProperCase = !isAllCaps && /[A-Z]/.test(title);
    const readabilityPoints = hasProperCase ? 5 : (isAllCaps ? 0 : 3);
    totalPoints += readabilityPoints;
    breakdown.push({
        factor: 'Readability',
        points: readabilityPoints,
        maxPoints: 5,
        tip: isAllCaps ? 'Avoid ALL CAPS - use Title Case' : 'Good formatting!',
    });

    // 8. Gibberish/Quality Check (deduct up to 30 points)
    const gibberishCheck = detectGibberish(title);
    const qualityPenalty = gibberishCheck.penalty;
    totalPoints -= qualityPenalty;

    if (gibberishCheck.penalty > 0) {
        breakdown.push({
            factor: 'Quality Check',
            points: -qualityPenalty,
            maxPoints: 0,
            tip: `Issues detected: ${gibberishCheck.reasons.join(', ')}. Use clear, meaningful words.`,
        });
    }

    // Ensure score doesn't go negative
    totalPoints = Math.max(0, totalPoints);

    // Calculate grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (totalPoints >= 85) grade = 'A';
    else if (totalPoints >= 70) grade = 'B';
    else if (totalPoints >= 55) grade = 'C';
    else if (totalPoints >= 40) grade = 'D';
    else grade = 'F';

    return {
        score: Math.round(totalPoints),
        grade,
        breakdown,
    };
}

/**
 * Predict CTR potential based on title analysis
 */
export function predictCTRPotential(title: string): {
    rating: 'High' | 'Medium' | 'Low';
    percentage: string;
    factors: string[];
} {
    const { score } = calculateSEOScore(title);
    const factors: string[] = [];

    const titleLower = title.toLowerCase();

    // Check positive factors
    if (/\d+/.test(title)) factors.push('✓ Contains numbers');
    if (POWER_WORDS.some(pw => titleLower.includes(pw))) factors.push('✓ Uses power words');
    if (BRACKET_PATTERNS.some(p => p.test(title))) factors.push('✓ Has context brackets');
    if (/\?/.test(title)) factors.push('✓ Question format creates curiosity');
    if (/20\d{2}/.test(title)) factors.push('✓ Includes year for freshness');

    // Check negative factors
    if (title.length < 30) factors.push('✗ Title too short');
    if (title.length > 80) factors.push('✗ May be truncated');
    if (title === title.toUpperCase()) factors.push('✗ ALL CAPS reduces trust');

    if (score >= 75) {
        return { rating: 'High', percentage: '8-12%', factors };
    } else if (score >= 50) {
        return { rating: 'Medium', percentage: '4-7%', factors };
    } else {
        return { rating: 'Low', percentage: '1-3%', factors };
    }
}

/**
 * Analyze title for SEO with enhanced metrics
 */
export function analyzeYouTubeTitle(title: string): {
    length: number;
    wordCount: number;
    hasNumbers: boolean;
    hasYear: boolean;
    hasEmoji: boolean;
    startsWithKeyword: boolean;
    seoScore: number;
    grade: string;
    ctrPotential: string;
    suggestions: string[];
    powerWordsFound: string[];
} {
    const words = title.split(/\s+/).filter(w => w.length > 0);
    const titleLower = title.toLowerCase();
    const hasNumbers = /\d/.test(title);
    const hasYear = /20\d{2}/.test(title);
    const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]/u.test(title);

    // Check if starts with likely keyword (capitalized word or number)
    const startsWithKeyword = /^[A-Z0-9]/.test(title);

    // Get SEO score
    const { score, grade } = calculateSEOScore(title);
    const { rating: ctrPotential } = predictCTRPotential(title);

    // Find power words
    const powerWordsFound = POWER_WORDS.filter(pw => titleLower.includes(pw));

    const suggestions: string[] = [];

    if (title.length < 30) {
        suggestions.push('Add more descriptive words to reach 60-70 characters');
    }

    if (!hasNumbers) {
        suggestions.push('Add a number for higher CTR (e.g., "5 Ways to...", "Top 10...")');
    }

    if (!hasYear && words.length > 5) {
        suggestions.push('Consider adding 2025/2026 for content freshness');
    }

    if (title === title.toUpperCase()) {
        suggestions.push('Change to Title Case - ALL CAPS reduces trust');
    }

    if (words.length < 4) {
        suggestions.push('Use more keywords for better discoverability');
    }

    if (powerWordsFound.length === 0) {
        suggestions.push('Add power words: Ultimate, Essential, Proven, Secret, Easy');
    }

    if (!BRACKET_PATTERNS.some(p => p.test(title))) {
        suggestions.push('Add context in brackets: [Full Guide], [Tutorial], [2025]');
    }

    if (!/\?|!/.test(title) && words.length > 3) {
        suggestions.push('Consider a question format to spark curiosity');
    }

    return {
        length: title.length,
        wordCount: words.length,
        hasNumbers,
        hasYear,
        hasEmoji,
        startsWithKeyword,
        seoScore: score,
        grade,
        ctrPotential,
        suggestions,
        powerWordsFound,
    };
}

/**
 * Generate optimized title variations
 */
export function generateTitleVariations(title: string): string[] {
    const variations: string[] = [];
    const year = new Date().getFullYear();

    if (title.length > 0) {
        // Add year
        if (!title.includes(String(year))) {
            variations.push(`${title} (${year})`);
        }

        // Add brackets
        if (!title.includes('[')) {
            variations.push(`${title} [Complete Guide]`);
            variations.push(`${title} [Step by Step]`);
        }

        // Add number prefix if missing
        if (!/^\d/.test(title)) {
            variations.push(`7 ${title}`);
        }

        // Question format
        if (!title.includes('?') && !title.toLowerCase().startsWith('how')) {
            variations.push(`How to ${title}?`);
        }
    }

    return variations.slice(0, 4);
}
