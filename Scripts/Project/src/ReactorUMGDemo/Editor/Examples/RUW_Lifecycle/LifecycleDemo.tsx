import * as React from 'react';
import './Lifecycle.css';

const now = () => new Date().toLocaleTimeString();

class TimerClass extends React.Component<{ onTick?: (value: number)=>void }, { count: number }> {
  private timerId: any = null;
  state = { count: 0 };
  componentDidMount(): void {
    this.timerId = setInterval(() => {
      this.setState(
        prev => ({ count: prev.count + 1 }),
        () => this.props.onTick?.(this.state.count)
      );
    }, 1000);
  }
  componentDidUpdate(prevProps: Readonly<{ onTick?: (value: number)=>void }>, prevState: Readonly<{ count: number }>): void {
    if (prevState.count !== this.state.count) {
      // lifecycle update observed
    }
  }
  componentWillUnmount(): void {
    clearInterval(this.timerId);
    this.timerId = null;
  }
  
  render() {
    return <span className="life-counter">Class timer: {this.state.count}s</span>;
  }
}

const EffectTimer: React.FC<{ running: boolean; onTick?: (v:number)=>void; }>= ({ running, onTick }) => {
  const [count, setCount] = React.useState(0);
  const latestOnTick = React.useRef(onTick);

  React.useEffect(() => {
    latestOnTick.current = onTick;
  }, [onTick]);

  React.useEffect(() => {
    if (!running) return;

    const id = setTimeout(() => {
      setCount(c => c + 1);
    }, 1000);
  }, [running]);

  React.useEffect(() => {
    if (count === 0) return;
    latestOnTick.current?.(count);
  }, [count]);
  
  return <span className="life-counter">Hook timer: {count}s</span>;
};

const LifecycleDemo: React.FC = () => {
  const [running, setRunning] = React.useState(true);
  const [logs, setLogs] = React.useState<string[]>([]);
  const push = (m:string) => setLogs(prev => [`[${now()}] ${m}`, ...prev].slice(0, 40));

  return (
    <div className="life-wrapper">
      <div className="life-title">Lifecycle & Effects Demo</div>
      <div className="life-row">
        <button className="life-button" onClick={()=> setRunning(r => !r)}>{running ? 'Pause' : 'Resume'}</button>
        <TimerClass onTick={(v)=>push(`class tick: ${v}`)} />
        <EffectTimer running={running} onTick={(v)=>push(`hook tick: ${v}`)} />
      </div>
      <div className="life-logbox">
        {logs.length===0 ? <div className="life-log">No ticks yet.</div> : logs.map((l,i)=>(<div key={i} className="life-log">{l}</div>))}
      </div>
    </div>
  );
};

export default LifecycleDemo;
