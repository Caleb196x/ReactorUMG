import * as React from 'react';
import './TextAreaTest.css';

const ACCENT_COLORS = ['#ffb74d', '#4db6ac', '#9575cd'];

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

interface TextAreaClassState {
    textValue: string;
    changeCount: number;
    isDisabled: boolean;
    isReadOnly: boolean;
    isCompact: boolean;
    accentIndex: number;
    placeholder: string;
    lastChange: string;
    lastCommit: string;
    lastBlur: string;
    secondaryValue: string;
}

export class TextAreaClassExample extends React.Component<unknown, TextAreaClassState> {
    state: TextAreaClassState = {
        textValue: 'Class-based textarea managed by React state.',
        changeCount: 0,
        isDisabled: false,
        isReadOnly: false,
        isCompact: false,
        accentIndex: 0,
        placeholder: 'Start typing in the class textarea...',
        lastChange: 'Waiting for the first change event.',
        lastCommit: 'No submit events yet.',
        lastBlur: 'No blur events yet.',
        secondaryValue: 'Default value from class component.'
    };

    handleChange = (event: any) => {
        const incoming = event?.target?.value ?? '';
        this.setState((prev) => ({
            textValue: incoming,
            changeCount: prev.changeCount + 1,
            lastChange: `Change #${prev.changeCount + 1}: ${incoming.length} characters`
        }));
    };

    handleSubmit = (event: any) => {
        const description = getCommitDescription(event);
        this.setState({
            lastCommit: `Submit committed: "${description}"`
        });
    };

    handleBlur = (event: any) => {
        const value = event?.target?.value ?? '';
        this.setState({
            lastBlur: `Blur captured with ${value.length} characters.`
        });
    };

    toggleDisabled = () => {
        this.setState((prev) => ({ isDisabled: !prev.isDisabled }));
    };

    toggleReadOnly = () => {
        this.setState((prev) => ({ isReadOnly: !prev.isReadOnly }));
    };

    toggleCompact = () => {
        this.setState((prev) => ({ isCompact: !prev.isCompact }));
    };

    rotateAccent = () => {
        this.setState((prev) => ({
            accentIndex: (prev.accentIndex + 1) % ACCENT_COLORS.length
        }));
    };

    rotatePlaceholder = () => {
        const placeholders = [
            'Start typing in the class textarea...',
            'Class component also supports placeholders.',
            'Toggle compact mode for tighter spacing.',
            'Submit events fire on commit.'
        ];
        this.setState((prev) => {
            const currentIndex = placeholders.indexOf(prev.placeholder);
            const nextIndex = (currentIndex + 1) % placeholders.length;
            return { placeholder: placeholders[nextIndex] };
        });
    };

    clearControlled = () => {
        this.setState({
            textValue: '',
            lastChange: 'Controlled value cleared.'
        });
    };

    fillSampleText = () => {
        const sample = [
            'Class textarea demo:',
            '- Controlled value managed via setState.',
            '- Buttons toggle disabled/readOnly/compact modes.',
            '- Submit & blur events update the status area.'
        ].join('\n');
        this.setState({
            textValue: sample,
            lastChange: 'Filled with class-based sample multi-line text.'
        });
    };

    handleSecondaryChange = (event: any) => {
        const value = event?.target?.value ?? '';
        this.setState({ secondaryValue: value });
    };

    render() {
        const {
            textValue,
            changeCount,
            isDisabled,
            isReadOnly,
            isCompact,
            accentIndex,
            placeholder,
            lastChange,
            lastCommit,
            lastBlur,
            secondaryValue
        } = this.state;

        const accentColor = ACCENT_COLORS[accentIndex];

        return (
            <div className="textarea-demo-wrapper">
                <div className="textarea-demo-header">Textarea Component (class demo)</div>

                <textarea
                    className={`textarea-field ${isCompact ? 'textarea-compact' : ''}`}
                    value={textValue}
                    placeholder={placeholder}
                    readOnly={isReadOnly}
                    disabled={isDisabled}
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    onBlur={this.handleBlur}
                    style={{
                        borderColor: accentColor,
                        lineHeight: isCompact ? '1.3' : '1.6',
                        letterSpacing: '0.25px',
                        color: isDisabled ? 'rgba(255,255,255,0.4)' : '#f5f5f5',
                    }}
                    title="Class controlled textarea exercising props and events."
                />

                <div className="textarea-controls">
                    <button className="textarea-toggle" onClick={this.toggleDisabled}>
                        {isDisabled ? 'Enable textarea' : 'Disable textarea'}
                    </button>
                    <button className="textarea-toggle" onClick={this.toggleReadOnly}>
                        {isReadOnly ? 'Disable readOnly' : 'Set readOnly'}
                    </button>
                    <button className="textarea-toggle" onClick={this.toggleCompact}>
                        {isCompact ? 'Use relaxed spacing' : 'Use compact spacing'}
                    </button>
                    <button className="textarea-toggle" onClick={this.rotatePlaceholder}>
                        Rotate placeholder
                    </button>
                    <button className="textarea-toggle" onClick={this.rotateAccent}>
                        Accent color
                    </button>
                    <button className="textarea-toggle" onClick={this.fillSampleText}>
                        Fill sample text
                    </button>
                    <button className="textarea-toggle" onClick={this.clearControlled}>
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
                    placeholder="Uncontrolled textarea with defaultValue."
                    onChange={this.handleSecondaryChange}
                    onBlur={(event) => this.setState({
                        lastBlur: `Secondary blur value: ${(event?.target?.value ?? '').length} characters.`
                    })}
                    style={{
                        borderColor: '#a5d6a7',
                        background: 'rgba(20, 50, 50, 0.6)',
                        color: '#c8e6c9',
                    }}
                    title="Class component defaultValue textarea."
                />
            </div>
        );
    }
}

export default TextAreaClassExample;
