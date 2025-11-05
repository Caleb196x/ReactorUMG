import * as React from "react";
import './Progress.css';

const PROGRESS_STYLE = `
.progress-demo {
  width: 100%;
  height: 22px;
  appearance: none;
  -webkit-appearance: none;
  border: none;
  border-radius: 12px;
  background-color: #f3f3f3;
  color: #198754;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.progress-demo:focus {
  outline: 2px solid #198754;
  outline-offset: 3px;
}

.progress-demo.progress-paused::-webkit-progress-value,
.progress-demo.progress-paused::-moz-progress-bar {
  background-color: #adb5bd;
  background-image: none;
}

.progress-demo::-webkit-progress-bar {
  background-color: transparent;
}

.progress-demo::-webkit-progress-value {
  background-image: repeating-linear-gradient(
    135deg,
    rgba(25, 135, 84, 0.95),
    rgba(25, 135, 84, 0.95) 12px,
    rgba(25, 135, 84, 0.7) 12px,
    rgba(25, 135, 84, 0.7) 24px
  );
  transition: width 0.35s ease;
}

.progress-demo::-moz-progress-bar {
  background-image: repeating-linear-gradient(
    135deg,
    rgba(25, 135, 84, 0.95),
    rgba(25, 135, 84, 0.95) 12px,
    rgba(25, 135, 84, 0.7) 12px,
    rgba(25, 135, 84, 0.7) 24px
  );
}

.progress-demo[data-state="indeterminate"] {
  background-image: linear-gradient(
    90deg,
    rgba(25, 135, 84, 0.1) 0%,
    rgba(25, 135, 84, 0.35) 50%,
    rgba(25, 135, 84, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: progress-indeterminate 1.4s linear infinite;
}

@keyframes progress-indeterminate {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.progress-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #212529;
  pointer-events: none;
}

.progress-wrapper {
  position: relative;
  margin-top: 12px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.control-row label {
  font-size: 13px;
  color: #495057;
}

.control-row input[type="number"],
.control-row input[type="range"] {
  width: 120px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.control-buttons button:hover {
  background-color: #198754;
  color: #fff;
}

.log-panel {
  margin-top: 16px;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  max-height: 160px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
  color: #343a40;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background-color: #e9f7ef;
  color: #157347;
  border-radius: 999px;
  font-size: 12px;
  margin-left: 6px;
}
`;

const MAX_LOG_ITEMS = 10;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface ProgressClassState {
  value: number;
  max: number;
  autoPlay: boolean;
  indeterminate: boolean;
  logs: string[];
}

export class ProgressClassTest extends React.Component<unknown, ProgressClassState> {
  private timerId: number | null = null;

  state: ProgressClassState = {
    value: 50,
    max: 100,
    autoPlay: false,
    indeterminate: false,
    logs: [],
  };

  componentDidMount(): void {
    this.pushLog("Class component initialised");
  }

  componentWillUnmount(): void {
    this.clearTimer();
  }

  pushLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    this.setState((previous) => ({
      logs: [`[${timestamp}] ${message}`, ...previous.logs].slice(
        0,
        MAX_LOG_ITEMS
      ),
    }));
  };

  clearTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  startAutoPlay() {
    this.clearTimer();
    this.timerId = window.setInterval(() => {
      this.setState(
        (previous) => {
          const increment = Math.max(1, Math.round(previous.max * 0.07));
          const nextValue = clamp(previous.value + increment, 0, previous.max);
          const reachedEnd = nextValue === previous.max;
          return {
            value: nextValue,
            autoPlay: reachedEnd ? false : previous.autoPlay,
          };
        },
        () => {
          if (this.state.value === this.state.max) {
            this.clearTimer();
            this.pushLog("Auto-play finished at 100%");
          }
        }
      );
    }, 520);
  }

  toggleAutoPlay = () => {
    this.setState(
      (previous) => ({
        autoPlay: !previous.autoPlay,
      }),
      () => {
        if (this.state.indeterminate) {
          this.clearTimer();
          this.pushLog("Progress is indeterminate so auto-play is disabled");
          return;
        }

        if (this.state.autoPlay) {
          this.pushLog("Auto-play started");
          this.startAutoPlay();
        } else {
          this.clearTimer();
          this.pushLog("Auto-play paused");
        }
      }
    );
  };

  toggleIndeterminate = () => {
    this.setState(
      (previous) => ({
        indeterminate: !previous.indeterminate,
        autoPlay: previous.indeterminate ? previous.autoPlay : false,
      }),
      () => {
        if (this.state.indeterminate) {
          this.clearTimer();
          this.pushLog("Switched to indeterminate (value removed)");
        } else {
          this.pushLog("Restored determinate (value reapplied)");
        }
      }
    );
  };

  handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    this.setState(
      (previous) => ({
        max: normalized,
        value: clamp(previous.value, 0, normalized),
      }),
      () => this.pushLog(`Max updated to ${this.state.max}`)
    );
  };

  handleValueSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    const normalized = Number.isFinite(parsed) ? parsed : 0;
    this.setState(
      {
        value: clamp(normalized, 0, this.state.max),
      },
      () => this.pushLog(`Manual value updated to ${this.state.value}`)
    );
  };

  resetProgress = () => {
    this.clearTimer();
    this.setState(
      {
        value: 0,
        max: 100,
        autoPlay: false,
        indeterminate: false,
      },
      () => this.pushLog("Progress reset to defaults")
    );
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLProgressElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      this.setState(
        (previous) => ({
          value: clamp(previous.value + 1, 0, previous.max),
        }),
        () => this.pushLog(`Keyboard increased value to ${this.state.value}`)
      );
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      this.setState(
        (previous) => ({
          value: clamp(previous.value - 1, 0, previous.max),
        }),
        () => this.pushLog(`Keyboard decreased value to ${this.state.value}`)
      );
      event.preventDefault();
    }
  };

  handleProgressClick = (event: React.MouseEvent<HTMLProgressElement>) => {
    this.pushLog(`Progress clicked at x=${event.clientX}, y=${event.clientY}`);
  };

  handleMouseEnter = () => {
    this.pushLog("Pointer entered progress");
  };

  handleMouseLeave = () => {
    this.pushLog("Pointer left progress");
  };

  handleFocus = () => {
    this.pushLog("Progress focused");
  };

  handleBlur = () => {
    this.pushLog("Progress blurred");
  };

  completeImmediately = () => {
    this.clearTimer();
    this.setState(
      (previous) => ({
        value: previous.max,
        autoPlay: false,
      }),
      () => this.pushLog("Progress forced to 100%")
    );
  };

  handleDoubleClick = () => {
    this.toggleIndeterminate();
  };

  render() {
    const { value, max, autoPlay, indeterminate, logs } = this.state;
    const progressProps = indeterminate ? {} : { value };
    const ariaValueNow = indeterminate ? undefined : value;
    const progressState = indeterminate
      ? "indeterminate"
      : autoPlay
      ? "running"
      : value === max
      ? "completed"
      : "idle";

    const percentLabel = indeterminate
      ? "Processing..."
      : `${Math.round((value / max) * 100)}%`;

    return (
      <div>
        {/* <style>{PROGRESS_STYLE}</style> */}

        <h2>
          progress demo (class component)
          <span className="status-tag">React Class</span>
        </h2>

        <form id="class-progress-form" className="control-row">
          <label>
            Max value:
            <input
              type="number"
              min={1}
              step={1}
              value={max}
              onChange={this.handleMaxChange}
            />
          </label>

          <label>
            Current value:
            <input
              type="range"
              min={0}
              max={max}
              value={indeterminate ? 0 : value}
              onChange={this.handleValueSlider}
              disabled={indeterminate}
            />
          </label>

          <label>
            Indeterminate:
            <input
              type="checkbox"
              checked={indeterminate}
              onChange={this.toggleIndeterminate}
            />
          </label>

          <span>State: {progressState}</span>
        </form>

        <div className="control-buttons">
          <button
            type="button"
            onClick={this.toggleAutoPlay}
            disabled={indeterminate}
          >
            {autoPlay ? "Pause auto-play" : "Start auto-play"}
          </button>
          <button type="button" onClick={this.completeImmediately}>
            Complete now
          </button>
          <button type="button" onClick={this.resetProgress}>
            Reset all
          </button>
          <button
            type="button"
            onClick={() => this.pushLog("Manual log entry captured")}
          >
            Record log
          </button>
        </div>

        <div className="progress-wrapper">
          <progress
            className={`progress-demo ${autoPlay ? "" : "progress-paused"}`}
            max={max}
            aria-label="Download progress"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={ariaValueNow}
            tabIndex={0}
            data-state={progressState}
            onClick={this.handleProgressClick}
            onKeyDown={this.handleKeyDown}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onDoubleClick={this.handleDoubleClick}
            {...progressProps}
          />
          <span className="progress-label">{percentLabel}</span>
        </div>

        <div className="log-panel" aria-live="polite">
          {logs.length === 0 ? (
            <div>No events yet - interact with the controls to see updates.</div>
          ) : (
            logs.map((entry, index) => <div key={index}>{entry}</div>)
          )}
        </div>
      </div>
    );
  }
}

export default ProgressClassTest;
