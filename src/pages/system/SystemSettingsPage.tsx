import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { SystemSettings } from '../../types';
import { PageHeader } from '../../components';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const SystemSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
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
            <div>
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

            <Divider />

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
    </>
  );
};
