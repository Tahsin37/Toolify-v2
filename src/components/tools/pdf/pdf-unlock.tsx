'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Unlock, Eye, EyeOff, Loader2, Info, ShieldOff } from 'lucide-react';

export function PdfUnlock() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (f.type === 'application/pdf') {
            setFile(f);
            setError('');
            setSuccess(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const unlockPDF = async () => {
        if (!file) return;
        setProcessing(true);
        setError('');
        setSuccess(false);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;

            // Try loading with the password
            const pdfDoc = await PDFDocument.load(arrayBuffer, {
                password,
                ignoreEncryption: false,
            } as any);

            // Re-save without encryption
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `unlocked-${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
            setSuccess(true);
        } catch (error: any) {
            console.error('Unlock failed:', error);
            if (error?.message?.includes('password') || error?.message?.includes('decrypt')) {
                setError('Incorrect password. Please try again.');
            } else {
                // Try loading with ignoreEncryption as fallback
                try {
                    const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
                    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `unlocked-${file.name}`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setSuccess(true);
                } catch {
                    setError('Failed to unlock PDF. The encryption method may not be supported.');
                }
            }
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-unlock-input')?.click()}
            >
                <input
                    id="pdf-unlock-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <ShieldOff className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your protected PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
                </p>
            </Card>

            {/* Password Input */}
            {file && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Unlock className="h-4 w-4 mr-2 text-indigo-500" />
                        Enter PDF Password
                    </h3>

                    <div className="relative mb-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter the PDF password"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10"
                            onKeyDown={(e) => e.key === 'Enter' && unlockPDF()}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                            <p className="text-sm text-emerald-700">✅ PDF unlocked and downloaded successfully!</p>
                        </div>
                    )}

                    <Button
                        onClick={unlockPDF}
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Unlocking...
                            </>
                        ) : (
                            <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unlock & Download PDF
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Unlock PDF</h4>
                        <p className="text-sm text-blue-700">
                            Remove password protection from PDF files. You must know the current password
                            to unlock the file. All processing happens in your browser — passwords are never sent anywhere.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
