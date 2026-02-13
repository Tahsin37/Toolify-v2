'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Hash, Loader2, Info } from 'lucide-react';

type Position = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
type NumberFormat = 'plain' | 'page' | 'of' | 'page-of';

const FORMAT_LABELS: Record<NumberFormat, string> = {
    'plain': '1, 2, 3...',
    'page': 'Page 1, Page 2...',
    'of': '1 of N',
    'page-of': 'Page 1 of N',
};

export function PdfPageNumbers() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [position, setPosition] = useState<Position>('bottom-center');
    const [format, setFormat] = useState<NumberFormat>('plain');
    const [fontSize, setFontSize] = useState(12);
    const [startNumber, setStartNumber] = useState(1);
    const [skipFirst, setSkipFirst] = useState(false);
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

    const formatNumber = (pageNum: number, totalPages: number): string => {
        switch (format) {
            case 'plain': return `${pageNum}`;
            case 'page': return `Page ${pageNum}`;
            case 'of': return `${pageNum} of ${totalPages}`;
            case 'page-of': return `Page ${pageNum} of ${totalPages}`;
        }
    };

    const addPageNumbers = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            pages.forEach((page, index) => {
                if (skipFirst && index === 0) return;

                const pageNum = startNumber + index;
                const text = formatNumber(pageNum, totalPages + startNumber - 1);
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const { width, height } = page.getSize();

                let x: number;
                let y: number;
                const margin = 40;

                switch (position) {
                    case 'bottom-left':
                        x = margin; y = 30; break;
                    case 'bottom-center':
                        x = (width - textWidth) / 2; y = 30; break;
                    case 'bottom-right':
                        x = width - textWidth - margin; y = 30; break;
                    case 'top-left':
                        x = margin; y = height - 30; break;
                    case 'top-center':
                        x = (width - textWidth) / 2; y = height - 30; break;
                    case 'top-right':
                        x = width - textWidth - margin; y = height - 30; break;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.3, 0.3, 0.3),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `numbered-${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error adding page numbers:', error);
            alert('Failed to add page numbers.');
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-numbers-input')?.click()}
            >
                <input
                    id="pdf-numbers-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Hash className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
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
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Page Number Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value as Position)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="bottom-center">Bottom Center</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-right">Bottom Right</option>
                                <option value="top-center">Top Center</option>
                                <option value="top-left">Top Left</option>
                                <option value="top-right">Top Right</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Format</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value as NumberFormat)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Font Size</label>
                            <input
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                min={8}
                                max={24}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Start Number</label>
                            <input
                                type="number"
                                value={startNumber}
                                onChange={(e) => setStartNumber(Number(e.target.value))}
                                min={0}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                        <input
                            type="checkbox"
                            checked={skipFirst}
                            onChange={(e) => setSkipFirst(e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Skip first page (cover page)
                    </label>

                    <Button
                        onClick={addPageNumbers}
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding Page Numbers...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Add Page Numbers & Download
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Add Page Numbers</h4>
                        <p className="text-sm text-blue-700">
                            Add page numbers to any PDF. Choose position, format, font size, and more.
                            Processing happens entirely in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
