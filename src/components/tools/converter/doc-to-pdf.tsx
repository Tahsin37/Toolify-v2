'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function DocToPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(doc|docx)$/i)) {
                setError('Please upload a valid Word document (.docx or .doc).');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setPdfUrl(null);
            setProgress(0);
        }
    };

    const convertToPdf = async () => {
        if (!file || !previewContainerRef.current) return;

        setIsConverting(true);
        setProgress(10);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();

            previewContainerRef.current.innerHTML = '';

            await renderAsync(arrayBuffer, previewContainerRef.current, undefined, {
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                experimental: true
            });

            setProgress(50);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const element = previewContainerRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            setProgress(90);

            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setProgress(100);

        } catch (err: any) {
            console.error('Conversion failed:', err);
            setError('Failed to convert document. Please ensure it is a valid .docx file.');
        } finally {
            setIsConverting(false);
        }
    };

    const downloadPdf = () => {
        if (pdfUrl && file) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = file.name.replace(/\.(docx|doc)$/i, '.pdf');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Word to PDF Converter
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Convert Word documents to high-quality PDF files while preserving formatting.
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
                            accept=".docx,.doc"
                            onChange={handleFileChange}
                            className="hidden"
                            id="doc-upload"
                        />
                        <label
                            htmlFor="doc-upload"
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
                                    <p className="text-sm text-slate-500 mt-1">Word Files (.docx)</p>
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
                            {!pdfUrl ? (
                                <Button
                                    size="lg"
                                    onClick={convertToPdf}
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
                                            Convert to PDF
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div className="flex gap-4">
                                    <Button
                                        size="lg"
                                        onClick={downloadPdf}
                                        className="min-w-[200px] h-12 text-base rounded-full bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setFile(null); setPdfUrl(null); setProgress(0); }}
                                        className="h-12 px-6 rounded-full"
                                    >
                                        Convert Another
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="opacity-0 absolute top-0 left-0 -z-50 pointer-events-none overflow-hidden h-0 max-w-[800px]">
                        <div ref={previewContainerRef} className="bg-white text-black p-8 min-h-[1000px]"></div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
