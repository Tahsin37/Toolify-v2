'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Image as ImageIcon, CheckCircle2, Zap } from 'lucide-react';

export function ImageToWebp() {
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [converted, setConverted] = React.useState<string | null>(null);
    const [quality, setQuality] = React.useState(85);
    const [originalSize, setOriginalSize] = React.useState(0);
    const [newSize, setNewSize] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setOriginalSize(selectedFile.size);
            setConverted(null);
        }
    };

    const convertToWebp = async () => {
        if (!file) return;
        setLoading(true);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const webpDataUrl = canvas.toDataURL('image/webp', quality / 100);
                setConverted(webpDataUrl);
                // Calculate new size (base64 to bytes approximation)
                const base64Length = webpDataUrl.split(',')[1]?.length || 0;
                setNewSize(Math.round((base64Length * 3) / 4));
            }
            setLoading(false);
        };
        img.src = URL.createObjectURL(file);
    };

    const downloadFile = () => {
        if (!converted) return;
        const link = document.createElement('a');
        link.href = converted;
        const baseName = file?.name.replace(/\.[^.]+$/, '') || 'converted';
        link.download = `${baseName}.webp`;
        link.click();
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const savings = originalSize > 0 && newSize > 0
        ? Math.round(((originalSize - newSize) / originalSize) * 100)
        : 0;

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
                    {file ? file.name : 'Drop any image file here'}
                </p>
                <p className="text-sm text-slate-500">Supports PNG, JPG, GIF, BMP, and more</p>
            </Card>

            {/* Quality Slider */}
            {file && (
                <Card className="p-6 bg-white border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                        WebP Quality: {quality}%
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Smaller file</span>
                        <span>Better quality</span>
                    </div>
                </Card>
            )}

            {/* Convert Button */}
            {file && !converted && (
                <Button
                    onClick={convertToWebp}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                    disabled={loading}
                >
                    {loading ? 'Converting...' : 'Convert to WebP'}
                </Button>
            )}

            {/* Size Comparison */}
            {converted && (
                <Card className="p-5 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Original: {formatSize(originalSize)}</p>
                            <p className="text-sm text-emerald-700 font-medium">WebP: {formatSize(newSize)}</p>
                        </div>
                        {savings > 0 && (
                            <div className="flex items-center text-emerald-700">
                                <Zap className="h-5 w-5 mr-1" />
                                <span className="text-lg font-bold">{savings}% smaller</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Preview */}
            {preview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 bg-white border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" /> Original
                        </h3>
                        <img src={preview} alt="Original" className="w-full rounded-lg" />
                    </Card>

                    {converted && (
                        <Card className="p-4 bg-white border border-emerald-200">
                            <h3 className="text-sm font-medium text-emerald-700 mb-3 flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Converted WebP
                            </h3>
                            <img src={converted} alt="Converted" className="w-full rounded-lg" />
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
                    Download WebP
                </Button>
            )}
        </div>
    );
}
