'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jsonToCSV, csvToJSON, getCSVStats } from '@/lib/tools/developer/json-csv-converter';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, Copy, Check, Download, FileJson, FileSpreadsheet } from 'lucide-react';

export function JsonCsvConverter() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [direction, setDirection] = React.useState<'json-to-csv' | 'csv-to-json'>('json-to-csv');
    const [delimiter, setDelimiter] = React.useState(',');
    const [includeHeaders, setIncludeHeaders] = React.useState(true);
    const [error, setError] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [stats, setStats] = React.useState<any>(null);

    const handleConvert = () => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            setStats(null);
            return;
        }

        setError('');

        if (direction === 'json-to-csv') {
            const result = jsonToCSV({ json: input, delimiter, includeHeaders });
            if (result.success && result.data) {
                setOutput(result.data.csv || '');
                setStats({ rowCount: result.data.rowCount || 0, columnCount: result.data.headers?.length || 0 });
            } else {
                setError(result.error || 'Invalid JSON');
                setOutput('');
                setStats(null);
            }
        } else {
            const result = csvToJSON(input, { delimiter, hasHeaders: includeHeaders });
            if (result.success && result.data) {
                setOutput(JSON.stringify(result.data, null, 2));
                const csvStats = getCSVStats(input, delimiter);
                setStats(csvStats);
            } else {
                setError(result.error || 'Invalid CSV');
                setOutput('');
                setStats(null);
            }
        }
    };

    React.useEffect(() => {
        if (input.trim()) {
            handleConvert();
        }
    }, [input, direction, delimiter, includeHeaders]);

    const handleSwap = () => {
        setDirection(d => d === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv');
        setInput(output);
        setOutput('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([output], { type: direction === 'json-to-csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = direction === 'json-to-csv' ? 'data.csv' : 'data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Direction Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setDirection('json-to-csv')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            direction === 'json-to-csv' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <FileJson className="h-4 w-4" />
                        <span>JSON → CSV</span>
                    </button>
                    <button
                        onClick={() => setDirection('csv-to-json')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            direction === 'csv-to-json' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>CSV → JSON</span>
                    </button>
                </div>
            </div>

            {/* Options */}
            <div className="flex justify-center flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-slate-700">Delimiter:</label>
                    <select
                        value={delimiter}
                        onChange={(e) => setDelimiter(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 text-slate-900 bg-white focus:ring-indigo-500"
                    >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab</option>
                        <option value="|">Pipe (|)</option>
                    </select>
                </div>
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={includeHeaders}
                        onChange={(e) => setIncludeHeaders(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Headers</span>
                </label>
            </div>

            {/* Input/Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center space-x-2">
                        {direction === 'json-to-csv' ? <FileJson className="h-4 w-4 text-amber-600" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
                        <span className="text-sm font-medium text-slate-700">
                            {direction === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}
                        </span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={direction === 'json-to-csv'
                            ? '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                            : 'name,age\nJohn,30\nJane,25'
                        }
                        className="w-full h-64 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {direction === 'json-to-csv' ? <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> : <FileJson className="h-4 w-4 text-amber-600" />}
                            <span className="text-sm font-medium text-slate-700">
                                {direction === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={handleSwap} className="text-xs">
                                <ArrowRightLeft className="h-3 w-3 mr-1" /> Swap
                            </Button>
                            {output && (
                                <>
                                    <Button variant="ghost" size="sm" onClick={handleDownload} className="text-xs">
                                        <Download className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={error || output}
                        readOnly
                        className={cn(
                            "w-full h-64 px-4 py-3 bg-slate-50 focus:outline-none font-mono text-sm resize-none border-0",
                            error ? "text-rose-600" : "text-slate-900"
                        )}
                    />
                </Card>
            </div>

            {/* Stats */}
            {stats && !error && (
                <div className="flex justify-center space-x-6">
                    <div className="text-center">
                        <span className="text-2xl font-bold text-indigo-600">{stats.rowCount || stats.totalUrls || 0}</span>
                        <span className="block text-xs text-slate-500">Rows</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-bold text-indigo-600">{stats.columnCount || stats.headers?.length || 0}</span>
                        <span className="block text-xs text-slate-500">Columns</span>
                    </div>
                </div>
            )}
        </div>
    );
}
