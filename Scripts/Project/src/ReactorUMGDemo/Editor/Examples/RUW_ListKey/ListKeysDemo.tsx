import * as React from 'react';
import './ListKeys.css';

interface Item { id: string; title: string; }

class ListItem extends React.Component<{ item: Item; onRemove: (id: string)=>void; } , { hovered: boolean }> {
  state = { hovered: false };
  render() {
    const { item, onRemove } = this.props;
    const { hovered } = this.state;
    return (
      <div
        className="list-item"
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
      >
        <span className="list-item-title">{item.title}</span>
        <div>
          {hovered && <span className="list-meta">hovered</span>}
          <button className="list-item-remove" onClick={() => onRemove(item.id)}>remove</button>
        </div>
      </div>
    );
  }
}

const randomId = () => Math.random().toString(36).slice(2, 8);

const ListKeysDemo: React.FC = () => {
  const [items, setItems] = React.useState<Item[]>([
    { id: randomId(), title: 'Alpha' },
    { id: randomId(), title: 'Bravo' },
    { id: randomId(), title: 'Charlie' },
  ]);

  const addItem = () => setItems(prev => [{ id: randomId(), title: `Item ${prev.length+1}`}, ...prev]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const shuffle = () => setItems(prev => [...prev].sort(()=> Math.random() - 0.5));
  const clear = () => setItems([]);

  return (
    <div className="list-wrapper">
      <div className="list-title">List & Keys Demo</div>
      <div className="list-controls">
        <button className="list-button" onClick={addItem}>Add</button>
        <button className="list-button" onClick={shuffle}>Shuffle</button>
        <button className="list-button" onClick={clear}>Clear</button>
      </div>
      <div className="list-items">
        {items.map(item => (
          <ListItem key={item.id} item={item} onRemove={removeItem} />
        ))}
      </div>
      <div className="list-meta">Total: {items.length}</div>
    </div>
  );
};

export default ListKeysDemo;

