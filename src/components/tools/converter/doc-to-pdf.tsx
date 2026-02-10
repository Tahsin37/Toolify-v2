'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Upload, Download, FileText, ArrowRight, File,
    CheckCircle2, AlertTriangle, Loader2, Trash2, Eye
} from 'lucide-react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

interface ConversionResult {
    filename: string;
    blob: Blob;
    size: number;
    preview?: string;
}

export function DocToPdf() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [results, setResults] = React.useState<ConversionResult[]>([]);
    const [error, setError] = React.useState('');
    const [showPreview, setShowPreview] = React.useState<number | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            f => f.name.endsWith('.docx') || f.name.endsWith('.doc')
        );
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
            setError('');
        } else {
            setError('Please drop Word documents (.docx, .doc) only');
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
            const converted: ConversionResult[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                setProgress(Math.round(((i + 0.3) / files.length) * 100));

                // Convert DOCX to HTML using mammoth
                const result = await mammoth.convertToHtml({ arrayBuffer });
                const html = result.value;

                setProgress(Math.round(((i + 0.6) / files.length) * 100));

                // Create PDF from HTML content
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 15;
                const maxWidth = pageWidth - 2 * margin;
                let yPosition = 20;

                // Parse HTML into DOM
                const div = document.createElement('div');
                div.innerHTML = html;

                // Helper to get all text from a node (including children)
                const getFullText = (node: Node): string => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        return node.textContent || '';
                    }
                    let text = '';
                    for (const child of Array.from(node.childNodes)) {
                        text += getFullText(child);
                    }
                    return text;
                };

                // Helper to check if element contains bold text
                const hasBold = (el: HTMLElement): boolean => {
                    if (el.tagName === 'STRONG' || el.tagName === 'B') return true;
                    return Array.from(el.children).some(c => hasBold(c as HTMLElement));
                };

                // Helper to add a page break check
                const checkPageBreak = (linesNeeded: number, lineHeight: number) => {
                    if (yPosition + linesNeeded * lineHeight > pageHeight - 20) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                };

                // Process block-level elements (paragraphs, headings, lists)
                const processBlock = (element: HTMLElement) => {
                    const tagName = element.tagName.toLowerCase();

                    if (tagName.match(/^h[1-6]$/)) {
                        // Heading
                        const level = parseInt(tagName[1]);
                        const fontSize = Math.max(12, 18 - (level - 1) * 2);
                        const lineHeight = fontSize * 0.45;

                        yPosition += 4;
                        pdf.setFontSize(fontSize);
                        pdf.setFont('helvetica', 'bold');

                        const text = getFullText(element).trim();
                        if (text) {
                            const lines = pdf.splitTextToSize(text, maxWidth);
                            checkPageBreak(lines.length, lineHeight);
                            for (const line of lines) {
                                if (yPosition > pageHeight - 20) {
                                    pdf.addPage();
                                    yPosition = 20;
                                }
                                pdf.text(line, margin, yPosition);
                                yPosition += lineHeight;
                            }
                        }
                        yPosition += 3;
                        pdf.setFontSize(11);
                        pdf.setFont('helvetica', 'normal');

                    } else if (tagName === 'p') {
                        // Paragraph - get full text content at once
                        const isBold = hasBold(element);
                        pdf.setFontSize(11);
                        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

                        const text = getFullText(element).trim();
                        if (text) {
                            const lineHeight = 5.5;
                            const lines = pdf.splitTextToSize(text, maxWidth);
                            checkPageBreak(Math.min(lines.length, 3), lineHeight);
                            for (const line of lines) {
                                if (yPosition > pageHeight - 20) {
                                    pdf.addPage();
                                    yPosition = 20;
                                }
                                pdf.text(line, margin, yPosition);
                                yPosition += lineHeight;
                            }
                            yPosition += 2;
                        } else {
                            yPosition += 3; // Empty paragraph = spacing
                        }
                        pdf.setFont('helvetica', 'normal');

                    } else if (tagName === 'ul' || tagName === 'ol') {
                        // List
                        const items = element.querySelectorAll(':scope > li');
                        items.forEach((li, idx) => {
                            pdf.setFontSize(11);
                            pdf.setFont('helvetica', 'normal');

                            const bullet = tagName === 'ol' ? `${idx + 1}. ` : '• ';
                            const text = getFullText(li).trim();
                            if (text) {
                                const bulletWidth = pdf.getTextWidth(bullet);
                                const itemMaxWidth = maxWidth - bulletWidth - 2;
                                const lines = pdf.splitTextToSize(text, itemMaxWidth);
                                const lineHeight = 5.5;

                                checkPageBreak(1, lineHeight);
                                for (let j = 0; j < lines.length; j++) {
                                    if (yPosition > pageHeight - 20) {
                                        pdf.addPage();
                                        yPosition = 20;
                                    }
                                    if (j === 0) {
                                        pdf.text(bullet, margin, yPosition);
                                    }
                                    pdf.text(lines[j], margin + bulletWidth + 2, yPosition);
                                    yPosition += lineHeight;
                                }
                            }
                        });
                        yPosition += 2;

                    } else if (tagName === 'table') {
                        // Table - render as text with separators
                        const rows = element.querySelectorAll('tr');
                        pdf.setFontSize(10);
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('td, th');
                            const cellTexts = Array.from(cells).map(c => getFullText(c).trim());
                            const rowText = cellTexts.join('  |  ');
                            if (rowText.trim()) {
                                const lines = pdf.splitTextToSize(rowText, maxWidth);
                                checkPageBreak(lines.length, 5);
                                for (const line of lines) {
                                    if (yPosition > pageHeight - 20) {
                                        pdf.addPage();
                                        yPosition = 20;
                                    }
                                    pdf.text(line, margin, yPosition);
                                    yPosition += 5;
                                }
                            }
                        });
                        pdf.setFontSize(11);
                        yPosition += 2;

                    } else if (tagName === 'br') {
                        yPosition += 3;
                    } else {
                        // For divs or other containers, process children
                        for (const child of Array.from(element.children)) {
                            processBlock(child as HTMLElement);
                        }
                    }
                };

                // Process all top-level elements
                for (const child of Array.from(div.children)) {
                    processBlock(child as HTMLElement);
                }

                // If no block elements found, treat as plain text
                if (div.children.length === 0) {
                    const text = getFullText(div).trim();
                    if (text) {
                        pdf.setFontSize(11);
                        const lines = pdf.splitTextToSize(text, maxWidth);
                        for (const line of lines) {
                            if (yPosition > pageHeight - 20) {
                                pdf.addPage();
                                yPosition = 20;
                            }
                            pdf.text(line, margin, yPosition);
                            yPosition += 5.5;
                        }
                    }
                }

                const pdfBlob = pdf.output('blob');
                const baseName = file.name.replace(/\.(docx?|doc)$/i, '');

                converted.push({
                    filename: `${baseName}.pdf`,
                    blob: pdfBlob,
                    size: pdfBlob.size,
                    preview: html.substring(0, 500)
                });

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            setResults(converted);
        } catch (err) {
            console.error('Conversion error:', err);
            setError('Failed to convert. Make sure the file is a valid Word document (.docx format works best).');
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
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/30 hover:border-blue-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Drop Word documents here
                    </h3>
                    <p className="text-sm text-slate-500">Supports .docx and .doc formats</p>
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
                                    <FileText className="h-4 w-4 text-blue-500" />
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
                    className="w-full h-12 bg-red-600 hover:bg-red-700"
                >
                    {converting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Converting... {progress}%
                        </>
                    ) : (
                        <>
                            <ArrowRight className="h-5 w-5 mr-2" />
                            Convert to PDF ({files.length} files)
                        </>
                    )}
                </Button>
            )}

            {/* Progress */}
            {converting && (
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-red-600" />
                            <h3 className="font-semibold text-red-800">Conversion Complete!</h3>
                        </div>
                        {results.length > 1 && (
                            <Button size="sm" onClick={downloadAll} className="bg-red-600 hover:bg-red-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <File className="h-5 w-5 text-red-600" />
                                        <span className="font-medium text-slate-800">{result.filename}</span>
                                        <span className="text-xs text-slate-500">{formatSize(result.size)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowPreview(showPreview === index ? null : index)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadResult(result)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {showPreview === index && result.preview && (
                                    <div
                                        className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-600 max-h-40 overflow-y-auto prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: result.preview + '...' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Supported Features</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Text, headings, paragraphs</li>
                            <li>• Bold, italic formatting</li>
                            <li>• Lists and bullet points</li>
                            <li>• Basic table structure</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
