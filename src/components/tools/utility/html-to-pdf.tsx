'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import { FileCode, Download, Eye, EyeOff } from 'lucide-react';

export function HtmlToPdf() {
    const [html, setHtml] = React.useState(`<h1>Welcome to ZyloTools</h1>
<p>This is a sample HTML document that will be converted to PDF.</p>
<ul>
  <li>Feature 1: Fast conversion</li>
  <li>Feature 2: Client-side processing</li>
  <li>Feature 3: Privacy-first</li>
</ul>
<p><strong>Bold text</strong> and <em>italic text</em> are supported.</p>`);
    const [title, setTitle] = React.useState('document');
    const [showPreview, setShowPreview] = React.useState(true);
    const [generating, setGenerating] = React.useState(false);

    const generatePdf = async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4',
            });

            // Create a temporary element to render HTML
            const container = document.createElement('div');
            container.innerHTML = html;
            container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:170mm;font-family:Arial,sans-serif;font-size:12pt;line-height:1.5;';
            document.body.appendChild(container);

            // Use jsPDF's html method
            await doc.html(container, {
                callback: function (doc) {
                    doc.save(`${title}.pdf`);
                },
                x: 20,
                y: 20,
                width: 170,
                windowWidth: 794,
            });

            document.body.removeChild(container);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
        setGenerating(false);
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <Card className="p-4 bg-white border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    PDF File Name
                </label>
                <div className="flex items-center gap-2">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="document"
                    />
                    <span className="text-slate-500">.pdf</span>
                </div>
            </Card>

            {/* HTML Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                        HTML Content
                    </label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                        {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                </div>
                <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="<h1>Your HTML here</h1>"
                    className="w-full h-48 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Preview */}
            {showPreview && (
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Preview</h3>
                    <div
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </Card>
            )}

            {/* Generate Button */}
            <Button
                onClick={generatePdf}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                disabled={!html.trim() || generating}
            >
                {generating ? (
                    'Generating PDF...'
                ) : (
                    <>
                        <FileCode className="h-5 w-5 mr-2" />
                        Convert to PDF
                    </>
                )}
            </Button>

            {/* Info */}
            <Card className="p-4 bg-amber-50 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Supported HTML Elements</h4>
                <div className="text-sm text-amber-700 grid grid-cols-2 gap-1">
                    <span>• Headings (h1-h6)</span>
                    <span>• Paragraphs (p)</span>
                    <span>• Lists (ul, ol, li)</span>
                    <span>• Bold (strong, b)</span>
                    <span>• Italic (em, i)</span>
                    <span>• Links (a)</span>
                </div>
            </Card>
        </div>
    );
}
