import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { KeyboardTester } from '../keyboard-tester';
import '@testing-library/jest-dom';

// Mock AudioContext
window.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: () => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: {
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
        },
    }),
    createGain: () => ({
        connect: jest.fn(),
        gain: {
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
        },
    }),
    currentTime: 0,
    destination: {},
})) as any;

describe('KeyboardTester', () => {
    it('renders correctly', () => {
        render(<KeyboardTester />);
        expect(screen.getByText('Keyboard Tester')).toBeInTheDocument();
        expect(screen.getByText('Keys Tested')).toBeInTheDocument();
    });

    it('registers key presses', async () => {
        render(<KeyboardTester />);

        // Simulate pressing 'A'
        await act(async () => {
            fireEvent.keyDown(window, { key: 'a', code: 'KeyA' });
        });

        // Check if stats updated
        expect(screen.getByText('KeyA')).toBeInTheDocument();
        // "Pressed" count should be 1. The component displays the count.
        // We look for the element that contains the count.
        // Based on the code: <div class="... text-indigo-600">1</div>
        const testedCount = screen.getByText('1');
        expect(testedCount).toBeInTheDocument();
    });

    it('resets state when reset button is clicked', async () => {
        render(<KeyboardTester />);

        // Simulate pressing 'A'
        await act(async () => {
            fireEvent.keyDown(window, { key: 'a', code: 'KeyA' });
        });

        // Verify it's registered
        expect(screen.getByText('KeyA')).toBeInTheDocument();

        // Click Reset
        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);

        // Verify reset (Last Key should be '-' or similar, count should be 0)
        expect(screen.getByText('-')).toBeInTheDocument();
    });
});
