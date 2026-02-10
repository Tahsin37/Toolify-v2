'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Copy, CheckCircle2, Info, RefreshCw, Settings
} from 'lucide-react';

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
    'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
    'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
    'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
    'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
    'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt'
];

export function LoremGenerator() {
    const [type, setType] = React.useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [count, setCount] = React.useState(3);
    const [output, setOutput] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [startWithLorem, setStartWithLorem] = React.useState(true);

    const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const generateSentence = (minWords = 8, maxWords = 15): string => {
        const length = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
        const words = Array.from({ length }, getRandomWord);
        words[0] = capitalize(words[0]);
        return words.join(' ') + '.';
    };

    const generateParagraph = (minSentences = 4, maxSentences = 8): string => {
        const length = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
        return Array.from({ length }, () => generateSentence()).join(' ');
    };

    const generate = React.useCallback(() => {
        let result = '';

        switch (type) {
            case 'paragraphs':
                const paragraphs = Array.from({ length: count }, generateParagraph);
                if (startWithLorem && paragraphs.length > 0) {
                    paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraphs[0].split('. ').slice(1).join('. ');
                }
                result = paragraphs.join('\n\n');
                break;

            case 'sentences':
                const sentences = Array.from({ length: count }, () => generateSentence());
                if (startWithLorem && sentences.length > 0) {
                    sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
                }
                result = sentences.join(' ');
                break;

            case 'words':
                const words = Array.from({ length: count }, getRandomWord);
                if (startWithLorem && words.length >= 2) {
                    words[0] = 'lorem';
                    words[1] = 'ipsum';
                }
                result = capitalize(words.join(' ')) + '.';
                break;
        }

        setOutput(result);
    }, [type, count, startWithLorem]);

    React.useEffect(() => {
        generate();
    }, [generate]);

    const copyOutput = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const wordCount = output.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = output.length;

    return (
        <div className="space-y-6">
            {/* Settings */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                    Generator Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Type</label>
                        <div className="grid grid-cols-3 gap-1">
                            {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${type === t
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Count: {count}
                        </label>
                        <Input
                            type="number"
                            min={1}
                            max={100}
                            value={count}
                            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={startWithLorem}
                                onChange={(e) => setStartWithLorem(e.target.checked)}
                                className="h-4 w-4 rounded text-indigo-600"
                            />
                            <span className="text-sm text-slate-600">Start with "Lorem ipsum..."</span>
                        </label>
                    </div>
                </div>
                <div className="mt-4">
                    <Button onClick={generate} className="bg-indigo-600 hover:bg-indigo-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>
                </div>
            </Card>

            {/* Output */}
            <Card className="p-5 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-sm font-semibold text-slate-800">Generated Text</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">{wordCount} words • {charCount} chars</span>
                        <Button variant="outline" size="sm" onClick={copyOutput}>
                            {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg max-h-96 overflow-auto">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{output}</p>
                </div>
            </Card>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Lorem Ipsum Generator</h4>
                        <p className="text-sm text-indigo-700">
                            Generate placeholder text for your designs and mockups. Choose between
                            paragraphs, sentences, or words and customize the output count.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
