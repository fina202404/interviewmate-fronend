// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Added useLocation
import AuthContext from '../context/AuthContext';

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get location to redirect to original destination if available
  const authContext = useContext(AuthContext);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    if (!authContext || !authContext.login) {
        setError('Authentication service is not available. Please try again later.');
        setLoading(false);
        return;
    }
    const result = await authContext.login(values.email, values.password);
    setLoading(false);
    if (result.success) {
      // Redirect to the page the user was trying to access, or to /app by default
      const from = location.state?.from?.pathname || '/app';
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)' /* Adjust based on header/footer height if needed, or set to 100vh if no layout */, paddingTop: '20px', paddingBottom: '20px' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Login</Title>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} onClose={() => setError('')} />}
          <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'The input is not valid E-mail!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ marginBottom: '10px' }}>
                Log In
              </Button>
              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </Form.Item>
            <Form.Item style={{ textAlign: 'center', marginTop: '16px' }}>
              Don't have an account? <Link to="/signup">Sign up now!</Link>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
