import * as React from "react";

type AnchorKey =
  | 'top left' | 'top center' | 'top right'
  | 'center left' | 'center center' | 'center right'
  | 'bottom left' | 'bottom center' | 'bottom right'
  | 'top fill' | 'center fill' | 'bottom fill'
  | 'top span-all' | 'center span-all' | 'bottom span-all'
  | 'span-all left' | 'span-all center' | 'span-all right'
  | 'fill left' | 'fill center' | 'fill right'
  | 'fill' | 'span-all';

const ALL_ANCHORS: AnchorKey[] = [
  'top left', 'top center', 'top right',
  'center left', 'center center', 'center right',
  'bottom left', 'bottom center', 'bottom right',
  'top fill', 'center fill', 'bottom fill',
  'top span-all', 'center span-all', 'bottom span-all',
  'span-all left', 'span-all center', 'span-all right',
  'fill left', 'fill center', 'fill right',
  'fill', 'span-all',
];

interface CanvasTestState {
  containerWidth: string;
  containerHeight: string;
  useOffsetAnchor: boolean;
  anchor: AnchorKey;
}

const boxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '6px',
  border: '1px solid rgba(0,0,0,0.25)'
};

export default class CanvasTest extends React.Component<{}, CanvasTestState> {
  state: CanvasTestState = {
    containerWidth: '640px',
    containerHeight: '420px',
    useOffsetAnchor: false,
    anchor: 'top left',
  };

  renderControls() {
    const { containerWidth, containerHeight, useOffsetAnchor, anchor } = this.state;
    return (
      <div style={{ minWidth: 280 }}>
        <h3>Canvas Controls</h3>
        <div style={{ marginBottom: 8 }}>
          <label>container width: </label>
          <input
            value={containerWidth}
            onChange={(e) => this.setState({ containerWidth: e.target.value })}
            placeholder="e.g. 640px or 32em"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>container height: </label>
          <input
            value={containerHeight}
            onChange={(e) => this.setState({ containerHeight: e.target.value })}
            placeholder="e.g. 420px or 24rem"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>anchor type: </label>
          <select
            value={useOffsetAnchor ? 'offset' : 'position'}
            onChange={(e) => this.setState({ useOffsetAnchor: e.target.value === 'offset' })}
          >
            <option value="position">positionAnchor</option>
            <option value="offset">offsetAnchor</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>anchor preset: </label>
          <select
            value={anchor}
            onChange={(e) => this.setState({ anchor: e.target.value as AnchorKey })}
          >
            {ALL_ANCHORS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Use the dropdowns to iterate through all predefined anchor presets.
        </div>
      </div>
    );
  }

  renderCanvasDemo() {
    const { containerWidth, containerHeight, useOffsetAnchor, anchor } = this.state;

    const containerStyle: React.CSSProperties = {
      width: containerWidth,
      height: containerHeight,
      border: '2px dashed #888',
      background: '#f7f7f7',
      // Canvas-specific container styles
      ...(useOffsetAnchor ? { offsetAnchor: anchor } : { positionAnchor: anchor }),
    } as any;

    const labelStyle: React.CSSProperties = {
      position: 'absolute',
      top: '4px',
      left: '6px',
      fontSize: 12,
      color: '#333'
    };

    return (
      <canvas style={containerStyle}>
        {/* Absolute positioned by top/left with explicit size */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#3f51b5',
            top: '12px',
            left: '12px',
            width: '120px',
            height: '64px',
            padding: '6px',
            margin: '2px',
            fontSize: '16px',
          }}
        >A
          <span style={labelStyle}>top/left + size</span>
        </div>

        {/* Width only + aspectRatio controls computed height */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#009688',
            top: '12px',
            left: '160px',
            width: '160px',
            aspectRatio: '16/9',
            fontSize: '16px',
          }}
        >B
          <span style={labelStyle}>width + aspectRatio</span>
        </div>

        {/* Height only + aspectRatio controls computed width */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#e91e63',
            top: '100px',
            left: '12px',
            height: '96px',
            aspectRatio: '1/1',
            fontSize: '16px',
          }}
        >C
          <span style={labelStyle}>height + aspectRatio</span>
        </div>

        {/* Auto size (no width/height) with content-driven size */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#ff9800',
            top: '210px',
            left: '12px',
            padding: '10px 14px',
            fontSize: '16px',
          }}
        >
          Auto Size
          <span style={labelStyle}>autoSize</span>
        </div>

        {/* Scale applied to the computed size */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#795548',
            top: '210px',
            left: '170px',
            width: '120px',
            height: '60px',
            scale: 1.5 as any,
            fontSize: '16px',
          }}
        >D
          <span style={labelStyle}>scale x1.5</span>
        </div>

        {/* Demonstrate right/bottom properties (effective with offset-based anchoring) */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#607d8b',
            top: '12px',
            left: '340px',
            right: '16px',
            bottom: '16px',
            width: '140px',
            height: '80px',
            fontSize: '16px',
          }}
        >E
          <span style={labelStyle}>right/bottom</span>
        </div>

        {/* Different units (px, em, rem) */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#9c27b0',
            top: '120px',
            left: '340px',
            width: '12em',
            height: '4rem',
            fontSize: '16px',
          }}
        >F
          <span style={labelStyle}>em/rem units</span>
        </div>

        {/* Percentage-based size and position (relative to container) */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: '#4caf50',
            top: '60% ',
            left: '55%',
            width: '35%',
            height: '25%',
            fontSize: '16px',
          }}
        >G
          <span style={labelStyle}>% pos/size</span>
        </div>
      </canvas>
    );
  }

  render() {
    return (
      <div style={{ display: 'flex', gap: '24px' }}>
        {this.renderControls()}
        {this.renderCanvasDemo()}
      </div>
    );
  }
}
