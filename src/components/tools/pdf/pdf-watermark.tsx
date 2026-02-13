'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Droplets, Loader2, Info } from 'lucide-react';

type WatermarkPosition = 'center' | 'diagonal' | 'tiled';

export function PdfWatermark() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [text, setText] = useState('CONFIDENTIAL');
    const [watermarkFontSize, setWatermarkFontSize] = useState(48);
    const [opacity, setOpacity] = useState(0.15);
    const [color, setColor] = useState('#888888');
    const [rotation, setRotation] = useState(-45);
    const [position, setPosition] = useState<WatermarkPosition>('diagonal');
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (f.type === 'application/pdf') {
            setFile(f);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
    };

    const addWatermark = async () => {
        if (!file || !text.trim()) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            const textColor = hexToRgb(color);

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(text, watermarkFontSize);

                if (position === 'center' || position === 'diagonal') {
                    const x = (width - textWidth) / 2;
                    const y = height / 2;

                    page.drawText(text, {
                        x: position === 'diagonal' ? width / 2 - textWidth / 2 : x,
                        y,
                        size: watermarkFontSize,
                        font,
                        color: textColor,
                        opacity,
                        rotate: position === 'diagonal' ? degrees(rotation) : degrees(0),
                    });
                } else if (position === 'tiled') {
                    const spacingX = textWidth + 80;
                    const spacingY = watermarkFontSize + 80;

                    for (let y = -height; y < height * 2; y += spacingY) {
                        for (let x = -width; x < width * 2; x += spacingX) {
                            page.drawText(text, {
                                x,
                                y,
                                size: watermarkFontSize,
                                font,
                                color: textColor,
                                opacity,
                                rotate: degrees(rotation),
                            });
                        }
                    }
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `watermarked-${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error adding watermark:', error);
            alert('Failed to add watermark.');
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-watermark-input')?.click()}
            >
                <input
                    id="pdf-watermark-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Droplets className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
                </p>
            </Card>

            {/* Settings */}
            {file && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Watermark Settings</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Watermark Text</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter watermark text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Position</label>
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="center">Center</option>
                                    <option value="diagonal">Diagonal</option>
                                    <option value="tiled">Tiled</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Font Size</label>
                                <input
                                    type="number"
                                    value={watermarkFontSize}
                                    onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                                    min={12}
                                    max={120}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-500">{color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Rotation (°)</label>
                                <input
                                    type="number"
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    min={-90}
                                    max={90}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                            <input
                                type="range"
                                min={0.02}
                                max={0.5}
                                step={0.01}
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full accent-teal-600"
                            />
                        </div>

                        {/* Preview box */}
                        <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-lg h-40 flex items-center justify-center overflow-hidden">
                            <span
                                className="font-bold select-none"
                                style={{
                                    fontSize: `${Math.min(watermarkFontSize, 40)}px`,
                                    color,
                                    opacity,
                                    transform: `rotate(${rotation}deg)`,
                                }}
                            >
                                {text || 'Preview'}
                            </span>
                            <span className="absolute bottom-2 right-2 text-xs text-slate-400">Preview</span>
                        </div>
                    </div>

                    <Button
                        onClick={addWatermark}
                        disabled={processing || !text.trim()}
                        className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding Watermark...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Add Watermark & Download
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">PDF Watermark</h4>
                        <p className="text-sm text-blue-700">
                            Add text watermarks to every page of your PDF. Customize position, opacity, color, and rotation.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
