'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, RotateCcw, Info, Check } from 'lucide-react';

// Standard QWERTY keyboard layout
const KEYBOARD_ROWS = [
    [
        { key: 'Escape', label: 'Esc', width: 'w-14' },
        { key: 'F1', label: 'F1', width: 'w-11' },
        { key: 'F2', label: 'F2', width: 'w-11' },
        { key: 'F3', label: 'F3', width: 'w-11' },
        { key: 'F4', label: 'F4', width: 'w-11' },
        { key: 'F5', label: 'F5', width: 'w-11' },
        { key: 'F6', label: 'F6', width: 'w-11' },
        { key: 'F7', label: 'F7', width: 'w-11' },
        { key: 'F8', label: 'F8', width: 'w-11' },
        { key: 'F9', label: 'F9', width: 'w-11' },
        { key: 'F10', label: 'F10', width: 'w-11' },
        { key: 'F11', label: 'F11', width: 'w-11' },
        { key: 'F12', label: 'F12', width: 'w-11' },
    ],
    [
        { key: 'Backquote', label: '`', width: 'w-11' },
        { key: 'Digit1', label: '1', width: 'w-11' },
        { key: 'Digit2', label: '2', width: 'w-11' },
        { key: 'Digit3', label: '3', width: 'w-11' },
        { key: 'Digit4', label: '4', width: 'w-11' },
        { key: 'Digit5', label: '5', width: 'w-11' },
        { key: 'Digit6', label: '6', width: 'w-11' },
        { key: 'Digit7', label: '7', width: 'w-11' },
        { key: 'Digit8', label: '8', width: 'w-11' },
        { key: 'Digit9', label: '9', width: 'w-11' },
        { key: 'Digit0', label: '0', width: 'w-11' },
        { key: 'Minus', label: '-', width: 'w-11' },
        { key: 'Equal', label: '=', width: 'w-11' },
        { key: 'Backspace', label: '⌫ Back', width: 'w-20' },
    ],
    [
        { key: 'Tab', label: 'Tab', width: 'w-16' },
        { key: 'KeyQ', label: 'Q', width: 'w-11' },
        { key: 'KeyW', label: 'W', width: 'w-11' },
        { key: 'KeyE', label: 'E', width: 'w-11' },
        { key: 'KeyR', label: 'R', width: 'w-11' },
        { key: 'KeyT', label: 'T', width: 'w-11' },
        { key: 'KeyY', label: 'Y', width: 'w-11' },
        { key: 'KeyU', label: 'U', width: 'w-11' },
        { key: 'KeyI', label: 'I', width: 'w-11' },
        { key: 'KeyO', label: 'O', width: 'w-11' },
        { key: 'KeyP', label: 'P', width: 'w-11' },
        { key: 'BracketLeft', label: '[', width: 'w-11' },
        { key: 'BracketRight', label: ']', width: 'w-11' },
        { key: 'Backslash', label: '\\', width: 'w-14' },
    ],
    [
        { key: 'CapsLock', label: 'Caps', width: 'w-[72px]' },
        { key: 'KeyA', label: 'A', width: 'w-11' },
        { key: 'KeyS', label: 'S', width: 'w-11' },
        { key: 'KeyD', label: 'D', width: 'w-11' },
        { key: 'KeyF', label: 'F', width: 'w-11' },
        { key: 'KeyG', label: 'G', width: 'w-11' },
        { key: 'KeyH', label: 'H', width: 'w-11' },
        { key: 'KeyJ', label: 'J', width: 'w-11' },
        { key: 'KeyK', label: 'K', width: 'w-11' },
        { key: 'KeyL', label: 'L', width: 'w-11' },
        { key: 'Semicolon', label: ';', width: 'w-11' },
        { key: 'Quote', label: "'", width: 'w-11' },
        { key: 'Enter', label: 'Enter ↵', width: 'w-[82px]' },
    ],
    [
        { key: 'ShiftLeft', label: '⇧ Shift', width: 'w-[92px]' },
        { key: 'KeyZ', label: 'Z', width: 'w-11' },
        { key: 'KeyX', label: 'X', width: 'w-11' },
        { key: 'KeyC', label: 'C', width: 'w-11' },
        { key: 'KeyV', label: 'V', width: 'w-11' },
        { key: 'KeyB', label: 'B', width: 'w-11' },
        { key: 'KeyN', label: 'N', width: 'w-11' },
        { key: 'KeyM', label: 'M', width: 'w-11' },
        { key: 'Comma', label: ',', width: 'w-11' },
        { key: 'Period', label: '.', width: 'w-11' },
        { key: 'Slash', label: '/', width: 'w-11' },
        { key: 'ShiftRight', label: 'Shift ⇧', width: 'w-[92px]' },
    ],
    [
        { key: 'ControlLeft', label: 'Ctrl', width: 'w-14' },
        { key: 'MetaLeft', label: 'Win', width: 'w-12' },
        { key: 'AltLeft', label: 'Alt', width: 'w-12' },
        { key: 'Space', label: 'Space', width: 'flex-1' },
        { key: 'AltRight', label: 'Alt', width: 'w-12' },
        { key: 'MetaRight', label: 'Win', width: 'w-12' },
        { key: 'ContextMenu', label: 'Menu', width: 'w-12' },
        { key: 'ControlRight', label: 'Ctrl', width: 'w-14' },
    ],
];

const ARROW_KEYS = [
    { key: 'ArrowUp', label: '↑', row: 0, col: 1 },
    { key: 'ArrowLeft', label: '←', row: 1, col: 0 },
    { key: 'ArrowDown', label: '↓', row: 1, col: 1 },
    { key: 'ArrowRight', label: '→', row: 1, col: 2 },
];

