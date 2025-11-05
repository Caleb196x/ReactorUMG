import * as UE from 'ue';
import { ElementConverter } from '../converter';
import { convertCssToStyles2 } from '../parsers/cssstyle_parser';
import { clearInlineStylesForSource, parseInlineCss, registerInlineStyles } from '../parsers/inline_style_registry';

let styleSourceCounter = 0;

export class StyleTagConverter extends ElementConverter {
    private readonly sourceId: string;
    private cssText: string;

    constructor(typeName: string, props: any, outer: any) {
        super(typeName, props, outer);
        this.sourceId = `style-${++styleSourceCounter}`;
        this.cssText = this.extractCssText(props);
    }

    creatWidget(): UE.Widget {
        this.registerCurrentStyles();
        return null;
    }

    createNativeWidget(): UE.Widget {
        return null;
    }

    canUpdateWithoutNative(): boolean {
        return true;
    }

    updateWidget(_widget: UE.Widget, _oldProps: any, newProps: any) {
        const nextCss = this.extractCssText(newProps);
        if (nextCss !== this.cssText) {
            this.cssText = nextCss;
            this.registerCurrentStyles();
        }
        this.props = newProps;
    }

    update(_widget: UE.Widget, _oldProps: any, _changedProps: any): void {
        // no-op; handled in updateWidget
    }

    appendChild(_parent: UE.Widget, _child: UE.Widget, _childTypeName: string, _childProps: any): void {
        // Style tags do not participate in the widget tree
    }

    removeChild(_parent: UE.Widget, _child: UE.Widget): void {
        // Style tags do not participate in the widget tree
    }

    dispose(): void {
        clearInlineStylesForSource(this.sourceId);
    }

    private registerCurrentStyles(): void {
        const rules = parseInlineCss(this.cssText, convertCssToStyles2);
        registerInlineStyles(this.sourceId, rules);
    }

    private extractCssText(props: any): string {
        if (!props) {
            return '';
        }

        if (typeof props.children === 'string') {
            return props.children;
        }

        if (Array.isArray(props.children)) {
            return props.children.filter((child: any) => typeof child === 'string').join('\n');
        }

        if (props.dangerouslySetInnerHTML && typeof props.dangerouslySetInnerHTML.__html === 'string') {
            return props.dangerouslySetInnerHTML.__html;
        }

        return '';
    }
}
