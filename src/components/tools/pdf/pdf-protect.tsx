'use client';

import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Lock, Eye, EyeOff, Loader2, Info, Shield } from 'lucide-react';

export function PdfProtect() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [userPassword, setUserPassword] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [showUserPass, setShowUserPass] = useState(false);
    const [showOwnerPass, setShowOwnerPass] = useState(false);
    const [permissions, setPermissions] = useState({
        printing: true,
        copying: false,
        modifying: false,
    });
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (f.type === 'application/pdf') {
            setFile(f);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const protectPDF = async () => {
        if (!file || !userPassword) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            (pdfDoc as any).encrypt({
                userPassword,
                ownerPassword: ownerPassword || userPassword,
                permissions: {
                    printing: permissions.printing ? 'highResolution' : undefined,
                    copying: permissions.copying,
                    modifying: permissions.modifying,
                },
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `protected-${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error protecting PDF:', error);
            alert('Failed to protect PDF. The file may already be encrypted.');
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload */}
            <Card
                className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 bg-white'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-protect-input')?.click()}
            >
                <input
                    id="pdf-protect-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Shield className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-800 mb-1">
                    {file ? file.name : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
                </p>
            </Card>

            {/* Settings */}
            {file && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Lock className="h-4 w-4 mr-2 text-amber-500" />
                        Password Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">User Password (required to open)</label>
                            <div className="relative">
                                <input
                                    type={showUserPass ? 'text' : 'password'}
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUserPass(!showUserPass)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showUserPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Owner Password (optional, for permissions)</label>
                            <div className="relative">
                                <input
                                    type={showOwnerPass ? 'text' : 'password'}
                                    value={ownerPassword}
                                    onChange={(e) => setOwnerPassword(e.target.value)}
                                    placeholder="Enter owner password (defaults to user password)"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOwnerPass(!showOwnerPass)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showOwnerPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 block mb-2">Permissions</label>
                            <div className="space-y-2">
                                {[
                                    { key: 'printing', label: 'Allow Printing' },
                                    { key: 'copying', label: 'Allow Copying Text' },
                                    { key: 'modifying', label: 'Allow Modifying' },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={permissions[key as keyof typeof permissions]}
                                            onChange={(e) => setPermissions((p) => ({ ...p, [key]: e.target.checked }))}
                                            className="rounded border-slate-300"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={protectPDF}
                        disabled={processing || !userPassword}
                        className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Encrypting...
                            </>
                        ) : (
                            <>
                                <Lock className="h-4 w-4 mr-2" />
                                Protect & Download PDF
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">PDF Protection</h4>
                        <p className="text-sm text-blue-700">
                            Add password protection to your PDF files. Set user and owner passwords,
                            and control permissions for printing, copying, and modifying.
                            Encryption happens entirely in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
