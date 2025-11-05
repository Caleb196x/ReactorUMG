import * as UE from "ue";
import { convertPadding } from "./css_margin_parser";

const HORIZONTAL_ALIGN_MAP: Readonly<Record<string, UE.EHorizontalAlignment>> = {
    start: UE.EHorizontalAlignment.HAlign_Left,
    left: UE.EHorizontalAlignment.HAlign_Left,
    "flex-start": UE.EHorizontalAlignment.HAlign_Left,
    end: UE.EHorizontalAlignment.HAlign_Right,
    right: UE.EHorizontalAlignment.HAlign_Right,
    "flex-end": UE.EHorizontalAlignment.HAlign_Right,
    center: UE.EHorizontalAlignment.HAlign_Center,
    stretch: UE.EHorizontalAlignment.HAlign_Fill
};

const VERTICAL_ALIGN_MAP: Readonly<Record<string, UE.EVerticalAlignment>> = {
    start: UE.EVerticalAlignment.VAlign_Top,
    top: UE.EVerticalAlignment.VAlign_Top,
    "flex-start": UE.EVerticalAlignment.VAlign_Top,
    end: UE.EVerticalAlignment.VAlign_Bottom,
    bottom: UE.EVerticalAlignment.VAlign_Bottom,
    "flex-end": UE.EVerticalAlignment.VAlign_Bottom,
    center: UE.EVerticalAlignment.VAlign_Center,
    stretch: UE.EVerticalAlignment.VAlign_Fill
};

const getHorizontalAlignment = (value: string) =>
    HORIZONTAL_ALIGN_MAP[value] ?? UE.EHorizontalAlignment.HAlign_Center;

const getVerticalAlignment = (value: string) =>
    VERTICAL_ALIGN_MAP[value] ?? UE.EVerticalAlignment.VAlign_Center;

export function parseWidgetSelfAlignment(style: any) {
    const alignment = {
        horizontal: UE.EHorizontalAlignment.HAlign_Fill,
        vertical: UE.EVerticalAlignment.VAlign_Fill,
        padding: new UE.Margin(0, 0, 0, 0)
    };

    const flexDirection = style?.flexDirection ?? "row";

    const justifySelf = style?.justifySelf;
    if (justifySelf) {
        alignment.horizontal = getHorizontalAlignment(justifySelf);
    }

    const padding = convertPadding(style);
    if (padding) {
        alignment.padding = padding;
    }

    const alignSelf = style?.alignSelf;
    if (!alignSelf) {
        return alignment;
    }

    if (flexDirection === "row") {
        alignment.vertical = getVerticalAlignment(alignSelf);
    } else {
        alignment.horizontal = getHorizontalAlignment(alignSelf);
    }

    return alignment;
}

export function parseFlexHorizontalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'flex-end': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'left': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'right': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'start': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'end': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'center': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center),
            'stretch': (slot: UE.HorizontalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill)
        },
        alignSelf: {
            'stretch': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill),
            'center': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center),
            'flex-start': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'flex-end': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'start': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'end': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'top': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'bottom': (slot: UE.HorizontalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom)
        },
        spaceBetween: (slot: UE.HorizontalBoxSlot, flex: number) => 
            slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill))
    };
}

export function parseFlexVerticalAlignmentActions() {
    return {
        justifySelf: {
            'flex-start': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'flex-end': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'start': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'end': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'left': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Top),
            'right': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Bottom),
            'center': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Center),
            'stretch': (slot: UE.VerticalBoxSlot) => 
                slot.SetVerticalAlignment(UE.EVerticalAlignment.VAlign_Fill)
        },
        alignSelf: {
            'stretch': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Fill),
            'center': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Center),
            'flex-start': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'flex-end': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'start': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'end': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right),
            'top': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Left),
            'bottom': (slot: UE.VerticalBoxSlot) => 
                slot.SetHorizontalAlignment(UE.EHorizontalAlignment.HAlign_Right)
        },
        spaceBetween: (slot: UE.VerticalBoxSlot, flex: number) => 
            slot.SetSize(new UE.SlateChildSize(flex, UE.ESlateSizeRule.Fill))
    };
}
