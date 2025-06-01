import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Spin, Row } from 'antd'; // Added Row for consistent centering

const ProtectedRoute = ({ children }) => { // children prop can be used for an alternative pattern, but Outlet is standard for v6 layouts
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  console.log(
    `DEBUG: ProtectedRoute - Path: ${location.pathname}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`
  );

  if (isLoading) {
    console.log("DEBUG: ProtectedRoute - Showing loading spinner...");
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Spin size="large" tip="Loading user data..." />
      </Row>
    );
  }

  if (!isAuthenticated) {
    console.log(`DEBUG: ProtectedRoute - Not authenticated. Redirecting to /login. Intended path: ${location.pathname}`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log(`DEBUG: ProtectedRoute - Authenticated. Rendering Outlet for path: ${location.pathname}`);
  return children ? children : <Outlet />; // Prefer Outlet for route elements
};

export default ProtectedRoute;
