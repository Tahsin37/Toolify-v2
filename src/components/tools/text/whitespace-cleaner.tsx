'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cleanWhitespace, analyzeWhitespace } from '@/lib/tools/text/whitespace-cleaner';
import { cn } from '@/lib/utils';
import { Copy, Check, Eraser, ArrowRight } from 'lucide-react';

export function WhitespaceCleaner() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [options, setOptions] = React.useState({
        trimLines: true,
        removeExtraSpaces: true,
        removeExtraNewlines: true,
        normalizeLineEndings: true,
        removeTabs: false,
        removeAllWhitespace: false,
    });
    const [analysis, setAnalysis] = React.useState<any>(null);
    const [changes, setChanges] = React.useState<string[]>([]);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!input) {
            setOutput('');
            setAnalysis(null);
            setChanges([]);
            return;
        }

        setAnalysis(analyzeWhitespace(input));
        const result = cleanWhitespace({ text: input, options });
        if (result.success && result.data) {
            setOutput(result.data.cleaned);
            setChanges(result.data.changesApplied);
        }
    }, [input, options]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleOption = (key: keyof typeof options) => {
        if (key === 'removeAllWhitespace' && !options.removeAllWhitespace) {
            // Reset other options when enabling remove all
            setOptions({ ...options, [key]: true });
        } else {
            setOptions({ ...options, [key]: !options[key] });
        }
    };

    return (
        <div className="space-y-6">
            {/* Options */}
            <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3">Cleaning Options</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries({
                        trimLines: 'Trim Lines',
                        removeExtraSpaces: 'Remove Extra Spaces',
                        removeExtraNewlines: 'Remove Extra Newlines',
                        normalizeLineEndings: 'Normalize Line Endings',
                        removeTabs: 'Remove Tabs',
                        removeAllWhitespace: 'Remove ALL Whitespace',
                    }).map(([key, label]) => (
                        <label
                            key={key}
                            className={cn(
                                "flex items-center space-x-2 text-sm p-2 rounded-lg cursor-pointer transition-colors",
                                options[key as keyof typeof options]
                                    ? key === 'removeAllWhitespace' ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={options[key as keyof typeof options]}
                                onChange={() => toggleOption(key as keyof typeof options)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </Card>

            {/* Input/Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Original Text</span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste text with messy whitespace..."
                        className="w-full h-48 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Cleaned Text</span>
                        {output && (
                            <Button variant="ghost" size="sm" onClick={handleCopy}>
                                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        )}
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="w-full h-48 px-4 py-3 bg-slate-50 text-slate-900 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>
            </div>

            {/* Analysis & Changes */}
            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Whitespace Analysis */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Whitespace Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                <span className="text-slate-600">Spaces</span>
                                <span className="font-medium text-slate-900">{analysis.spaces}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                <span className="text-slate-600">Tabs</span>
                                <span className="font-medium text-slate-900">{analysis.tabs}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                <span className="text-slate-600">Newlines</span>
                                <span className="font-medium text-slate-900">{analysis.newlines}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                <span className="text-slate-600">Empty Lines</span>
                                <span className="font-medium text-slate-900">{analysis.emptyLines}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                <span className="text-slate-600">Consecutive Spaces</span>
                                <span className="font-medium text-slate-900">{analysis.consecutiveSpaces}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-indigo-50 rounded">
                                <span className="text-indigo-600">Whitespace %</span>
                                <span className="font-medium text-indigo-700">{analysis.whitespacePercentage}%</span>
                            </div>
                        </div>
                    </Card>

                    {/* Changes Applied */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                            <Eraser className="h-4 w-4 text-indigo-600 mr-2" />
                            Changes Applied
                        </h4>
                        {changes.length > 0 ? (
                            <ul className="space-y-2">
                                {changes.map((change, i) => (
                                    <li key={i} className="flex items-center text-sm text-slate-700">
                                        <ArrowRight className="h-3 w-3 text-emerald-600 mr-2" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No changes applied</p>
                        )}

                        {input && output && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                                <p className="text-sm">
                                    <span className="text-slate-600">Characters saved: </span>
                                    <span className="font-bold text-emerald-600">{input.length - output.length}</span>
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
