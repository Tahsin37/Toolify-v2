'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Image as ImageIcon, Upload, Download, Info, Settings, CheckCircle2
} from 'lucide-react';

interface FaviconSize {
    size: number;
    canvas: HTMLCanvasElement | null;
}

export function FaviconGenerator() {
    const [image, setImage] = React.useState<HTMLImageElement | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = React.useState('#ffffff');
    const [rounded, setRounded] = React.useState(0);
    const [padding, setPadding] = React.useState(0);
    const [favicons, setFavicons] = React.useState<FaviconSize[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        const url = URL.createObjectURL(file);
        setPreview(url);

        img.onload = () => {
            setImage(img);
            generateFavicons(img);
        };
        img.src = url;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const input = fileInputRef.current;
            if (input) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

    const generateFavicons = React.useCallback((img: HTMLImageElement) => {
        const generated: FaviconSize[] = sizes.map(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;

            // Background
            ctx.fillStyle = backgroundColor;
            if (rounded > 0) {
                const r = (rounded / 100) * (size / 2);
                ctx.beginPath();
                ctx.roundRect(0, 0, size, size, r);
                ctx.fill();
                ctx.clip();
            } else {
                ctx.fillRect(0, 0, size, size);
            }

            // Draw image with padding
            const paddingPx = (padding / 100) * size;
            const drawSize = size - paddingPx * 2;

            // Maintain aspect ratio
            const scale = Math.min(drawSize / img.width, drawSize / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;

            ctx.drawImage(img, x, y, w, h);

            return { size, canvas };
        });

        setFavicons(generated);
    }, [backgroundColor, rounded, padding]);

    React.useEffect(() => {
        if (image) {
            generateFavicons(image);
        }
    }, [image, backgroundColor, rounded, padding, generateFavicons]);

    const downloadFavicon = (favicon: FaviconSize) => {
        const link = document.createElement('a');
        link.download = `favicon-${favicon.size}x${favicon.size}.png`;
        link.href = favicon.canvas!.toDataURL('image/png');
        link.click();
    };

    const downloadAll = () => {
        favicons.forEach((favicon, i) => {
            setTimeout(() => downloadFavicon(favicon), i * 100);
        });
    };

    const downloadICO = () => {
        // For ICO, we use the 32x32 size as a PNG (browsers accept PNG favicons)
        const favicon32 = favicons.find(f => f.size === 32);
        if (favicon32?.canvas) {
            const link = document.createElement('a');
            link.download = 'favicon.png';
            link.href = favicon32.canvas.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-amber-50/30 hover:border-amber-400 transition-all cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Upload Image
                    </h3>
                    <p className="text-sm text-slate-500">Drop an image or click to browse</p>
                    <p className="text-xs text-slate-400 mt-2">Recommended: Square PNG with transparent background</p>
                </div>
            </Card>

            {/* Settings */}
            {image && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-amber-500" />
                        Favicon Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                Background Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="flex-1 px-3 border border-slate-300 rounded-lg text-sm uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                Rounded Corners: {rounded}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={rounded}
                                onChange={(e) => setRounded(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                Padding: {padding}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={padding}
                                onChange={(e) => setPadding(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Preview */}
            {favicons.length > 0 && (
                <Card className="p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-semibold text-slate-800">Generated Favicons</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={downloadICO}>
                                <Download className="h-4 w-4 mr-1" /> favicon.png
                            </Button>
                            <Button size="sm" onClick={downloadAll} className="bg-amber-600 hover:bg-amber-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {favicons.map((favicon) => (
                            <div key={favicon.size} className="text-center">
                                <div
                                    className="bg-slate-100 rounded-lg p-2 flex items-center justify-center mb-2 cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => downloadFavicon(favicon)}
                                    style={{ minHeight: '80px' }}
                                >
                                    {favicon.canvas && (
                                        <img
                                            src={favicon.canvas.toDataURL()}
                                            alt={`${favicon.size}x${favicon.size}`}
                                            style={{
                                                width: Math.min(favicon.size, 64),
                                                height: Math.min(favicon.size, 64),
                                                imageRendering: favicon.size < 32 ? 'pixelated' : 'auto'
                                            }}
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{favicon.size}px</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Usage Guide */}
            {favicons.length > 0 && (
                <Card className="p-4 bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">How to Use</h4>
                    <pre className="text-xs bg-slate-800 text-slate-100 p-3 rounded-lg overflow-x-auto">
                        {`<!-- Basic favicon -->
<link rel="icon" href="/favicon.png" sizes="32x32">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/favicon-180x180.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">`}
                    </pre>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Favicon Generator</h4>
                        <p className="text-sm text-amber-700">
                            Generate favicons for all devices and platforms. Upload any image and
                            we'll create optimized sizes for browsers, iOS, and Android.
                            All processing happens locally.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
