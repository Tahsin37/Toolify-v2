'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateRobotsTxt, generateRobotsTxtTemplate } from '@/lib/tools/seo/robots-validator';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Copy, Check, FileText } from 'lucide-react';

export function RobotsValidator() {
    const [content, setContent] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);

    const handleValidate = () => {
        const data = validateRobotsTxt({ content });
        if (data.success) {
            setResult(data.data);
        }
    };

    const handleLoadTemplate = () => {
        const template = generateRobotsTxtTemplate({
            allowAll: false,
            disallowPaths: ['/admin/', '/private/'],
            sitemapUrl: 'https://example.com/sitemap.xml'
        });
        setContent(template);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">robots.txt</span>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleLoadTemplate} className="text-xs">
                            Load Template
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your robots.txt content here..."
                    className="w-full h-64 px-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                />
            </Card>

            <Button onClick={handleValidate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                Validate Robots.txt
            </Button>

            {result && (
                <>
                    {/* Status Banner */}
                    <Card className={cn(
                        "p-4 border shadow-sm flex items-center space-x-3",
                        result.isValid ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                    )}>
                        {result.isValid ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                            <XCircle className="h-6 w-6 text-rose-600" />
                        )}
                        <div>
                            <h3 className={cn("font-bold", result.isValid ? "text-emerald-800" : "text-rose-800")}>
                                {result.isValid ? 'Valid robots.txt' : 'Invalid robots.txt'}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {result.directives.length} directives found • {result.userAgents.length} user-agents • {result.sitemaps.length} sitemaps
                            </p>
                        </div>
                    </Card>

                    {/* Errors */}
                    {result.errors.length > 0 && (
                        <Card className="p-4 bg-rose-50 border border-rose-200">
                            <h4 className="font-bold text-rose-800 mb-2 flex items-center">
                                <XCircle className="h-4 w-4 mr-2" /> Errors
                            </h4>
                            <ul className="space-y-1">
                                {result.errors.map((error: string, i: number) => (
                                    <li key={i} className="text-sm text-rose-700 font-mono">{error}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                        <Card className="p-4 bg-amber-50 border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" /> Warnings
                            </h4>
                            <ul className="space-y-1">
                                {result.warnings.map((warning: string, i: number) => (
                                    <li key={i} className="text-sm text-amber-700">{warning}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Parsed Directives */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Parsed Directives</h4>
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Line</th>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Type</th>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Value</th>
                                        <th className="px-3 py-2 text-left text-slate-600 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.directives.map((d: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-100">
                                            <td className="px-3 py-2 text-slate-500 font-mono">{d.lineNumber}</td>
                                            <td className="px-3 py-2 font-medium text-indigo-600">{d.type}</td>
                                            <td className="px-3 py-2 text-slate-700 font-mono truncate max-w-[200px]">{d.value}</td>
                                            <td className="px-3 py-2">
                                                {d.isValid ? (
                                                    <span className="text-emerald-600">✓</span>
                                                ) : (
                                                    <span className="text-rose-600">✗</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
