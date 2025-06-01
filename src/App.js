// frontend/src/App.js
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ConfigProvider, Layout, Typography, Space, Button, theme as antTheme, App as AntApp, Spin, message as antdMessage, Menu, Tooltip } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import {
  CopyrightOutlined, LoginOutlined, LogoutOutlined, UserAddOutlined, HomeOutlined,
  UserOutlined as ProfileIcon, SettingOutlined as AdminIconRouter, PlayCircleOutlined
  // QuestionCircleOutlined is correctly removed as overflowedIndicator is null
} from '@ant-design/icons';

// Your existing components
import InterviewPage from './InterviewPage';
import ThemeToggleButton from './ThemeToggleButton'; // Assuming path is src/ThemeToggleButton.js
import InterviewIntro from './components/InterviewIntro';
import AdminLayout from './components/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';
// AdminDashboardPage import is removed if UserManagementPage is the dashboard content via AdminLayout
// import AdminDashboardPage from './pages/AdminDashboardPage';


// Context and Protected Routes
import AuthContext, { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// AppHeader (for MainApplicationLayout - non-admin views)
const AppHeader = ({ currentTheme, toggleTheme }) => {
  const { isAuthenticated, user, logout, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: antdToken } = antTheme.useToken(); // Using antdToken for clarity

  useEffect(() => {
    // This log is crucial and you've confirmed it shows user.role === 'admin'
    console.log(
      "%%%% DEBUG: AppHeader EFFECT TRIGGERED %%%%",
      "isLoading:", isLoading,
      "isAuthenticated:", isAuthenticated
    );
    if (user) {
      console.log("%%%% DEBUG: AppHeader - User Object IS PRESENT %%%%", user);
      console.log("%%%% DEBUG: AppHeader - User Role IS:", user.role);
    } else {
      console.log("%%%% DEBUG: AppHeader - User Object IS NULL %%%%");
    }
  }, [user, isLoading, isAuthenticated]);

  const handleLogout = () => {
    logout();
    antdMessage.success('Logged out successfully.');
    navigate('/login');
  };

  // Navigation menu items (now EXCLUDES Admin Panel and Logout)
  const navigationMenuItems = [];
  if (isAuthenticated) {
    navigationMenuItems.push({ key: '/app', icon: <PlayCircleOutlined />, label: <Link to="/app">Interview Room</Link> });
    navigationMenuItems.push({ key: '/app/profile', icon: <ProfileIcon />, label: <Link to="/app/profile">Profile</Link> });
    // The "Admin Panel" link will be rendered as a separate button below
  } else {
    // Login/Signup links for unauthenticated users if not on those pages already
    if (!['/login', '/signup', '/intro', '/'].includes(location.pathname)) {
        navigationMenuItems.push({ key: '/login', icon: <LoginOutlined />, label: <Link to="/login">Login</Link> });
        navigationMenuItems.push({ key: '/signup', icon: <UserAddOutlined />, label: <Link to="/signup">Sign Up</Link> });
    }
  }

  let selectedKey = location.pathname;
  // Adjust selectedKey logic based on what's in navigationMenuItems
  if (location.pathname.startsWith('/app/profile')) selectedKey = '/app/profile';
  else if (location.pathname.startsWith('/app')) selectedKey = '/app';
  // No need to specifically select '/app/admin/dashboard' here if it's a separate button

  // Standalone Admin Panel Button
  let adminPanelButtonComponent = null;
  if (isAuthenticated && user && user.role === 'admin') {
    console.log("%%%% DEBUG: AppHeader - Preparing STANDALONE Admin Panel button (user.role IS admin) %%%%");
    adminPanelButtonComponent = (
      <Link to="/app/admin/dashboard">
        <Button
          icon={<AdminIconRouter />}
          type="text" // Or "default" for more prominence
          style={{ color: antdToken.colorText, marginLeft: '8px' }} // Added marginLeft for spacing
        >
          Admin Panel
        </Button>
      </Link>
    );
  }

  // Standalone Logout Button
  let logoutButtonComponent = null;
  if (isAuthenticated) {
    logoutButtonComponent = (
      <Tooltip title="Logout">
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          type="text"
          style={{ color: antdToken.colorText }}
          aria-label="Logout"
        />
      </Tooltip>
    );
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `1px solid ${antdToken.colorBorderSecondary}`, position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      <Link to={isAuthenticated ? "/app" : "/intro"}>
        <Title level={3} style={{ color: antdToken.colorPrimary, margin: 0, lineHeight: '64px', whiteSpace: 'nowrap' }}>
          🎯 InterviewMate
        </Title>
      </Link>
      <Space align="center">
        {isLoading && isAuthenticated && <Spin size="small" />}
        {!isLoading && navigationMenuItems.length > 0 && (
          <Menu
            theme={currentTheme === 'dark' ? 'dark' : 'light'}
            mode="horizontal"
            items={navigationMenuItems} // Now only contains "Interview Room", "Profile" or Login/Signup
            selectedKeys={[selectedKey]}
            style={{ lineHeight: '62px', borderBottom: 'none', backgroundColor: 'transparent', minWidth: 'auto' }}
            overflowedIndicator={null}
          />
        )}
        {adminPanelButtonComponent} {/* <<< Render the standalone Admin Panel button here */}
        {logoutButtonComponent}
        {/* ThemeToggleButton is primarily in AdminLayout for admin section. 
            Conditionally show it here if NOT in admin section. */}
        { !location.pathname.startsWith('/app/admin') && <ThemeToggleButton currentTheme={currentTheme} toggleTheme={toggleTheme} /> }
      </Space>
    </Header>
  );
};

// MainApplicationLayout component (as you provided, with background fixes)
const MainApplicationLayout = ({ currentTheme, toggleTheme }) => {
  const { token: resolvedAntToken } = antTheme.useToken();
  const contentBackgroundColor = currentTheme === 'dark' ? '#101010' : '#f0f2f5';
  const footerBackgroundColor = currentTheme === 'dark' ? '#000000' : '#f0f2f5';
  const footerBorderColor = currentTheme === 'dark' ? resolvedAntToken.colorBorderSecondary : '#e8e8e8';

  return (
    <Layout style={{
      minHeight: '100vh',
      backgroundColor: resolvedAntToken.colorBgLayout,
    }}>
      <AppHeader currentTheme={currentTheme} toggleTheme={toggleTheme} />
      <Content style={{
        padding: '24px',
        marginTop: '64px',
        flexGrow: 1,
        backgroundColor: contentBackgroundColor,
      }}>
        <Outlet />
      </Content>
      <Footer style={{
        textAlign: 'center',
        padding: '12px 24px',
        borderTop: `1px solid ${footerBorderColor}`,
        flexShrink: 0,
        backgroundColor: footerBackgroundColor,
      }}>
        <Text type="secondary">InterviewMate <CopyrightOutlined /> {new Date().getFullYear()}</Text>
      </Footer>
    </Layout>
  );
};

// LandingHandler component (as you provided)
const LandingHandler = ({ currentThemeForSpinner }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();
  const spinnerBgColor = currentThemeForSpinner === 'dark' ? '#000' : '#fff';

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: spinnerBgColor }}><Spin size="large" /* Removed tip to address warning */ /></div>;
  }
  if (isAuthenticated && (location.pathname === "/" || location.pathname === "/intro")) {
    return <Navigate to="/app" replace />;
  }
  if ((location.pathname === "/" || location.pathname === "/intro")) {
    return <InterviewIntro />;
  }
  return <Navigate to="/intro" replace />;
};

