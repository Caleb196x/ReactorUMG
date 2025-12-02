import { useMemo, useState } from 'react';
import './TextTest.css';
import * as React from 'react';

type TextAlign = 'left' | 'center' | 'right';

const ALIGNMENT_ORDER: TextAlign[] = ['left', 'center', 'right'];

const clampLineHeight = (value: number) => {
    if (value > 1.8) {
        return 1.1;
    }
    return parseFloat((value + 0.2).toFixed(1));
};

export const TextFunctionExample: React.FC = () => {
    const [content, setContent] = useState('Functional Text example');
    const [alignmentIndex, setAlignmentIndex] = useState(0);
    const [updateCount, setUpdateCount] = useState(0);
    const [lineHeight, setLineHeight] = useState(1.2);
    const [isUppercase, setIsUppercase] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [useChildren, setUseChildren] = useState(false);
    const [accentColor, setAccentColor] = useState('#ffcd38');

    const alignment = ALIGNMENT_ORDER[alignmentIndex];

    const derivedContent = useMemo(
        () => `${content} (updates ${updateCount})`,
        [content, updateCount]
    );

    const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContent(event.target.value);
        setUpdateCount((prev) => prev + 1);
    };

    const toggleAlignment = () => {
        setAlignmentIndex((prev) => (prev + 1) % ALIGNMENT_ORDER.length);
    };

    const toggleUppercase = () => {
        setIsUppercase((prev) => !prev);
    };

    const toggleDisabled = () => {
        setIsDisabled((prev) => !prev);
    };

    const toggleVisibility = () => {
        setIsVisible((prev) => !prev);
    };

    const toggleUsageMode = () => {
        setUseChildren((prev) => !prev);
    };

    const cycleLineHeight = () => {
        setLineHeight((prev) => clampLineHeight(prev));
    };

    const cycleAccentColor = () => {
        setAccentColor((prev) => {
            if (prev === '#ffcd38') return '#7fffd4';
            if (prev === '#7fffd4') return '#ff8a80';
            return '#ffcd38';
        });
    };

    return (
        <div className="text-demo-wrapper">
            <span
                className="text-demo-header"
            >
                Text Component (functional demo)
            </span>

            <span
                id="text-from-id"
                className={`text-outline ${isUppercase ? 'text-highlight' : ''}`}
                title={`Alignment: ${alignment} | line-height: ${lineHeight.toFixed(1)}`}
                style={{
                    fontSize: '22px',
                    fontWeight: isUppercase ? '700' : '500',
                    letterSpacing: '1.6px',
                    wordSpacing: '6px',
                    lineHeight: lineHeight.toString(),
                    textAlign: alignment,
                    textTransform: isUppercase ? 'uppercase' : 'none',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(255, 255, 255, 0.35)',
                    outline: '2px solid rgba(255,255,255,0.55)',
                    outlineOffset: 2,
                    textShadow: '0 0 10px rgba(0, 0, 0, 0.45)',
                    color: accentColor,
                    visibility: isVisible ? 'visible' : 'hidden',
                    pointerEvents: isDisabled ? 'none' : undefined,
                    opacity: isDisabled ? 0.5 : 1,
                }}
            >
                {useChildren ? derivedContent : derivedContent}
            </span>

            <span
                className="text-secondary text-with-shadow"
                style={{
                    fontStyle: 'italic',
                    fontSize: '18px',
                    lineHeight: '1.4',
                    textAlign: 'left',
                }}
            >
                Using the text prop with className driven styles
            </span>

            <span
                className="text-highlight"
                style={{
                    textAlign: 'center',
                    fontFamily: '"Roboto", "monospace"',
                    outline: '1px solid rgba(255, 205, 56, 0.4)',
                    padding: '4px 6px',
                    lineHeight: '1.6',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                }}
            >
                {`CSS + inline styles | line height ${lineHeight.toFixed(1)} | align ${alignment}`}
            </span>

            <text
                className="text-meta"
                values={`disabled: ${isDisabled ? 'yes' : 'no'} | visible: ${isVisible ? 'yes' : 'no'} | using children: ${
                    useChildren ? 'yes' : 'no'
                }`}
                style={{
                    textAlign: 'left',
                    fontSize: '14px',
                    lineHeight: '1.3',
                }}
            />

            <div className="text-controls">
                <input
                    className="text-input"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Update primary content"
                />
                <button className="text-toggle" onClick={toggleAlignment}>
                    Toggle alignment (current: {alignment})
                </button>
                <button className="text-toggle" onClick={toggleUppercase}>
                    {isUppercase ? 'Disable uppercase' : 'Uppercase text'}
                </button>
                <button className="text-toggle" onClick={cycleLineHeight}>
                    Change line height ({lineHeight.toFixed(1)})
                </button>
                <button className="text-toggle" onClick={toggleDisabled}>
                    {isDisabled ? 'Enable text' : 'Disable text'}
                </button>
                <button className="text-toggle" onClick={toggleVisibility}>
                    {isVisible ? 'Hide text' : 'Show text'}
                </button>
                <button className="text-toggle" onClick={toggleUsageMode}>
                    {useChildren ? 'Use text prop' : 'Use children'}
                </button>
                <button className="text-toggle" onClick={cycleAccentColor}>
                    Cycle accent color
                </button>
            </div>
        </div>
    );
};

export default TextFunctionExample;
