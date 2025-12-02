import * as React from "react";
import {
    RadialSlider,
    Slider,
    SpinBox,
    CircularThrobber,
    Throbber,
    Spacer,
    ExpandableArea,
    ScrollBox,
    Button,
    ComboBox,
    CheckBox,
    ProgressBar,
    Spine,
} from "reactorUMG";

const cardStyle: React.CSSProperties = {
    padding: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#e2e8f0",
    maxWidth: 520,
    margin: "0 auto",
};

const heading: React.CSSProperties = { margin: "0 0 8px", fontSize: "18px" };
const row: React.CSSProperties = { display: "flex", gap: "10px", alignItems: "center" };

export const ERU_RadialSlider: React.FC = () => {
    const [value, setValue] = React.useState(0.4);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>RadialSlider</h2>
            <div style={row}>
                <RadialSlider
                    defaultValue={value}
                    thumbStartAngle={-90}
                    thumbEndPointAngle={270}
                    sliderProgressColor="#38bdf8"
                    backgroundColor="#0b172a"
                    onValueChanged={setValue}
                />
                <div>Value: {value.toFixed(2)}</div>
            </div>
        </div>
    );
};

export const ERU_Slider: React.FC = () => {
    const [value, setValue] = React.useState(0.25);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>Slider</h2>
            <Slider minValue={0} maxValue={1} stepSize={0.05} value={value} onValueChanged={setValue} />
            <div style={{ marginTop: 8 }}>Value: {value.toFixed(2)}</div>
        </div>
    );
};

export const ERU_SpinBox: React.FC = () => {
    const [value, setValue] = React.useState(2.5);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>SpinBox</h2>
            <SpinBox
                value={value}
                minValue={0}
                maxValue={5}
                enableSlider
                minFractionDigits={1}
                maxFractionDigits={2}
                onValueChanged={setValue}
            />
            <div style={{ marginTop: 8 }}>Value: {value.toFixed(2)}</div>
        </div>
    );
};

export const ERU_CircularThrobber: React.FC = () => (
    <div style={cardStyle}>
        <h2 style={heading}>CircularThrobber</h2>
        <CircularThrobber radius={28} pieces={8} period={0.8} />
    </div>
);

export const ERU_Throbber: React.FC = () => (
    <div style={cardStyle}>
        <h2 style={heading}>Throbber</h2>
        <Throbber pieces={5} period={0.5} animationHorizontal animationOpacity />
    </div>
);

export const ERU_Spacer: React.FC = () => (
    <div style={cardStyle}>
        <h2 style={heading}>Spacer</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 40, height: 24, background: "#1d4ed8" }} />
            <Spacer size={{ x: 60, y: 10 }} />
            <div style={{ width: 40, height: 24, background: "#22c55e" }} />
        </div>
    </div>
);

export const ERU_ExpandableArea: React.FC = () => {
    const [expanded, setExpanded] = React.useState(true);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>ExpandableArea</h2>
            <ExpandableArea
                expanded={expanded}
                header={<Button onClick={() => setExpanded((v) => !v)}>{expanded ? "折叠" : "展开"}</Button>}
                area={
                    <div style={{ padding: 8, background: "rgba(255,255,255,0.08)" }}>
                        展开区域内容，展示单个组件行为。
                    </div>
                }
                onExpansionChanged={setExpanded}
            />
        </div>
    );
};

export const ERU_ScrollBox: React.FC = () => (
    <div style={cardStyle}>
        <h2 style={heading}>ScrollBox</h2>
        <ScrollBox style={{ height: 140 }} barThickness={6}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ padding: 8, margin: 4, background: "rgba(255,255,255,0.08)" }}>
                    行 {i + 1}
                </div>
            ))}
        </ScrollBox>
    </div>
);

export const ERU_Button: React.FC = () => {
    const [count, setCount] = React.useState(0);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>Button</h2>
            <Button backgroundColor="#2563eb" textColor="#e2e8f0" onClick={() => setCount((c) => c + 1)}>
                点击我
            </Button>
            <div style={{ marginTop: 8 }}>点击次数: {count}</div>
        </div>
    );
};

export const ERU_ComboBox: React.FC = () => {
    const options = ["红色", "绿色", "蓝色"];
    const [selected, setSelected] = React.useState(options[0]);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>ComboBox</h2>
            <ComboBox options={options} selectedOption={selected} onSelectionChanged={(item) => setSelected(item)} />
            <div style={{ marginTop: 8 }}>当前选择: {selected}</div>
        </div>
    );
};

export const ERU_Checkbox: React.FC = () => {
    const [checked, setChecked] = React.useState(true);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>CheckBox</h2>
            <CheckBox checked={checked} onCheckStateChanged={setChecked} />
            <div style={{ marginTop: 8 }}>状态: {checked ? "勾选" : "未勾选"}</div>
        </div>
    );
};

export const ERU_ProgressBar: React.FC = () => {
    const [value, setValue] = React.useState(0.6);
    return (
        <div style={cardStyle}>
            <h2 style={heading}>ProgressBar</h2>
            <ProgressBar
                precent={value}
                barType="left-to-right"
                enableFillAnimation
                fillColor="#22d3ee"
                background={{ color: "#0b1727" }}
            />
            <div style={{ marginTop: 8 }}>进度: {(value * 100).toFixed(0)}%</div>
            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <Button onClick={() => setValue((v) => Math.max(0, v - 0.1))}>-10%</Button>
                <Button onClick={() => setValue((v) => Math.min(1, v + 0.1))}>+10%</Button>
            </div>
        </div>
    );
};

export const ERU_Spine: React.FC = () => (
    <div style={cardStyle}>
        <h2 style={heading}>Spine</h2>
        <p style={{ marginTop: 0, color: "#cbd5e1", fontSize: 12 }}>
            使用 lazyLoad 加载，占位 atlas/skel，请替换为真实资源以观察动画。
        </p>
        <Spine lazyLoad initAnimation="Idle" initSkin="Default" atlas="" skel="" />
    </div>
);
