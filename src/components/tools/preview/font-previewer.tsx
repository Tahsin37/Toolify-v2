'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Upload, Type, Minus, Plus, Grid, AlignLeft, Download,
    Info, Loader2, Eye, Hash, Palette
} from 'lucide-react';

interface FontInfo {
    name: string;
    family: string;
    style: string;
    weight: string;
    glyphCount?: number;
}

const SAMPLE_TEXTS = [
    'The quick brown fox jumps over the lazy dog.',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '!@#$%^&*()_+-=[]{}|;:\'",.<>?/',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump!',
];

const EXAMPLE_FONTS = [
    // Sans-serif
    { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
    { name: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
    { name: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
    { name: 'Outfit', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
    { name: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap' },
    { name: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Lato', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap' },
    { name: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
    { name: 'Raleway', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap' },
    { name: 'Quicksand', url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap' },
    { name: 'Manrope', url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap' },
    { name: 'Rubik', url: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap' },
    { name: 'Source Sans 3', url: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap' },
    { name: 'Work Sans', url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap' },
    { name: 'DM Sans', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Space Grotesk', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
    // Serif
    { name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
    { name: 'Merriweather', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap' },
    { name: 'Lora', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
    { name: 'PT Serif', url: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap' },
    { name: 'Crimson Text', url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap' },
    { name: 'Libre Baskerville', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap' },
    // Display
    { name: 'Abril Fatface', url: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap' },
    { name: 'Lobster', url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap' },
    { name: 'Pacifico', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
    { name: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap' },
    { name: 'Bebas Neue', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' },
    { name: 'Oswald', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap' },
    // Monospace
    { name: 'Fira Code', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap' },
    { name: 'JetBrains Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap' },
    { name: 'Source Code Pro', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap' },
];

// Character ranges for character map
const CHAR_RANGES = {
    'Basic Latin': { start: 0x0020, end: 0x007E },
    'Latin Extended': { start: 0x00C0, end: 0x00FF },
    'Numbers': { start: 0x0030, end: 0x0039 },
    'Punctuation': { start: 0x0021, end: 0x002F },
};

export function FontPreviewer() {
    const [fontUrl, setFontUrl] = React.useState<string>('');
    const [fontFamily, setFontFamily] = React.useState<string>('');
    const [fontInfo, setFontInfo] = React.useState<FontInfo | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [fontSize, setFontSize] = React.useState(48);
    const [customText, setCustomText] = React.useState('');
    const [showCharMap, setShowCharMap] = React.useState(false);
    const [bgColor, setBgColor] = React.useState('#ffffff');
    const [textColor, setTextColor] = React.useState('#1e293b');
    const [exampleLoaded, setExampleLoaded] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadFont = async (file: File) => {
        setLoading(true);
        setError('');
        setExampleLoaded(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

            // Create font face
            const fontFace = new FontFace(fontName, arrayBuffer);
            await fontFace.load();
            document.fonts.add(fontFace);

            setFontFamily(fontName);
            setFontInfo({
                name: file.name,
                family: fontName,
                style: fontFace.style || 'normal',
                weight: fontFace.weight || '400',
            });

            // Create object URL for download
            const blob = new Blob([arrayBuffer], { type: 'font/ttf' });
            setFontUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error('Font load error:', err);
            setError('Failed to load font. Make sure it\'s a valid TTF, OTF, WOFF, or WOFF2 file.');
        }

        setLoading(false);
    };

    const loadExampleFont = async (font: typeof EXAMPLE_FONTS[0]) => {
        setLoading(true);
        setError('');

        try {
            // Load Google Font via CSS
            const link = document.createElement('link');
            link.href = font.url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Wait for font to load
            await document.fonts.ready;

            setFontFamily(font.name);
            setFontInfo({
                name: font.name,
                family: font.name,
                style: 'normal',
                weight: '400-700',
            });
            setExampleLoaded(font.name);
            setFontUrl('');
        } catch (err) {
            console.error('Example font error:', err);
            setError('Failed to load example font.');
        }

        setLoading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) loadFont(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) loadFont(file);
    };

    const adjustSize = (delta: number) => {
        setFontSize(prev => Math.max(8, Math.min(200, prev + delta)));
    };

    const sizes = [12, 16, 24, 32, 48, 64, 96, 128];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="p-3 bg-white border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        Load Font
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="h-6 w-px bg-slate-200" />

                    {/* Example Fonts */}
                    <span className="text-xs text-slate-500">Examples:</span>
                    {EXAMPLE_FONTS.map(font => (
                        <Button
                            key={font.name}
                            size="sm"
                            variant={exampleLoaded === font.name ? 'primary' : 'outline'}
                            onClick={() => loadExampleFont(font)}
                            className="h-7 text-xs"
                        >
                            {font.name}
                        </Button>
                    ))}

                    <div className="h-6 w-px bg-slate-200" />

                    {/* Size Controls */}
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => adjustSize(-8)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">{fontSize}px</span>
                        <Button size="sm" variant="ghost" onClick={() => adjustSize(8)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <Button
                        size="sm"
                        variant={showCharMap ? 'primary' : 'outline'}
                        onClick={() => setShowCharMap(!showCharMap)}
                    >
                        <Hash className="h-4 w-4 mr-1" />
                        Chars
                    </Button>

                    {/* Colors */}
                    <div className="flex items-center gap-1 ml-2">
                        <label className="flex items-center gap-1 text-xs text-slate-500">
                            BG:
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer"
                            />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                            Text:
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </Card>

            {/* Custom Text Input */}
            <Card className="p-3 bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-slate-400" />
                    <Input
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type custom text to preview..."
                        className="flex-1"
                    />
                </div>
            </Card>

            {/* Font Preview Area */}
            <Card
                className="p-6 min-h-[400px] border border-slate-200 overflow-auto"
                style={{ backgroundColor: bgColor, color: textColor }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {loading && (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                )}

                {!fontFamily && !loading && (
                    <div
                        className="flex flex-col items-center justify-center h-64 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Type className="h-16 w-16 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-400">Drop font file here</p>
                        <p className="text-sm text-slate-400 mt-1">Supports TTF, OTF, WOFF, WOFF2</p>
                        <p className="text-xs text-slate-400 mt-3">or try an example font above</p>
                    </div>
                )}

                {fontFamily && !loading && (
                    <div className="space-y-6">
                        {/* Font Info */}
                        {fontInfo && (
                            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: textColor + '20' }}>
                                <Type className="h-8 w-8" style={{ color: textColor }} />
                                <div>
                                    <h3 className="text-lg font-bold">{fontInfo.family}</h3>
                                    <p className="text-sm opacity-70">
                                        {fontInfo.name} • {fontInfo.style} • Weight: {fontInfo.weight}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Custom Text */}
                        {customText && (
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    fontFamily,
                                    fontSize: `${fontSize}px`,
                                    backgroundColor: textColor + '10',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {customText}
                            </div>
                        )}

                        {/* Sample Texts */}
                        <div className="space-y-4">
                            {SAMPLE_TEXTS.map((text, i) => (
                                <div
                                    key={i}
                                    style={{
                                        fontFamily,
                                        fontSize: i === 0 ? `${fontSize}px` : `${Math.max(16, fontSize * 0.5)}px`,
                                        lineHeight: 1.4
                                    }}
                                >
                                    {text}
                                </div>
                            ))}
                        </div>

                        {/* Size Preview */}
                        <div className="pt-4 border-t" style={{ borderColor: textColor + '20' }}>
                            <p className="text-sm opacity-70 mb-3">Size Samples:</p>
                            <div className="space-y-2">
                                {sizes.map(size => (
                                    <div
                                        key={size}
                                        className="flex items-baseline gap-3"
                                        style={{ fontFamily }}
                                    >
                                        <span className="text-xs opacity-50 w-12">{size}px</span>
                                        <span style={{ fontSize: `${size}px` }}>
                                            The quick brown fox
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Character Map */}
                        {showCharMap && (
                            <div className="pt-4 border-t" style={{ borderColor: textColor + '20' }}>
                                <p className="text-sm opacity-70 mb-3">Character Map:</p>
                                {Object.entries(CHAR_RANGES).map(([name, range]) => (
                                    <div key={name} className="mb-4">
                                        <p className="text-xs opacity-50 mb-2">{name}</p>
                                        <div
                                            className="flex flex-wrap gap-1"
                                            style={{ fontFamily, fontSize: '24px' }}
                                        >
                                            {Array.from({ length: range.end - range.start + 1 }, (_, i) => (
                                                <span
                                                    key={i}
                                                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-black/10"
                                                    title={`U+${(range.start + i).toString(16).toUpperCase().padStart(4, '0')}`}
                                                >
                                                    {String.fromCharCode(range.start + i)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700">{error}</p>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-emerald-800 mb-1">Font Previewer</h4>
                        <p className="text-sm text-emerald-700">
                            Preview any font file before installing. Supports TrueType (TTF), OpenType (OTF),
                            and Web Open Font Format (WOFF/WOFF2). View character maps, test custom text,
                            and compare sizes - all in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
