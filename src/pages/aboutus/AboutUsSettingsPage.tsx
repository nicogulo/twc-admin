import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Upload, Button, Space, message, Radio } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { AboutUsPage } from '../../types';
import { PageHeader } from '../../components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { TextArea } = Input;

export const AboutUsSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>(
    'image'
  );
  const [heroFile, setHeroFile] = useState<UploadFile | null>(null);
  const [contentEn, setContentEn] = useState('');
  const [contentId, setContentId] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockData: AboutUsPage = {
        id: '1',
        titleEn: 'About TWC',
        titleId: 'Tentang TWC',
        contentEn: '<p>Welcome to The Watch Collector...</p>',
        contentId: '<p>Selamat datang di The Watch Collector...</p>',
        seoTitle: 'About Us - TWC',
        seoDescription: 'Learn more about The Watch Collector',
        updatedAt: '2024-01-01',
        updatedBy: 'admin',
      };
      form.setFieldsValue(mockData);
      setContentEn(mockData.contentEn || '');
      setContentId(mockData.contentId || '');
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File, type: 'image' | 'video'): boolean => {
    if (type === 'image') {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(
        file.type
      );
      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidType) {
        message.error('Only JPG, PNG, and WEBP files are allowed');
      }
      if (!isValidSize) {
        message.error('Image must be smaller than 5MB');
      }
      return isValidType && isValidSize;
    } else {
      const isValidType = file.type === 'video/mp4';
      const isValidSize = file.size / 1024 / 1024 < 100;
      if (!isValidType) {
        message.error('Only MP4 files are allowed');
      }
      if (!isValidSize) {
        message.error('Video must be smaller than 100MB');
      }
      return isValidType && isValidSize;
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      formData.append('contentEn', contentEn);
      formData.append('contentId', contentId);
      formData.append('heroMediaType', heroMediaType);

      if (heroFile?.originFileObj) {
        formData.append('heroMedia', heroFile.originFileObj);
      }

      // TODO: Replace with actual API call
      console.log('Saving about us:', values);
      message.success('About Us page updated successfully');
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
        title="About Us Page"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'About Us Page' },
        ]}
      />

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Hero Media */}
            <div>
              <Form.Item label="Hero Media Type">
                <Radio.Group
                  value={heroMediaType}
                  onChange={(e) => {
                    setHeroMediaType(e.target.value);
                    setHeroFile(null);
                  }}
                >
                  <Radio value="image">Image</Radio>
                  <Radio value="video">Video</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label={`Hero ${
                  heroMediaType === 'image' ? 'Image' : 'Video'
                } (Optional)`}
              >
                <Upload
                  maxCount={1}
                  fileList={heroFile ? [heroFile] : []}
                  beforeUpload={(file) => {
                    if (validateFile(file, heroMediaType)) {
                      setHeroFile({
                        uid: file.uid,
                        name: file.name,
                        status: 'done',
                        url: URL.createObjectURL(file),
                        originFileObj: file,
                      });
                    }
                    return false;
                  }}
                  onRemove={() => setHeroFile(null)}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload {heroMediaType === 'image' ? 'Image' : 'Video'}
                  </Button>
                </Upload>
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  {heroMediaType === 'image'
                    ? 'JPG, PNG, or WEBP. Max 5MB.'
                    : 'MP4 format only. Max 100MB.'}
                </div>
              </Form.Item>
            </div>

            {/* Title */}
            <div>
              <Form.Item
                name="titleEn"
                label="Title (EN)"
                rules={[
                  { required: true, message: 'Title EN is required' },
                  { min: 1, max: 80, message: 'Must be 1-80 characters' },
                ]}
              >
                <Input placeholder="Enter title in English" />
              </Form.Item>

              <Form.Item
                name="titleId"
                label="Title (ID)"
                rules={[
                  { required: true, message: 'Title ID is required' },
                  { min: 1, max: 80, message: 'Must be 1-80 characters' },
                ]}
              >
                <Input placeholder="Enter title in Indonesian" />
              </Form.Item>
            </div>

            {/* Content */}
            <div>
              <Form.Item
                label="Content (EN)"
                rules={[{ max: 5000, message: 'Max 5000 characters' }]}
              >
                <ReactQuill
                  value={contentEn}
                  onChange={setContentEn}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Form.Item>

              <Form.Item
                label="Content (ID)"
                rules={[{ max: 5000, message: 'Max 5000 characters' }]}
              >
                <ReactQuill
                  value={contentId}
                  onChange={setContentId}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Form.Item>
            </div>

            {/* SEO */}
            <div>
              <Form.Item
                name="seoTitle"
                label="SEO Title"
                rules={[{ max: 70, message: 'Max 70 characters' }]}
              >
                <Input placeholder="Page title for search engines" />
              </Form.Item>

              <Form.Item
                name="seoDescription"
                label="SEO Description"
                rules={[{ max: 160, message: 'Max 160 characters' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Page description for search engines"
                  showCount
                  maxLength={160}
                />
              </Form.Item>
            </div>

            {/* Save Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Save About Us Page
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </>
  );
};
