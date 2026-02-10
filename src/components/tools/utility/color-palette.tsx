'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Palette, Copy, CheckCircle2, Info, RefreshCw, Lock, Unlock, Download
} from 'lucide-react';

interface Color {
    hex: string;
    locked: boolean;
}

export function ColorPaletteGenerator() {
    const [colors, setColors] = React.useState<Color[]>([]);
    const [copied, setCopied] = React.useState<string | null>(null);
    const [harmony, setHarmony] = React.useState<'random' | 'analogous' | 'complementary' | 'triadic'>('random');

    const hslToHex = (h: number, s: number, l: number): string => {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
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

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const generateRandomColor = (): string => {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 40) + 40; // 40-80%
        const l = Math.floor(Math.random() * 40) + 30; // 30-70%
        return hslToHex(h, s, l);
    };

    const generatePalette = React.useCallback(() => {
        const baseHue = Math.floor(Math.random() * 360);
        let newColors: Color[];

        switch (harmony) {
            case 'analogous':
                newColors = Array.from({ length: 5 }, (_, i) => ({
                    hex: hslToHex((baseHue + (i - 2) * 30 + 360) % 360, 60 + Math.random() * 20, 40 + Math.random() * 30),
                    locked: false
                }));
                break;

            case 'complementary':
                newColors = [
                    { hex: hslToHex(baseHue, 70, 45), locked: false },
                    { hex: hslToHex(baseHue, 50, 60), locked: false },
                    { hex: hslToHex(baseHue, 40, 75), locked: false },
                    { hex: hslToHex((baseHue + 180) % 360, 50, 60), locked: false },
                    { hex: hslToHex((baseHue + 180) % 360, 70, 45), locked: false },
                ];
                break;

            case 'triadic':
                newColors = [
                    { hex: hslToHex(baseHue, 70, 50), locked: false },
                    { hex: hslToHex((baseHue + 120) % 360, 60, 55), locked: false },
                    { hex: hslToHex((baseHue + 240) % 360, 60, 55), locked: false },
                    { hex: hslToHex(baseHue, 40, 70), locked: false },
                    { hex: hslToHex((baseHue + 120) % 360, 40, 70), locked: false },
                ];
                break;

            default:
                newColors = Array.from({ length: 5 }, () => ({
                    hex: generateRandomColor(),
                    locked: false
                }));
        }

        // Preserve locked colors
        setColors(prev => {
            if (prev.length === 0) return newColors;
            return newColors.map((color, i) => prev[i]?.locked ? prev[i] : color);
        });
    }, [harmony]);

    React.useEffect(() => {
        generatePalette();
    }, []);

    const toggleLock = (index: number) => {
        setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
    };

    const copyColor = async (hex: string) => {
        await navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = async () => {
        const text = colors.map(c => c.hex).join(', ');
        await navigator.clipboard.writeText(text);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    const exportCSS = () => {
        const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'palette.css';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getContrastColor = (hex: string): string => {
        const { l } = hexToHsl(hex);
        return l > 55 ? '#000000' : '#ffffff';
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Harmony:</span>
                        <div className="flex gap-1">
                            {(['random', 'analogous', 'complementary', 'triadic'] as const).map((h) => (
                                <button
                                    key={h}
                                    onClick={() => { setHarmony(h); generatePalette(); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${harmony === h
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyAll}>
                            {copied === 'all' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-1">Copy All</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportCSS}>
                            <Download className="h-4 w-4 mr-1" /> CSS
                        </Button>
                        <Button onClick={generatePalette} className="bg-indigo-600 hover:bg-indigo-700">
                            <RefreshCw className="h-4 w-4 mr-1" /> Generate
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Palette Display */}
            <div className="grid grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-lg">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="h-48 flex flex-col items-center justify-end p-4 transition-all hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex)}
                    >
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleLock(index); }}
                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                            >
                                {color.locked ? (
                                    <Lock className="h-4 w-4" style={{ color: getContrastColor(color.hex) }} />
                                ) : (
                                    <Unlock className="h-4 w-4" style={{ color: getContrastColor(color.hex) }} />
                                )}
                            </button>
                        </div>
                        <p
                            className="font-mono text-sm font-medium uppercase"
                            style={{ color: getContrastColor(color.hex) }}
                        >
                            {copied === color.hex ? '✓ Copied!' : color.hex}
                        </p>
                    </div>
                ))}
            </div>

            {/* Color Details */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                    <Palette className="h-4 w-4 mr-2 text-indigo-500" />
                    Color Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {colors.map((color, index) => {
                        const hsl = hexToHsl(color.hex);
                        return (
                            <div key={index} className="p-3 bg-slate-50 rounded-lg text-center">
                                <div
                                    className="w-8 h-8 rounded-lg mx-auto mb-2"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <p className="font-mono text-xs text-slate-800 uppercase">{color.hex}</p>
                                <p className="text-xs text-slate-500">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Color Palette Generator</h4>
                        <p className="text-sm text-indigo-700">
                            Generate beautiful color palettes with different harmony types.
                            Click a color to copy, lock colors to keep them when regenerating,
                            and export as CSS variables.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
