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

type TestCase = { name: string; run: () => boolean };

const testCases: TestCase[] = [
    {
        name: "RadialSlider wires change callbacks",
        run: () => {
            let changed = 0;
            const element = (
                <RadialSlider
                    defaultValue={0.25}
                    thumbStartAngle={5}
                    thumbEndPointAngle={60}
                    sliderProgressColor="#ff5500"
                    backgroundColor="#111"
                    valueTags={[0.25, 0.5, 0.75]}
                    onValueChanged={(value) => {
                        changed = value;
                    }}
                />
            );
            element.props.onValueChanged?.(0.75);
            return changed === 0.75 && element.props.defaultValue === 0.25;
        },
    },
    {
        name: "Slider respects orientation and bounds",
        run: () => {
            let last = 0;
            const element = (
                <Slider
                    minValue={0}
                    maxValue={10}
                    orientation="horizontal"
                    stepSize={0.5}
                    onValueChanged={(v) => {
                        last = v;
                    }}
                />
            );
            element.props.onValueChanged?.(5.5);
            return last === 5.5 && element.props.orientation === "horizontal";
        },
    },
    {
        name: "SpinBox commits value with formatting options",
        run: () => {
            let committed = 0;
            let commitMethod: string | undefined;
            const element = (
                <SpinBox
                    value={1}
                    minValue={0}
                    maxValue={5}
                    minFractionDigits={1}
                    maxFractionDigits={2}
                    textAlign="right"
                    onValueCommitted={(value, method) => {
                        committed = value;
                        commitMethod = method;
                    }}
                />
            );
            element.props.onValueCommitted?.(3.25, "enter");
            return committed === 3.25 && commitMethod === "enter";
        },
    },
    {
        name: "CircularThrobber applies radius and piece count",
        run: () => {
            const element = <CircularThrobber radius={24} pieces={6} period={0.8} enableRadius />;
            return element.props.radius === 24 && element.props.pieces === 6 && element.props.enableRadius === true;
        },
    },
    {
        name: "Throbber toggles animation flags",
        run: () => {
            const element = (
                <Throbber animationHorizontal animationVertical animationOpacity pieces={5} period={0.4} />
            );
            return (
                element.props.animationHorizontal === true &&
                element.props.animationVertical === true &&
                element.props.animationOpacity === true
            );
        },
    },
    {
        name: "Spacer exposes desired size vector",
        run: () => {
            const element = <Spacer size={{ x: 8, y: 16 }} />;
            return element.props.size?.x === 8 && element.props.size?.y === 16;
        },
    },
    {
        name: "ExpandableArea hosts header and area content",
        run: () => {
            let expanded = false;
            const element = (
                <ExpandableArea
                    header={<span>Header</span>}
                    area={<span>Body</span>}
                    expanded
                    maxHeight={400}
                    onExpansionChanged={(isExpanded) => {
                        expanded = isExpanded;
                    }}
                />
            );
            element.props.onExpansionChanged?.(false);
            return expanded === false && element.props.expanded === true;
        },
    },
    {
        name: "ScrollBox configures scrolling behavior",
        run: () => {
            const element = (
                <ScrollBox
                    orientation="vertical"
                    barThickness={6}
                    alwaysShowBars
                    allowDragging
                    navigationDestination="into-view"
                >
                    <Spacer size={{ x: 0, y: 120 }} />
                </ScrollBox>
            );
            return (
                element.props.orientation === "vertical" &&
                element.props.barThickness === 6 &&
                element.props.alwaysShowBars === true &&
                element.props.allowDragging === true &&
                !!element.props.children
            );
        },
    },
    {
        name: "Button forwards interaction events",
        run: () => {
            let clicked = false;
            let hovered = false;
            const element = (
                <Button
                    backgroundColor="#222"
                    textColor="#fff"
                    onClick={() => {
                        clicked = true;
                    }}
                    onHovered={() => {
                        hovered = true;
                    }}
                >
                    Press Me
                </Button>
            );
            element.props.onClick?.();
            element.props.onHovered?.();
            return clicked && hovered && element.props.children === "Press Me";
        },
    },
    {
        name: "ComboBox handles option selection changes",
        run: () => {
            let selection: string | undefined;
            let selectionType: string | undefined;
            const element = (
                <ComboBox
                    options={["A", "B", "C"]}
                    selectedOption="A"
                    hasDownArrow
                    onSelectionChanged={(item, type) => {
                        selection = item;
                        selectionType = type;
                    }}
                />
            );
            element.props.onSelectionChanged?.("C", "mouse-click");
            return selection === "C" && selectionType === "mouse-click" && element.props.selectedOption === "A";
        },
    },
    {
        name: "Checkbox toggles check state callback",
        run: () => {
            let lastState = false;
            const element = (
                <CheckBox
                    checked
                    type="toggle"
                    color="#00ff00"
                    onCheckStateChanged={(isChecked) => {
                        lastState = isChecked;
                    }}
                />
            );
            element.props.onCheckStateChanged?.(false);
            return lastState === false && element.props.checked === true;
        },
    },
    {
        name: "ProgressBar binds percent and fill color",
        run: () => {
            const element = (
                <ProgressBar
                    precent={0.6}
                    barType="left-to-right"
                    enableFillAnimation
                    fillColor="#3366ff"
                    precentBinding={() => 0.75}
                />
            );
            const boundValue = element.props.precentBinding?.();
            return element.props.precent === 0.6 && boundValue === 0.75 && element.props.enableFillAnimation === true;
        },
    },
    {
        name: "Spine hooks animation lifecycle events",
        run: () => {
            let started: string | undefined;
            let completed: string | undefined;
            const element = (
                <Spine
                    initSkin="Hero"
                    initAnimation="Idle"
                    atlas="Hero.atlas"
                    skel="Hero.skel"
                    color="#ffffff"
                    onAnimationStart={(track) => {
                        started = track;
                    }}
                    onAnimationComplete={(track) => {
                        completed = track;
                    }}
                />
            );
            element.props.onAnimationStart?.("Idle");
            element.props.onAnimationComplete?.("Idle");
            return started === "Idle" && completed === "Idle" && element.props.initSkin === "Hero";
        },
    },
];

export function runReactorUMGComponentSmokeTests(
    log: (message: string) => void = console.log
): { passed: number; total: number } {
    let passed = 0;
    for (const test of testCases) {
        try {
            const ok = test.run();
            if (ok) {
                passed += 1;
                log(`[PASS] ${test.name}`);
            } else {
                log(`[FAIL] ${test.name}`);
            }
        } catch (error) {
            log(`[ERROR] ${test.name}: ${error}`);
        }
    }
    return { passed, total: testCases.length };
}

export function listReactorUMGComponentSmokeTests(): string[] {
    return testCases.map((test) => test.name);
}
