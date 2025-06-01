// frontend/src/pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col, message as antdMessage } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const { Title } = Typography;

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const authContext = useContext(AuthContext); // Use the context

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    // Ensure authContext and signup function are available
    if (!authContext || !authContext.signup) {
        setError('Authentication service is not available. Please try again later.');
        setLoading(false);
        return;
    }

    // Password confirmation is now handled by Form.Item rules directly
    const result = await authContext.signup(values.username, values.email, values.password);
    setLoading(false);
    if (result.success) {
      antdMessage.success(result.message || 'Signup successful! Please login.');
      navigate('/login');
    } else {
      setError(result.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
     <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)' /* Adjust based on header/footer height */, paddingTop: '20px', paddingBottom: '20px' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={7}>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Sign Up</Title>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} onClose={() => setError('')} />}
          <Form name="signup" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }, { min: 3, message: 'Username must be at least 3 characters!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'The input is not valid E-mail!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" size="large"/>
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }, { min: 6, message: 'Password must be at least 6 characters!' }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large"/>
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your Password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large"/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sign Up
              </Button>
            </Form.Item>
             <Form.Item style={{ textAlign: 'center', marginTop: '16px' }}>
              Already have an account? <Link to="/login">Log in!</Link>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default SignupPage;