// NotFoundPage component (as you provided)
const NotFoundPage = ({ mainAppPath = "/intro" }) => (
  <div style={{ textAlign: 'center', marginTop: 50, padding: 20 }}>
    <Title level={2}>404 - Page Not Found</Title>
    <Paragraph>The page you are looking for does not exist or has been moved.</Paragraph>
    <Link to={mainAppPath}><Button type="primary" icon={<HomeOutlined />}>Go to Main Page</Button></Link>
  </div>
);

// Main App Component (with updated themeConfig and routing for AdminLayout)
function App() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const storedTheme = localStorage.getItem('appTheme') || 'light';
    document.body.setAttribute('data-theme', storedTheme);
    return storedTheme;
  });

  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const primaryColor = "#00A78E";
  const generalTextColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)';

  const themeConfig = useMemo(() => ({
    token: {
      colorPrimary: primaryColor,
      colorBgLayout: currentTheme === 'dark' ? '#000000' : '#f5f5f5',
      colorBgContainer: currentTheme === 'dark' ? '#141414' : '#ffffff',
      colorBgElevated: currentTheme === 'dark' ? '#1D1D1D' : '#ffffff',
      colorBorderSecondary: currentTheme === 'dark' ? '#303030' : '#f0f0f0',
      colorText: generalTextColor,
      colorTextSecondary: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      borderRadiusLG: 8,
    },
    algorithm: currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    components: {
      Layout: {
        headerBg: currentTheme === 'dark' ? '#141414' : '#ffffff',
        siderBg: currentTheme === 'dark' ? '#001529' : '#ffffff',
        bodyBg: currentTheme === 'dark' ? '#101010' : '#f0f2f5',
        footerBg: currentTheme === 'dark' ? '#000000' : '#f0f2f5',
      },
      Menu: {
          darkItemBg: 'transparent',
          darkItemSelectedBg: primaryColor,
          darkItemColor: 'rgba(255, 255, 255, 0.65)',
          darkItemHoverColor: '#ffffff',
          darkItemSelectedColor: '#ffffff',
          itemColor: generalTextColor,
          itemHoverBg: currentTheme === 'light' ? '#f0f0f0' : undefined,
          itemSelectedBg: currentTheme === 'light' ? '#e6f7ff' : primaryColor,
          itemSelectedColor: primaryColor,
          itemActiveBg: currentTheme === 'light' ? '#f0f5ff' : undefined,
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
      },
      Card: {
        colorBgContainer: currentTheme === 'dark' ? '#1D1D1D' : '#FFFFFF',
        actionsBg: currentTheme === 'dark' ? '#1D1D1D' : '#FAFAFA',
        borderRadiusLG: 8,
      },
      Table: {
        colorBgContainer: currentTheme === 'dark' ? '#1D1D1D' : '#FFFFFF',
        headerBg: currentTheme === 'dark' ? '#141414' : '#FAFAFA',
        borderColor: currentTheme === 'dark' ? '#303030' : '#f0f0f0',
      },
      Modal: {
        contentBg: currentTheme === 'dark' ? '#1D1D1D' : '#FFFFFF',
        headerBg: currentTheme === 'dark' ? '#1D1D1D' : '#FFFFFF',
        footerBg: currentTheme === 'dark' ? '#1D1D1D' : '#FFFFFF',
      },
      Input: { colorBgContainer: currentTheme === 'dark' ? '#141414' : '#ffffff' },
      Select: { colorBgContainer: currentTheme === 'dark' ? '#141414' : '#ffffff' },
      Button: {
        defaultBg: currentTheme === 'dark' ? '#303030' : '#ffffff',
        defaultBorderColor: currentTheme === 'dark' ? '#424242' : '#d9d9d9',
        defaultColor: generalTextColor,
        colorTextLightSolid: '#ffffff'
      }
    },
  }), [currentTheme, primaryColor, generalTextColor]);

  return (
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingHandler currentThemeForSpinner={currentTheme} />} />
              <Route path="/intro" element={<LandingHandler currentThemeForSpinner={currentTheme} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />

              <Route path="/app" element={
                <ProtectedRoute>
                  <MainApplicationLayout currentTheme={currentTheme} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }>
                <Route index element={<InterviewPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin specific routes using AdminLayout */}
              <Route path="/app/admin" element={
                <AdminRoute>
                  <AdminLayout currentTheme={currentTheme} toggleTheme={toggleTheme} />
                </AdminRoute>
              }>
                <Route path="dashboard" element={<UserManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="*" element={<NotFoundPage mainAppPath="/app/admin/dashboard" />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;