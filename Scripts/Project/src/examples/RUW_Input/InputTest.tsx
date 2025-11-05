import { Component } from 'react';
import * as React from 'react';

interface CustomInputProps {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  [key: string]: any; // Allow additional props
}

interface CustomInputState {
  value: string;
}

class CustomInput extends Component<CustomInputProps, CustomInputState> {
  constructor(props: CustomInputProps) {
    super(props);
    this.state = {
      value: this.props.value || '', // 初始化输入框的值
    };
  }

  // 处理输入框变化的事件
  handleChange = (event) => {
    const { value } = event.target;
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(event); // 如果父组件传入了 onChange 方法，调用它
    }
  };

  // 处理输入框聚焦的事件
  handleFocus = (event) => {
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  // 处理输入框失焦的事件
  handleBlur = (event) => {
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  render() {
    const {
      type = 'text', // 默认为文本输入框
      placeholder = '', // 占位符
      value = this.state.value, // 控制值
      name,
      id,
      className,
      style,
      maxLength,
      minLength,
      required,
      disabled,
      readOnly,
      autoFocus,
      autoComplete,
      onClick,
      onChange,
      onFocus,
      onBlur,
      ...otherProps
    } = this.props;

    return (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        name={name}
        id={id}
        className={className}
        style={{
          ...style,
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          outline: 'black',
          transition: 'border 0.3s',
          width: '100%',
          ...(disabled && { backgroundColor: '#f0f0f0' }),
          ...(readOnly && { backgroundColor: '#e0e0e0' }),
        }}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onClick={onClick}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        {...otherProps}
      />
    );
  }
}

interface AppState {
  inputValue: string;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputValue: '',
    };
  }

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    alert(`Submitted value: ${this.state.inputValue}`);
  };

  render() {
    return (
      <div style={{ padding: '20px', flexDirection: 'column' }}>
        <h1>React Input Component Example</h1>

        <div onSubmit={this.handleSubmit} style={{ padding: '20px', flexDirection: 'column' }}>
          <div>
            <label htmlFor="username">Username: </label>
            <CustomInput
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              required
              maxLength={20}
              style={{ marginBottom: '10px' }}
            />
          </div>

          <div>
            <label htmlFor="email">Email: </label>
            <CustomInput
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              required
              style={{ marginBottom: '10px' }}
            />
          </div>

          <div>
            <button type="submit" style={{color: 'black'}}>Submit</button>
          </div>
        </div>

        <div>
          <h2>Input Value:</h2>
          <p>{this.state.inputValue}</p>
        </div>
      </div>
    );
  }
}

export default App;
