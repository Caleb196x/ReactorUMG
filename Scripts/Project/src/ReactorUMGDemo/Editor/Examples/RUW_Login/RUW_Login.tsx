import * as UE from "ue";
import * as React from "react";

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        width: "100%",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2b3a55 0%, #1f2641 50%, #141824 100%)",
        padding: 24,
        boxSizing: "border-box",
    },
    card: {
        width: 420,
        maxWidth: "100%",
        background: "rgba(19, 23, 35, 0.9)",
        borderRadius: 18,
        padding: "32px 28px",
        boxShadow: "0 20px 35px rgba(0,0,0,0.35)",
        color: "#f5f6fb",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        border: "1px solid rgba(255,255,255,0.06)",
    },
    title: {
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "#b7c0d8",
        marginTop: -6,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    labelRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        color: "#c6d0f5",
    },
    input: {
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.04)",
        padding: "12px 14px",
        color: "#f5f6fb",
        fontSize: 15,
        outline: "none",
    },
    checkboxRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        color: "#c6d0f5",
    },
    button: {
        marginTop: 4,
        padding: "12px 16px",
        borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg, #5c7cfa 0%, #845ef7 50%, #9775fa 100%)",
        color: "#fff",
        fontWeight: 600,
        letterSpacing: 0.2,
        cursor: "pointer",
    },
    disabledButton: {
        opacity: 0.6,
        cursor: "not-allowed",
    },
    status: {
        fontSize: 13,
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 44,
    },
    logBox: {
        borderRadius: 10,
        background: "rgba(0,0,0,0.25)",
        padding: 12,
        maxHeight: 120,
        overflowY: "auto",
        fontSize: 12,
        color: "#9aa6d1",
    },
    error: {
        color: "#ffb3c1",
        fontSize: 12,
    },
    helperButton: {
        fontSize: 12,
        color: "#8bc2ff",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "underline",
        padding: 0,
    },
};

const timestamp = () => new Date().toLocaleTimeString();

const LoginDemo: React.FC = () => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [rememberMe, setRememberMe] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState("Please sign in with your Reactor account.");
    const [logs, setLogs] = React.useState<string[]>([]);
    const [errors, setErrors] = React.useState<{ username?: string; password?: string }>({});
    const pendingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const pushLog = React.useCallback((message: string) => {
        setLogs(prev => [`[${timestamp()}] ${message}`, ...prev].slice(0, 6));
    }, []);

    React.useEffect(() => {
        return () => {
            if (pendingRef.current) {
                clearTimeout(pendingRef.current);
            }
        };
    }, []);

    const validate = React.useCallback(() => {
        const nextErrors: { username?: string; password?: string } = {};
        if (!username.trim()) {
            nextErrors.username = "Username is required.";
        }
        if (password.length < 4) {
            nextErrors.password = "Password must be at least 4 characters.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }, [username, password]);

    const handleSubmit = React.useCallback(() => {
        if (loading) {
            return;
        }
        if (!validate()) {
            pushLog("Form validation failed.");
            setStatus("Please fix the highlighted errors.");
            return;
        }
        setLoading(true);
        setStatus("Authenticating...");
        pushLog(`Submitting credentials for ${username}.`);

        pendingRef.current = setTimeout(() => {
            setLoading(false);
            const success = password.toLowerCase() !== "reactor";
            if (success) {
                setStatus(`Welcome back, ${username}!${rememberMe ? " We'll keep you signed in." : ""}`);
                pushLog("Login successful.");
            } else {
                setStatus("Authentication failed. Try a different password.");
                pushLog("Login failed due to invalid credentials.");
            }
        }, 1200);
    }, [loading, validate, pushLog, username, password, rememberMe]);

    const fillDemo = React.useCallback(() => {
        setUsername("pilot@reactorumg.dev");
        setPassword("Reactor2025!");
        setRememberMe(true);
        setStatus("Demo credentials pre-filled.");
    }, []);

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <div>
                    <div style={styles.title}>Reactor Login</div>
                    <div style={styles.subtitle}>Sign in to preview your UMG project</div>
                </div>

                <div style={styles.inputGroup}>
                    <div style={styles.labelRow}>
                        <label htmlFor="username">Username</label>
                        {errors.username && <span style={styles.error}>{errors.username}</span>}
                    </div>
                    <input
                        id="username"
                        style={styles.input}
                        placeholder="you@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <div style={styles.labelRow}>
                        <label htmlFor="password">Password</label>
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                    </div>
                    <input
                        id="password"
                        type="password"
                        style={styles.input}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div style={styles.checkboxRow}>
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ marginRight: 6 }}
                        />
                        Remember me
                    </label>
                    <button style={styles.helperButton} onClick={fillDemo}>
                        Use demo credentials
                    </button>
                </div>

                <button
                    style={loading ? { ...styles.button, ...styles.disabledButton } : styles.button}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </button>

                <div style={styles.status}>{status}</div>

                <div>
                    <div style={{ fontSize: 13, color: "#c6d0f5", marginBottom: 6 }}>Recent activity</div>
                    <div style={styles.logBox}>
                        {logs.length === 0 ? (
                            <div>No activity yet.</div>
                        ) : (
                            logs.map((log, index) => <div key={index}>{log}</div>)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export class RUW_Login extends React.Component {
    render() {
        return <LoginDemo />;
    }
}