const ALL_KEY_CODES = KEYBOARD_ROWS.flat().map(k => k.key).concat(ARROW_KEYS.map(k => k.key));

export function KeyboardTester() {
    const [pressedKeys, setPressedKeys] = React.useState<Set<string>>(new Set());
    const [testedKeys, setTestedKeys] = React.useState<Set<string>>(new Set());
    const [activeKey, setActiveKey] = React.useState<string | null>(null);
    const [totalPresses, setTotalPresses] = React.useState(0);
    const [lastKey, setLastKey] = React.useState<string>('');
    const [lastKeyCode, setLastKeyCode] = React.useState<string>('');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const code = e.code;
            setActiveKey(code);
            setLastKey(e.key);
            setLastKeyCode(code);
            setTotalPresses(p => p + 1);

            setTestedKeys(prev => {
                const next = new Set(prev);
                next.add(code);
                return next;
            });
            setPressedKeys(prev => {
                const next = new Set(prev);
                next.add(code);
                return next;
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            const code = e.code;
            setActiveKey(null);
            setPressedKeys(prev => {
                const next = new Set(prev);
                next.delete(code);
                return next;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const reset = () => {
        setPressedKeys(new Set());
        setTestedKeys(new Set());
        setActiveKey(null);
        setTotalPresses(0);
        setLastKey('');
        setLastKeyCode('');
    };

    const testedCount = testedKeys.size;
    const totalKeys = ALL_KEY_CODES.length;
    const coverage = totalKeys > 0 ? Math.round((testedCount / totalKeys) * 100) : 0;

    const getKeyStyle = (code: string) => {
        const isActive = pressedKeys.has(code);
        const isTested = testedKeys.has(code);

        if (isActive) return 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-95 ring-2 ring-indigo-300';
        if (isTested) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
        return 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50';
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{totalPresses}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Presses</div>
                </Card>
                <Card className="p-4 bg-white border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{testedCount}</div>
                    <div className="text-xs text-slate-500 mt-1">Keys Tested</div>
                </Card>
                <Card className="p-4 bg-white border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-amber-600">{coverage}%</div>
                    <div className="text-xs text-slate-500 mt-1">Coverage</div>
                </Card>
                <Card className="p-4 bg-white border border-slate-200 text-center">
                    <div className="text-lg font-mono font-bold text-slate-700 truncate">
                        {lastKey || '—'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Last Key</div>
                </Card>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Keyboard Coverage</span>
                    <span>{testedCount} / {totalKeys} keys</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${coverage}%` }}
                    />
                </div>
            </div>

            {/* Visual Keyboard */}
            <Card className="p-4 md:p-6 bg-slate-100 border border-slate-200 overflow-x-auto">
                <div className="min-w-[700px] space-y-1.5">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1">
                            {row.map((keyDef) => (
                                <button
                                    key={keyDef.key}
                                    className={`${keyDef.width} h-10 rounded-lg border text-xs font-medium transition-all duration-100 flex items-center justify-center flex-shrink-0 ${getKeyStyle(keyDef.key)}`}
                                    tabIndex={-1}
                                >
                                    {testedKeys.has(keyDef.key) && !pressedKeys.has(keyDef.key) && (
                                        <Check className="h-3 w-3 mr-0.5 text-emerald-500" />
                                    )}
                                    {keyDef.label}
                                </button>
                            ))}
                        </div>
                    ))}

                    {/* Arrow Keys */}
                    <div className="flex justify-end mt-2">
                        <div className="grid grid-cols-3 gap-1" style={{ width: '138px' }}>
                            <div />
                            <button
                                className={`w-11 h-9 rounded-lg border text-xs font-medium transition-all duration-100 flex items-center justify-center ${getKeyStyle('ArrowUp')}`}
                                tabIndex={-1}
                            >↑</button>
                            <div />
                            <button
                                className={`w-11 h-9 rounded-lg border text-xs font-medium transition-all duration-100 flex items-center justify-center ${getKeyStyle('ArrowLeft')}`}
                                tabIndex={-1}
                            >←</button>
                            <button
                                className={`w-11 h-9 rounded-lg border text-xs font-medium transition-all duration-100 flex items-center justify-center ${getKeyStyle('ArrowDown')}`}
                                tabIndex={-1}
                            >↓</button>
                            <button
                                className={`w-11 h-9 rounded-lg border text-xs font-medium transition-all duration-100 flex items-center justify-center ${getKeyStyle('ArrowRight')}`}
                                tabIndex={-1}
                            >→</button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Key Info & Reset */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                    {lastKeyCode ? (
                        <span>Last: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{lastKey}</code> (code: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{lastKeyCode}</code>)</span>
                    ) : (
                        <span className="text-slate-400">Press any key to begin testing...</span>
                    )}
                </div>
                <Button variant="outline" onClick={reset} className="text-red-600 border-red-200 hover:bg-red-50">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded border border-slate-300 bg-white" />
                    <span>Not tested</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded border border-emerald-300 bg-emerald-50" />
                    <span>Tested ✓</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded border border-indigo-600 bg-indigo-500" />
                    <span>Active (pressed)</span>
                </div>
            </div>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Keyboard Tester</h4>
                        <p className="text-sm text-indigo-700">
                            Press any key to test it. Keys light up blue when pressed and turn green once tested.
                            Use this tool to check for stuck, non-working, or ghosting keys. Try testing all keys for full coverage.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
