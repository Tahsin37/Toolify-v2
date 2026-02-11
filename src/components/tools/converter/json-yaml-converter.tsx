'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ArrowLeftRight, Copy, Check, Upload, MoveRight, FileJson, FileType, RefreshCw
} from 'lucide-react';
import yaml from 'js-yaml';

export function JsonYamlConverter() {
    const [jsonText, setJsonText] = React.useState('');
    const [yamlText, setYamlText] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [mode, setMode] = React.useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
    const [copied, setCopied] = React.useState(false);

    const handleConvert = () => {
        setError(null);
        try {
            if (mode === 'json-to-yaml') {
                if (!jsonText.trim()) return;
                const obj = JSON.parse(jsonText);
                const result = yaml.dump(obj);
                setYamlText(result);
            } else {
                if (!yamlText.trim()) return;
                const obj = yaml.load(yamlText);
                const result = JSON.stringify(obj, null, 2);
                setJsonText(result);
            }
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleSwap = () => {
        setMode(prev => prev === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml');
        setJsonText('');
        setYamlText('');
        setError(null);
    };

    const handleCopy = () => {
        const text = mode === 'json-to-yaml' ? yamlText : jsonText;
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        if (mode === 'json-to-yaml') {
            setJsonText(text);
        } else {
            setYamlText(text);
        }
    };

    const loadSample = () => {
        if (mode === 'json-to-yaml') {
            setJsonText(JSON.stringify({
                name: "Toolify",
                version: "1.0",
                features: ["SEO", "Dev Tools"],
                config: { theme: "dark", active: true }
            }, null, 2));
        } else {
            setYamlText(`name: Toolify
version: '1.0'
features:
  - SEO
  - Dev Tools
config:
  theme: dark
  active: true`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Mode Switch */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <Button
                        size="sm"
                        variant={mode === 'json-to-yaml' ? 'primary' : 'ghost'}
                        onClick={() => setMode('json-to-yaml')}
                        className="w-32"
                    >
                        JSON to YAML
                    </Button>
                    <Button
                        size="sm"
                        variant={mode === 'yaml-to-json' ? 'primary' : 'ghost'}
                        onClick={() => setMode('yaml-to-json')}
                        className="w-32"
                    >
                        YAML to JSON
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSample}>Load Sample</Button>
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Upload className="h-3 w-3 mr-1" /> Upload File
                        <input type="file" accept={mode === 'json-to-yaml' ? '.json' : '.yaml,.yml'} onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input */}
                <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center">
                            {mode === 'json-to-yaml' ? <FileJson className="h-4 w-4 mr-1 text-indigo-500" /> : <FileType className="h-4 w-4 mr-1 text-amber-500" />}
                            {mode === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
                        </label>
                    </div>
                    <textarea
                        value={mode === 'json-to-yaml' ? jsonText : yamlText}
                        onChange={(e) => mode === 'json-to-yaml' ? setJsonText(e.target.value) : setYamlText(e.target.value)}
                        placeholder={mode === 'json-to-yaml' ? 'Paste JSON here...' : 'Paste YAML here...'}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        spellCheck={false}
                    />
                </Card>

                {/* Wrapper for Action & Output */}
                <div className="flex flex-col h-[500px] gap-4">
                    {/* Action Button (Centered logic visually but placed here for flow) */}
                    <div className="flex justify-center md:justify-start">
                        <Button
                            onClick={handleConvert}
                            className="w-full md:w-auto"
                            size="lg"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Convert {mode === 'json-to-yaml' ? 'to YAML' : 'to JSON'}
                        </Button>
                    </div>

                    {/* Output */}
                    <Card className="flex-1 p-4 bg-slate-900 border border-slate-800 shadow-sm flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-2 text-slate-300">
                            <label className="text-sm font-medium flex items-center">
                                {mode === 'json-to-yaml' ? <FileType className="h-4 w-4 mr-1 text-amber-500" /> : <FileJson className="h-4 w-4 mr-1 text-indigo-500" />}
                                {mode === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'}
                            </label>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCopy}
                                className="text-slate-300 hover:text-white hover:bg-slate-800"
                                disabled={!yamlText && !jsonText}
                            >
                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        {error ? (
                            <div className="flex-1 p-4 bg-rose-900/20 border border-rose-900/50 rounded-lg text-rose-200 font-mono text-sm overflow-auto">
                                Error: {error}
                            </div>
                        ) : (
                            <textarea
                                readOnly
                                value={mode === 'json-to-yaml' ? yamlText : jsonText}
                                className="flex-1 w-full bg-transparent text-slate-200 font-mono text-sm resize-none focus:outline-none"
                                placeholder="Result will appear here..."
                            />
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
