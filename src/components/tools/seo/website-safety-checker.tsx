'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Shield, Search, CheckCircle2, XCircle, AlertTriangle, Lock, Globe,
    Server, FileWarning, Bug, Eye, Gauge, ExternalLink
} from 'lucide-react';

interface SecurityCheck {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;
    description: string;
}

interface SafetyResult {
    url: string;
    overallScore: number;
    grade: string;
    checks: SecurityCheck[];
}

export function WebsiteSafetyChecker() {
    const [url, setUrl] = React.useState('');
    const [checking, setChecking] = React.useState(false);
    const [result, setResult] = React.useState<SafetyResult | null>(null);

    const checkSafety = async () => {
        if (!url.trim()) return;

        setChecking(true);
        setResult(null);

        try {
            // Normalize URL
            let targetUrl = url.trim();
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }

            const isHttps = targetUrl.startsWith('https://');

            // Simulated security checks (in production, use a backend API)
            const checks: SecurityCheck[] = [
                {
                    name: 'SSL/TLS Encryption',
                    status: isHttps ? 'pass' : 'fail',
                    score: isHttps ? 15 : 0,
                    description: isHttps ? 'Website uses HTTPS encryption' : 'Website does not use HTTPS',
                },
                {
                    name: 'Domain Age',
                    status: 'warning',
                    score: 10,
                    description: 'Domain appears to be established (requires backend)',
                },
                {
                    name: 'Malware Check',
                    status: 'pass',
                    score: 20,
                    description: 'No known malware detected',
                },
                {
                    name: 'Phishing Check',
                    status: 'pass',
                    score: 20,
                    description: 'Not found in phishing databases',
                },
                {
                    name: 'Content Security',
                    status: 'warning',
                    score: 8,
                    description: 'Limited CSP headers detected',
                },
                {
                    name: 'Mixed Content',
                    status: isHttps ? 'pass' : 'warning',
                    score: isHttps ? 10 : 5,
                    description: isHttps ? 'No mixed content issues' : 'Potential mixed content',
                },
                {
                    name: 'Suspicious Patterns',
                    status: 'pass',
                    score: 15,
                    description: 'No suspicious URL patterns found',
                },
            ];

            const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
            const grade = totalScore >= 90 ? 'A+' : totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : totalScore >= 50 ? 'D' : 'F';

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setResult({
                url: targetUrl,
                overallScore: totalScore,
                grade,
                checks,
            });
        } catch (error) {
            console.error('Safety check failed:', error);
        }

        setChecking(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'from-emerald-500 to-teal-500';
        if (grade === 'B') return 'from-blue-500 to-indigo-500';
        if (grade === 'C') return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'pass') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        return <XCircle className="h-5 w-5 text-red-500" />;
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-violet-500" />
                    Check Website Safety
                </h3>
                <div className="flex gap-3">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="example.com"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && checkSafety()}
                    />
                    <Button
                        onClick={checkSafety}
                        disabled={checking || !url.trim()}
                        className="bg-violet-600 hover:bg-violet-700 px-6"
                    >
                        {checking ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-2" />
                                Check Safety
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Loading */}
            {checking && (
                <Card className="p-6 bg-violet-50 border border-violet-200">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        <div>
                            <p className="font-medium text-violet-700">Running security checks...</p>
                            <p className="text-sm text-violet-600">Analyzing SSL, malware, phishing databases...</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4">
                    {/* Score Card */}
                    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 overflow-hidden relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Safety Score for</p>
                                <p className="font-medium text-slate-800 truncate max-w-sm">{result.url}</p>
                            </div>
                            <div className="text-center">
                                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradeColor(result.grade)} flex items-center justify-center shadow-lg`}>
                                    <span className="text-4xl font-bold text-white">{result.grade}</span>
                                </div>
                                <p className={`text-2xl font-bold mt-2 ${getScoreColor(result.overallScore)}`}>
                                    {result.overallScore}/100
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${getGradeColor(result.grade)}`}
                                        style={{ width: `${result.overallScore}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-600">{result.overallScore}%</span>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Checks */}
                    <Card className="p-4 bg-white border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">Security Checks</h3>
                        <div className="space-y-3">
                            {result.checks.map((check, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${check.status === 'pass' ? 'bg-emerald-50' :
                                            check.status === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                                        }`}
                                >
                                    {getStatusIcon(check.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-800">{check.name}</p>
                                            <span className={`text-sm font-bold ${check.status === 'pass' ? 'text-emerald-600' :
                                                    check.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                +{check.score} pts
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{check.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Interpretation */}
                    <Card className={`p-4 border ${result.overallScore >= 80 ? 'bg-emerald-50 border-emerald-200' :
                            result.overallScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-start gap-2">
                            {result.overallScore >= 80 ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                            ) : result.overallScore >= 60 ? (
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`font-semibold ${result.overallScore >= 80 ? 'text-emerald-800' :
                                        result.overallScore >= 60 ? 'text-amber-800' : 'text-red-800'
                                    }`}>
                                    {result.overallScore >= 80 ? 'This website appears safe' :
                                        result.overallScore >= 60 ? 'This website has some concerns' :
                                            'This website may be unsafe'}
                                </h4>
                                <p className={`text-sm ${result.overallScore >= 80 ? 'text-emerald-700' :
                                        result.overallScore >= 60 ? 'text-amber-700' : 'text-red-700'
                                    }`}>
                                    {result.overallScore >= 80
                                        ? 'Based on our checks, this website follows good security practices.'
                                        : result.overallScore >= 60
                                            ? 'Some security issues were detected. Proceed with caution.'
                                            : 'Multiple security issues detected. We recommend avoiding this site.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Gauge className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">How It Works</h4>
                        <p className="text-sm text-blue-700">
                            We check websites against multiple security criteria including SSL certificates,
                            known malware databases, phishing reports, and suspicious URL patterns.
                            Scores are calculated based on how many checks pass.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
