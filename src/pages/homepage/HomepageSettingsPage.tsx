import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DragOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import type { HomepageItem } from '../../types';
import { PageHeader } from '../../components';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const { Option } = Select;

// Mock data
const mockBrands = [
  { id: '1', nameEn: 'Rolex', nameId: 'Rolex' },
  { id: '2', nameEn: 'Omega', nameId: 'Omega' },
];

export const HomepageSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HomepageItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<HomepageItem | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [language, setLanguage] = useState<'en' | 'id'>('en');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // TODO: API call
      const mockData: HomepageItem[] = [
        {
          id: '1',
          titleEn: 'Summer Collection',
          titleId: 'Koleksi Musim Panas',
          subtitleEn: 'Discover luxury timepieces',
          subtitleId: 'Temukan jam tangan mewah',
          linkType: 'Brand',
          linkedBrandId: '1',
          imageUrl: 'https://via.placeholder.com/800',
          status: 'Enabled',
          sortOrder: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      setItems(mockData);
    } catch (error) {
      message.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setImageFile(null);
    setModalVisible(true);
  };

  const handleEdit = (item: HomepageItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete', id);
    Modal.confirm({
      title: 'Delete Item',
      content: 'Are you sure you want to delete this item?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: API call
          message.success('Item deleted successfully');
          loadItems();
        } catch (error) {
          message.error('Failed to delete item');
        }
      },
    });
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

      if (imageFile?.originFileObj) {
        formData.append('image', imageFile.originFileObj);
      }

      // TODO: API call
      message.success(
        editingItem ? 'Item updated successfully' : 'Item created successfully'
      );
      setModalVisible(false);
      loadItems();
    } catch (error) {
      message.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          sortOrder: index + 1,
        })
      );
      setItems(newItems);
      // TODO: API call to save new order
    }
  };

  const validateImageFile = (file: File): boolean => {
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
  };

  const columns: ColumnsType<HomepageItem> = [
    {
      title: '',
      key: 'drag',
      width: 50,
      render: () => <DragOutlined style={{ cursor: 'move' }} />,
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 100,
      render: (url) => (
        <img
          src={url}
          alt=""
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: language === 'en' ? 'titleEn' : 'titleId',
      key: 'title',
    },
    {
      title: 'Subtitle',
      dataIndex: language === 'en' ? 'subtitleEn' : 'subtitleId',
      key: 'subtitle',
    },
    {
      title: 'Link Type',
      dataIndex: 'linkType',
      key: 'linkType',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Enabled' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Homepage Settings"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Homepage Settings' },
        ]}
      />

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: 100 }}
            >
              <Option value="en">EN</Option>
              <Option value="id">ID</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Hero/Collection Item
            </Button>
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                columns={columns}
                dataSource={items}
                loading={loading}
                rowKey="id"
                pagination={false}
              />
            </SortableContext>
          </DndContext>
        </Space>
      </Card>

      <Modal
        title={editingItem ? 'Edit Item' : 'Add Item'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

          <Form.Item
            name="subtitleEn"
            label="Subtitle (EN)"
            rules={[{ max: 120, message: 'Max 120 characters' }]}
          >
            <Input placeholder="Enter subtitle in English" />
          </Form.Item>

          <Form.Item
            name="subtitleId"
            label="Subtitle (ID)"
            rules={[{ max: 120, message: 'Max 120 characters' }]}
          >
            <Input placeholder="Enter subtitle in Indonesian" />
          </Form.Item>

          <Form.Item
            name="linkType"
            label="Link Type"
            rules={[{ required: true, message: 'Link type is required' }]}
          >
            <Select placeholder="Select link type">
              <Option value="Brand">Brand</Option>
              <Option value="Category">Category</Option>
              <Option value="Custom URL">Custom URL</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.linkType !== currentValues.linkType
            }
          >
            {({ getFieldValue }) => {
              const linkType = getFieldValue('linkType');
              if (linkType === 'Brand') {
                return (
                  <Form.Item
                    name="linkedBrandId"
                    label="Linked Brand"
                    rules={[{ required: true, message: 'Brand is required' }]}
                  >
                    <Select placeholder="Select brand">
                      {mockBrands.map((brand) => (
                        <Option key={brand.id} value={brand.id}>
                          {language === 'en' ? brand.nameEn : brand.nameId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              if (linkType === 'Custom URL') {
                return (
                  <Form.Item
                    name="customUrl"
                    label="Custom URL"
                    rules={[
                      { required: true, message: 'URL is required' },
                      { type: 'url', message: 'Must be a valid URL' },
                      { max: 255, message: 'Max 255 characters' },
                    ]}
                  >
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="Image"
            required
            rules={[{ required: true, message: 'Image is required' }]}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={imageFile ? [imageFile] : []}
              beforeUpload={(file) => {
                if (validateImageFile(file)) {
                  setImageFile({
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    url: URL.createObjectURL(file),
                    originFileObj: file,
                  });
                }
                return false;
              }}
              onRemove={() => setImageFile(null)}
            >
              {!imageFile && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              JPG, PNG, or WEBP. Max 5MB. Min 800x800px.
            </div>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
            initialValue="Enabled"
          >
            <Select>
              <Option value="Enabled">Enabled</Option>
              <Option value="Disabled">Disabled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
