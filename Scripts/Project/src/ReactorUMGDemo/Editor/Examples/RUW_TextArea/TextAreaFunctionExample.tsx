import { useCallback, useMemo, useState } from 'react';
import './TextAreaTest.css';
import * as React from 'react';

const ACCENT_COLORS = ['#64b5f6', '#ba68c8', '#ff7043'];

const getCommitDescription = (payload: any) => {
    if (typeof payload === 'string') {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        if (typeof payload.target === 'string') {
            return payload.target;
        }
        return payload.target?.value ?? '';
    }
    return '';
};

export const TextAreaFunctionExample: React.FC = () => {
    const [textValue, setTextValue] = useState('Controlled textarea content');
    const [changeCount, setChangeCount] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [placeholder, setPlaceholder] = useState('Type something remarkable...');
    const [accentIndex, setAccentIndex] = useState(0);
    const [lastChange, setLastChange] = useState('');
    const [lastCommit, setLastCommit] = useState('No submit events yet.');
    const [lastBlur, setLastBlur] = useState('No blur events yet.');
    const [secondaryValue, setSecondaryValue] = useState('This textarea uses defaultValue and manages its own state.');

    const accentColor = ACCENT_COLORS[accentIndex];

    const placeholderOptions = useMemo(
        () => [
            'Type something remarkable...',
            'Supports multiline input, try hitting Enter.',
            'Toggle read-only mode to lock the content.',
            'Textarea placeholder styles are active.'
        ],
        []
    );

    const handleChange = useCallback((event: any) => {
        const incoming = event?.target?.value ?? '';
        setTextValue(incoming);
        setLastChange(`Change #${changeCount + 1}: ${incoming.length} characters`);
        setChangeCount((count) => count + 1);
    }, [changeCount]);

    const handleSubmit = useCallback((event: any) => {
        const description = getCommitDescription(event);
        setLastCommit(`Submit committed: "${description}"`);
    }, []);

    const handleBlur = useCallback((event: any) => {
        const value = event?.target?.value ?? '';
        setLastBlur(`Blur captured with ${value.length} characters.`);
    }, []);

    const cycleAccent = () => {
        setAccentIndex((index) => (index + 1) % ACCENT_COLORS.length);
    };

    const cyclePlaceholder = () => {
        setPlaceholder((current) => {
            const currentIndex = placeholderOptions.indexOf(current);
            const nextIndex = (currentIndex + 1) % placeholderOptions.length;
            return placeholderOptions[nextIndex];
        });
    };

    const resetControlledValue = () => {
        setTextValue('');
        setLastChange('Controlled value cleared.');
    };

    const fillSampleText = () => {
        const sample = [
            'Textarea demo:',
            '- onChange synchronises React state',
            '- onSubmit fires when committing (e.g. Enter)',
            '- onBlur fires when focus leaves',
            `Accent color: ${accentColor}`
        ].join('\n');
        setTextValue(sample);
        setLastChange('Filled with sample multi-line text.');
    };

    const handleSecondaryChange = (event: any) => {
        const value = event?.target?.value ?? '';
        setSecondaryValue(value);
    };

    return (
        <div className="textarea-demo-wrapper">
            <div className="textarea-demo-header">Textarea Component (functional demo)</div>

            <textarea
                className={`textarea-field ${isCompact ? 'textarea-compact' : ''}`}
                value={textValue}
                placeholder={placeholder}
                readOnly={isReadOnly}
                disabled={isDisabled}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBlur={handleBlur}
                style={{
                    borderColor: accentColor,
                    lineHeight: isCompact ? '1.3' : '1.6',
                    letterSpacing: '0.3px',
                    color: isDisabled ? 'rgba(255,255,255,0.4)' : '#f5f5f5',
                }}
                title="Controlled textarea showcasing value, events, and styling."
            />

            <div className="textarea-controls">
                <button className="textarea-toggle" onClick={() => setIsDisabled((state) => !state)}>
                    {isDisabled ? 'Enable textarea' : 'Disable textarea'}
                </button>
                <button className="textarea-toggle" onClick={() => setIsReadOnly((state) => !state)}>
                    {isReadOnly ? 'Disable readOnly' : 'Set readOnly'}
                </button>
                <button className="textarea-toggle" onClick={() => setIsCompact((state) => !state)}>
                    {isCompact ? 'Use relaxed spacing' : 'Use compact spacing'}
                </button>
                <button className="textarea-toggle" onClick={cyclePlaceholder}>
                    Rotate placeholder
                </button>
                <button className="textarea-toggle" onClick={cycleAccent}>
                    Accent color
                </button>
                <button className="textarea-toggle" onClick={fillSampleText}>
                    Fill sample text
                </button>
                <button className="textarea-toggle" onClick={resetControlledValue}>
                    Clear controlled value
                </button>
            </div>

            <div className="textarea-status">{lastChange}</div>
            <div className="textarea-status">{lastCommit}</div>
            <div className="textarea-status">{lastBlur}</div>
            <div className="textarea-meta">
                {`Disabled: ${isDisabled ? 'yes' : 'no'} | ReadOnly: ${isReadOnly ? 'yes' : 'no'} | Changes: ${changeCount}`}
            </div>

            <textarea
                className="textarea-field textarea-compact"
                defaultValue={secondaryValue}
                placeholder="Uncontrolled textarea using defaultValue."
                onChange={handleSecondaryChange}
                onBlur={(event) => setLastBlur(`Secondary blur value: ${(event?.target?.value ?? '').length} characters.`)}
                style={{
                    borderColor: '#81d4fa',
                    background: 'rgba(0, 30, 60, 0.6)',
                    color: '#e0f7fa',
                }}
                title="Default value textarea demonstrating uncontrolled usage."
            />
        </div>
    );
};

export default TextAreaFunctionExample;
