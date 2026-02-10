'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, Palette, RefreshCw } from 'lucide-react';

export function ColorPicker() {
    const [color, setColor] = React.useState('#6366f1');
    const [copied, setCopied] = React.useState<string>('');

    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const rgb = hexToRgb(color);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };

    const formats = {
        hex: color.toUpperCase(),
        rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '',
        rgba: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '',
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
    };

    const copyToClipboard = (format: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(format);
        setTimeout(() => setCopied(''), 2000);
    };

    const generateRandom = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setColor(randomColor);
    };

    // Generate complementary colors
    const complementary = `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`;
    const analogous1 = `hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${hsl.l}%)`;
    const analogous2 = `hsl(${(hsl.h + 330) % 360}, ${hsl.s}%, ${hsl.l}%)`;
    const triadic1 = `hsl(${(hsl.h + 120) % 360}, ${hsl.s}%, ${hsl.l}%)`;
    const triadic2 = `hsl(${(hsl.h + 240) % 360}, ${hsl.s}%, ${hsl.l}%)`;

    return (
        <div className="space-y-6">
            {/* Color Picker */}
            <Card className="p-6 bg-white border border-slate-200">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-32 h-32 rounded-xl cursor-pointer border-4 border-white shadow-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <div
                            className="w-full h-32 rounded-xl shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: color }}
                        >
                            <span
                                className="px-4 py-2 rounded-lg font-mono text-sm font-bold"
                                style={{
                                    color: hsl.l > 50 ? '#000' : '#fff',
                                    backgroundColor: hsl.l > 50 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                {color.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={generateRandom}
                    variant="outline"
                    className="w-full mt-4"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Random Color
                </Button>
            </Card>

            {/* Color Formats */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Color Formats</h3>
                <div className="space-y-3">
                    {Object.entries(formats).map(([format, value]) => (
                        <div
                            key={format}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                            onClick={() => copyToClipboard(format, value)}
                        >
                            <div>
                                <span className="text-xs text-slate-500 uppercase">{format}</span>
                                <p className="font-mono text-sm text-slate-900">{value}</p>
                            </div>
                            {copied === format ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <Copy className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Color Harmonies */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Color Harmonies</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-2">Complementary</p>
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: color }} />
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: complementary }} />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 mb-2">Analogous</p>
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: analogous2 }} />
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: color }} />
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: analogous1 }} />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 mb-2">Triadic</p>
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: color }} />
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: triadic1 }} />
                            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: triadic2 }} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
