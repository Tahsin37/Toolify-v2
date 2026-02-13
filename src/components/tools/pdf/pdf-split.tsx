'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Download, File, Scissors, Loader2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

export function PdfSplit() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
    const [range, setRange] = useState('');
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResultUrl(null);
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

    const splitPDF = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdf = await PDFDocument.load(arrayBuffer);
            const zip = new JSZip();

            if (splitMode === 'all') {
                for (let i = 0; i < pdf.getPageCount(); i++) {
                    const newPdf = await PDFDocument.create();
                    const [page] = await newPdf.copyPages(pdf, [i]);
                    newPdf.addPage(page);
                    const pdfBytes = await newPdf.save();
                    zip.file(`${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`, pdfBytes);
                }
            } else {
                // Parse range (e.g., "1-3, 5, 7-9")
                const pagesToExtract = new Set<number>();
                const parts = range.split(',').map(p => p.trim());

                parts.forEach(part => {
                    if (part.includes('-')) {
                        const [start, end] = part.split('-').map(Number);
                        if (!isNaN(start) && !isNaN(end)) {
                            for (let i = start; i <= end; i++) {
                                if (i >= 1 && i <= pageCount) pagesToExtract.add(i - 1);
                            }
                        }
                    } else {
                        const page = Number(part);
                        if (!isNaN(page) && page >= 1 && page <= pageCount) {
                            pagesToExtract.add(page - 1);
                        }
                    }
                });

                if (pagesToExtract.size === 0) throw new Error('Invalid page range');

                const newPdf = await PDFDocument.create();
                const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
                const copiedPages = await newPdf.copyPages(pdf, sortedPages);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                // If single file, download directly
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setResultUrl(url);
                setProcessing(false);
                return; // Skip zip for range/single file
            }

            const zipContent = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipContent);
            setResultUrl(url);

        } catch (err) {
            console.error('Split failed:', err);
            alert('Failed to split PDF. Check your page ranges.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Split PDF</h1>
                <p className="text-slate-500">Extract pages from your PDF documents.</p>
            </div>

            <Card className="p-8 border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                {!file ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-red-100 rounded-full">
                            <Scissors className="w-8 h-8 text-red-600" />
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
                                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                                <File className="w-6 h-6 text-red-500" />
                                <div>
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResultUrl(null); }}>
                                Change
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Button
                                    variant={splitMode === 'all' ? 'primary' : 'outline'}
                                    onClick={() => setSplitMode('all')}
                                    className="flex-1"
                                >
                                    Extract All Pages
                                </Button>
                                <Button
                                    variant={splitMode === 'range' ? 'primary' : 'outline'}
                                    onClick={() => setSplitMode('range')}
                                    className="flex-1"
                                >
                                    Select Range
                                </Button>
                            </div>

                            {splitMode === 'range' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Page Ranges (e.g., 1-3, 5, 8)</label>
                                    <Input
                                        placeholder={`1-${pageCount}`}
                                        value={range}
                                        onChange={(e) => setRange(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Enter page numbers or ranges separated by commas.
                                    </p>
                                </div>
                            )}

                            {!resultUrl ? (
                                <Button
                                    onClick={splitPDF}
                                    disabled={processing || (splitMode === 'range' && !range)}
                                    className="w-full h-12 bg-red-600 hover:bg-red-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Splitting...
                                        </>
                                    ) : (
                                        <>
                                            <Scissors className="mr-2 h-5 w-5" />
                                            Split PDF
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div className="flex gap-4">
                                    <a
                                        href={resultUrl}
                                        download={splitMode === 'all' ? 'split_pages.zip' : 'split_range.pdf'}
                                        className="flex-1"
                                    >
                                        <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
                                            <Download className="mr-2 h-5 w-5" />
                                            Download {splitMode === 'all' ? 'ZIP' : 'PDF'}
                                        </Button>
                                    </a>
                                    <Button variant="outline" onClick={() => { setFile(null); setResultUrl(null); }}>
                                        Start Over
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
