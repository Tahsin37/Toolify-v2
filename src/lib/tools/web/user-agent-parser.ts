/**
 * Browser User-Agent Parser
 * 
 * Parses user agent strings to identify browser, OS, and device.
 */

import type { ToolResult, UserAgentResult } from '@/lib/types';

export interface UserAgentInput {
    userAgent: string;
}

/**
 * Parse user agent string
 */
export function parseUserAgent(input: UserAgentInput): ToolResult<UserAgentResult> {
    const startTime = performance.now();

    const { userAgent } = input;

    if (!userAgent || userAgent.trim().length === 0) {
        return {
            success: false,
            error: 'User agent string is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Detect browser
    const browser = detectBrowser(userAgent);

    // Detect OS
    const os = detectOS(userAgent);

    // Detect device type
    const device = detectDevice(userAgent);

    // Detect engine
    const engine = detectEngine(userAgent);

    // Check if bot
    const isBot = detectBot(userAgent);

    // Check if mobile
    const isMobile = device.type === 'mobile' || device.type === 'tablet';

    return {
        success: true,
        data: {
            userAgent,
            browser,
            os,
            device,
            engine,
            isBot,
            isMobile,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Detect browser from user agent
 */
function detectBrowser(ua: string): { name: string; version: string; major: string } {
    const browsers: Array<{ name: string; pattern: RegExp }> = [
        { name: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+)\.(\d+)/ },
        { name: 'Chrome', pattern: /(?:Chrome|CriOS)\/(\d+)\.(\d+)/ },
        { name: 'Firefox', pattern: /(?:Firefox|FxiOS)\/(\d+)\.(\d+)/ },
        { name: 'Safari', pattern: /Version\/(\d+)\.(\d+).*Safari/ },
        { name: 'Opera', pattern: /(?:Opera|OPR)\/(\d+)\.(\d+)/ },
        { name: 'IE', pattern: /(?:MSIE |rv:)(\d+)\.(\d+)/ },
        { name: 'Samsung', pattern: /SamsungBrowser\/(\d+)\.(\d+)/ },
        { name: 'UC Browser', pattern: /UCBrowser\/(\d+)\.(\d+)/ },
    ];

    for (const { name, pattern } of browsers) {
        const match = ua.match(pattern);
        if (match) {
            return {
                name,
                version: `${match[1]}.${match[2]}`,
                major: match[1],
            };
        }
    }

    return { name: 'Unknown', version: '', major: '' };
}

/**
 * Detect OS from user agent
 */
function detectOS(ua: string): { name: string; version: string } {
    const osList: Array<{ name: string; pattern: RegExp; versionPattern?: RegExp }> = [
        { name: 'Windows 11', pattern: /Windows NT 10\.0.*Win64/ },
        { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
        { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
        { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
        { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
        { name: 'Windows', pattern: /Windows NT (\d+\.\d+)/ },
        { name: 'macOS', pattern: /Mac OS X (\d+[._]\d+)/ },
        { name: 'iOS', pattern: /(?:iPhone|iPad|iPod).*OS (\d+[._]\d+)/ },
        { name: 'Android', pattern: /Android (\d+\.?\d*)/ },
        { name: 'Linux', pattern: /Linux/ },
        { name: 'Chrome OS', pattern: /CrOS/ },
        { name: 'Ubuntu', pattern: /Ubuntu/ },
    ];

    for (const { name, pattern } of osList) {
        const match = ua.match(pattern);
        if (match) {
            const version = match[1] ? match[1].replace(/_/g, '.') : '';
            return { name, version };
        }
    }

    return { name: 'Unknown', version: '' };
}

/**
 * Detect device type from user agent
 */
function detectDevice(ua: string): {
    type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
    vendor?: string;
    model?: string;
} {
    // Check for bots first
    if (detectBot(ua)) {
        return { type: 'bot' };
    }

    // Check for tablets
    if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
        return {
            type: 'tablet',
            vendor: detectVendor(ua),
            model: detectModel(ua),
        };
    }

    // Check for mobile
    if (/Mobile|iPhone|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
        return {
            type: 'mobile',
            vendor: detectVendor(ua),
            model: detectModel(ua),
        };
    }

    // Default to desktop
    return { type: 'desktop' };
}

/**
 * Detect rendering engine
 */
function detectEngine(ua: string): { name: string; version: string } {
    const engines: Array<{ name: string; pattern: RegExp }> = [
        { name: 'Blink', pattern: /Chrome\/(\d+)/ },
        { name: 'WebKit', pattern: /AppleWebKit\/(\d+\.?\d*)/ },
        { name: 'Gecko', pattern: /Gecko\/(\d+)/ },
        { name: 'Trident', pattern: /Trident\/(\d+\.?\d*)/ },
        { name: 'Presto', pattern: /Presto\/(\d+\.?\d*)/ },
    ];

    for (const { name, pattern } of engines) {
        const match = ua.match(pattern);
        if (match) {
            return { name, version: match[1] };
        }
    }

    return { name: 'Unknown', version: '' };
}

/**
 * Detect if user agent is a bot
 */
function detectBot(ua: string): boolean {
    const botPatterns = [
        /bot/i,
        /spider/i,
        /crawl/i,
        /slurp/i,
        /mediapartners/i,
        /googlebot/i,
        /bingbot/i,
        /yandexbot/i,
        /baiduspider/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i,
        /whatsapp/i,
        /telegram/i,
        /curl/i,
        /wget/i,
        /python-requests/i,
        /axios/i,
        /node-fetch/i,
    ];

    return botPatterns.some(pattern => pattern.test(ua));
}

/**
 * Detect device vendor
 */
function detectVendor(ua: string): string {
    if (/iPhone|iPad|iPod|Mac/i.test(ua)) return 'Apple';
    if (/Samsung/i.test(ua)) return 'Samsung';
    if (/Huawei/i.test(ua)) return 'Huawei';
    if (/Xiaomi|Mi\s/i.test(ua)) return 'Xiaomi';
    if (/OPPO/i.test(ua)) return 'OPPO';
    if (/vivo/i.test(ua)) return 'Vivo';
    if (/OnePlus/i.test(ua)) return 'OnePlus';
    if (/Google|Pixel/i.test(ua)) return 'Google';
    if (/LG/i.test(ua)) return 'LG';
    if (/Sony/i.test(ua)) return 'Sony';
    if (/HTC/i.test(ua)) return 'HTC';
    if (/Nokia/i.test(ua)) return 'Nokia';
    if (/Motorola/i.test(ua)) return 'Motorola';
    return '';
}

/**
 * Detect device model
 */
function detectModel(ua: string): string {
    // iPhone models
    const iphoneMatch = ua.match(/iPhone(\d+),(\d+)/);
    if (iphoneMatch) {
        return `iPhone ${iphoneMatch[1]},${iphoneMatch[2]}`;
    }

    // iPad models
    if (/iPad/.test(ua)) {
        return 'iPad';
    }

    // Android device model (usually in Build/MODEL format)
    const androidMatch = ua.match(/;\s*([^;)]+)\s*Build/);
    if (androidMatch) {
        return androidMatch[1].trim();
    }

    return '';
}

/**
 * Get common user agents
 */
export function getCommonUserAgents(): Array<{ name: string; userAgent: string }> {
    return [
        {
            name: 'Chrome on Windows',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        {
            name: 'Chrome on macOS',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        {
            name: 'Safari on macOS',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        },
        {
            name: 'Safari on iPhone',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        },
        {
            name: 'Chrome on Android',
            userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
        {
            name: 'Firefox on Windows',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        },
        {
            name: 'Googlebot',
            userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
        {
            name: 'Bingbot',
            userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        },
    ];
}

/**
 * Compare two user agents
 */
export function compareUserAgents(ua1: string, ua2: string): {
    sameBrowser: boolean;
    sameOS: boolean;
    sameDevice: boolean;
    differences: string[];
} {
    const parsed1 = parseUserAgent({ userAgent: ua1 });
    const parsed2 = parseUserAgent({ userAgent: ua2 });

    if (!parsed1.success || !parsed2.success || !parsed1.data || !parsed2.data) {
        return {
            sameBrowser: false,
            sameOS: false,
            sameDevice: false,
            differences: ['Unable to parse one or both user agents'],
        };
    }

    const d1 = parsed1.data;
    const d2 = parsed2.data;

    const differences: string[] = [];

    const sameBrowser = d1.browser.name === d2.browser.name;
    if (!sameBrowser) {
        differences.push(`Browser: ${d1.browser.name} vs ${d2.browser.name}`);
    } else if (d1.browser.major !== d2.browser.major) {
        differences.push(`Browser version: ${d1.browser.version} vs ${d2.browser.version}`);
    }

    const sameOS = d1.os.name === d2.os.name;
    if (!sameOS) {
        differences.push(`OS: ${d1.os.name} vs ${d2.os.name}`);
    } else if (d1.os.version !== d2.os.version) {
        differences.push(`OS version: ${d1.os.version} vs ${d2.os.version}`);
    }

    const sameDevice = d1.device.type === d2.device.type;
    if (!sameDevice) {
        differences.push(`Device: ${d1.device.type} vs ${d2.device.type}`);
    }

    return {
        sameBrowser,
        sameOS,
        sameDevice,
        differences,
    };
}
