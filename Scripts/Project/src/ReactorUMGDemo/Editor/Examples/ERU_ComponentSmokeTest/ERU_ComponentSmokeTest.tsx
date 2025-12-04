import * as React from "react";
import {
    listReactorUMGComponentSmokeTests,
    runReactorUMGComponentSmokeTests,
} from "./componentSmokeTests";

interface SmokeState {
    logs: string[];
    passed: number;
    total: number;
    lastRunAt?: string;
}

export class ERU_ComponentSmokeTest extends React.Component<Record<string, never>, SmokeState> {
    state: SmokeState = {
        logs: [],
        passed: 0,
        total: listReactorUMGComponentSmokeTests().length,
    };

    componentDidMount(): void {
        this.runTests();
    }

    runTests = () => {
        const logs: string[] = [];
        const result = runReactorUMGComponentSmokeTests((message) => logs.push(message));
        this.setState({
            logs,
            passed: result.passed,
            total: result.total,
            lastRunAt: new Date().toLocaleTimeString(),
        });
    };

    render() {
        const { logs, passed, total, lastRunAt } = this.state;
        return (
            <div style={styles.page}>
                <div style={styles.headerCard}>
                    <div style={styles.titleRow}>
                        <h1 style={styles.title}>ReactorUMG 组件烟雾测试</h1>
                        <button style={styles.runButton} onClick={this.runTests}>
                            重新运行
                        </button>
                    </div>
                    <p style={styles.subtitle}>
                        覆盖 RadialSlider、Slider、SpinBox、CircularThrobber、Throbber、Spacer、ExpandableArea、
                        ScrollBox、Button、ComboBox、Checkbox、ProgressBar、Spine。
                    </p>
                    <div style={styles.summaryRow}>
                        <span style={styles.summaryBadge}>{`通过 ${passed} / ${total}`}</span>
                        {lastRunAt && <span style={styles.timestamp}>{`上次运行：${lastRunAt}`}</span>}
                    </div>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>测试日志</h2>
                    <div style={styles.logBox}>
                        {logs.length === 0 ? (
                            <p style={styles.empty}>等待测试结果...</p>
                        ) : (
                            logs.map((line, idx) => (
                                <span key={idx} style={styles.logLine}>
                                    {line}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        color: "#e2e8f0",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', 'PingFang SC', sans-serif",
    },
    headerCard: {
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
        marginBottom: "18px",
    },
    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
    },
    title: {
        margin: 0,
        fontSize: "22px",
        letterSpacing: "0.2px",
    },
    subtitle: {
        marginTop: "10px",
        marginBottom: "14px",
        color: "#cbd5e1",
        lineHeight: 1.5,
        fontSize: "14px",
    },
    summaryRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
    summaryBadge: {
        background: "linear-gradient(120deg, #22c55e, #16a34a)",
        color: "#0b141f",
        padding: "6px 12px",
        borderRadius: "12px",
        fontWeight: 700,
        letterSpacing: "0.4px",
    },
    timestamp: {
        fontSize: "12px",
        color: "#94a3b8",
    },
    runButton: {
        border: "none",
        background: "linear-gradient(120deg, #3b82f6, #22d3ee)",
        color: "#0b141f",
        padding: "10px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 10px 20px rgba(34, 211, 238, 0.25)",
    },
    card: {
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 10px 26px rgba(0, 0, 0, 0.3)",
    },
    sectionTitle: {
        margin: "0 0 10px",
        fontSize: "18px",
    },
    logBox: {
        background: "rgba(15, 23, 42, 0.7)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: "12px",
        padding: "12px",
        maxHeight: "320px",
        overflow: "auto",
    },
    logLine: {
        margin: 0,
        color: "#e2e8f0",
        fontSize: "13px",
        lineHeight: 1.4,
        fontFamily: "Consolas, 'SFMono-Regular', Menlo, monospace",
    },
    empty: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "13px",
    },
};
