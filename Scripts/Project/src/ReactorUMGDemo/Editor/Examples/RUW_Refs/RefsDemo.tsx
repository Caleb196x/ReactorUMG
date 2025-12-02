import * as React from 'react';
import './Refs.css';

const FocusableInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  return <input ref={ref} className="refs-input" {...props} />;
});

class ClassInput extends React.Component<{ placeholder?: string }> {
  private inputRef = React.createRef<HTMLInputElement|any>();
  focus() { this.inputRef.current?.SetKeyboardFocus(); }
  render() { return <input ref={this.inputRef} className="refs-input" placeholder={this.props.placeholder} />; }
}

const RefsDemo: React.FC = () => {
  const inputRef = React.useRef<HTMLInputElement|any>(null);
  const classRef = React.useRef<ClassInput|any>(null);
  const [lastKey, setLastKey] = React.useState<string>('none');

  return (
    <div className="refs-wrapper">
      <div className="refs-title">Refs & Focus Demo</div>
      <div className="refs-row">
        <FocusableInput ref={inputRef} placeholder="ForwardRef input" onChange={(e)=> setLastKey(e.target.value)} />
        <button className="refs-btn" onClick={()=> inputRef.current?.SetKeyboardFocus()}>Focus first</button>
      </div>
      <div className="refs-row">
        <ClassInput ref={classRef as any} placeholder="Class ref input" />
        <button className="refs-btn" onClick={()=> classRef.current?.focus()}>Focus second</button>
      </div>
      <div className="refs-meta">Last key: {lastKey}</div>
    </div>
  );
};

export default RefsDemo;

