import { Button, Col, Form, Input, Row, Typography, Spin, message } from 'antd';
import { Card } from '../../components';
import { SaveOutlined } from '@ant-design/icons';
import { useProfile } from '../../hooks';
import { useEffect } from 'react';

type FieldType = {
  id?: number;
  name?: string;
  slug?: string;
  url?: string;
  description?: string;
};

export const UserProfileDetailsPage = () => {
  const [form] = Form.useForm();
  const { profile, loading, updateProfile } = useProfile();

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        id: profile.id,
        name: profile.name,
        slug: profile.slug,
        url: profile.url || '',
        description: profile.description || '',
      });
    }
  }, [profile, form]);

  const onFinish = async (values: any) => {
    try {
      await updateProfile(values);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form and try again');
  };

  if (loading && !profile) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading profile...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Form
        form={form}
        name="user-profile-details-form"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col sm={24} lg={24}>
            <Form.Item<FieldType>
              label="User ID"
              name="id"
              tooltip="Unique identifier for your account"
            >
              <Input
                readOnly
                disabled
                suffix={
                  <Typography.Paragraph
                    copyable={{ text: String(profile?.id || '') }}
                    style={{ margin: 0 }}
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Display Name"
              name="name"
              rules={[
                { required: true, message: 'Please input your display name!' },
              ]}
            >
              <Input placeholder="Enter your display name" />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Username (Slug)"
              name="slug"
              tooltip="URL-friendly username"
            >
              <Input placeholder="username" disabled />
            </Form.Item>
          </Col>
          <Col sm={24} lg={24}>
            <Form.Item<FieldType>
              label="Website URL"
              name="url"
              rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
            >
              <Input placeholder="https://yourwebsite.com" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<FieldType> label="Bio / Description" name="description">
              <Input.TextArea
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
