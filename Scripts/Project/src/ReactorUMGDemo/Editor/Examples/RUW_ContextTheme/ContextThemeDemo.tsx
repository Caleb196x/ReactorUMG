import * as React from 'react';
import './ContextTheme.css';

type Theme = {
  name: 'light' | 'dark';
  bg: string;
  fg: string;
  accent: string;
};

const LIGHT: Theme = { name: 'light', bg: 'rgba(255,255,255,0.9)', fg: '#222', accent: '#3949ab' };
const DARK: Theme = { name: 'dark', bg: 'rgba(0,0,0,0.55)', fg: '#f5f5f5', accent: '#ef6c00' };

const ThemeContext = React.createContext<{ theme: Theme; toggle: ()=>void }>({ theme: DARK, toggle: () => {} });

class ThemedLabel extends React.Component { static contextType = ThemeContext; declare context: React.ContextType<typeof ThemeContext>;
  render() {
    const { theme } = this.context;
    return <span className="theme-chip" style={{ color: theme.fg, border: `1px solid ${theme.fg}` }}>Label in {theme.name} theme</span>;
  }
}

const ThemedButton: React.FC<{ onClick?: ()=>void; children?: React.ReactNode }> = ({ onClick, children }) => {
  const { theme } = React.useContext(ThemeContext);
  return (
    <button className="theme-button" onClick={onClick} style={{ background: theme.accent, color: '#fff' }}>{children}</button>
  );
};

const ContextThemeDemo: React.FC = () => {
  const [theme, setTheme] = React.useState<Theme>(DARK);
  const toggle = () => setTheme(t => t.name === 'dark' ? LIGHT : DARK);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="theme-wrapper" style={{ background: theme.bg }}>
        <div className="theme-title" style={{ color: theme.fg }}>Context Theme Demo</div>
        <div className="theme-row">
          {/* <ThemedButton onClick={toggle}>Toggle Theme</ThemedButton> */}
          <ThemedLabel />
          <span style={{ color: theme.fg }}>Foreground preview</span>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default ContextThemeDemo;

