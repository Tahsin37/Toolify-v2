'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export function ImageToBase64() {
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [base64, setBase64] = React.useState<string>('');
    const [copied, setCopied] = React.useState(false);
    const [includePrefix, setIncludePrefix] = React.useState(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));

            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setBase64(result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const getOutput = () => {
        if (includePrefix) return base64;
        return base64.split(',')[1] || '';
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getOutput());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-1">
                    {file ? file.name : 'Drop your image here'}
                </p>
                <p className="text-sm text-slate-500">Supports all image formats</p>
            </Card>

            {/* Preview & Stats */}
            {preview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 bg-white border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" /> Image Preview
                        </h3>
                        <img src={preview} alt="Preview" className="w-full rounded-lg max-h-64 object-contain" />
                    </Card>

                    <Card className="p-4 bg-white border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">File Info</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">File Name:</span>
                                <span className="text-slate-900 font-medium">{file?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">File Size:</span>
                                <span className="text-slate-900 font-medium">{file && formatSize(file.size)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">MIME Type:</span>
                                <span className="text-slate-900 font-medium">{file?.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Base64 Length:</span>
                                <span className="text-slate-900 font-medium">{base64.length.toLocaleString()} chars</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Options */}
            {base64 && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includePrefix}
                                onChange={(e) => setIncludePrefix(e.target.checked)}
                                className="mr-2 h-4 w-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm text-slate-700">Include Data URL prefix</span>
                        </label>
                        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {includePrefix ? 'data:image/...;base64,' : 'raw base64'}
                        </code>
                    </div>
                </Card>
            )}

            {/* Base64 Output */}
            {base64 && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-300">Base64 Output</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyToClipboard}
                            className="text-slate-400 hover:text-white"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
                        </Button>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-48 overflow-auto">
                        <code className="text-xs text-emerald-400 break-all font-mono">
                            {getOutput().slice(0, 500)}{getOutput().length > 500 && '...'}
                        </code>
                    </div>
                </Card>
            )}

            {/* Copy Button */}
            {base64 && (
                <Button
                    onClick={copyToClipboard}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                >
                    {copied ? (
                        <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Copied to Clipboard!
                        </>
                    ) : (
                        <>
                            <Copy className="h-5 w-5 mr-2" />
                            Copy Base64 String
                        </>
                    )}
                </Button>
            )}

            {/* Usage Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">How to use Base64 images</h4>
                <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>HTML:</strong> <code className="bg-blue-100 px-1 rounded">&lt;img src="DATA_URL"&gt;</code></p>
                    <p><strong>CSS:</strong> <code className="bg-blue-100 px-1 rounded">background-image: url(DATA_URL)</code></p>
                    <p><strong>Markdown:</strong> <code className="bg-blue-100 px-1 rounded">![alt](DATA_URL)</code></p>
                </div>
            </Card>
        </div>
    );
}
