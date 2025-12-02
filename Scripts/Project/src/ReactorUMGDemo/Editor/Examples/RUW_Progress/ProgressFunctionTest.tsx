import * as React from "react";
import './Progress.css';

const { useCallback, useEffect, useMemo, useState } = React;

const PROGRESS_STYLE = `
.progress-demo {
  width: 100%;
  height: 22px;
  appearance: none;
  -webkit-appearance: none;
  border: none;
  border-radius: 12px;
  background-color: #f3f3f3;
  color: #0d6efd;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.progress-demo:focus {
  outline: 2px solid #0d6efd;
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
    45deg,
    rgba(13, 110, 253, 0.9),
    rgba(13, 110, 253, 0.9) 10px,
    rgba(13, 110, 253, 0.6) 10px,
    rgba(13, 110, 253, 0.6) 20px
  );
  transition: width 0.35s ease;
}

.progress-demo::-moz-progress-bar {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(13, 110, 253, 0.9),
    rgba(13, 110, 253, 0.9) 10px,
    rgba(13, 110, 253, 0.6) 10px,
    rgba(13, 110, 253, 0.6) 20px
  );
}

.progress-demo[data-state="indeterminate"] {
  background-image: linear-gradient(
    90deg,
    rgba(13, 110, 253, 0.1) 0%,
    rgba(13, 110, 253, 0.35) 50%,
    rgba(13, 110, 253, 0.1) 100%
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
  background-color: #0d6efd;
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
  background-color: #e7f1ff;
  color: #0b5ed7;
  border-radius: 999px;
  font-size: 12px;
  margin-left: 6px;
}
`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MAX_LOG_ITEMS = 10;

const formatPercent = (value: number, max: number) => {
  if (max <= 0) {
    return "0%";
  }
  const percent = Math.round((value / max) * 100);
  return `${clamp(percent, 0, 100)}%`;
};

export const ProgressFunctionTest: React.FC = () => {
  const [value, setValue] = useState<number>(35);
  const [max, setMax] = useState<number>(100);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const percentLabel = useMemo(
    () => (indeterminate ? "Processing..." : formatPercent(value, max)),
    [indeterminate, value, max]
  );

  const pushLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((previous) =>
      [`[${timestamp}] ${message}`, ...previous].slice(0, MAX_LOG_ITEMS)
    );
  }, []);

  useEffect(() => {
    if (!autoPlay || indeterminate) {
      return;
    }

    const interval = window.setInterval(() => {
      setValue((previous) => {
        const increment = Math.max(1, Math.round(max * 0.08));
        const next = clamp(previous + increment, 0, max);

        if (next === max) {
          window.clearInterval(interval);
          setAutoPlay(false);
          pushLog("Auto-play finished at 100%");
        }

        return next;
      });
    }, 480);

    return () => window.clearInterval(interval);
  }, [autoPlay, indeterminate, max, pushLog]);

  useEffect(() => {
    pushLog("Function component initialised");
  }, [pushLog]);

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    setMax(normalized);
    setValue((previous) => clamp(previous, 0, normalized));
    pushLog(`Max updated to ${normalized}`);
  };

  const handleValueSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    const normalized = Number.isFinite(parsed) ? parsed : 0;
    setValue(clamp(normalized, 0, max));
    pushLog(`Manual value updated to ${normalized}`);
  };

  const toggleIndeterminate = () => {
    setIndeterminate((previous) => {
      const next = !previous;
      pushLog(
        next
          ? "Switched to indeterminate (value removed)"
          : "Restored determinate (value reapplied)"
      );
      if (next) {
        setAutoPlay(false);
      }
      return next;
    });
  };

  const toggleAutoPlay = () => {
    setAutoPlay((previous) => {
      const next = !previous;
      pushLog(next ? "Auto-play started" : "Auto-play paused");
      return next;
    });
  };

  const resetProgress = () => {
    setAutoPlay(false);
    setIndeterminate(false);
    setValue(0);
    setMax(100);
    pushLog("Progress reset to defaults");
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLProgressElement>) => {
    pushLog(`Progress clicked at x=${event.clientX}, y=${event.clientY}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLProgressElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      setValue((previous) => {
        const next = clamp(previous + 1, 0, max);
        pushLog(`Keyboard increased value to ${next}`);
        return next;
      });
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      setValue((previous) => {
        const next = clamp(previous - 1, 0, max);
        pushLog(`Keyboard decreased value to ${next}`);
        return next;
      });
      event.preventDefault();
    }
  };

  const progressProps = indeterminate ? {} : { value };
  const ariaValueNow = indeterminate ? undefined : value;
  const progressState = indeterminate
    ? "indeterminate"
    : autoPlay
    ? "running"
    : value === max
    ? "completed"
    : "idle";

  return (
    <div>
      <style>{PROGRESS_STYLE}</style>

      <h2>
        progress demo (function component)
        <span className="status-tag">React Hooks</span>
      </h2>

      <form id="function-progress-form" className="control-row">
        <label>
          Max value:
          <input
            type="number"
            min={1}
            step={1}
            value={max}
            onChange={handleMaxChange}
          />
        </label>

        <label>
          Current value:
          <input
            type="range"
            min={0}
            max={max}
            value={indeterminate ? 0 : value}
            onChange={handleValueSlider}
            disabled={indeterminate}
          />
        </label>

        <label>
          Indeterminate:
          <input
            type="checkbox"
            checked={indeterminate}
            onChange={toggleIndeterminate}
          />
        </label>

        <span>State: {progressState}</span>
      </form>

      <div className="control-buttons">
        <button type="button" onClick={toggleAutoPlay} disabled={indeterminate}>
          {autoPlay ? "Pause auto-play" : "Start auto-play"}
        </button>
        <button type="button" onClick={() => setValue(max)}>
          Complete now
        </button>
        <button type="button" onClick={resetProgress}>
          Reset all
        </button>
        <button type="button" onClick={() => pushLog("Manual log entry captured")}>
          Record log
        </button>
      </div>

      <div className="progress-wrapper">
        <progress
          className={`progress-demo ${autoPlay ? "" : "progress-paused"}`}
          max={max}
          aria-label="Upload progress"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={ariaValueNow}
          tabIndex={0}
          data-state={progressState}
          onClick={handleProgressClick}
          onFocus={() => pushLog("Progress focused")}
          onBlur={() => pushLog("Progress blurred")}
          onMouseEnter={() => pushLog("Pointer entered progress")}
          onMouseLeave={() => pushLog("Pointer left progress")}
          onKeyDown={handleKeyDown}
          onDoubleClick={toggleIndeterminate}
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
};

export default ProgressFunctionTest;
