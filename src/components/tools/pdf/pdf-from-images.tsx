'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Image, X, ArrowUp, ArrowDown, Loader2, Info } from 'lucide-react';

interface ImageItem {
    file: File;
    preview: string;
}

const PAGE_SIZES = {
    'A4': PageSizes.A4,
    'Letter': PageSizes.Letter,
    'Legal': PageSizes.Legal,
    'Fit to Image': null,
} as const;

export function PdfFromImages() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
    const [margin, setMargin] = useState(20);
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = useCallback((fileList: FileList) => {
        const newImages: ImageItem[] = [];
        Array.from(fileList).forEach((file) => {
            if (file.type.startsWith('image/')) {
                newImages.push({ file, preview: URL.createObjectURL(file) });
            }
        });
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const removeImage = (index: number) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        setImages((prev) => {
            const arr = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= arr.length) return prev;
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            return arr;
        });
    };

    const createPDF = async () => {
        if (images.length === 0) return;
        setProcessing(true);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const img of images) {
                const arrayBuffer = await img.file.arrayBuffer() as ArrayBuffer;
                let embeddedImage;

                if (img.file.type === 'image/png') {
                    embeddedImage = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    // Convert to JPG via canvas for non-PNG formats
                    try {
                        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
                    } catch {
                        // If JPG embed fails, convert via canvas
                        const bitmap = await createImageBitmap(img.file);
                        const canvas = document.createElement('canvas');
                        canvas.width = bitmap.width;
                        canvas.height = bitmap.height;
                        const ctx = canvas.getContext('2d')!;
                        ctx.drawImage(bitmap, 0, 0);
                        const jpgBlob = await new Promise<Blob>((resolve) =>
                            canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
                        );
                        const jpgBuffer = await jpgBlob.arrayBuffer() as ArrayBuffer;
                        embeddedImage = await pdfDoc.embedJpg(jpgBuffer);
                    }
                }

                const imgWidth = embeddedImage.width;
                const imgHeight = embeddedImage.height;

                let pageWidth: number;
                let pageHeight: number;

                const selectedSize = PAGE_SIZES[pageSize];

                if (selectedSize === null) {
                    // Fit to image
                    pageWidth = imgWidth + margin * 2;
                    pageHeight = imgHeight + margin * 2;
                } else {
                    pageWidth = selectedSize[0];
                    pageHeight = selectedSize[1];

                    if (orientation === 'landscape') {
                        [pageWidth, pageHeight] = [pageHeight, pageWidth];
                    } else if (orientation === 'auto') {
                        if (imgWidth > imgHeight) {
                            [pageWidth, pageHeight] = [Math.max(pageWidth, pageHeight), Math.min(pageWidth, pageHeight)];
                        } else {
                            [pageWidth, pageHeight] = [Math.min(pageWidth, pageHeight), Math.max(pageWidth, pageHeight)];
                        }
                    }
                }

                const page = pdfDoc.addPage([pageWidth, pageHeight]);

                // Scale image to fit within page margins
                const maxW = pageWidth - margin * 2;
                const maxH = pageHeight - margin * 2;
                const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
                const scaledW = imgWidth * scale;
                const scaledH = imgHeight * scale;

                // Center image
                const x = (pageWidth - scaledW) / 2;
                const y = (pageHeight - scaledH) / 2;

                page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: scaledW,
                    height: scaledH,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'images-to-pdf.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('Failed to create PDF from images.');
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('img-to-pdf-input')?.click()}
            >
                <input
                    id="img-to-pdf-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <Image className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">Drop images here</p>
                <p className="text-sm text-slate-500">JPG, PNG, WebP — drag multiple files or click to browse</p>
            </Card>

            {/* Settings */}
            {images.length > 0 && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Page Size</label>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value as any)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                {Object.keys(PAGE_SIZES).map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Orientation</label>
                            <select
                                value={orientation}
                                onChange={(e) => setOrientation(e.target.value as any)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                disabled={pageSize === 'Fit to Image'}
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                                <option value="auto">Auto (match image)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Margin (px)</label>
                            <input
                                type="number"
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                                min={0}
                                max={100}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Image List */}
            {images.length > 0 && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">
                        {images.length} image{images.length > 1 ? 's' : ''} selected
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {images.map((img, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                <img
                                    src={img.preview}
                                    alt={img.file.name}
                                    className="w-12 h-12 object-cover rounded border border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{img.file.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {(img.file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => moveImage(i, 'up')}
                                        disabled={i === 0}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveImage(i, 'down')}
                                        disabled={i === images.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => removeImage(i)} className="p-1 text-red-400 hover:text-red-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={createPDF}
                        disabled={processing}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Convert to PDF
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Image to PDF</h4>
                        <p className="text-sm text-blue-700">
                            Convert multiple images into a single PDF. Drag to reorder pages.
                            Supports JPG, PNG, and WebP formats. All processing happens locally.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
