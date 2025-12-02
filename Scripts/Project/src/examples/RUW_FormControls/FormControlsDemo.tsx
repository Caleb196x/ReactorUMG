import * as React from 'react';
import './FormControls.css';

type Gender = 'male' | 'female' | 'other';

class EventLog extends React.Component<{ logs: string[] }> {
  render() {
    const { logs } = this.props;
    return (
      <div>
        <div className="forms-label">Event logs:</div>
        <div style={{ maxHeight: 120, overflow: 'auto', border: '1px dashed #777', padding: 6, borderRadius: 8 }}>
          {logs.length === 0 ? (
            <div className="forms-meta">No events yet.</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="forms-meta">{l}</div>
            ))
          )}
        </div>
      </div>
    );
  }
}

const FormsRow: React.FC<{ label: string } & React.HTMLAttributes<HTMLDivElement>> = ({ label, children, ...rest }) => (
  <div className="forms-row" {...rest}>
    <span className="forms-label">{label}</span>
    {children}
  </div>
);

const now = () => new Date().toLocaleTimeString();

const FormControlsDemo: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [bio, setBio] = React.useState('Hello, world!');
  const [gender, setGender] = React.useState<Gender>('male');
  const [hobbies, setHobbies] = React.useState<string[]>([]);
  const [level, setLevel] = React.useState(3);
  const [focus, setFocus] = React.useState<string>('');
  const [logs, setLogs] = React.useState<string[]>([]);

  const pushLog = (l: string) => setLogs(prev => [`[${now()}] ${l}`, ...prev].slice(0, 30));

  const toggleHobby = (key: string) => {
    setHobbies(prev => prev.includes(key) ? prev.filter(h => h !== key) : [...prev, key]);
    pushLog(`hobby toggled: ${key}`);
  };

  const handleSubmit = () => {
    pushLog(`submit: username=${username}, gender=${gender}, level=${level}`);
    alert(`Submitted!\nUser: ${username}\nGender: ${gender}\nLevel: ${level}\nHobbies: ${hobbies.join(', ')}`);
  };

  return (
    <div className="forms-wrapper">
      <div className="forms-title">Form Controls Demo</div>

      <FormsRow label="Username">
        <input
          className="forms-input"
          placeholder="Type username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); pushLog(`username change: ${e.target.value}`); }}
          onFocus={() => { setFocus('username'); pushLog('username focus'); }}
          onBlur={() => { setFocus(''); pushLog('username blur'); }}
        />
        <span className="forms-badge">{focus === 'username' ? 'focused' : 'idle'}</span>
      </FormsRow>

      <FormsRow label="Password">
        <input
          className="forms-input"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => { setPassword(e.target.value); pushLog('password change'); }}
          onFocus={() => { setFocus('password'); pushLog('password focus'); }}
          onBlur={() => { setFocus(''); pushLog('password blur'); }}
        />
        <span className="forms-badge">{password ? `${password.length} chars` : 'empty'}</span>
      </FormsRow>

      <FormsRow label="Gender">
        <label><input type="radio" name="gender" checked={gender==='male'} onChange={() => { setGender('male'); pushLog('gender male'); }} /> Male</label>
        <label><input type="radio" name="gender" checked={gender==='female'} onChange={() => { setGender('female'); pushLog('gender female'); }} /> Female</label>
        <label><input type="radio" name="gender" checked={gender==='other'} onChange={() => { setGender('other'); pushLog('gender other'); }} /> Other</label>
      </FormsRow>

      <FormsRow label="Hobbies">
        <label><input type="checkbox" checked={hobbies.includes('music')} onChange={() => toggleHobby('music')} /> Music</label>
        <label><input type="checkbox" checked={hobbies.includes('sports')} onChange={() => toggleHobby('sports')} /> Sports</label>
        <label><input type="checkbox" checked={hobbies.includes('reading')} onChange={() => toggleHobby('reading')} /> Reading</label>
      </FormsRow>

      <FormsRow label="Level">
        <input type="range" min={1} max={10} value={level} onChange={(e:any)=>{ setLevel(Number(e.target.value)); pushLog(`level -> ${e.target.value}`); }} />
        <span className="forms-badge">{level}</span>
      </FormsRow>

      <FormsRow label="Bio">
        <textarea
          className="forms-textarea"
          value={bio}
          onChange={(e)=>{ setBio(e.target.value); pushLog(`bio change (${e.target.value.length})`); }}
          onSubmit={(e)=>{ pushLog(`bio submit: ${e}` as any); }}
          rows={3}
          style={{ minWidth: 320 }}
        />
      </FormsRow>

      <FormsRow label="Country">
        <select className="forms-select" onChange={(e)=>{ pushLog(`country: ${e.target.value}`); }} defaultValue="">
          <option value="" disabled>Select...</option>
          <option value="us">United States</option>
          <option value="cn">China</option>
          <option value="de">Germany</option>
        </select>
      </FormsRow>

      <div className="forms-actions">
        <button className="forms-button" onClick={handleSubmit}>Submit</button>
        <button className="forms-button" onClick={()=>{ setUsername(''); setPassword(''); setBio(''); setHobbies([]); setLevel(3); pushLog('form reset'); }}>Reset</button>
      </div>

      <EventLog logs={logs} />
    </div>
  );
};

export default FormControlsDemo;

