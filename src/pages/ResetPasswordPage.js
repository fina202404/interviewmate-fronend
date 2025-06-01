import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col, message as antdMessage } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const { Title } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { resettoken } = useParams(); // Get token from URL
  const { resetPassword } = useContext(AuthContext);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }
    const result = await resetPassword(resettoken, values.password);
    setLoading(false);
    if (result.success) {
      antdMessage.success(result.message || 'Password has been reset successfully. Please login.');
      navigate('/login');
    } else {
      setError(result.message || 'Failed to reset password. The link may be invalid or expired.');
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)', paddingTop: '20px', paddingBottom: '20px' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Reset Password</Title>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} onClose={() => setError('')} />}
          <Form name="reset_password" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
              label="New Password"
              name="password"
              rules={[{ required: true, message: 'Please input your new Password!' }, { min: 6, message: 'Password must be at least 6 characters!' }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password" size="large" />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your new Password!' },
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
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Reset Password
              </Button>
            </Form.Item>
             <Form.Item style={{ textAlign: 'center', marginTop: '16px' }}>
              Remembered your password? <Link to="/login">Login</Link>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPasswordPage;
