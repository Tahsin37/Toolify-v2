'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Image as ImageIcon, CheckCircle2, Lock, Unlock } from 'lucide-react';

export function ImageResizer() {
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [converted, setConverted] = React.useState<string | null>(null);
    const [originalWidth, setOriginalWidth] = React.useState(0);
    const [originalHeight, setOriginalHeight] = React.useState(0);
    const [width, setWidth] = React.useState(0);
    const [height, setHeight] = React.useState(0);
    const [lockAspect, setLockAspect] = React.useState(true);
    const [quality, setQuality] = React.useState(90);
    const [loading, setLoading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setConverted(null);

            const img = new Image();
            img.onload = () => {
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setWidth(img.width);
                setHeight(img.height);
                setPreview(URL.createObjectURL(selectedFile));
            };
            img.src = URL.createObjectURL(selectedFile);
        }
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (lockAspect && originalWidth > 0) {
            const ratio = originalHeight / originalWidth;
            setHeight(Math.round(newWidth * ratio));
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        if (lockAspect && originalHeight > 0) {
            const ratio = originalWidth / originalHeight;
            setWidth(Math.round(newHeight * ratio));
        }
    };

    const resizeImage = async () => {
        if (!file) return;
        setLoading(true);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                setConverted(dataUrl);
            }
            setLoading(false);
        };
        img.src = URL.createObjectURL(file);
    };

    const downloadFile = () => {
        if (!converted) return;
        const link = document.createElement('a');
        link.href = converted;
        const baseName = file?.name.replace(/\.[^.]+$/, '') || 'resized';
        link.download = `${baseName}_${width}x${height}.jpg`;
        link.click();
    };

    const presetSizes = [
        { label: '50%', w: Math.round(originalWidth * 0.5), h: Math.round(originalHeight * 0.5) },
        { label: '25%', w: Math.round(originalWidth * 0.25), h: Math.round(originalHeight * 0.25) },
        { label: '1080p', w: 1920, h: 1080 },
        { label: '720p', w: 1280, h: 720 },
        { label: 'Instagram', w: 1080, h: 1080 },
        { label: 'Twitter', w: 1200, h: 675 },
    ];

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-1">
                    {file ? file.name : 'Drop your image here'}
                </p>
                <p className="text-sm text-slate-500">Supports PNG, JPG, WebP, GIF</p>
            </Card>

            {/* Size Controls */}
            {file && (
                <Card className="p-6 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-slate-900">Resize Options</h3>
                        <p className="text-sm text-slate-500">Original: {originalWidth} × {originalHeight}</p>
                    </div>

                    {/* Preset Sizes */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {presetSizes.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="outline"
                                size="sm"
                                onClick={() => { setWidth(preset.w); setHeight(preset.h); }}
                                className="text-xs"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom Size */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Width (px)</label>
                            <Input
                                type="number"
                                value={width}
                                onChange={(e) => handleWidthChange(Number(e.target.value))}
                                className="text-center"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLockAspect(!lockAspect)}
                            className="mt-5"
                        >
                            {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Height (px)</label>
                            <Input
                                type="number"
                                value={height}
                                onChange={(e) => handleHeightChange(Number(e.target.value))}
                                className="text-center"
                            />
                        </div>
                    </div>

                    {/* Quality Slider */}
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Quality: {quality}%</label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </Card>
            )}

            {/* Resize Button */}
            {file && !converted && (
                <Button
                    onClick={resizeImage}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                    disabled={loading || width <= 0 || height <= 0}
                >
                    {loading ? 'Resizing...' : `Resize to ${width} × ${height}`}
                </Button>
            )}

            {/* Preview */}
            {preview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 bg-white border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" /> Original ({originalWidth}×{originalHeight})
                        </h3>
                        <img src={preview} alt="Original" className="w-full rounded-lg" />
                    </Card>

                    {converted && (
                        <Card className="p-4 bg-white border border-emerald-200">
                            <h3 className="text-sm font-medium text-emerald-700 mb-3 flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Resized ({width}×{height})
                            </h3>
                            <img src={converted} alt="Resized" className="w-full rounded-lg" />
                        </Card>
                    )}
                </div>
            )}

            {/* Download Button */}
            {converted && (
                <Button
                    onClick={downloadFile}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Download Resized Image
                </Button>
            )}
        </div>
    );
}
