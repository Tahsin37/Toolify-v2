'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseHTTPHeaders, getRecommendedSecurityHeaders } from '@/lib/tools/web/http-header-viewer';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck, Copy, Check, Globe, Lock, RefreshCw, Server } from 'lucide-react';
import type { HTTPHeader, HTTPHeaderResult } from '@/lib/types';

export function HttpHeaderViewer() {
    const [headers, setHeaders] = React.useState('');
    const [result, setResult] = React.useState<HTTPHeaderResult | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'all' | 'security' | 'caching' | 'cors'>('all');

    const handleParse = () => {
        if (!headers.trim()) return;
        const data = parseHTTPHeaders({ headers });
        if (data.success && data.data) {
            setResult(data.data);
        }
    };

    const loadExample = () => {
        setHeaders(`HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 12345
Cache-Control: max-age=3600, public
ETag: "abc123"
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Server: nginx/1.18.0`);
    };

    const copyRecommended = () => {
        const recommended = getRecommendedSecurityHeaders();
        const text = Object.entries(recommended).map(([k, v]) => `${k}: ${v}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredHeaders = result?.headers.filter(h =>
        activeTab === 'all' || h.category === activeTab
    ) || [];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <ShieldCheck className="h-8 w-8 text-emerald-600" />;
        if (score >= 60) return <Shield className="h-8 w-8 text-amber-600" />;
        return <ShieldAlert className="h-8 w-8 text-rose-600" />;
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">HTTP Headers</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadExample} className="text-xs">
                        Load Example
                    </Button>
                </div>
                <textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder="Paste HTTP headers here (one per line)...

Example:
Content-Type: text/html
Cache-Control: max-age=3600"
                    className="w-full h-48 px-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                />
            </Card>

            <Button onClick={handleParse} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Server className="h-4 w-4 mr-2" />
                Analyze Headers
            </Button>

            {result && (
                <>
                    {/* Security Score */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {getScoreIcon(result.securityScore)}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Security Score</h3>
                                    <p className="text-sm text-slate-500">{result.headers.length} headers analyzed</p>
                                </div>
                            </div>
                            <div className={cn("text-4xl font-bold", getScoreColor(result.securityScore))}>
                                {result.securityScore}/100
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    result.securityScore >= 80 ? "bg-emerald-500" :
                                        result.securityScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                                )}
                                style={{ width: `${result.securityScore}%` }}
                            />
                        </div>
                    </Card>

                    {/* Security Issues */}
                    {result.securityIssues.length > 0 && (
                        <Card className="p-4 bg-rose-50 border border-rose-200">
                            <h4 className="font-bold text-rose-800 mb-3 flex items-center">
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Security Issues ({result.securityIssues.length})
                            </h4>
                            <ul className="space-y-1">
                                {result.securityIssues.map((issue, i) => (
                                    <li key={i} className="text-sm text-rose-700 flex items-start">
                                        <span className="mr-2">•</span>
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Caching Info */}
                    {result.cachingInfo.length > 0 && (
                        <Card className="p-4 bg-blue-50 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Caching Information
                            </h4>
                            <ul className="space-y-1">
                                {result.cachingInfo.map((info, i) => (
                                    <li key={i} className="text-sm text-blue-700">{info}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Category Tabs */}
                    <div className="flex space-x-2 overflow-x-auto">
                        {(['all', 'security', 'caching', 'cors'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                <span className="ml-1.5 text-xs opacity-60">
                                    ({tab === 'all' ? result.headers.length : result.headers.filter(h => h.category === tab).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Headers Table */}
                    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-slate-600 font-medium">Header</th>
                                        <th className="px-4 py-3 text-left text-slate-600 font-medium">Value</th>
                                        <th className="px-4 py-3 text-left text-slate-600 font-medium">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHeaders.map((h, i) => (
                                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-indigo-600">{h.name}</span>
                                                {h.description && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{h.description}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-700 max-w-xs truncate">
                                                {h.value}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-1 text-xs font-medium rounded-full",
                                                    h.category === 'security' && "bg-emerald-100 text-emerald-700",
                                                    h.category === 'caching' && "bg-blue-100 text-blue-700",
                                                    h.category === 'cors' && "bg-purple-100 text-purple-700",
                                                    h.category === 'general' && "bg-slate-100 text-slate-700",
                                                    h.category === 'other' && "bg-gray-100 text-gray-700"
                                                )}>
                                                    {h.category}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Recommended Headers */}
                    <Card className="p-4 bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-900 flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-indigo-600" />
                                Recommended Security Headers
                            </h4>
                            <Button variant="outline" size="sm" onClick={copyRecommended}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <pre className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
                            {Object.entries(getRecommendedSecurityHeaders()).map(([k, v]) => `${k}: ${v}`).join('\n')}
                        </pre>
                    </Card>
                </>
            )}
        </div>
    );
}
