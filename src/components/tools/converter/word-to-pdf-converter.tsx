'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileType, Download, Loader2, Info, CheckCircle } from 'lucide-react';

export function WordToPdfConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (f.name.match(/\.(docx|doc)$/i)) {
            setFile(f);
            setError(null);
            setPdfUrl(null);
        } else {
            setError('Please upload a valid Word document (.docx or .doc)');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const convertToPdf = async () => {
        if (!file) return;
        setProcessing(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Dynamically import mammoth for DOCX → HTML
            const mammoth = await import('mammoth');
            const result = await mammoth.convertToHtml(
                { arrayBuffer },
                {
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                    ]
                }
            );

            const htmlContent = result.value;

            // Use jsPDF to create PDF from HTML
            const { default: jsPDF } = await import('jspdf');

            const styledHtml = `
                <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; max-width: 700px; padding: 20px;">
                    <style>
                        h1 { font-size: 24pt; font-weight: bold; margin: 20px 0 10px 0; color: #000; }
                        h2 { font-size: 20pt; font-weight: bold; margin: 16px 0 8px 0; color: #000; }
                        h3 { font-size: 16pt; font-weight: bold; margin: 12px 0 6px 0; color: #000; }
                        p { margin: 0 0 8px 0; }
                        ul, ol { margin: 4px 0 8px 20px; padding: 0; }
                        li { margin: 2px 0; }
                        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                        td, th { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 11pt; }
                        th { background: #f0f0f0; font-weight: bold; }
                        strong, b { font-weight: bold; }
                        em, i { font-style: italic; }
                        a { color: #1a0dab; text-decoration: underline; }
                        img { max-width: 100%; height: auto; }
                    </style>
                    ${htmlContent}
                </div>
            `;

            const container = document.createElement('div');
            container.innerHTML = styledHtml;
            container.style.width = '750px';
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            await pdf.html(styledHtml, {
                callback: (doc) => {
                    const pdfBlob = doc.output('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    setPdfUrl(url);
                    document.body.removeChild(container);
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 750,
                html2canvas: {
                    scale: 0.265,
                    logging: false,
                    useCORS: true,
                },
            });

        } catch (err: any) {
            console.error('Conversion failed:', err);
            setError(err.message || 'Failed to convert document. Please ensure it is a valid .docx file.');
        } finally {
            setProcessing(false);
        }
    };

    const downloadPdf = () => {
        if (pdfUrl && file) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = file.name.replace(/\.(docx|doc)$/i, '.pdf');
            a.click();
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
                onClick={() => document.getElementById('word-to-pdf-input')?.click()}
            >
                <input
                    id="word-to-pdf-input"
                    type="file"
                    accept=".docx,.doc"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <FileType className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your Word file here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse — supports .docx and .doc'}
                </p>
            </Card>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Convert Button */}
            {file && !pdfUrl && (
                <Button
                    onClick={convertToPdf}
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Converting...
                        </>
                    ) : (
                        <>
                            <FileType className="h-5 w-5 mr-2" />
                            Convert to PDF
                        </>
                    )}
                </Button>
            )}

            {/* Result */}
            {pdfUrl && (
                <Card className="p-6 bg-white border border-slate-200">
                    <div className="text-center mb-4">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-slate-800">Conversion Complete!</h3>
                        <p className="text-sm text-slate-500">Your PDF is ready to download</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={downloadPdf} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button variant="outline" onClick={() => { setFile(null); setPdfUrl(null); }} className="flex-1">
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
                        <h4 className="font-semibold text-blue-800 mb-1">Word to PDF</h4>
                        <p className="text-sm text-blue-700">
                            Convert Word documents to high-quality PDF files. Preserves formatting, headings, tables, and images.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
