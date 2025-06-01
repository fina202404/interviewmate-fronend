// frontend/src/components/AdminRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Correct path from components/ to context/
import { Spin, Result, Button, Row, Col } from 'antd'; // Only AntD components used by AdminRoute itself
import { Link } from 'react-router-dom';

const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)' }}>
        <Spin size="large" tip="Verifying access..." />
      </Row>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure user object and role property exist before checking the role
  if (!user || user.role !== 'admin') {
    return (
      <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)', padding: '20px' }}>
        <Col>
          <Result
            status="403"
            title="403 - Access Denied"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Link to="/"><Button type="primary">Back Home</Button></Link>}
          />
        </Col>
      </Row>
    );
  }

  return <Outlet />; // Renders the child route's element if authenticated and admin
};

export default AdminRoute;