import * as React from 'react';
import './MouseKeyboard.css';

const MouseKeyboardDemo: React.FC = () => {
  const [coords, setCoords] = React.useState<{x:number;y:number}|null>(null);
  const [inside, setInside] = React.useState(false);
  const [dbl, setDbl] = React.useState(0);
  const [lastKey, setLastKey] = React.useState<string>('none');

  return (
    <div className="mk-wrapper">
      <div className="mk-title">Mouse & Keyboard Demo</div>
      <div
        className="mk-area"
        onMouseEnter={()=> setInside(true)}
        onMouseLeave={()=> { setInside(false); setCoords(null); }}
        onMouseMove={(e:any)=> setCoords({ x: e.clientX ?? 0, y: e.clientY ?? 0 })}
        onKeyDown={(e:any)=> setLastKey(e.key || 'unknown')}
        tabIndex={0}
        title="Move mouse here and press keys"
      >
        <span className="mk-coords">{inside ? `x:${coords?.x ?? 0}, y:${coords?.y ?? 0}` : 'outside'}</span>
      </div>
      <div>
        <button className="mk-btn" onDoubleClick={()=> setDbl(c=>c+1)}>Double click me</button>
        <span className="mk-keys"> lastKey: {lastKey} | dblCount: {dbl}</span>
      </div>
    </div>
  );
};

export default MouseKeyboardDemo;

