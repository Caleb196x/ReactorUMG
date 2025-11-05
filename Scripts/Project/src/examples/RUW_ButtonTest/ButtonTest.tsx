import { ChangeEvent } from 'react';
import * as React from "react";
import './ButtonTest.css';  // 引入 CSS 样式

// 定义 state 类型
interface ButtonTestClassState {
  buttonText: string;
  isDisabled: boolean;
  isClicked: boolean;
  isFocused: boolean;
}

class ButtonTestClass extends React.Component<{}, ButtonTestClassState> {
  constructor(props: {}) {
    super(props);
    // 初始化状态
    this.state = {
      buttonText: 'Click Me!',
      isDisabled: false,
      isClicked: false,
      isFocused: false,
    };
  }

  // 处理点击事件
  handleClick =  () => {
    console.log("button clicked");
    this.setState({
      isClicked: true,
      buttonText: 'Button Clicked!',
    });
  };

  // 处理焦点事件
  handleFocus = () => { this.setState({ isFocused: true }); };
  handleBlur = () => { this.setState({ isFocused: false }); };

  // 切换禁用状态
  toggleDisable = () => {
    this.setState(prevState => ({
      isDisabled: !prevState.isDisabled,
    }));
  };

  render() {
    const { buttonText, isDisabled, isClicked, isFocused } = this.state;

    return (
      <div className="button-test-container">
        <button
          className={`custom-button ${isFocused ? 'focused' : ''}`}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          disabled={isDisabled}
        >
          {buttonText}
        </button>
        
        {/* 控制按钮禁用与否 */}
        <div>
          <button onClick={this.toggleDisable} style={{color: "rgb(0, 0, 0)"}}>
            {isDisabled ? 'Enable Button' : 'Disable Button'}
          </button>
        </div>
        
        {/* 状态信息 */}
        <div className="button-status">
          <p>{isClicked ? 'Button has been clicked!' : 'Button not clicked yet.'}</p>
          <p>{isDisabled ? 'Button is disabled.' : 'Button is enabled.'}</p>
          <p>{isFocused ? 'Button is focused.' : 'Button is not focused.'}</p>
        </div>
      </div>
    );
  }
}

export default ButtonTestClass;
