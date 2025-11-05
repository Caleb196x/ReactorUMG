import { parseWidgetSelfAlignment } from "../parsers/alignment_parser";
import { getAllStyles } from "../parsers/cssstyle_parser";
import { convertLengthUnitToSlateUnit } from "../parsers/css_length_parser";
import { ContainerConverter } from "./container_converter";
import * as UE from "ue";

type OverlayChildMeta = {
    child: UE.Widget;
    parent: UE.Overlay;
    slot: UE.OverlaySlot;
    typeName: string;
    props: any;
};

export class OverlayConverter extends ContainerConverter {
    private absoluteChildren: Map<UE.Widget, OverlayChildMeta>;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.absoluteChildren = new Map();
    }

    createNativeWidget(): UE.Widget {
        const widget = new UE.Overlay(this.outer);
        return widget;
    }

    update(widget: UE.Widget, oldProps: any, changedProps: any): void {
        if (!widget) {
            return;
        }

        this.absoluteChildren.forEach((meta) => {
            if (!meta) {
                return;
            }

            const style = getAllStyles(meta.typeName, meta.props);
            this.scheduleAbsoluteChildLayout(meta, style, 0);
        });
    }

    appendChild(parent: UE.Widget, child: UE.Widget, childTypeName: string, childProps: any): void {
        const overlay = parent as UE.Overlay;
        const overlaySlot = overlay.AddChildToOverlay(child);
        const style = getAllStyles(childTypeName, childProps);
        if (!overlaySlot) {
            return;
        }

        const alignment = parseWidgetSelfAlignment(style);
        overlaySlot.SetHorizontalAlignment(alignment.horizontal);
        overlaySlot.SetVerticalAlignment(alignment.vertical);
        overlaySlot.SetPadding(alignment.padding);

        const isAbsolute = this.isAbsolutePositioned(style);
        if (!isAbsolute) {
            this.absoluteChildren.delete(child);
            return;
        }

        const meta: OverlayChildMeta = {
            child,
            parent: overlay,
            slot: overlaySlot,
            typeName: childTypeName,
            props: childProps,
        };

        this.absoluteChildren.set(child, meta);

        // When using absolute positioning we reset slot alignment to top/left so we can fully control translation.
        overlaySlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left);
        overlaySlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top);
        overlaySlot.SetPadding(new UE.Margin(0, 0, 0, 0));

        const styleLeft = style?.left;
        const styleTop = style?.top;
        if (!styleLeft && !styleTop) return;

        if (styleLeft.endsWith("%") && styleLeft === "50%") { overlaySlot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center); }
        if (styleTop.endsWith("%") && styleTop === "50%") { overlaySlot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center); }
        UE.UMGManager.SynchronizeSlotProperties(overlaySlot);

        this.scheduleAbsoluteChildLayout(meta, style, 0);
    }

    removeChild(parent: UE.Widget, child: UE.Widget): void {
        this.absoluteChildren.delete(child);
        child.RemoveFromParent();
    }

    private isAbsolutePositioned(style: any): boolean {
        if (!style) {
            return false;
        }
        if (style.position && style.position.toString().toLowerCase() === "absolute") {
            return true;
        }
        return ["left", "right", "top", "bottom"].some((key) => style[key] !== undefined);
    }

    private scheduleAbsoluteChildLayout(meta: OverlayChildMeta, style: any, attempt: number): void {
        const maxAttempts = 10;
        const parentSize = this.getWidgetPixelSize(meta.parent);
        const childSize = this.getWidgetPixelSize(meta.child);

        if (!this.isSizeValid(parentSize) || !this.isSizeValid(childSize)) {
            if (attempt >= maxAttempts) {
                return;
            }

            console.log("delay setup child layout");
            setTimeout(() => this.scheduleAbsoluteChildLayout(meta, style, attempt + 1), 2000);
            return;
        }

        this.applyAbsoluteLayout(meta, style, parentSize, childSize);
    }

    private getWidgetPixelSize(widget: UE.Widget): UE.Vector2D {
        if (!widget) {
            return new UE.Vector2D(0, 0);
        }

        try {
            const size = UE.UMGManager.GetWidgetScreenPixelSize(widget);
            if (this.isSizeValid(size)) {
                return size;
            }
        } catch (err) {
            // ignore and fallback
        }

        return widget.GetDesiredSize();
    }

    private isSizeValid(size: UE.Vector2D): boolean {
        if (!size) {
            return false;
        }

        return size.X > 0 && size.Y > 0;
    }

    private applyAbsoluteLayout(meta: OverlayChildMeta, style: any, parentSize: UE.Vector2D, childSize: UE.Vector2D): void {
        const { child, slot } = meta;
        const styleLeft = style?.left;
        const styleTop = style?.top;
        if (!styleLeft && !styleTop) return;

        // center case
        let donotSetValue = false;
        if (styleLeft.endsWith("%") && styleLeft === "50%") { slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center); donotSetValue = true; }
        if (styleTop.endsWith("%") && styleTop === "50%") { slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center); donotSetValue = true; }

        if (!donotSetValue) {
            const left = convertLengthUnitToSlateUnit(style?.left, style, parentSize.X);
            const top = convertLengthUnitToSlateUnit(style?.top, style, parentSize.Y);
            const transformTranslate = this.computeTransformTranslation(style, childSize);

            const paddingLeft = left + transformTranslate.X;
            const paddingTop = top + transformTranslate.Y;
            slot.SetPadding(new UE.Margin(paddingLeft, paddingTop, 0, 0));
        }

        UE.UMGManager.SynchronizeSlotProperties(slot);
    }

    private computeTransformTranslation(style: any, childSize: UE.Vector2D) {
        let translateX = 0;
        let translateY = 0;

        const accumulate = (value: any, axis: "x" | "y") => {
            const reference = axis === "x" ? childSize.X : childSize.Y;
            const resolved = convertLengthUnitToSlateUnit(value, style, reference);
            if (resolved !== null) {
                if (axis === "x") {
                    translateX += resolved;
                } else {
                    translateY += resolved;
                }
            }
        };

        const parseTranslateList = (raw: string, axis: "x" | "y") => {
            if (!raw) {
                return;
            }
            const parts = raw.split(/[, ]+/).filter((p) => p.length > 0);
            if (parts.length === 0) {
                return;
            }

            accumulate(parts[0], "x");
            if (parts.length > 1) {
                accumulate(parts[1], "y");
            } else if (axis === "y") {
                accumulate(parts[0], "y");
            }
        };

        const transform = style?.transform;
        if (typeof transform === "string" && transform.length > 0) {
            const regex = /(translate(?:3d|X|Y)?)\(([^)]+)\)/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(transform)) !== null) {
                const fn = match[1];
                const args = match[2];
                switch (fn) {
                    case "translate":
                        parseTranslateList(args, "x");
                        break;
                    case "translate3d":
                        parseTranslateList(args, "x");
                        break;
                    case "translateX":
                        accumulate(args, "x");
                        break;
                    case "translateY":
                        accumulate(args, "y");
                        break;
                }
            }
        }

        if (style?.translate) {
            parseTranslateList(style.translate.toString(), "x");
        }

        if (style?.translateX !== undefined) {
            accumulate(style.translateX, "x");
        }

        if (style?.translateY !== undefined) {
            accumulate(style.translateY, "y");
        }

        return {X: translateX, Y: translateY};
    }
}
