import * as React from "react";
import {
    Border,
    Button,
    CheckBox,
    CircularThrobber,
    ComboBox,
    ExpandableArea,
    InvalidationBox,
    ListView,
    ListViewItem,
    Overlay,
    ProgressBar,
    RadialSlider,
    RetainerBox,
    Rive,
    SafeZone,
    ScaleBox,
    ScrollBox,
    SizeBox,
    Slider,
    Spacer,
    Spine,
    SpinBox,
    Throbber,
    TileView,
    TileViewItem,
    TreeView,
    TreeViewItem,
    UniformGrid,
    Viewport,
} from "reactorUMG";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Border
        backgroundColor="rgba(255,255,255,0.05)"
        contentPadding="12px"
        contentMargin="6px"
        contentColor="#e2e8f0"
        style={{
            margin: "6px",
            padding: "4px",
            width: "100%",
        }}
    >
        <ScrollBox display="flex" flexDirection="column" gap="8px" style={{ padding: "8px" }}>
            <Border contentPadding="6px" backgroundColor="rgba(255,255,255,0.04)">
                <Spacer size={{ x: 0, y: 4 }} />
                {title}
                <Spacer size={{ x: 0, y: 4 }} />
            </Border>
            {children}
        </ScrollBox>
    </Border>
);

