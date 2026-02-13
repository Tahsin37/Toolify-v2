'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export function PdfToDoc() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [convertedDoc, setConvertedDoc] = useState<Blob | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setConvertedDoc(null);
            setProgress(0);
        }
    };

    const convertToDoc = async () => {
        if (!file) return;

        setIsConverting(true);
        setProgress(10);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            setProgress(30);

            const children: (Paragraph)[] = [];
            const pageCount = pdf.numPages;

            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                const items = textContent.items as any[];

                const lines: { y: number; text: string }[] = [];
                items.forEach(item => {
                    const existingLine = lines.find(l => Math.abs(l.y - item.transform[5]) < 5);
                    if (existingLine) {
                        existingLine.text += ' ' + item.str;
                    } else {
                        lines.push({ y: item.transform[5], text: item.str });
                    }
                });

                lines.sort((a, b) => b.y - a.y);

                lines.forEach(line => {
                    const text = line.text.trim();
                    if (text) {
                        children.push(
                            new Paragraph({
                                children: [new TextRun(text)],
                                spacing: { after: 200 },
                            })
                        );
                    }
                });

                if (i < pageCount) {
                    children.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
                }

                setProgress(30 + Math.round((i / pageCount) * 50));
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children,
                }],
            });

            const blob = await Packer.toBlob(doc);
            setConvertedDoc(blob);
            setProgress(100);

        } catch (err: any) {
            console.error('Conversion failed:', err);
            setError(err.message || 'Failed to convert PDF. The file might be corrupted or password protected.');
        } finally {
            setIsConverting(false);
        }
    };

    const downloadDoc = () => {
        if (convertedDoc && file) {
            saveAs(convertedDoc, file.name.replace('.pdf', '.docx'));
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    PDF to Word Converter
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Convert your PDF documents to editable Word (.docx) files accurately using modern conversion engine.
                </p>
            </div>

            <Card className="p-8 border-slate-200">
                <div className="space-y-8">
                    <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                            }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label
                            htmlFor="pdf-upload"
                            className="cursor-pointer flex flex-col items-center justify-center"
                        >
                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                                {file ? <FileText className="h-8 w-8 text-indigo-600" /> : <Upload className="h-8 w-8 text-slate-400" />}
                            </div>
                            {file ? (
                                <>
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-sm text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    <p className="text-xs text-indigo-600 mt-2 font-medium">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                                    <p className="text-sm text-slate-500 mt-1">PDF Files (Max 20MB)</p>
                                </>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {file && !error && (
                        <div className="flex flex-col items-center space-y-4">
                            {!convertedDoc ? (
                                <Button
                                    size="lg"
                                    onClick={convertToDoc}
                                    disabled={isConverting}
                                    className="w-full sm:w-auto min-w-[200px] h-12 text-base rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                                >
                                    {isConverting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Converting... {progress}%
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Convert to Word
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div className="flex gap-4">
                                    <Button
                                        size="lg"
                                        onClick={downloadDoc}
                                        className="min-w-[200px] h-12 text-base rounded-full bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Word Doc
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setFile(null); setConvertedDoc(null); setProgress(0); }}
                                        className="h-12 px-6 rounded-full"
                                    >
                                        Convert Another
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
