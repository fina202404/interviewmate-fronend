// frontend/src/components/AdminLayout.js
import React, { useState, useContext } from 'react';
import { Layout, Menu, Avatar, Space, Dropdown, Typography, Button, theme as antTheme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  ShopOutlined,      // Placeholder for Company
  SolutionOutlined,  // Placeholder for Subscriptions
  UserOutlined as UserProfileIcon,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined, // <<--- IMPORT THIS ICON for Interview Room link
} from '@ant-design/icons';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from '../ThemeToggleButton'; // Path assuming it's in src/

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = ({ currentTheme, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { token } = antTheme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const siderMenuItems = [
    {
      key: '/app/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/app/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '/app/admin/users',
      icon: <TeamOutlined />,
      label: <Link to="/app/admin/users">User Management</Link>,
    },
    {
      type: 'divider', // Visual separator
    },
    { // <<--- NEW LINK ADDED HERE ---
      key: '/app', // Path to the main application / Interview Room
      icon: <PlayCircleOutlined />,
      label: <Link to="/app">Interview Room</Link>, // Link back to the main app
    }, // <<--- END OF NEW LINK ---
    {
      type: 'divider', // Visual separator
    },
    {
      key: 'company',
      icon: <ShopOutlined />,
      label: 'Company',
      disabled: true,
    },
    {
      key: 'subscriptions',
      icon: <SolutionOutlined />,
      label: 'Subscriptions',
      disabled: true,
    },
    {
      key: 'manager',
      icon: <SettingOutlined />,
      label: 'Manager',
      disabled: true,
    },
  ];

  const userDropdownMenu = {
    items: [
      {
        key: 'profile',
        label: <Link to="/app/profile">My Profile</Link>,
        icon: <UserProfileIcon />,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ]
  };

  let selectedSidebarKey = location.pathname;
  if (location.pathname === '/app/admin/users') {
     selectedSidebarKey = '/app/admin/dashboard';
  } else if (location.pathname === '/app') { // Handle selection for the new link
    selectedSidebarKey = '/app';
  }


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={currentTheme}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          borderRight: currentTheme === 'dark' ? `1px solid ${token.colorBorderSecondary}`: `1px solid ${token.colorSplit}`,
        }}
        width={220}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          paddingLeft: collapsed ? 0 : '24px',
          cursor: 'pointer',
        }}
        onClick={() => navigate(user ? "/app" : "/intro")}
        >
          <Title level={4} style={{
            color: token.colorPrimary,
            margin: 0,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {collapsed ? 'IM' : 'InterviewMate'}
          </Title>
        </div>
        <Menu
          theme={currentTheme}
          mode="inline"
          selectedKeys={[selectedSidebarKey]}
          items={siderMenuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: 0,
            background: token.colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: token.colorText,
            }}
          />
          <Space size="middle" style={{ paddingRight: '24px'}}>
            <Button type="text" disabled style={{ color: token.colorTextSecondary }}>INR</Button>
            <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} />
            <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            <Dropdown menu={userDropdownMenu} trigger={['click']}>
              <Avatar style={{ cursor: 'pointer', backgroundColor: token.colorPrimary }} icon={!user?.username && <UserProfileIcon />}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;