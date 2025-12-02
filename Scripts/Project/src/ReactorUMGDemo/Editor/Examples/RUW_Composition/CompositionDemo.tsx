import * as React from 'react';
import './Composition.css';

const Toolbar: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="comp-toolbar">{children}</div>
);

const Card: React.FC<{ title?: React.ReactNode; footer?: React.ReactNode; children?: React.ReactNode }> = ({ title, footer, children }) => (
  <div className="card">
    {title && <div className="card-header">{title}</div>}
    <div>{children}</div>
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

const HoverSensor: React.FC<{ children: (hovered: boolean)=>React.ReactNode }> = ({ children }) => {
  const [h, setH] = React.useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      {children(h)}
    </div>
  );
};

class Tag extends React.Component<{ label: string }> {
  render() { return <span className="tag">{this.props.label}</span>; }
}

let globalSet: React.Dispatch<number> | null = null;

const CompositionDemo: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const countRef = React.useRef(count);
  const buttonCallback = React.useCallback(() => {
    // setCount(pre => {pre = pre + 1; countRef.current = pre; return pre;});
    setCount(1);
    console.log("buttonCallback: ", count);
    console.log("buttonCallback after: ", countRef.current);
  }, []);

  return (
    <div className="comp-wrapper">
      <div className="comp-title">Composition Patterns Demo</div>
      <Toolbar>
        <button className="comp-btn" onClick={() => setCount(c => c + 1)}>Increment</button>
        <span className="tag">count: {count}</span>
      </Toolbar>

      <Card
        title={<>
          <span>Panel Title</span>
          {' '}
          <Tag label="header tag" />
        </>}
        footer={<>
          <span>Footer content</span>
          {' '}
          <Tag label="footer tag" />
        </>}
      >
        <HoverSensor>
          {(hovered)=> (
            <span style={{ color: hovered ? '#ffcc80' : '#e0e0e0' }}>
              {hovered ? 'Hovering over content' : 'Move mouse over this content'}
            </span>
          )}
        </HoverSensor>
      </Card>
    </div>
  );
};

export default CompositionDemo;

