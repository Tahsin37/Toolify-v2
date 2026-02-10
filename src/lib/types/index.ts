// ============================================
// Core Tool Types
// ============================================

/**
 * Generic result wrapper for all tools
 */
export interface ToolResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    warnings?: string[];
    processingTime?: number;
}

/**
 * Tool metadata for SEO and display purposes
 */
export interface ToolMetadata {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string;
    category: ToolCategory;
    keywords: string[];
    relatedTools: string[];
    faqs: FAQ[];
}

export type ToolCategory = 'seo' | 'text' | 'developer' | 'social' | 'web';

export interface FAQ {
    question: string;
    answer: string;
}

// ============================================
// SEO Tools Types
// ============================================

export interface PixelCheckResult {
    text: string;
    pixelWidth: number;
    maxPixelWidth: number;
    characterCount: number;
    maxCharacterCount: number;
    isTruncated: boolean;
    percentUsed: number;
    recommendation: string;
}

export interface MetaTitleResult extends PixelCheckResult {
    desktopPreview: string;
    mobilePreview: string;
}

export interface MetaDescriptionResult extends PixelCheckResult {
    desktopPreview: string;
    mobilePreview: string;
}

export interface RobotsTxtDirective {
    type: 'user-agent' | 'disallow' | 'allow' | 'sitemap' | 'crawl-delay' | 'host' | 'unknown';
    value: string;
    lineNumber: number;
    isValid: boolean;
    error?: string;
}

export interface RobotsTxtResult {
    isValid: boolean;
    directives: RobotsTxtDirective[];
    userAgents: string[];
    sitemaps: string[];
    errors: string[];
    warnings: string[];
}

export interface SitemapResult {
    isValid: boolean;
    urlCount: number;
    urls: string[];
    nestedSitemaps: string[];
    errors: string[];
    lastModDates: string[];
}

export interface CanonicalResult {
    hasCanonical: boolean;
    canonicalUrl: string | null;
    isSelfReferencing: boolean;
    pageUrl: string;
    issues: string[];
    recommendations: string[];
}

export interface HeadingItem {
    level: number;
    text: string;
    index: number;
}

export interface HeadingAnalysisResult {
    headings: HeadingItem[];
    structure: string[];
    hasH1: boolean;
    h1Count: number;
    issues: string[];
    hierarchy: HeadingHierarchy[];
}

export interface HeadingHierarchy {
    level: number;
    text: string;
    children: HeadingHierarchy[];
}

export interface KeywordDensityItem {
    keyword: string;
    count: number;
    density: number;
}

export interface KeywordDensityResult {
    totalWords: number;
    uniqueWords: number;
    singleWords: KeywordDensityItem[];
    twoWordPhrases: KeywordDensityItem[];
    threeWordPhrases: KeywordDensityItem[];
    targetKeyword?: {
        keyword: string;
        count: number;
        density: number;
        recommendation: string;
    };
}

export interface SlugOptimizeResult {
    original: string;
    optimized: string;
    length: number;
    maxRecommendedLength: number;
    changes: string[];
    isOptimal: boolean;
}

export interface SERPPreviewResult {
    title: {
        text: string;
        displayText: string;
        isTruncated: boolean;
        pixelWidth: number;
    };
    description: {
        text: string;
        displayText: string;
        isTruncated: boolean;
        pixelWidth: number;
    };
    url: {
        text: string;
        displayText: string;
    };
    desktop: {
        titleMaxWidth: number;
        descriptionMaxWidth: number;
    };
    mobile: {
        titleMaxWidth: number;
        descriptionMaxWidth: number;
    };
}

export interface RobotsMetaTag {
    name: string;
    content: string;
    directives: string[];
}

export interface NoindexCheckResult {
    hasNoindex: boolean;
    hasNofollow: boolean;
    hasNoarchive: boolean;
    hasNosnippet: boolean;
    metaTags: RobotsMetaTag[];
    xRobotsTag: string | null;
    summary: string[];
    isIndexable: boolean;
}

// ============================================
// Text Tools Types
// ============================================

export interface WordCountResult {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
    readingTimeMinutes: number;
    speakingTimeMinutes: number;
    averageWordLength: number;
    averageSentenceLength: number;
}

export interface CharacterCountResult {
    total: number;
    withoutSpaces: number;
    letters: number;
    numbers: number;
    symbols: number;
    spaces: number;
    platformLimits: PlatformLimit[];
}

export interface PlatformLimit {
    platform: string;
    limit: number;
    remaining: number;
    isWithinLimit: boolean;
    percentUsed: number;
}

export type CaseType =
    | 'uppercase'
    | 'lowercase'
    | 'titlecase'
    | 'sentencecase'
    | 'camelcase'
    | 'pascalcase'
    | 'snakecase'
    | 'kebabcase'
    | 'togglecase';