export const RUW_AllComponents: React.FC = () => {
    const [radial, setRadial] = React.useState(0.35);
    const [linear, setLinear] = React.useState(0.5);
    const [spinValue, setSpinValue] = React.useState(2.5);
    const [progress, setProgress] = React.useState(0.6);
    const [checked, setChecked] = React.useState(true);
    const [selected, setSelected] = React.useState("蓝色");
    const [expanded, setExpanded] = React.useState(true);

    const colorOptions = ["蓝色", "绿色", "橙色", "紫色"];

    return (
        <SafeZone padLeft padRight padTop padBottom>
            <ScrollBox
                display="flex"
                flexDirection="column"
                gap="10px"
                background="linear-gradient(135deg, #0f172a, #1e293b)"
                style={{
                    padding: "12px",
                    minHeight: "100vh",
                }}
            >
                <Border
                    backgroundColor="rgba(255,255,255,0.08)"
                    contentPadding="14px"
                    contentMargin="6px"
                    contentColor="#e2e8f0"
                >
                    ReactorUMG 组件全景示例（包含 Slider、SpinBox、ComboBox、ProgressBar、ExpandableArea、ScrollBox、
                    Overlay、ScaleBox、UniformGrid、InvalidationBox、RetainerBox、SafeZone、SizeBox、Border、Spacer、
                    Throbber、CircularThrobber、Button、Checkbox、List/Tree/TileView、Spine、Rive、Viewport）
                </Border>

                <Section title="滑块与输入">
                    <UniformGrid minCellSize={{ x: 240, y: 120 }} cellPadding="10px" display="grid">
                        <RadialSlider
                            defaultValue={radial}
                            sliderProgressColor="#38bdf8"
                            backgroundColor="#0f172a"
                            thumbStartAngle={-90}
                            thumbEndPointAngle={270}
                            valueTags={[0.25, 0.5, 0.75]}
                            onValueChanged={(v) => {
                                setRadial(v);
                                setProgress(v);
                            }}
                        />
                        <Slider
                            value={linear}
                            minValue={0}
                            maxValue={1}
                            stepSize={0.05}
                            orientation="horizontal"
                            onValueChanged={(v) => {
                                setLinear(v);
                                setProgress(v);
                            }}
                        />
                        <SpinBox
                            value={spinValue}
                            minValue={0}
                            maxValue={5}
                            minFractionDigits={1}
                            maxFractionDigits={2}
                            enableSlider
                            onValueChanged={(v) => setSpinValue(v)}
                            onValueCommitted={(v) => setSpinValue(v)}
                        />
                    </UniformGrid>
                </Section>

                <Section title="加载与间隔">
                    <ScaleBox stretch="contain" scale={1}>
                        <Overlay style={{ width: "100%", height: 140 }}>
                            <CircularThrobber
                                radius={22}
                                pieces={8}
                                period={0.7}
                                style={{ positionX: "15%", positionY: "50%" }}
                            />
                            <Throbber
                                pieces={5}
                                period={0.4}
                                animationHorizontal
                                animationOpacity
                                style={{ positionX: "45%", positionY: "50%" }}
                            />
                            <Spacer size={{ x: 20, y: 20 }} />
                        </Overlay>
                    </ScaleBox>
                </Section>

                <Section title="布局与缓存">
                    <InvalidationBox cache>
                        <RetainerBox retainRender renderOnInvalidate>
                            <SizeBox width="100%" height={120}>
                                <Border backgroundColor="rgba(255,255,255,0.08)" contentPadding="10px">
                                    RetainerBox + InvalidationBox 组合
                                </Border>
                            </SizeBox>
                        </RetainerBox>
                    </InvalidationBox>

                    <ExpandableArea
                        expanded={expanded}
                        header={<Button onClick={() => setExpanded((v) => !v)}>切换展开</Button>}
                        area={
                            <ScrollBox style={{ maxHeight: 120 }}>
                                <Border contentPadding="8px" backgroundColor="rgba(255,255,255,0.04)">
                                    展开区域内容
                                </Border>
                                <Spacer size={{ x: 0, y: 10 }} />
                            </ScrollBox>
                        }
                        onExpansionChanged={(isExpanded) => setExpanded(isExpanded)}
                        headerPadding="6px"
                        areaPadding="6px"
                    />
                </Section>

                <Section title="选择与切换">
                    <UniformGrid minCellSize={{ x: 220, y: 100 }} cellPadding="10px" display="grid">
                        <ComboBox
                            options={colorOptions}
                            selectedOption={selected}
                            onSelectionChanged={(item) => setSelected(item)}
                        />
                        <CheckBox
                            checked={checked}
                            type="toggle"
                            color="#22c55e"
                            onCheckStateChanged={(v) => setChecked(v)}
                        />
                        <Button
                            backgroundColor="#2563eb"
                            textColor="#e2e8f0"
                            onClick={() => setProgress((p) => Math.min(1, p + 0.1))}
                        >
                            增加进度
                        </Button>
                    </UniformGrid>
                </Section>

                <Section title="进度与滚动">
                    <ProgressBar
                        precent={progress}
                        barType="left-to-right"
                        enableFillAnimation
                        fillColor="#22d3ee"
                        background={{ color: "#0b1727" }}
                    />
                    <ScrollBox orientation="horizontal" barThickness={6} style={{ height: 80 }}>
                        <Border contentPadding="8px" backgroundColor="rgba(255,255,255,0.06)">
                            横向 ScrollBox 内容（可滚动）
                        </Border>
                        <Spacer size={{ x: 40, y: 0 }} />
                        <Border contentPadding="8px" backgroundColor="rgba(255,255,255,0.06)">
                            更多内容
                        </Border>
                        <Spacer size={{ x: 40, y: 0 }} />
                        <Border contentPadding="8px" backgroundColor="rgba(255,255,255,0.06)">
                            尾部内容
                        </Border>
                    </ScrollBox>
                </Section>

                <Section title="列表与树/网格">
                    <UniformGrid minCellSize={{ x: 260, y: 120 }} cellPadding="12px" display="grid">
                        <ListView>
                            <ListViewItem>列表项 A</ListViewItem>
                            <ListViewItem>列表项 B</ListViewItem>
                            <ListViewItem>列表项 C</ListViewItem>
                        </ListView>
                        <TreeView>
                            <TreeViewItem>树节点 1</TreeViewItem>
                            <TreeViewItem>树节点 2</TreeViewItem>
                        </TreeView>
                        <TileView display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="6px">
                            <TileViewItem>方块 1</TileViewItem>
                            <TileViewItem>方块 2</TileViewItem>
                            <TileViewItem>方块 3</TileViewItem>
                            <TileViewItem>方块 4</TileViewItem>
                        </TileView>
                    </UniformGrid>
                </Section>

                <Section title="动画与视口">
                    <UniformGrid minCellSize={{ x: 260, y: 140 }} cellPadding="10px" display="grid">
                        <Spine
                            lazyLoad
                            initSkin="Default"
                            initAnimation="Idle"
                            atlas=""
                            skel=""
                            color="#ffffff"
                            onAnimationStart={() => {}}
                        />
                        <Rive lazyLoad rive="" fitType="contain" alignment="center" />
                        <Viewport display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                            <Button onClick={() => setProgress(0.5)}>Viewport 内按钮</Button>
                        </Viewport>
                    </UniformGrid>
                </Section>
            </ScrollBox>
        </SafeZone>
    );
};
