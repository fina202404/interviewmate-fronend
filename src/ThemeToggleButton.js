// frontend/src/components/ThemeToggleButton.js (or frontend/src/ThemeToggleButton.js)
import React from 'react';
import { Switch } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const ThemeToggleButton = ({ currentTheme, toggleTheme }) => {
  return (
    <Switch
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
      checked={currentTheme === 'dark'}
      onChange={toggleTheme}
    />
  );
};

export default ThemeToggleButton;