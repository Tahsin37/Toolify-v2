'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, File, X, ArrowUp, ArrowDown, Layers, Loader2, Info } from 'lucide-react';

export function PdfMerge() {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = (fileList: FileList) => {
        const pdfFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            setFiles(prev => [...prev, ...pdfFiles]);
            setResultUrl(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        setFiles(prev => {
            const arr = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= arr.length) return prev;
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            return arr;
        });
    };

    const mergePDFs = async () => {
        if (files.length < 2) return;
        setProcessing(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
                const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
        } catch (err) {
            console.error('Merge failed:', err);
            alert('Failed to merge PDFs.');
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
                onClick={() => document.getElementById('pdf-merge-input')?.click()}
            >
                <input
                    id="pdf-merge-input"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <Layers className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    Drop your PDF files here
                </p>
                <p className="text-sm text-slate-500">
                    or click to browse — select multiple files
                </p>
            </Card>

            {/* File List */}
            {files.length > 0 && (
                <Card className="p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            {files.length} file{files.length > 1 ? 's' : ''} selected
                        </h3>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setFiles([])}>
                            Clear All
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                        {files.map((file, i) => (
                            <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                                    <File className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveFile(i, 'up')} disabled={i === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => removeFile(i)} className="p-1 text-red-400 hover:text-red-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!resultUrl ? (
                        <Button
                            onClick={mergePDFs}
                            disabled={processing || files.length < 2}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Merging...
                                </>
                            ) : (
                                <>
                                    <Layers className="h-4 w-4 mr-2" />
                                    Merge {files.length} PDFs
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <a href={resultUrl} download="merged.pdf" className="flex-1">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Merged PDF
                                </Button>
                            </a>
                            <Button variant="outline" onClick={() => { setFiles([]); setResultUrl(null); }}>
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
                        <h4 className="font-semibold text-blue-800 mb-1">Merge PDFs</h4>
                        <p className="text-sm text-blue-700">
                            Combine multiple PDF files into one document. Use the arrow buttons to reorder files before merging.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
