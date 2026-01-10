import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  message,
} from 'antd';
import { SaveOutlined, UserAddOutlined } from '@ant-design/icons';
import type { SystemSettings } from '../../types';
import { PageHeader } from '../../components';

import { useIsAdmin } from '../../hooks/useAuth';
import { useCreateUser } from '../../hooks';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const SystemSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockSettings: SystemSettings = {
        id: '1',
        multiLanguageEnabled: true,
        defaultLanguage: 'en',
        updatedAt: '2024-01-01',
        updatedBy: 'admin',
      };
      setSettings(mockSettings);
      form.setFieldsValue(mockSettings);
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Saving settings:', values);
      message.success('Settings saved successfully');
      loadSettings();
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // User Management - Create User
  const { createUser, loading: creating } = useCreateUser();
  const isAdmin = useIsAdmin();
  console.log('Is Admin:', isAdmin);

  const handleCreateUser = async (values: any) => {
    try {
      await createUser({
        username: values.username,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        roles: values.roles ? [values.roles] : ['subscriber'],
        description: values.description || '',
      });
      // reset user form
      userForm.resetFields();
    } catch (err) {
      // error messaging handled in hook
      console.error('Create user error', err);
    }
  };

  return (
    <>
      <PageHeader
        title="System Settings"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'System Settings' },
        ]}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            multiLanguageEnabled: true,
            defaultLanguage: 'en',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Language Settings */}
            {/* <div>
              <Title level={4}>Language Settings</Title>
              <Paragraph type="secondary">
                Configure multi-language support for the website. When enabled,
                all content will be available in both English and Indonesian.
              </Paragraph>

              <Form.Item
                name="multiLanguageEnabled"
                label="Multi-Language Support"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                  style={{ width: 100 }}
                />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.multiLanguageEnabled !==
                  currentValues.multiLanguageEnabled
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('multiLanguageEnabled') ? (
                    <Form.Item
                      name="defaultLanguage"
                      label="Default Language"
                      rules={[
                        {
                          required: true,
                          message: 'Default language is required',
                        },
                      ]}
                    >
                      <Select style={{ width: 200 }}>
                        <Option value="en">English (EN)</Option>
                        <Option value="id">Indonesian (ID)</Option>
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginTop: 8 }}
              >
                <strong>Language Fallback Rule:</strong> If Indonesian (ID)
                content is empty, the system will automatically display English
                (EN) content.
              </Paragraph>
            </div>

            <Divider /> */}

            {/* User Roles (Optional) */}
            <div>
              <Title level={4}>User Roles (Optional)</Title>
              <Paragraph type="secondary">
                User role management is available for minimal implementation.
                Contact your administrator for advanced role and permission
                configuration.
              </Paragraph>

              <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
                <Space direction="vertical">
                  <div>
                    <strong>Available Roles:</strong>
                  </div>
                  <ul style={{ marginBottom: 0 }}>
                    <li>Super Admin - Full system access</li>
                    <li>Admin - Manage products and content</li>
                    <li>Editor - Edit content only</li>
                    <li>Viewer - Read-only access</li>
                  </ul>
                </Space>
              </Card>
            </div>

            <Divider />

            {/* Save Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Save Settings
              </Button>
            </Form.Item>

            {settings && (
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                Last updated:{' '}
                {new Date(settings.updatedAt).toLocaleString('id-ID')} by{' '}
                {settings.updatedBy}
              </Paragraph>
            )}
          </Space>
        </Form>
      </Card>

      {/* User Management Card - Admin Only */}
      {isAdmin && (
        <Card title="User Management" style={{ marginTop: 16 }}>
          <Title level={5}>Create New User</Title>
          <Paragraph type="secondary">
            Create a new user account. Required fields are username, email, and
            password. You can assign administrator role to give full access.
          </Paragraph>

          <Form layout="vertical" onFinish={handleCreateUser} form={userForm}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input username' },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message:
                    'Username can only contain letters, numbers and underscore',
                },
              ]}
              extra="Username must be unique and cannot be changed later"
            >
              <Input placeholder="e.g., johndoe" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
              extra="Email must be unique"
            >
              <Input placeholder="e.g., john@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password' },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters',
                },
              ]}
              extra="Minimum 8 characters"
            >
              <Input.Password placeholder="Strong password" />
            </Form.Item>

            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: false }]}
            >
              <Input placeholder="e.g., John" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: false }]}
            >
              <Input placeholder="e.g., Doe" />
            </Form.Item>

            <Form.Item name="roles" label="Role" initialValue="subscriber">
              <Select style={{ width: '100%' }}>
                <Option value="subscriber">Subscriber</Option>
                <Option value="contributor">Contributor</Option>
                <Option value="author">Author</Option>
                <Option value="editor">Editor</Option>
                <Option value="administrator">Administrator</Option>
                <Option value="shop_manager">Shop Manager</Option>
              </Select>
            </Form.Item>

            <Form.Item name="description" label="Bio / Description">
              <Input.TextArea rows={3} placeholder="Optional user biography" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UserAddOutlined />}
                loading={creating}
                size="large"
              >
                Create User
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </>
  );
};
