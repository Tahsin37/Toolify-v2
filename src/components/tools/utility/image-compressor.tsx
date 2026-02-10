'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Image as ImageIcon, CheckCircle2, Settings, Trash2, Info } from 'lucide-react';

interface CompressedImage {
    original: File;
    compressed: Blob;
    originalSize: number;
    compressedSize: number;
    preview: string;
}

export function ImageCompressor() {
    const [images, setImages] = React.useState<CompressedImage[]>([]);
    const [quality, setQuality] = React.useState(80);
    const [maxWidth, setMaxWidth] = React.useState(1920);
    const [format, setFormat] = React.useState<'jpeg' | 'webp' | 'png'>('jpeg');
    const [processing, setProcessing] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) processImages(files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) processImages(files);
    };

    const processImages = async (files: File[]) => {
        setProcessing(true);
        const results: CompressedImage[] = [];

        for (const file of files) {
            try {
                const compressed = await compressImage(file);
                results.push(compressed);
            } catch (err) {
                console.error('Error compressing:', file.name, err);
            }
        }

        setImages(prev => [...prev, ...results]);
        setProcessing(false);
    };

    const compressImage = async (file: File): Promise<CompressedImage> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
                const qualityValue = format === 'png' ? undefined : quality / 100;

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve({
                                original: file,
                                compressed: blob,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                preview: URL.createObjectURL(blob),
                            });
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    mimeType,
                    qualityValue
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };

    const recompressAll = async () => {
        if (images.length === 0) return;
        setProcessing(true);
        const files = images.map(img => img.original);
        setImages([]);
        await processImages(files);
    };

    const downloadImage = (img: CompressedImage) => {
        const a = document.createElement('a');
        a.href = img.preview;
        const baseName = img.original.name.split('.').slice(0, -1).join('.');
        a.download = `${baseName}-compressed.${format}`;
        a.click();
    };

    const downloadAll = () => {
        images.forEach((img, i) => {
            setTimeout(() => downloadImage(img), i * 100);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setImages([]);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressed = images.reduce((sum, img) => sum + img.compressedSize, 0);
    const totalSaved = totalOriginal - totalCompressed;
    const savedPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-pink-400 hover:from-pink-50/50 hover:to-rose-50/50 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-pink-100 rounded-2xl mb-4 group-hover:bg-pink-200 transition-colors">
                        <ImageIcon className="h-10 w-10 text-pink-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">
                        Drop images here or click to browse
                    </p>
                    <p className="text-sm text-slate-500">
                        Supports JPG, PNG, WebP, GIF • Multiple files allowed
                    </p>
                </div>
            </Card>

            {/* Settings */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-pink-500" />
                    Compression Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Quality: {quality}%
                        </label>
                        <input
                            type="range"
                            min={10}
                            max={100}
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Smaller</span>
                            <span>Better</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Max Width: {maxWidth}px
                        </label>
                        <input
                            type="range"
                            min={320}
                            max={4096}
                            step={64}
                            value={maxWidth}
                            onChange={(e) => setMaxWidth(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Output Format</label>
                        <div className="grid grid-cols-3 gap-1">
                            {(['jpeg', 'webp', 'png'] as const).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all uppercase ${format === fmt
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {images.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <Button variant="outline" size="sm" onClick={recompressAll} disabled={processing}>
                            Re-compress with new settings
                        </Button>
                    </div>
                )}
            </Card>

            {/* Processing Indicator */}
            {processing && (
                <Card className="p-4 bg-pink-50 border border-pink-200">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-pink-700">Compressing images...</span>
                    </div>
                </Card>
            )}

            {/* Results Summary */}
            {images.length > 0 && (
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-semibold text-emerald-700">
                                {images.length} image{images.length > 1 ? 's' : ''} compressed
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={clearAll}>
                                <Trash2 className="h-4 w-4 mr-1" /> Clear
                            </Button>
                            <Button size="sm" onClick={downloadAll} className="bg-emerald-600 hover:bg-emerald-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Original</p>
                            <p className="text-lg font-bold text-slate-700">{formatSize(totalOriginal)}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Compressed</p>
                            <p className="text-lg font-bold text-emerald-700">{formatSize(totalCompressed)}</p>
                        </div>
                        <div className="bg-emerald-100 rounded-lg p-3">
                            <p className="text-xs text-emerald-600">Saved</p>
                            <p className="text-lg font-bold text-emerald-700">{savedPercent}%</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Image List */}
            {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((img, index) => {
                        const saved = img.originalSize - img.compressedSize;
                        const savedPct = Math.round((saved / img.originalSize) * 100);
                        return (
                            <Card key={index} className="p-3 bg-white border border-slate-200 group">
                                <div className="flex gap-3">
                                    <img
                                        src={img.preview}
                                        alt=""
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {img.original.name}
                                        </p>
                                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                            <span>{formatSize(img.originalSize)} → {formatSize(img.compressedSize)}</span>
                                        </div>
                                        <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded ${savedPct > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {savedPct > 0 ? `-${savedPct}%` : `+${Math.abs(savedPct)}%`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => downloadImage(img)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => removeImage(index)} className="text-red-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Privacy First</h4>
                        <p className="text-sm text-blue-700">
                            All compression happens in your browser. Your images are never uploaded to any server.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
