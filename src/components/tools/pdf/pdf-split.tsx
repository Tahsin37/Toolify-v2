'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Download, Scissors, Loader2, Info } from 'lucide-react';
import JSZip from 'jszip';

export function PdfSplit() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (f: File) => {
        if (f.type !== 'application/pdf') return;
        setFile(f);
        setResultUrl(null);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const count = pdf.getPageCount();
            setPageCount(count);
            setRangeEnd(count);
        } catch (err) {
            console.error('Error loading PDF:', err);
            alert('Invalid or encrypted PDF file.');
            setFile(null);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const splitPDF = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const sourcePdf = await PDFDocument.load(arrayBuffer);
            const totalPages = sourcePdf.getPageCount();

            if (splitMode === 'all') {
                const zip = new JSZip();
                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [page] = await newPdf.copyPages(sourcePdf, [i]);
                    newPdf.addPage(page);
                    const pdfBytes = await newPdf.save();
                    zip.file(`page-${i + 1}.pdf`, pdfBytes);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(zipBlob);
                setResultUrl(url);
            } else {
                const start = Math.max(0, rangeStart - 1);
                const end = Math.min(totalPages, rangeEnd);
                const pageIndices = [];
                for (let i = start; i < end; i++) pageIndices.push(i);

                const newPdf = await PDFDocument.create();
                const pages = await newPdf.copyPages(sourcePdf, pageIndices);
                pages.forEach(page => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setResultUrl(url);
            }
        } catch (err) {
            console.error('Split failed:', err);
            alert('Failed to split PDF.');
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
                onClick={() => document.getElementById('pdf-split-input')?.click()}
            >
                <input
                    id="pdf-split-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Scissors className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
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
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Split Options</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Button
                                variant={splitMode === 'all' ? 'primary' : 'outline'}
                                onClick={() => setSplitMode('all')}
                                className={splitMode === 'all' ? 'bg-indigo-600 hover:bg-indigo-700 text-white flex-1' : 'flex-1'}
                            >
                                Extract All Pages
                            </Button>
                            <Button
                                variant={splitMode === 'range' ? 'primary' : 'outline'}
                                onClick={() => setSplitMode('range')}
                                className={splitMode === 'range' ? 'bg-indigo-600 hover:bg-indigo-700 text-white flex-1' : 'flex-1'}
                            >
                                Select Range
                            </Button>
                        </div>

                        {splitMode === 'range' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Start Page</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={pageCount}
                                        value={rangeStart}
                                        onChange={(e) => setRangeStart(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">End Page</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={pageCount}
                                        value={rangeEnd}
                                        onChange={(e) => setRangeEnd(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}

                        {!resultUrl ? (
                            <Button
                                onClick={splitPDF}
                                disabled={processing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Splitting...
                                    </>
                                ) : (
                                    <>
                                        <Scissors className="h-4 w-4 mr-2" />
                                        Split PDF
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <a href={resultUrl} download={splitMode === 'all' ? 'split-pages.zip' : 'extracted-pages.pdf'} className="flex-1">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download {splitMode === 'all' ? 'ZIP' : 'PDF'}
                                    </Button>
                                </a>
                                <Button variant="outline" onClick={() => { setFile(null); setResultUrl(null); }}>
                                    Start Over
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Split PDF</h4>
                        <p className="text-sm text-blue-700">
                            Extract individual pages or page ranges from your PDF. When extracting all pages,
                            they are downloaded as a ZIP archive. All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
