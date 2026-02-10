'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRCode from 'qrcode';
import { Download, QrCode, RefreshCw, Copy, CheckCircle2, Image, FileCode, Settings, Shield } from 'lucide-react';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type OutputFormat = 'png' | 'svg';

export function QrGenerator() {
    const [text, setText] = React.useState('https://zylotools.com');
    const [size, setSize] = React.useState(300);
    const [bgColor, setBgColor] = React.useState('#ffffff');
    const [fgColor, setFgColor] = React.useState('#000000');
    const [errorCorrection, setErrorCorrection] = React.useState<ErrorCorrectionLevel>('H');
    const [format, setFormat] = React.useState<OutputFormat>('png');
    const [margin, setMargin] = React.useState(2);
    const [qrDataUrl, setQrDataUrl] = React.useState('');
    const [svgString, setSvgString] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [generating, setGenerating] = React.useState(false);
    const [error, setError] = React.useState('');

    const generateQR = React.useCallback(async () => {
        if (!text.trim()) {
            setQrDataUrl('');
            setSvgString('');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            if (format === 'png') {
                const dataUrl = await QRCode.toDataURL(text, {
                    width: size,
                    margin: margin,
                    color: {
                        dark: fgColor,
                        light: bgColor,
                    },
                    errorCorrectionLevel: errorCorrection,
                });
                setQrDataUrl(dataUrl);
                setSvgString('');
            } else {
                const svg = await QRCode.toString(text, {
                    type: 'svg',
                    width: size,
                    margin: margin,
                    color: {
                        dark: fgColor,
                        light: bgColor,
                    },
                    errorCorrectionLevel: errorCorrection,
                });
                setSvgString(svg);
                setQrDataUrl('');
            }
        } catch (err) {
            setError('Failed to generate QR code. Please check your input.');
            console.error('QR generation error:', err);
        }

        setGenerating(false);
    }, [text, size, bgColor, fgColor, errorCorrection, format, margin]);

    React.useEffect(() => {
        const debounce = setTimeout(() => {
            generateQR();
        }, 300);
        return () => clearTimeout(debounce);
    }, [generateQR]);

    const downloadQR = () => {
        if (format === 'png' && qrDataUrl) {
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now()}.png`;
            link.href = qrDataUrl;
            link.click();
        } else if (format === 'svg' && svgString) {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now()}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const copyToClipboard = async () => {
        try {
            if (format === 'svg' && svgString) {
                await navigator.clipboard.writeText(svgString);
            } else if (qrDataUrl) {
                await navigator.clipboard.writeText(qrDataUrl);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const errorLevelDescriptions: Record<ErrorCorrectionLevel, string> = {
        L: '~7% recovery',
        M: '~15% recovery',
        Q: '~25% recovery',
        H: '~30% recovery',
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-5 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                    <QrCode className="inline h-4 w-4 mr-2 text-indigo-500" />
                    Content to Encode
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter URL, text, email, phone, or any data..."
                    className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{text.length} characters</span>
                    <span>Max: 2,953 characters</span>
                </div>
            </Card>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format & Size */}
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Image className="h-4 w-4 mr-2 text-indigo-500" />
                        Output Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Format</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setFormat('png')}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${format === 'png'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    PNG Image
                                </button>
                                <button
                                    onClick={() => setFormat('svg')}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${format === 'svg'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    SVG Vector
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                Size: {size}x{size}px
                            </label>
                            <input
                                type="range"
                                min={100}
                                max={1000}
                                step={50}
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                Margin: {margin} modules
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </Card>

                {/* Colors & Error Correction */}
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                        Customization
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Foreground</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                    />
                                    <Input
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="flex-1 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                    />
                                    <Input
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="flex-1 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                Error Correction Level
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setErrorCorrection(level)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${errorCorrection === level
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        title={errorLevelDescriptions[level]}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {errorLevelDescriptions[errorCorrection]} - Higher = more damage resistant
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </Card>
            )}

            {/* QR Preview */}
            {(qrDataUrl || svgString) && (
                <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                    <div className="flex flex-col items-center">
                        <div
                            className="p-6 bg-white rounded-2xl shadow-xl"
                            style={{ backgroundColor: bgColor }}
                        >
                            {format === 'png' && qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    className="max-w-full"
                                    style={{ width: Math.min(size, 280), height: Math.min(size, 280) }}
                                />
                            ) : svgString ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgString }}
                                    style={{ width: Math.min(size, 280), height: Math.min(size, 280) }}
                                />
                            ) : null}
                        </div>
                        <p className="text-sm text-slate-500 mt-4 text-center max-w-sm truncate font-mono">
                            {text}
                        </p>
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            {(qrDataUrl || svgString) && (
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={downloadQR}
                        className="h-12 bg-indigo-600 hover:bg-indigo-700 text-base font-medium"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download {format.toUpperCase()}
                    </Button>
                    <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="h-12 text-base font-medium"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5 mr-2" />
                                Copy {format === 'svg' ? 'SVG' : 'Data URL'}
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use high contrast colors for better scanning</li>
                        <li>• SVG format scales infinitely for print</li>
                        <li>• Higher error correction allows logo overlays</li>
                    </ul>
                </Card>
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-2">✅ Supported Content</h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• URLs, Text, Email, Phone numbers</li>
                        <li>• WiFi credentials, vCards, Calendar events</li>
                        <li>• Any text up to 2,953 characters</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
