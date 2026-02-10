'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Download, FileJson, CheckCircle2 } from 'lucide-react';

export function XmlToJson() {
    const [xml, setXml] = React.useState('');
    const [json, setJson] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setXml(event.target?.result as string);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const xmlToJson = (xmlStr: string): any => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            throw new Error('Invalid XML');
        }

        const nodeToJson = (node: Element): any => {
            const obj: any = {};

            // Handle attributes
            if (node.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    obj['@attributes'][attr.name] = attr.value;
                }
            }

            // Handle child nodes
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];

                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent?.trim();
                    if (text) {
                        if (Object.keys(obj).length === 0) {
                            return text;
                        }
                        obj['#text'] = text;
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const childName = child.nodeName;
                    const childValue = nodeToJson(child as Element);

                    if (obj[childName]) {
                        if (!Array.isArray(obj[childName])) {
                            obj[childName] = [obj[childName]];
                        }
                        obj[childName].push(childValue);
                    } else {
                        obj[childName] = childValue;
                    }
                }
            }

            return Object.keys(obj).length === 0 ? '' : obj;
        };

        const root = xmlDoc.documentElement;
        return { [root.nodeName]: nodeToJson(root) };
    };

    const convert = () => {
        try {
            if (!xml.trim()) {
                setError('Please enter XML data');
                return;
            }

            const result = xmlToJson(xml);
            setJson(JSON.stringify(result, null, 2));
            setError('');
        } catch (err) {
            setError('Failed to parse XML. Please check the format.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <book id="1">
        <title>The Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <year>1925</year>
    </book>
    <book id="2">
        <title>1984</title>
        <author>George Orwell</author>
        <year>1949</year>
    </book>
</catalog>`;

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
                    accept=".xml,text/xml,application/xml"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop XML file or click to browse</p>
            </Card>

            {/* XML Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700">XML Input</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setXml(sampleXml)}
                        className="text-xs text-indigo-600"
                    >
                        Load Example
                    </Button>
                </div>
                <textarea
                    value={xml}
                    onChange={(e) => setXml(e.target.value)}
                    placeholder="<?xml version='1.0'?>&#10;<root>...</root>"
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Convert Button */}
            <Button
                onClick={convert}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
                <FileJson className="h-5 w-5 mr-2" />
                Convert to JSON
            </Button>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            {/* JSON Output */}
            {json && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-300">JSON Output</h3>
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
                                onClick={downloadJson}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{json}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}
