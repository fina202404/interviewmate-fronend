import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Spin, Alert, Row, Col, theme as antTheme } from 'antd'; // Removed Typography
import { EditOutlined, DeleteOutlined, UserAddOutlined, UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const { token: authToken, API_URL, user: adminUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const { token: antDesignToken } = antTheme.useToken();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const { data } = await axios.get(`${API_URL}/admin/users`, config);
      setUsers(data.map(u => ({ ...u, key: u._id })));
    } catch (err) {
      console.error("Failed to fetch users", err.response || err.message || err);
      const errMessage = err.response?.data?.message || 'Failed to load users. Please try again.';
      setError(errMessage);
      message.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken && API_URL) {
        fetchUsers();
    } else {
        setLoading(false);
        if (!authToken) setError('Authentication token is missing. Please log in.');
        else if (!API_URL) setError('API URL configuration is missing.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, API_URL]);

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setIsModalVisible(true);
  };

  const showEditModal = (userRecord) => {
    setEditingUser(userRecord);
    form.setFieldsValue({
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId) => {
    if (adminUser && userId === adminUser._id) {
      message.error("You cannot delete your own admin account.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      await axios.delete(`${API_URL}/admin/users/${userId}`, config);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err.response || err.message || err);
      message.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      
      if (editingUser) {
        const payload = {
            username: values.username || editingUser.username,
            email: values.email || editingUser.email,
            role: values.role,
        };
        if (adminUser && editingUser._id === adminUser._id && payload.role !== 'admin') {
            const adminUsers = users.filter(u => u.role === 'admin');
            if (adminUsers.length <= 1 && adminUsers[0]._id === adminUser._id) {
                message.error('Cannot remove the last admin role from yourself.');
                return;
            }
        }
        await axios.put(`${API_URL}/admin/users/${editingUser._id}`, payload, config);
        message.success('User updated successfully');
      } else {
         if (!values.password) { 
          message.error('Password is required for new users.');
          form.getFieldInstance('password')?.focus();
          return;
        }
        await axios.post(`${API_URL}/admin/users`, {
            username: values.username,
            email: values.email,
            password: values.password, 
            role: values.role
        }, config);
        message.success('User added successfully.');
      }
      fetchUsers();
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (errInfo) {
      console.error('Modal operation failed:', errInfo.response?.data || errInfo.message || errInfo);
      message.error(errInfo.response?.data?.message || 'Operation failed. Please check input or try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const columns = [
    {
      title: 'ID',
      key: 'tableId',
      width: 80,
      render: (text, record, index) => index + 1,
      sorter: (a, b) => users.indexOf(a) - users.indexOf(b),
      defaultSortOrder: 'ascend',
    },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'default';
        if (role === 'admin') color = 'volcano';
        else if (role === 'Enterprise') color = 'blue'; // Changed "Buyer" to "Enterprise" and color
        else if (role === 'user') color = 'green';
        return <Tag color={color}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A'}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'Enterprise', value: 'Enterprise' }, // Changed "Buyer" to "Enterprise"
      ],
      onFilter: (value, record) => record.role && record.role.toLowerCase() === value.toLowerCase(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit Role
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={adminUser && record._id === adminUser._id}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} disabled={adminUser && record._id === adminUser._id}>
              Delete User
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && users.length === 0 && !error) {
    return <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 200px)' }}><Spin size="large" tip="Loading users..." /></Row>;
  }
  if (error && users.length === 0) {
    return <Alert message={error} type="error" showIcon style={{ margin: 24, textAlign: 'center' }} description="Could not fetch user data. Please try again later or contact support."/>;
  }

  return (
    <div style={{ background: antDesignToken.colorBgContainer, padding: '1px 0 0 0'}}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px', padding: '0 24px', marginTop: '24px' }}>
        <Col xs={24} md={10} style={{ marginBottom: '16px' }}>
          <Input
            id="userSearchInputAdmin"
            placeholder="Search users by username or email..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={14} style={{ textAlign: 'right' }}>
          <Space wrap>
            <Button icon={<UserAddOutlined />} type="primary" onClick={showAddModal} style={{minWidth: 120}}>
              Add User
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => message.info('Bulk Import feature coming soon!')} style={{minWidth: 120}}>
              Bulk Import
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => message.info('Bulk Export feature coming soon!')} style={{minWidth: 120}}>
              Bulk Export
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 'max-content' }} 
        pagination={{ pageSize: 7, showSizeChanger: true, pageSizeOptions: ['7', '10', '20', '50'], position: ['bottomRight'] }}
        style={{ margin: '0 24px'}}
      />
      <Modal
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Add New User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        destroyOnHidden // Changed from destroyOnClose
      >
        <Form form={form} layout="vertical" name="userForm" initialValues={{ role: 'user' }}>
          <Form.Item 
            name="username" 
            label="Username" 
            rules={[{ required: true, message: 'Please input the username!' }, {min: 3, message: 'Username must be at least 3 characters'}]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Not a valid email!' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && ( 
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input a password!' }, {min: 6, message: 'Password must be at least 6 characters'}]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
          )}
          <Form.Item 
            name="role" 
            label="Role" 
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="Enterprise">Enterprise</Option> {/* Changed "Buyer" to "Enterprise" */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;