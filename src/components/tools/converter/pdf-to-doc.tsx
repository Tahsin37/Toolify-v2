'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Upload, Download, File, ArrowRight, FileText,
    CheckCircle2, AlertTriangle, Loader2, Trash2, Info, Eye, EyeOff
} from 'lucide-react';

interface ConversionResult {
    filename: string;
    blob: Blob;
    size: number;
    text: string;
}

export function PdfToDoc() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [results, setResults] = React.useState<ConversionResult[]>([]);
    const [error, setError] = React.useState('');
    const [warning, setWarning] = React.useState('');
    const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            f => f.type === 'application/pdf' || f.name.endsWith('.pdf')
        );
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
            setError('');
        } else {
            setError('Please drop PDF files only');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...selectedFiles]);
        setError('');
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFiles([]);
        setResults([]);
        setError('');
        setProgress(0);
    };

    const convertFiles = async () => {
        if (files.length === 0) return;

        setConverting(true);
        setProgress(0);
        setResults([]);
        setError('');

        try {
            // Load pdf.js from CDN to avoid Next.js webpack issues
            const pdfjsLib = await new Promise<any>((resolve, reject) => {
                if ((window as any).pdfjsLib) {
                    resolve((window as any).pdfjsLib);
                    return;
                }
                const PDFJS_VERSION = '3.11.174';
                const script = document.createElement('script');
                script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
                script.onload = () => {
                    const lib = (window as any).pdfjsLib;
                    if (lib) {
                        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
                        resolve(lib);
                    } else {
                        reject(new Error('pdf.js failed to load'));
                    }
                };
                script.onerror = () => reject(new Error('Failed to load pdf.js'));
                document.head.appendChild(script);
            });

            const converted: ConversionResult[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                setProgress(Math.round(((i + 0.2) / files.length) * 100));

                // Load the PDF
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdf.numPages;
                const allParagraphs: string[] = [];

                // Extract text from each page with position awareness
                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    // Group text items by y-position to form lines
                    let lastY: number | null = null;
                    let currentLine = '';

                    for (const item of textContent.items) {
                        const textItem = item as any;
                        if (!textItem.str || textItem.str.length === 0) continue;

                        const y = Math.round(textItem.transform?.[5] || 0);

                        if (lastY !== null && Math.abs(y - lastY) > 3) {
                            // New line detected based on y-position change
                            if (currentLine.trim()) {
                                allParagraphs.push(currentLine.trim());
                            }
                            currentLine = textItem.str;
                        } else {
                            // Same line - check if we need a space
                            if (currentLine && !currentLine.endsWith(' ') && !textItem.str.startsWith(' ')) {
                                // Check for natural word boundary
                                const hasGap = textItem.transform?.[4] > 0;
                                currentLine += (hasGap ? ' ' : '') + textItem.str;
                            } else {
                                currentLine += textItem.str;
                            }
                        }
                        lastY = y;
                    }

                    // Don't forget the last line
                    if (currentLine.trim()) {
                        allParagraphs.push(currentLine.trim());
                    }

                    // Add page separator
                    if (pageNum < numPages) {
                        allParagraphs.push('');
                    }

                    setProgress(Math.round(((i + (pageNum / numPages) * 0.6) / files.length) * 100));
                }

                const fullText = allParagraphs.join('\n');

                if (!fullText.trim()) {
                    setWarning('Very little text was extracted. This PDF may contain primarily images or scanned content. For scanned PDFs, consider using an OCR tool for better results.');
                    // Continue with empty content rather than blocking
                    converted.push({
                        filename: file.name.replace(/\.pdf$/i, '.doc'),
                        blob: new Blob(['<html><body><p>No extractable text content found in this PDF.</p></body></html>'], { type: 'application/vnd.ms-word;charset=utf-8' }),
                        size: 0,
                        text: '(No text content extracted — PDF may contain only images)'
                    });
                    setProgress(Math.round(((i + 1) / files.length) * 100));
                    continue;
                }

                // Merge short consecutive lines into paragraphs
                const mergedParagraphs: string[] = [];
                let currentPara = '';

                for (const line of allParagraphs) {
                    if (!line.trim()) {
                        if (currentPara.trim()) {
                            mergedParagraphs.push(currentPara.trim());
                        }
                        mergedParagraphs.push('');
                        currentPara = '';
                    } else if (
                        currentPara &&
                        !currentPara.endsWith('.') &&
                        !currentPara.endsWith(':') &&
                        !currentPara.endsWith('!') &&
                        !currentPara.endsWith('?') &&
                        line.length > 20 &&
                        line[0] === line[0].toLowerCase()
                    ) {
                        // Continue paragraph if line doesn't start with capital and previous didn't end with period
                        currentPara += ' ' + line;
                    } else {
                        if (currentPara.trim()) {
                            mergedParagraphs.push(currentPara.trim());
                        }
                        currentPara = line;
                    }
                }
                if (currentPara.trim()) {
                    mergedParagraphs.push(currentPara.trim());
                }

                // Create Word-compatible HTML document
                const docContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
    <meta charset="utf-8">
    <title>Converted Document</title>
    <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; margin: 1in; color: #333; }
        p { margin: 0 0 8pt 0; text-align: justify; }
        h1 { font-size: 18pt; margin: 16pt 0 8pt 0; }
        h2 { font-size: 14pt; margin: 14pt 0 6pt 0; }
    </style>
</head>
<body>
    ${mergedParagraphs.map(para => {
                    if (!para.trim()) return '';
                    // Detect potential headings (short, no period, possibly uppercase)
                    if (para.length < 80 && !para.endsWith('.') && para === para.replace(/[a-z]/g, m => m.toUpperCase()).slice(0, 3) + para.slice(3)) {
                        if (para.length < 40) return `<h2>${para}</h2>`;
                    }
                    return `<p>${para}</p>`;
                }).join('\n    ')}
</body>
</html>`;

                const blob = new Blob([docContent], {
                    type: 'application/vnd.ms-word;charset=utf-8'
                });

                const baseName = file.name.replace(/\.pdf$/i, '');
                converted.push({
                    filename: `${baseName}.doc`,
                    blob,
                    size: blob.size,
                    text: fullText
                });

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            setResults(converted);
        } catch (err: any) {
            console.error('Conversion error:', err);
            const isPassword = err?.message?.includes('password') || err?.name === 'PasswordException';
            if (isPassword) {
                setError('This PDF is password-protected. Please unlock it first before converting.');
            } else {
                setError('Conversion encountered an issue. Some content may not have been extracted properly. Try re-exporting the PDF as a text-based PDF.');
            }
        }

        setConverting(false);
    };

    const downloadResult = (result: ConversionResult) => {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        results.forEach(result => downloadResult(result));
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
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-red-50/30 hover:border-red-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                        <File className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Drop PDF files here
                    </h3>
                    <p className="text-sm text-slate-500">Convert PDF to editable Word document</p>
                </div>
            </Card>

            {/* File List */}
            {files.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800">Files to Convert ({files.length})</h3>
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-1" /> Clear All
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                                    <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
                                </div>
                                <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Convert Button */}
            {files.length > 0 && results.length === 0 && (
                <Button
                    onClick={convertFiles}
                    disabled={converting}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                    {converting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Extracting text... {progress}%
                        </>
                    ) : (
                        <>
                            <ArrowRight className="h-5 w-5 mr-2" />
                            Convert to Word ({files.length} files)
                        </>
                    )}
                </Button>
            )}

            {/* Progress */}
            {converting && (
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-800">Conversion Complete!</h3>
                        </div>
                        {results.length > 1 && (
                            <Button size="sm" onClick={downloadAll} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium text-slate-800">{result.filename}</span>
                                        <span className="text-xs text-slate-500">{formatSize(result.size)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setPreviewIndex(previewIndex === index ? null : index)}>
                                            {previewIndex === index ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                            {previewIndex === index ? 'Hide' : 'Preview'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadResult(result)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {previewIndex === index && (
                                    <div className="p-4 bg-white rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                            <Eye className="h-4 w-4" /> Extracted Text Preview
                                        </h4>
                                        <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                                            {result.text || '(No text content)'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Warning */}
            {warning && (
                <Card className="p-4 bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">{warning}</span>
                    </div>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Note</h4>
                        <p className="text-sm text-amber-700">
                            This tool extracts text from PDFs and creates an editable Word document.
                            Image-only PDFs (scanned documents) require OCR, which isn't supported in the browser.
                            Complex layouts may not be preserved exactly.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
