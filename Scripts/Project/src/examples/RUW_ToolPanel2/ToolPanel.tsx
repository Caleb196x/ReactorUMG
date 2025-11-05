import { useState } from 'react';
import * as React from 'react';
import './ToolPanel.css'; // 引入样式

export function ToolPanel() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('fast');
  const urlRef = React.useRef(url);
  const modeRef = React.useRef(mode);

  const handleTest = () => console.log('测试中2...', urlRef.current, modeRef.current);
  const handleDownload = () => console.log('下载中...');
  const handleView = () => console.log('查看结果...');

  return (
    <div className='tool-container'>
      <div className='tool-card'>
        <h2 className='tool-title'>工具控制面板2</h2>
        <p className='tool-subtitle'>一个简单的测试 / 下载 / 查看工具界面</p>

        <div className='tool-form'>
          {/* 输入框 */}
          <div className='form-group'>
            <label htmlFor='url'>输入地址：</label>
            <input
              id='url'
              type='text'
              placeholder='请输入测试地址...'
              value={url}
              onChange={e => {setUrl(e.target.value); urlRef.current = e.target.value;  }}
            />
          </div>

          {/* 下拉框 */}
          <div className='form-group'>
            <label htmlFor='mode'>选择模式：</label>
            <select
              id='mode'
              value={mode}
              onChange={e => { modeRef.current = e.target.value; setMode(e.target.value); }}
            >
              <option value='fast'>快速模式</option>
              <option value='safe'>安全模式</option>
              <option value='custom'>自定义模式</option>
            </select>
          </div>

          {/* 附加参数 */}
          <div className='form-group'>
            <label htmlFor='param'>附加参数：</label>
            <input id='param' type='text' placeholder='例如：--verbose' />
          </div>
        </div>

        {/* 按钮区域 */}
        <div className='tool-buttons'>
          <button className='btn btn-secondary' onClick={handleTest}>
            测试
          </button>
          <button className='btn btn-outline' onClick={handleDownload}>
            下载
          </button>
          <button className='btn btn-primary' onClick={handleView}>
            查看
          </button>
        </div>
      </div>
    </div>
  );
}
