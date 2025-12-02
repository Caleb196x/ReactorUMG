import * as React from "react";

// Inline CSS styles added to fix missing file error
const styles = {
  gridItem: {
    backgroundColor: "#4caf50",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "16px",
  },
};

interface GridTestState {
  justifyContent: string;
  alignContent: string;
  justifyItems: string;
  alignItems: string;
  gap: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
}

class GridTest extends React.Component<{}, GridTestState> {
  constructor(props) {
    super(props);
    this.state = {
      justifyContent: "center",
      alignContent: "center",
      justifyItems: "stretch",
      alignItems: "stretch",
      gap: "10px",
      gridTemplateColumns: "repeat(3, 100px)",
      gridTemplateRows: "repeat(2, 100px)",
    };
  }

  handleChange = (key: keyof GridTestState, value: string) => {
    this.setState({ [key]: value } as Pick<GridTestState, keyof GridTestState>);
  };

  render() {
    const {
      justifyContent,
      alignContent,
      justifyItems,
      alignItems,
      gap,
      gridTemplateColumns,
      gridTemplateRows,
    } = this.state;

    const gridStyle = {
      display: "grid",
      justifyContent,
      alignContent,
      justifyItems,
      alignItems,
      gap,
      gridTemplateColumns,
      gridTemplateRows,
      border: "2px solid #333",
      padding: "10px",
      width: "400px",
      height: "300px",
      background: "#fafafa",
    };

    return (
      <div style={{ display: "flex", gap: "40px" }}>
        {/* Grid Container */}
        <div style={gridStyle}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={styles.gridItem}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Control Panel */}
        <div>
          <h3>Grid Controls</h3>

          <div>
            <label>justify-content: </label>
            <select
              value={justifyContent}
              onChange={(e) => this.handleChange("justifyContent", e.target.value)}
            >
              <option>start</option>
              <option>end</option>
              <option>center</option>
              <option>stretch</option>
              <option>space-between</option>
              <option>space-around</option>
              <option>space-evenly</option>
            </select>
          </div>

          <div>
            <label>align-content: </label>
            <select
              value={alignContent}
              onChange={(e) => this.handleChange("alignContent", e.target.value)}
            >
              <option>start</option>
              <option>end</option>
              <option>center</option>
              <option>stretch</option>
              <option>space-between</option>
              <option>space-around</option>
              <option>space-evenly</option>
            </select>
          </div>

          <div>
            <label>justify-items: </label>
            <select
              value={justifyItems}
              onChange={(e) => this.handleChange("justifyItems", e.target.value)}
            >
              <option>start</option>
              <option>end</option>
              <option>center</option>
              <option>stretch</option>
            </select>
          </div>

          <div>
            <label>align-items: </label>
            <select
              value={alignItems}
              onChange={(e) => this.handleChange("alignItems", e.target.value)}
            >
              <option>start</option>
              <option>end</option>
              <option>center</option>
              <option>stretch</option>
            </select>
          </div>

          <div>
            <label>gap: </label>
            <input
              type="text"
              value={gap}
              onChange={(e) => this.handleChange("gap", e.target.value)}
            />
          </div>

          <div>
            <label>grid-template-columns: </label>
            <input
              type="text"
              value={gridTemplateColumns}
              onChange={(e) =>
                this.handleChange("gridTemplateColumns", e.target.value)
              }
            />
          </div>

          <div>
            <label>grid-template-rows: </label>
            <input
              type="text"
              value={gridTemplateRows}
              onChange={(e) =>
                this.handleChange("gridTemplateRows", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default GridTest;
