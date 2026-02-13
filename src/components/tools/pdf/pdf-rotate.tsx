'use client';

import React, { useState } from 'react';
import { PDFDocument, RotationTypes } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, File, RotateCw, Loader2, RefreshCw } from 'lucide-react';

export function PdfRotate() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResultUrl(null);
            setRotation(0);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
            } catch (err) {
                console.error('Error loading PDF:', err);
                alert('Invalid or encrypted PDF file.');
                setFile(null);
            }
        }
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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Rotate PDF</h1>
                <p className="text-slate-500">Rotate all pages in your PDF file permanently.</p>
            </div>

            <Card className="p-8 border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                {!file ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-orange-100 rounded-full">
                            <RotateCw className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label
                                htmlFor="pdf-upload"
                                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Select PDF File
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                            <div className="flex items-center space-x-3">
                                <File className="w-6 h-6 text-orange-500" />
                                <div>
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResultUrl(null); }}>
                                Change
                            </Button>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button
                                variant={rotation === 90 ? 'primary' : 'outline'}
                                onClick={() => setRotation(90)}
                            >
                                <RotateCw className="mr-2 h-4 w-4" /> 90° Clockwise
                            </Button>
                            <Button
                                variant={rotation === 180 ? 'primary' : 'outline'}
                                onClick={() => setRotation(180)}
                            >
                                <RotateCw className="mr-2 h-4 w-4" /> 180°
                            </Button>
                            <Button
                                variant={rotation === 270 ? 'primary' : 'outline'}
                                onClick={() => setRotation(270)}
                            >
                                <RotateCw className="mr-2 h-4 w-4" /> 270° Counter-Clockwise
                            </Button>
                        </div>

                        {!resultUrl ? (
                            <Button
                                onClick={rotatePDF}
                                disabled={processing || rotation === 0}
                                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Rotating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        Apply Rotation
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex gap-4">
                                <a href={resultUrl} download="rotated.pdf" className="w-full">
                                    <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Rotated PDF
                                    </Button>
                                </a>
                                <Button variant="outline" onClick={() => { setFile(null); setResultUrl(null); }}>
                                    Start Over
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
