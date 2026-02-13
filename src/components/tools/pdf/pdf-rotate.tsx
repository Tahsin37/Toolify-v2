'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RotateCw, Loader2, Info, RefreshCw } from 'lucide-react';

export function PdfRotate() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [rotation, setRotation] = useState<number>(0);
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (f: File) => {
        if (f.type !== 'application/pdf') return;
        setFile(f);
        setResultUrl(null);
        setRotation(0);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setPageCount(pdf.getPageCount());
        } catch (err) {
            console.error('Error loading PDF:', err);
            alert('Invalid or encrypted PDF file.');
            setFile(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const rotatePDF = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = pdf.getPages();

            pages.forEach(page => {
                const currentRotation = page.getRotation().angle;
                page.setRotation({ angle: (currentRotation + rotation) % 360 } as any);
            });

            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
        } catch (err) {
            console.error('Rotation failed:', err);
            alert('Failed to rotate PDF.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-rotate-input')?.click()}
            >
                <input
                    id="pdf-rotate-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <RotateCw className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${pageCount} pages • ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
                </p>
            </Card>

            {/* Settings */}
            {file && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Rotation Options</h3>

                    <div className="flex justify-center gap-3 mb-4">
                        <Button
                            variant={rotation === 90 ? 'primary' : 'outline'}
                            onClick={() => setRotation(90)}
                            className={rotation === 90 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                        >
                            <RotateCw className="mr-2 h-4 w-4" /> 90° CW
                        </Button>
                        <Button
                            variant={rotation === 180 ? 'primary' : 'outline'}
                            onClick={() => setRotation(180)}
                            className={rotation === 180 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                        >
                            <RotateCw className="mr-2 h-4 w-4" /> 180°
                        </Button>
                        <Button
                            variant={rotation === 270 ? 'primary' : 'outline'}
                            onClick={() => setRotation(270)}
                            className={rotation === 270 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                        >
                            <RotateCw className="mr-2 h-4 w-4" /> 270° CCW
                        </Button>
                    </div>

                    {!resultUrl ? (
                        <Button
                            onClick={rotatePDF}
                            disabled={processing || rotation === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rotating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Apply Rotation
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <a href={resultUrl} download="rotated.pdf" className="flex-1">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Rotated PDF
                                </Button>
                            </a>
                            <Button variant="outline" onClick={() => { setFile(null); setResultUrl(null); }}>
                                Start Over
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Rotate PDF</h4>
                        <p className="text-sm text-blue-700">
                            Rotate all pages in your PDF file permanently. Choose 90°, 180°, or 270° rotation.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
