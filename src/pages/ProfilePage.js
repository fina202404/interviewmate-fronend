import React, { useContext, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Row, Col, Spin, Alert, message as antdMessage, Descriptions, Statistic, Divider, Tag, Space } from 'antd'; // Added Tag and Space here
import { UserOutlined, MailOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
// If you have a ProgressTracker component that can show overall stats, you might import it here
// import ProgressTracker from '../components/ProgressTracker'; // Example

const { Title, Text, Paragraph } = Typography;

const ProfilePage = () => {
  const { user, isLoading: authLoading, loadUser, token, API_URL } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch profile data when component mounts or user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && token) { // Ensure user and token are available from context
        setPageLoading(true);
        setError('');
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get(`${API_URL}/users/profile`, config);
          setProfileData(data);
          form.setFieldsValue({ username: data.username, email: data.email });
        } catch (err) {
          console.error("Failed to fetch profile", err);
          setError(err.response?.data?.message || 'Could not load profile data.');
        } finally {
          setPageLoading(false);
        }
      } else if (!authLoading) { // If auth context is done loading and no user
        setPageLoading(false);
        // Error will be set if navigation to this page happens without auth by ProtectedRoute
      }
    };

    if (!authLoading) { // Only fetch if auth context is not loading
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, token, API_URL]); // form removed from deps as it's stable


  const onFinishUpdate = async (values) => {
    setLoadingUpdate(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`${API_URL}/users/profile`, values, config);
      antdMessage.success('Profile updated successfully!');
      setProfileData(data); // Update local profile data
      if (loadUser) { // Ensure loadUser is available from context
        loadUser(); // Reload user in AuthContext to reflect changes globally (e.g., username in header)
      }
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoadingUpdate(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditing(false);
    setError('');
    if (profileData) { // Reset form to currently loaded profile data
        form.setFieldsValue({ username: profileData.username, email: profileData.email });
    }
  };

  if (pageLoading || authLoading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Spin size="large" tip="Loading profile..." />
      </Row>
    );
  }

  if (!profileData && !authLoading) {
    return <Alert message={error || "User profile not found or not authenticated. Please try logging in again."} type="error" showIcon />;
  }
  
  const interviewsCompleted = localStorage.getItem('interviewsCompleted') || 0;

  return (
    <Row justify="center" style={{paddingTop: '20px'}}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>My Profile</Title>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} onClose={() => setError('')} />}

          {!editing ? (
            <>
              <Descriptions bordered column={1} size="middle" layout="horizontal">
                <Descriptions.Item labelStyle={{width: '150px'}} label="Username">
                  <Text strong>{profileData?.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text>{profileData?.email}</Text>
                </Descriptions.Item>
                 <Descriptions.Item label="Role">
                  <Tag color={profileData?.role === 'admin' ? 'volcano' : 'geekblue'} style={{textTransform: 'capitalize'}}>{profileData?.role}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Joined">
                  {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Interviews Completed (Local)">
                  <Text strong>{interviewsCompleted}</Text>
                  <Text type="secondary" style={{marginLeft: 8}}>(This is tracked locally on your browser)</Text>
                </Descriptions.Item>
              </Descriptions>
              <Button 
                type="dashed" 
                icon={<EditOutlined />} 
                onClick={() => {
                    setEditing(true);
                    if (profileData) form.setFieldsValue({ username: profileData.username, email: profileData.email });
                }} 
                style={{ marginTop: '20px' }} 
                block
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <Form form={form} layout="vertical" onFinish={onFinishUpdate} initialValues={{ username: profileData?.username, email: profileData?.email }}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }, {min: 3, message: 'Username must be at least 3 characters.'}]}
              >
                <Input prefix={<UserOutlined />} size="large" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Not a valid email!' }]}
              >
                <Input prefix={<MailOutlined />} size="large" />
              </Form.Item>
              <Paragraph type="secondary" style={{fontSize: '0.9em', marginBottom: '16px'}}>
                To change your password, please use the "Forgot Password" feature on the login page if needed.
              </Paragraph>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loadingUpdate} icon={<SaveOutlined />}>
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} icon={<CloseCircleOutlined />}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}

          <Divider>Interview Progress</Divider>
          <Row gutter={16} justify="center">
            <Col>
                <Statistic title="Interviews Completed (Local)" value={interviewsCompleted} prefix={<LineChartOutlined />} />
            </Col>
          </Row>
          <Paragraph type="secondary" style={{textAlign: 'center', marginTop: '10px', fontSize: '0.9em'}}>
            Your interview completion count is currently tracked locally in this browser.
          </Paragraph>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;
