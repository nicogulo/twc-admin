import React, { useEffect } from 'react';
import { Form, Input, Modal, Upload, message, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface BrandFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  isEditMode?: boolean;
  loading?: boolean;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  isEditMode = false,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        slug: initialValues.slug,
        description: initialValues.description,
        menu_order: initialValues.menu_order || 0,
      });

      // Set image if exists
      if (initialValues.image?.src) {
        setFileList([
          {
            uid: '-1',
            name: 'brand-image',
            status: 'done',
            url: initialValues.image.src,
          },
        ]);
      }
    } else if (visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Add image data if uploaded
      if (fileList.length > 0 && fileList[0].originFileObj) {
        // For new uploads, we'll handle image upload separately in the parent
        values.imageFile = fileList[0].originFileObj;
      } else if (fileList.length > 0 && fileList[0].url) {
        // Existing image
        values.image = {
          src: fileList[0].url,
          alt: values.name,
        };
      }

      await onSubmit(values);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    // Only keep the last uploaded file
    setFileList(newFileList.slice(-1));
  };

  const uploadProps = {
    fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return Upload.LIST_IGNORE;
      }

      return false; // Prevent auto upload
    },
    onChange: handleUploadChange,
    onRemove: () => {
      setFileList([]);
    },
    listType: 'picture' as const,
    accept: 'image/*',
    maxCount: 1,
  };

  return (
    <Modal
      title={isEditMode ? 'Edit Brand' : 'Add New Brand'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Brand Name"
          name="name"
          rules={[{ required: true, message: 'Please enter brand name' }]}
        >
          <Input placeholder="e.g., Rolex" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          tooltip="URL-friendly identifier (auto-generated from name if empty)"
        >
          <Input placeholder="e.g., rolex" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Enter brand description..." />
        </Form.Item>

        <Form.Item
          label="Menu Order"
          name="menu_order"
          tooltip="Order for sorting (lower numbers appear first)"
          initialValue={0}
        >
          <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
        </Form.Item>

        <Form.Item label="Brand Image" tooltip="Upload brand logo or image">
          <Upload {...uploadProps}>
            <button
              type="button"
              style={{ border: 'none', background: 'none' }}
            >
              <UploadOutlined /> Upload Image
            </button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};
