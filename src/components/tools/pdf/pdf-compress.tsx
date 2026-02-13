'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, FileDown, Loader2, Info, Zap } from 'lucide-react';

export function PdfCompress() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ blob: Blob; originalSize: number; compressedSize: number } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (f.type === 'application/pdf') {
            setFile(f);
            setResult(null);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const compressPDF = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            // Strip metadata
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');

            // Save with object streams for smaller size
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

            setResult({
                blob,
                originalSize: file.size,
                compressedSize: blob.size,
            });
        } catch (error) {
            console.error('Compression failed:', error);
            alert('Failed to compress PDF. The file may be corrupted or encrypted.');
        }

        setProcessing(false);
    };

    const downloadResult = () => {
        if (!result) return;
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed-${file?.name || 'document.pdf'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const compressionPercent = result
        ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
        : 0;

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-compress-input')?.click()}
            >
                <input
                    id="pdf-compress-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Upload className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? formatSize(file.size) : 'or click to browse'}
                </p>
            </Card>

            {/* Compress Button */}
            {file && !result && (
                <Button
                    onClick={compressPDF}
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Compressing...
                        </>
                    ) : (
                        <>
                            <Zap className="h-5 w-5 mr-2" />
                            Compress PDF
                        </>
                    )}
                </Button>
            )}

            {/* Result */}
            {result && (
                <Card className="p-6 bg-white border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <FileDown className="h-5 w-5 mr-2 text-emerald-500" />
                        Compression Complete
                    </h3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Original</p>
                            <p className="text-xl font-bold text-slate-800">{formatSize(result.originalSize)}</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <p className="text-xs text-emerald-600 mb-1">Compressed</p>
                            <p className="text-xl font-bold text-emerald-700">{formatSize(result.compressedSize)}</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                            <p className="text-xs text-indigo-600 mb-1">Saved</p>
                            <p className="text-xl font-bold text-indigo-700">{compressionPercent}%</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${100 - compressionPercent}%` }}
                        />
                    </div>

                    <Button onClick={downloadResult} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download Compressed PDF
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">PDF Compression</h4>
                        <p className="text-sm text-blue-700">
                            Reduces file size by stripping metadata, optimizing object storage, and removing unused data.
                            All processing happens in your browser — your files are never uploaded.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
