'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText, Upload, Download, Info, Trash2, GripVertical,
    CheckCircle2, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PDFFile {
    id: string;
    name: string;
    file: File;
    pages: number;
}

export function PdfMerger() {
    const [pdfs, setPdfs] = React.useState<PDFFile[]>([]);
    const [merging, setMerging] = React.useState(false);
    const [merged, setMerged] = React.useState<Blob | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        const newPdfs: PDFFile[] = [];

        for (const file of Array.from(files)) {
            if (file.type !== 'application/pdf') continue;

            try {
                const buffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(buffer);

                newPdfs.push({
                    id: crypto.randomUUID(),
                    name: file.name,
                    file,
                    pages: pdf.getPageCount()
                });
            } catch (err) {
                console.error('Error loading PDF:', file.name, err);
            }
        }

        setPdfs(prev => [...prev, ...newPdfs]);
        setMerged(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const movePdf = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= pdfs.length) return;

        const newPdfs = [...pdfs];
        [newPdfs[index], newPdfs[newIndex]] = [newPdfs[newIndex], newPdfs[index]];
        setPdfs(newPdfs);
        setMerged(null);
    };

    const removePdf = (id: string) => {
        setPdfs(prev => prev.filter(p => p.id !== id));
        setMerged(null);
    };

    const clearAll = () => {
        setPdfs([]);
        setMerged(null);
    };

    const mergePdfs = async () => {
        if (pdfs.length < 2) return;

        setMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdf of pdfs) {
                const buffer = await pdf.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(buffer);
                const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedBytes = await mergedPdf.save();
            const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            setMerged(blob);
        } catch (err) {
            console.error('Error merging PDFs:', err);
        }

        setMerging(false);
    };

    const downloadMerged = () => {
        if (!merged) return;
        const url = URL.createObjectURL(merged);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalPages = pdfs.reduce((sum, pdf) => sum + pdf.pages, 0);

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-rose-50/30 hover:border-rose-400 transition-all cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Upload PDF Files
                    </h3>
                    <p className="text-sm text-slate-500">Drop files here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-2">Select multiple PDFs to merge</p>
                </div>
            </Card>

            {/* PDF List */}
            {pdfs.length > 0 && (
                <Card className="p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                {pdfs.length} PDFs • {totalPages} pages total
                            </h3>
                            <p className="text-xs text-slate-500">Drag to reorder, then merge</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-1" /> Clear All
                        </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                        {pdfs.map((pdf, index) => (
                            <div
                                key={pdf.id}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group"
                            >
                                <GripVertical className="h-4 w-4 text-slate-400" />
                                <div className="w-10 h-10 bg-rose-100 rounded flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-rose-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-700 truncate">{pdf.name}</p>
                                    <p className="text-xs text-slate-500">{pdf.pages} pages</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => movePdf(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => movePdf(index, 'down')}
                                        disabled={index === pdfs.length - 1}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removePdf(pdf.id)}
                                        className="text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={mergePdfs}
                        disabled={pdfs.length < 2 || merging}
                        className="w-full bg-rose-600 hover:bg-rose-700"
                    >
                        {merging ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Merging...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Merge {pdfs.length} PDFs
                            </>
                        )}
                    </Button>
                </Card>
            )}

            {/* Download */}
            {merged && (
                <Card className="p-5 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            <div>
                                <h3 className="font-semibold text-emerald-800">PDFs Merged Successfully!</h3>
                                <p className="text-sm text-emerald-600">{totalPages} pages combined</p>
                            </div>
                        </div>
                        <Button onClick={downloadMerged} className="bg-emerald-600 hover:bg-emerald-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Merged PDF
                        </Button>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-rose-50 border border-rose-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-rose-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-rose-800 mb-1">PDF Merger</h4>
                        <p className="text-sm text-rose-700">
                            Combine multiple PDF files into a single document. Reorder files
                            before merging. All processing happens locally in your browser -
                            files never leave your device.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