export interface CaseConvertResult {
    original: string;
    converted: string;
    caseType: CaseType;
}

export interface DuplicateRemoveResult {
    original: string;
    cleaned: string;
    originalLineCount: number;
    uniqueLineCount: number;
    duplicatesRemoved: number;
    duplicateLines: string[];
}

export interface DiffChange {
    type: 'added' | 'removed' | 'unchanged';
    value: string;
    lineNumber?: number;
}

export interface TextDiffResult {
    original: string;
    modified: string;
    changes: DiffChange[];
    additions: number;
    deletions: number;
    unchanged: number;
    similarity: number;
}

export interface WhitespaceCleanResult {
    original: string;
    cleaned: string;
    changesApplied: string[];
    charactersSaved: number;
}

// ============================================
// Developer Tools Types
// ============================================

export interface JSONFormatResult {
    isValid: boolean;
    formatted?: string;
    minified?: string;
    error?: {
        message: string;
        line?: number;
        column?: number;
    };
    stats?: {
        keys: number;
        depth: number;
        arrays: number;
        objects: number;
        strings: number;
        numbers: number;
        booleans: number;
        nulls: number;
    };
}

export interface JSONToCSVResult {
    isValid: boolean;
    csv?: string;
    headers?: string[];
    rowCount?: number;
    error?: string;
}

export interface Base64Result {
    input: string;
    output: string;
    operation: 'encode' | 'decode';
    isValid: boolean;
    error?: string;
    byteSize?: number;
}

export interface URLCodecResult {
    input: string;
    output: string;
    operation: 'encode' | 'decode';
    isValid: boolean;
    error?: string;
}

export interface RegexMatch {
    match: string;
    index: number;
    groups?: Record<string, string>;
}

export interface RegexTestResult {
    isValid: boolean;
    pattern: string;
    flags: string;
    matches: RegexMatch[];
    matchCount: number;
    error?: string;
    testString: string;
}

export interface JWTHeader {
    alg: string;
    typ?: string;
    [key: string]: unknown;
}

export interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
}

export interface JWTDecodeResult {
    isValid: boolean;
    header?: JWTHeader;
    payload?: JWTPayload;
    signature?: string;
    isExpired?: boolean;
    expiresAt?: Date;
    issuedAt?: Date;
    error?: string;
}

// ============================================
// Social Media Tools Types
// ============================================

export interface YouTubeTitleResult {
    text: string;
    length: number;
    maxLength: number;
    remaining: number;
    isWithinLimit: boolean;
    isOptimalLength: boolean;
    optimalRange: { min: number; max: number };
    recommendation: string;
}

export interface YouTubeDescriptionResult {
    text: string;
    length: number;
    maxLength: number;
    remaining: number;
    isWithinLimit: boolean;
    aboveFoldLength: number;
    aboveFoldText: string;
    linkCount: number;
    hashtagCount: number;
    recommendation: string;
}

export interface InstagramBioResult {
    text: string;
    length: number;
    maxLength: number;
    remaining: number;
    isWithinLimit: boolean;
    emojiCount: number;
    lineBreaks: number;
    recommendation: string;
}

export interface TwitterCountResult {
    text: string;
    length: number;
    maxLength: number;
    remaining: number;
    isWithinLimit: boolean;
    urlCount: number;
    urlCharacterReduction: number;
    effectiveLength: number;
    hashtagCount: number;
    mentionCount: number;
    threadCount: number;
}

export interface HashtagResult {
    text: string;
    hashtags: string[];
    count: number;
    uniqueHashtags: string[];
    uniqueCount: number;
    duplicates: string[];
    platformRecommendations: {
        platform: string;
        recommended: number;
        current: number;
        isOptimal: boolean;
    }[];
}

// ============================================
// Web Analysis Tools Types
// ============================================

export interface PageSizeResult {
    totalSize: number;
    totalSizeFormatted: string;
    breakdown: {
        html: number;
        text: number;
        estimatedCompressed: number;
    };
    performance: {
        rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
        loadTimeEstimate: string;
        recommendations: string[];
    };
}

export interface HTTPHeader {
    name: string;
    value: string;
    category: 'general' | 'security' | 'caching' | 'cors' | 'other';
    description?: string;
}

export interface HTTPHeaderResult {
    headers: HTTPHeader[];
    securityScore: number;
    securityIssues: string[];
    cachingInfo: string[];
    rawHeaders: string;
}

export interface UserAgentResult {
    userAgent: string;
    browser: {
        name: string;
        version: string;
        major: string;
    };
    os: {
        name: string;
        version: string;
    };
    device: {
        type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
        vendor?: string;
        model?: string;
    };
    engine: {
        name: string;
        version: string;
    };
    isBot: boolean;
    isMobile: boolean;
}

// ============================================
// Exports
// ============================================

export * from './index';
