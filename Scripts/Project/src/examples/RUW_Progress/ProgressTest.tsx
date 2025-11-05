import * as React from "react";
import { ProgressFunctionTest } from "./ProgressFunctionTest";
import { ProgressClassTest } from "./ProgressClassTest";

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  padding: "24px 28px",
  backgroundColor: "#f5f7fb",
  color: "#212529",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  background:
    "linear-gradient(90deg, rgba(148, 163, 184, 0.1), rgba(148, 163, 184, 0.45), rgba(148, 163, 184, 0.1))",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 600,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "13px",
  lineHeight: 1.6,
  color: "#475569",
};

const sectionHeaderStyle: React.CSSProperties = {
  marginBottom: "12px",
  fontSize: "18px",
  fontWeight: 600,
  color: "#0f172a",
};

const ProgressShowcase: React.FC = () => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headingStyle}>HTML progress 组件全量测试</h1>
      <p style={descriptionStyle}>
        下面分别使用 React 函数组件与类组件实现对原生 progress 元素的完整测试，覆盖属性、事件回调、常见功能与常用样式。
      </p>
    </div>

    <div style={dividerStyle} />

    <div style={cardStyle}>
      <h2 style={sectionHeaderStyle}>函数组件实现</h2>
      <ProgressFunctionTest />
    </div>

    <div style={cardStyle}>
      <h2 style={sectionHeaderStyle}>类组件实现</h2>
      <ProgressClassTest />
    </div>
  </div>
);

export default ProgressShowcase;
