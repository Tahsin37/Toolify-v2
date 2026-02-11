'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    FileJson, Upload, Copy, Check, ChevronRight, ChevronDown,
    Search, Maximize2, Minimize2, Info
} from 'lucide-react';

interface JsonNode {
    key: string;
    value: any;
    type: string;
    depth: number;
    path: string;
}

export function JsonPreviewer() {
    const [jsonText, setJsonText] = React.useState('');
    const [parsed, setParsed] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [collapsedPaths, setCollapsedPaths] = React.useState<Set<string>>(new Set());
    const [isMinified, setIsMinified] = React.useState(false);

    const handleParse = React.useCallback((text: string) => {
        if (!text.trim()) {
            setParsed(null);
            setError(null);
            return;
        }
        try {
            const result = JSON.parse(text);
            setParsed(result);
            setError(null);
        } catch (e: any) {
            setParsed(null);
            setError(e.message);
        }
    }, []);

    React.useEffect(() => {
        handleParse(jsonText);
    }, [jsonText, handleParse]);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setJsonText(text);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            file.text().then(text => setJsonText(text));
        }
    };

    const handleCopy = () => {
        const output = isMinified
            ? JSON.stringify(parsed)
            : JSON.stringify(parsed, null, 2);
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadSample = () => {
        setJsonText(JSON.stringify({
            name: "Toolify",
            version: "2.0.0",
            description: "Free Online SEO & Developer Tools",
            features: ["SEO Analysis", "Code Formatting", "File Conversion"],
            config: {
                theme: "dark",
                language: "en",
                analytics: { enabled: true, provider: "google" }
            },
            tags: ["seo", "tools", "web", "developer"],
            stats: { users: 15000, tools: 50, uptime: 99.9 }
        }, null, 2));
    };

    const togglePath = (path: string) => {
        setCollapsedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const collapseAll = () => {
        const paths = new Set<string>();
        const walk = (obj: any, path: string) => {
            if (obj && typeof obj === 'object') {
                paths.add(path);
                Object.keys(obj).forEach(k => walk(obj[k], path ? `${path}.${k}` : k));
            }
        };
        walk(parsed, '');
        setCollapsedPaths(paths);
    };

    const expandAll = () => setCollapsedPaths(new Set());

    const renderValue = (value: any, path: string, depth: number): React.ReactNode => {
        if (value === null) return <span className="text-rose-500">null</span>;
        if (typeof value === 'boolean') return <span className="text-amber-600">{value.toString()}</span>;
        if (typeof value === 'number') return <span className="text-cyan-600">{value}</span>;
        if (typeof value === 'string') {
            const highlighted = searchTerm && value.toLowerCase().includes(searchTerm.toLowerCase());
            return (
                <span className={cn("text-emerald-600", highlighted && "bg-yellow-200 rounded px-0.5")}>
                    &quot;{value}&quot;
                </span>
            );
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-slate-500">[]</span>;
            const isCollapsed = collapsedPaths.has(path);

            return (
                <span>
                    <button onClick={() => togglePath(path)} className="inline-flex items-center text-slate-500 hover:text-indigo-600">
                        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    <span className="text-slate-500">[</span>
                    {isCollapsed ? (
                        <span className="text-slate-400 text-xs ml-1">{value.length} items</span>
                    ) : (
                        <div className="ml-5">
                            {value.map((item, i) => (
                                <div key={i}>
                                    {renderValue(item, `${path}[${i}]`, depth + 1)}
                                    {i < value.length - 1 && <span className="text-slate-400">,</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    <span className="text-slate-500">]</span>
                </span>
            );
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) return <span className="text-slate-500">{'{}'}</span>;
            const isCollapsed = collapsedPaths.has(path);

            return (
                <span>
                    <button onClick={() => togglePath(path)} className="inline-flex items-center text-slate-500 hover:text-indigo-600">
                        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    <span className="text-slate-500">{'{'}</span>
                    {isCollapsed ? (
                        <span className="text-slate-400 text-xs ml-1">{keys.length} keys</span>
                    ) : (
                        <div className="ml-5">
                            {keys.map((key, i) => {
                                const highlighted = searchTerm && key.toLowerCase().includes(searchTerm.toLowerCase());
                                return (
                                    <div key={key}>
                                        <span className={cn("text-violet-600", highlighted && "bg-yellow-200 rounded px-0.5")}>
                                            &quot;{key}&quot;
                                        </span>
                                        <span className="text-slate-500">: </span>
                                        {renderValue(value[key], path ? `${path}.${key}` : key, depth + 1)}
                                        {i < keys.length - 1 && <span className="text-slate-400">,</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <span className="text-slate-500">{'}'}</span>
                </span>
            );
        }

        return <span>{String(value)}</span>;
    };

    const getStats = () => {
        if (!parsed) return null;
        const countNodes = (obj: any): number => {
            if (obj === null || typeof obj !== 'object') return 1;
            return Object.values(obj).reduce((sum: number, v) => sum + countNodes(v), 1);
        };
        const depth = (obj: any, d = 0): number => {
            if (obj === null || typeof obj !== 'object') return d;
            return Math.max(...Object.values(obj).map(v => depth(v, d + 1)), d);
        };

        return {
            nodes: countNodes(parsed),
            depth: depth(parsed),
            size: new Blob([JSON.stringify(parsed)]).size,
            type: Array.isArray(parsed) ? 'Array' : 'Object',
        };
    };

    const stats = getStats();

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-5 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">JSON Input</label>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={loadSample} className="text-xs">
                            Load Sample
                        </Button>
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <Upload className="h-3 w-3 mr-1" /> Upload .json
                            <input type="file" accept=".json" onChange={handleFile} className="hidden" />
                        </label>
                    </div>
                </div>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder='{"key": "value"} — Paste JSON or drop a .json file'
                        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                        spellCheck={false}
                    />
                </div>
            </Card>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-700 font-medium">❌ Parse Error: {error}</p>
                </Card>
            )}

            {/* Stats & Controls */}
            {parsed && stats && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="p-3 bg-white border border-slate-200 text-center">
                            <div className="text-xl font-bold text-indigo-600">{stats.type}</div>
                            <div className="text-xs text-slate-500">Root Type</div>
                        </Card>
                        <Card className="p-3 bg-white border border-slate-200 text-center">
                            <div className="text-xl font-bold text-emerald-600">{stats.nodes}</div>
                            <div className="text-xs text-slate-500">Total Nodes</div>
                        </Card>
                        <Card className="p-3 bg-white border border-slate-200 text-center">
                            <div className="text-xl font-bold text-amber-600">{stats.depth}</div>
                            <div className="text-xs text-slate-500">Max Depth</div>
                        </Card>
                        <Card className="p-3 bg-white border border-slate-200 text-center">
                            <div className="text-xl font-bold text-cyan-600">{(stats.size / 1024).toFixed(1)}KB</div>
                            <div className="text-xs text-slate-500">Size</div>
                        </Card>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search keys and values..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <Button size="sm" variant="outline" onClick={expandAll}>
                            <Maximize2 className="h-3 w-3 mr-1" /> Expand
                        </Button>
                        <Button size="sm" variant="outline" onClick={collapseAll}>
                            <Minimize2 className="h-3 w-3 mr-1" /> Collapse
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsMinified(!isMinified)}>
                            {isMinified ? 'Prettify' : 'Minify'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>

                    {/* Tree View */}
                    <Card className="p-5 bg-slate-900 border border-slate-700 overflow-x-auto">
                        <pre className="font-mono text-sm text-slate-200 leading-relaxed">
                            {renderValue(parsed, '', 0)}
                        </pre>
                    </Card>
                </>
            )}

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">JSON Previewer</h4>
                        <p className="text-sm text-indigo-700">
                            Paste or upload JSON to preview with syntax highlighting, collapsible tree view, and search.
                            View stats like node count, depth, and file size.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
