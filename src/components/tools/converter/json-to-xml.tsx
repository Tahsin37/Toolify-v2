'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Download, FileCode, CheckCircle2 } from 'lucide-react';

export function JsonToXml() {
    const [jsonInput, setJsonInput] = React.useState('');
    const [xml, setXml] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [error, setError] = React.useState('');
    const [rootElement, setRootElement] = React.useState('root');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setJsonInput(event.target?.result as string);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const jsonToXml = (obj: any, indent: number = 0): string => {
        const spaces = '    '.repeat(indent);
        let xml = '';

        for (const key in obj) {
            const value = obj[key];

            if (key === '@attributes') continue;
            if (key === '#text') {
                xml += value;
                continue;
            }

            if (Array.isArray(value)) {
                value.forEach(item => {
                    xml += spaces + `<${key}`;
                    if (item && typeof item === 'object' && item['@attributes']) {
                        for (const attr in item['@attributes']) {
                            xml += ` ${attr}="${escapeXml(item['@attributes'][attr])}"`;
                        }
                    }
                    xml += '>\n';
                    if (typeof item === 'object') {
                        xml += jsonToXml(item, indent + 1);
                    } else {
                        xml += spaces + '    ' + escapeXml(String(item)) + '\n';
                    }
                    xml += spaces + `</${key}>\n`;
                });
            } else if (typeof value === 'object' && value !== null) {
                xml += spaces + `<${key}`;
                if (value['@attributes']) {
                    for (const attr in value['@attributes']) {
                        xml += ` ${attr}="${escapeXml(value['@attributes'][attr])}"`;
                    }
                }
                xml += '>\n';
                xml += jsonToXml(value, indent + 1);
                xml += spaces + `</${key}>\n`;
            } else {
                xml += spaces + `<${key}>${escapeXml(String(value ?? ''))}</${key}>\n`;
            }
        }

        return xml;
    };

    const escapeXml = (str: string): string => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const convert = () => {
        try {
            if (!jsonInput.trim()) {
                setError('Please enter JSON data');
                return;
            }

            const data = JSON.parse(jsonInput);
            let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';

            if (typeof data === 'object' && !Array.isArray(data)) {
                const keys = Object.keys(data);
                if (keys.length === 1 && typeof data[keys[0]] === 'object') {
                    // Use the single key as root
                    xmlContent += `<${keys[0]}>\n${jsonToXml(data[keys[0]], 1)}</${keys[0]}>`;
                } else {
                    xmlContent += `<${rootElement}>\n${jsonToXml(data, 1)}</${rootElement}>`;
                }
            } else if (Array.isArray(data)) {
                xmlContent += `<${rootElement}>\n`;
                data.forEach((item, index) => {
                    xmlContent += `    <item>\n${jsonToXml(item, 2)}    </item>\n`;
                });
                xmlContent += `</${rootElement}>`;
            } else {
                xmlContent += `<${rootElement}>${escapeXml(String(data))}</${rootElement}>`;
            }

            setXml(xmlContent);
            setError('');
        } catch (err) {
            setError('Failed to parse JSON. Please check the format.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(xml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadXml = () => {
        const blob = new Blob([xml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.xml';
        link.click();
        URL.revokeObjectURL(url);
    };

    const sampleJson = `{
  "catalog": {
    "book": [
      {
        "@attributes": { "id": "1" },
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "year": "1925"
      },
      {
        "@attributes": { "id": "2" },
        "title": "1984",
        "author": "George Orwell",
        "year": "1949"
      }
    ]
  }
}`;

    return (
        <div className="space-y-6">
            {/* File Upload */}
            <Card
                className="p-6 border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop JSON file or click to browse</p>
            </Card>

            {/* JSON Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700">JSON Input</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setJsonInput(sampleJson)}
                        className="text-xs text-indigo-600"
                    >
                        Load Example
                    </Button>
                </div>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Convert Button */}
            <Button
                onClick={convert}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
                <FileCode className="h-5 w-5 mr-2" />
                Convert to XML
            </Button>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            {/* XML Output */}
            {xml && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-300">XML Output</h3>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                className="text-slate-400 hover:text-white"
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={downloadXml}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{xml}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}
