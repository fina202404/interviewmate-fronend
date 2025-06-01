// frontend/src/pages/AdminDashboardPage.js
import React from 'react';
import { Card, Typography, Row, Col, Statistic, Button } from 'antd';
import { UserOutlined, SolutionOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const AdminDashboardPage = () => {
  const totalUsers = 150;
  const activeInterviews = 25;
  const systemHealth = "Good"; // Keep if used, or remove if systemHealth statistic is removed

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Admin Overview</Title>
      <Paragraph>Welcome to the admin control panel. Here's a quick overview of your application.</Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable variant="outlined"> {/* Changed from implicit bordered */}
            <Statistic title="Total Users" value={totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable variant="outlined">
            <Statistic title="Active Interviews (Mock)" value={activeInterviews} prefix={<SolutionOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable variant="outlined">
            <Statistic title="System Health (Mock)" value={systemHealth} prefix={<SettingOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="User Management Shortcut" variant="outlined">
            <Paragraph>View, edit, or manage user accounts and roles.</Paragraph>
            <Link to="/app/admin/users">
              <Button type="primary">Manage Users</Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Application Settings (Placeholder)" variant="outlined">
            <Paragraph>Configure application-wide settings.</Paragraph>
            <Button disabled>Configure Settings</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;