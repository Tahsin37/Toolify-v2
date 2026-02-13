'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Loader2, Info, CheckCircle } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// PDF.js CDN
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const loadScript = (src: string) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve(true);
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(s);
    });
};

export function PdfToWordConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [docBlob, setDocBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await loadScript(`${PDFJS_CDN}/pdf.min.js`);
                // @ts-ignore
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
                setPdfJsLoaded(true);
            } catch (err) {
                console.error('Failed to load PDF.js:', err);
                setError('Failed to load PDF processing library. Please check your internet connection.');
            }
        })();
    }, []);

    const handleFile = useCallback((f: File) => {
        if (f.type === 'application/pdf') {
            setFile(f);
            setError(null);
            setDocBlob(null);
        } else {
            setError('Please upload a valid PDF file.');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const convertToDoc = async () => {
        if (!file || !pdfJsLoaded) return;
        setProcessing(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            // @ts-ignore
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            const pageCount = pdf.numPages;
            const children: any[] = [];

            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const items = textContent.items as any[];

                const lines: { y: number; text: string; fontSize: number }[] = [];

                items.forEach((item: any) => {
                    if (!item.str || !item.str.trim()) return;
                    const y = Math.round(item.transform[5]);
                    const fontSize = Math.abs(item.transform[0]) || 12;
                    const existingLine = lines.find(l => Math.abs(l.y - y) < 5);

                    if (existingLine) {
                        existingLine.text += ' ' + item.str;
                        existingLine.fontSize = Math.max(existingLine.fontSize, fontSize);
                    } else {
                        lines.push({ y, text: item.str, fontSize });
                    }
                });

                lines.sort((a, b) => b.y - a.y);

                lines.forEach(line => {
                    const isHeading = line.fontSize > 14;
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.text,
                                    bold: isHeading,
                                    size: (isHeading ? line.fontSize : (line.fontSize || 12)) * 2,
                                })
                            ],
                            spacing: { after: isHeading ? 200 : 120 },
                        })
                    );
                });

                if (i < pageCount) {
                    children.push(new Paragraph({
                        children: [new TextRun({ break: 1 })],
                        pageBreakBefore: true,
                    }));
                }
            }

            const doc = new Document({
                sections: [{ properties: {}, children }],
            });

            const blob = await Packer.toBlob(doc);
            setDocBlob(blob);
        } catch (err: any) {
            console.error('Conversion failed:', err);
            setError(err.message || 'Failed to convert PDF.');
        } finally {
            setProcessing(false);
        }
    };

    const downloadDoc = () => {
        if (docBlob && file) {
            saveAs(docBlob, file.name.replace(/\.pdf$/i, '.docx'));
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
                onClick={() => document.getElementById('pdf-to-word-input')?.click()}
            >
                <input
                    id="pdf-to-word-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <FileText className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
                </p>
            </Card>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Convert Button */}
            {file && !docBlob && (
                <Button
                    onClick={convertToDoc}
                    disabled={processing || !pdfJsLoaded}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Converting...
                        </>
                    ) : (
                        <>
                            <FileText className="h-5 w-5 mr-2" />
                            Convert to Word
                        </>
                    )}
                </Button>
            )}

            {/* Result */}
            {docBlob && (
                <Card className="p-6 bg-white border border-slate-200">
                    <div className="text-center mb-4">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-slate-800">Conversion Complete!</h3>
                        <p className="text-sm text-slate-500">Your Word document is ready</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={downloadDoc} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Download Word Doc
                        </Button>
                        <Button variant="outline" onClick={() => { setFile(null); setDocBlob(null); }} className="flex-1">
                            Convert Another
                        </Button>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">PDF to Word</h4>
                        <p className="text-sm text-blue-700">
                            Extract text from PDF files and convert to editable Word format with intelligent heading detection.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
