'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import {
    FileText, Download, Settings, Type, AlignLeft, AlignCenter, AlignRight,
    Ruler, RotateCw, Hash, Droplet, Eye, Columns, FileDown
} from 'lucide-react';

type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5';
type Orientation = 'portrait' | 'landscape';
type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export function TextToPdf() {
    const [text, setText] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [author, setAuthor] = React.useState('');
    const [fontSize, setFontSize] = React.useState(12);
    const [lineHeight, setLineHeight] = React.useState(1.5);
    const [fontFamily, setFontFamily] = React.useState<'helvetica' | 'times' | 'courier'>('helvetica');
    const [pageSize, setPageSize] = React.useState<PageSize>('a4');
    const [orientation, setOrientation] = React.useState<Orientation>('portrait');
    const [textAlign, setTextAlign] = React.useState<TextAlign>('left');
    const [margins, setMargins] = React.useState<Margins>({ top: 20, right: 20, bottom: 20, left: 20 });
    const [showPageNumbers, setShowPageNumbers] = React.useState(true);
    const [showHeader, setShowHeader] = React.useState(false);
    const [headerText, setHeaderText] = React.useState('');
    const [showFooter, setShowFooter] = React.useState(false);
    const [footerText, setFooterText] = React.useState('');
    const [watermark, setWatermark] = React.useState('');
    const [watermarkOpacity, setWatermarkOpacity] = React.useState(0.1);
    const [generating, setGenerating] = React.useState(false);

    const generatePdf = async () => {
        if (!text.trim()) return;
        setGenerating(true);

        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: pageSize,
                orientation: orientation,
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const maxWidth = pageWidth - margins.left - margins.right;

            // Set font
            doc.setFont(fontFamily);
            doc.setFontSize(fontSize);

            // Add metadata
            if (title) doc.setProperties({ title });
            if (author) doc.setProperties({ author });

            // Split text into lines
            const lines = doc.splitTextToSize(text, maxWidth);
            const lineHeightMm = fontSize * 0.353 * lineHeight;

            let y = margins.top;
            let pageNum = 1;

            const addWatermark = () => {
                if (watermark) {
                    doc.setTextColor(200, 200, 200);
                    doc.setFontSize(60);
                    doc.setFont(fontFamily, 'normal');

                    // Calculate center position
                    const centerX = pageWidth / 2;
                    const centerY = pageHeight / 2;

                    // Save graphics state
                    doc.saveGraphicsState();
                    doc.setGState({ opacity: watermarkOpacity });

                    // Add diagonal watermark text
                    const textWidth = doc.getTextWidth(watermark);
                    doc.text(watermark, centerX, centerY, {
                        angle: 45,
                        align: 'center',
                    });

                    doc.restoreGraphicsState();
                    doc.setFontSize(fontSize);
                    doc.setTextColor(0, 0, 0);
                }
            };

            const addHeaderFooter = (pageNumber: number) => {
                // Header
                if (showHeader && headerText) {
                    doc.setFontSize(10);
                    doc.setTextColor(128, 128, 128);
                    doc.text(headerText, pageWidth / 2, 10, { align: 'center' });
                    doc.setFontSize(fontSize);
                    doc.setTextColor(0, 0, 0);
                }

                // Footer
                if (showFooter && footerText) {
                    doc.setFontSize(10);
                    doc.setTextColor(128, 128, 128);
                    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
                    doc.setFontSize(fontSize);
                    doc.setTextColor(0, 0, 0);
                }

                // Page numbers
                if (showPageNumbers) {
                    doc.setFontSize(10);
                    doc.setTextColor(128, 128, 128);
                    doc.text(`Page ${pageNumber}`, pageWidth - margins.right, pageHeight - 10, { align: 'right' });
                    doc.setFontSize(fontSize);
                    doc.setTextColor(0, 0, 0);
                }
            };

            // Add watermark to first page
            addWatermark();
            addHeaderFooter(pageNum);

            // Add title if provided
            if (title) {
                doc.setFontSize(fontSize + 8);
                doc.setFont(fontFamily, 'bold');
                doc.text(title, textAlign === 'center' ? pageWidth / 2 : margins.left, y, {
                    align: textAlign === 'justify' ? 'left' : textAlign,
                });
                y += (fontSize + 8) * 0.353 * 2;
                doc.setFontSize(fontSize);
                doc.setFont(fontFamily, 'normal');
            }

            // Add text content
            for (const line of lines) {
                if (y + lineHeightMm > pageHeight - margins.bottom) {
                    doc.addPage();
                    pageNum++;
                    y = margins.top;
                    addWatermark();
                    addHeaderFooter(pageNum);
                }

                // Handle text alignment
                let xPos = margins.left;
                if (textAlign === 'center') {
                    xPos = pageWidth / 2;
                } else if (textAlign === 'right') {
                    xPos = pageWidth - margins.right;
                }

                doc.text(line, xPos, y, {
                    align: textAlign === 'justify' ? 'left' : textAlign,
                    maxWidth: maxWidth,
                });
                y += lineHeightMm;
            }

            doc.save(`${title || 'document'}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
        }

        setGenerating(false);
    };

    const wordCount = text.split(/\s+/).filter(w => w).length;
    const charCount = text.length;
    const estimatedPages = Math.ceil(wordCount / 250) || 1;

    return (
        <div className="space-y-6">
            {/* Document Info */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                    Document Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Title (Optional)
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Document Title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Author (Optional)
                        </label>
                        <Input
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Author Name"
                        />
                    </div>
                </div>
            </Card>

            {/* Text Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center">
                    <Type className="h-4 w-4 mr-2 text-indigo-500" />
                    Text Content
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here... It will be converted to a beautifully formatted PDF document."
                    className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
                    style={{ lineHeight: lineHeight }}
                />
                <div className="flex justify-between mt-3 text-xs">
                    <div className="flex gap-4">
                        <span className="text-slate-500">{charCount.toLocaleString()} characters</span>
                        <span className="text-slate-500">{wordCount.toLocaleString()} words</span>
                    </div>
                    <span className="text-indigo-600 font-medium">~{estimatedPages} page{estimatedPages > 1 ? 's' : ''}</span>
                </div>
            </Card>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Typography Settings */}
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Type className="h-4 w-4 mr-2 text-indigo-500" />
                        Typography
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Font Family</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['helvetica', 'times', 'courier'] as const).map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => setFontFamily(font)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${fontFamily === font
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        style={{ fontFamily: font === 'times' ? 'Times New Roman' : font === 'courier' ? 'Courier New' : 'Helvetica' }}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Font Size: {fontSize}pt
                                </label>
                                <input
                                    type="range"
                                    min={8}
                                    max={24}
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">
                                    Line Height: {lineHeight}
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={lineHeight}
                                    onChange={(e) => setLineHeight(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Text Alignment</label>
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { value: 'left', icon: AlignLeft },
                                    { value: 'center', icon: AlignCenter },
                                    { value: 'right', icon: AlignRight },
                                    { value: 'justify', icon: Columns },
                                ].map(({ value, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTextAlign(value as TextAlign)}
                                        className={`p-2 rounded-lg transition-all ${textAlign === value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mx-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Page Settings */}
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                        Page Layout
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Page Size</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="a4">A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                    <option value="a3">A3</option>
                                    <option value="a5">A5</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Orientation</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setOrientation('portrait')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${orientation === 'portrait'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        Portrait
                                    </button>
                                    <button
                                        onClick={() => setOrientation('landscape')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${orientation === 'landscape'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        Landscape
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center">
                                <Ruler className="h-3 w-3 mr-1" />
                                Margins (mm)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                                    <div key={side}>
                                        <label className="block text-[10px] text-slate-400 mb-1 capitalize">{side}</label>
                                        <Input
                                            type="number"
                                            min={5}
                                            max={50}
                                            value={margins[side]}
                                            onChange={(e) => setMargins({ ...margins, [side]: Number(e.target.value) })}
                                            className="text-center text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Header, Footer & Options */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-indigo-500" />
                    Header, Footer & Extras
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={showPageNumbers}
                                onChange={(e) => setShowPageNumbers(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Page Numbers</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={showHeader}
                                onChange={(e) => setShowHeader(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Custom Header</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={showFooter}
                                onChange={(e) => setShowFooter(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Custom Footer</span>
                        </label>
                    </div>

                    {showHeader && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Header Text</label>
                            <Input
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                                placeholder="Header text appears at top of each page"
                            />
                        </div>
                    )}

                    {showFooter && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Footer Text</label>
                            <Input
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                                placeholder="Footer text appears at bottom of each page"
                            />
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center">
                            <Droplet className="h-3 w-3 mr-1" />
                            Watermark (Optional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                value={watermark}
                                onChange={(e) => setWatermark(e.target.value)}
                                placeholder="e.g., CONFIDENTIAL, DRAFT"
                            />
                            {watermark && (
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">
                                        Opacity: {Math.round(watermarkOpacity * 100)}%
                                    </label>
                                    <input
                                        type="range"
                                        min={0.05}
                                        max={0.5}
                                        step={0.05}
                                        value={watermarkOpacity}
                                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Generate Button */}
            <Button
                onClick={generatePdf}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 h-14 text-lg font-semibold shadow-lg shadow-indigo-500/25"
                disabled={!text.trim() || generating}
            >
                {generating ? (
                    <>
                        <RotateCw className="h-5 w-5 mr-2 animate-spin" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <FileDown className="h-5 w-5 mr-2" />
                        Generate PDF ({estimatedPages} page{estimatedPages > 1 ? 's' : ''})
                    </>
                )}
            </Button>

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">✨ Features</h4>
                <ul className="text-sm text-blue-700 space-y-1 grid grid-cols-2 gap-x-4">
                    <li>• Multiple page sizes (A3-A5, Letter, Legal)</li>
                    <li>• Portrait & landscape orientation</li>
                    <li>• Custom margins & alignment</li>
                    <li>• 3 font families available</li>
                    <li>• Headers, footers & page numbers</li>
                    <li>• Watermark support</li>
                </ul>
            </Card>
        </div>
    );
}
