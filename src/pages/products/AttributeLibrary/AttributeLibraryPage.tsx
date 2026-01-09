import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Modal,
  Form,
  message,
  Tabs,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ProductAttribute, AttributeType } from '../../../types';
import { PageHeader } from '../../../components';

const { TabPane } = Tabs;

const attributeTypes: AttributeType[] = [
  'Bracelet Material',
  'Case Material',
  'Bezel Material',
  'Crystal',
  'Movement',
  'Dial',
  'Dial Numerals',
  'Scope of Delivery',
  'Bracelet Color',
  'Clasp Type',
  'Clasp Material',
  'Function Tags',
];

export const AttributeLibraryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState<
    Record<AttributeType, ProductAttribute[]>
  >({
    'Bracelet Material': [],
    'Case Material': [],
    'Bezel Material': [],
    Crystal: [],
    Movement: [],
    Dial: [],
    'Dial Numerals': [],
    'Scope of Delivery': [],
    'Bracelet Color': [],
    'Clasp Type': [],
    'Clasp Material': [],
    'Function Tags': [],
  });
  const [currentType, setCurrentType] =
    useState<AttributeType>('Bracelet Material');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] =
    useState<ProductAttribute | null>(null);
  const [form] = Form.useForm();
  // const [language, setLanguage] = useState<'en' | 'id'>('en');

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/attributes');
      // const data = await response.json();
      // setAttributes(data);

      // Mock data
      const mockData: Record<AttributeType, ProductAttribute[]> = {
        'Bracelet Material': [
          {
            id: '1',
            nameEn: 'Stainless Steel',
            nameId: 'Baja Tahan Karat',
            type: 'Bracelet Material',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            isUsedByProducts: true,
          },
          {
            id: '2',
            nameEn: 'Leather',
            nameId: 'Kulit',
            type: 'Bracelet Material',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            isUsedByProducts: false,
          },
        ],
        'Case Material': [],
        'Bezel Material': [],
        Crystal: [],
        Movement: [],
        Dial: [],
        'Dial Numerals': [],
        'Scope of Delivery': [],
        'Bracelet Color': [],
        'Clasp Type': [],
        'Clasp Material': [],
        'Function Tags': [],
      };

      setAttributes(mockData);
    } catch (error) {
      message.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAttribute(null);
    form.resetFields();
    form.setFieldsValue({ type: currentType });
    setModalVisible(true);
  };

  const handleEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute);
    form.setFieldsValue(attribute);
    setModalVisible(true);
  };

  const handleDelete = async (attribute: ProductAttribute) => {
    if (attribute.isUsedByProducts) {
      Modal.error({
        title: 'Cannot Delete Attribute',
        content:
          'This attribute is currently used by one or more products. Please remove it from all products before deleting.',
        icon: <ExclamationCircleOutlined />,
      });
      return;
    }

    try {
      // TODO: API call to delete
      // await fetch(`/api/attributes/${attribute.id}`, { method: 'DELETE' });

      message.success('Attribute deleted successfully');
      loadAttributes();
    } catch (error) {
      message.error('Failed to delete attribute');
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        type: currentType,
      };

      // TODO: API call to save
      if (editingAttribute) {
        // await fetch(`/api/attributes/${editingAttribute.id}`, {
        //   method: 'PUT',
        //   body: JSON.stringify(payload),
        // });
        console.log('Update payload:', payload);
        message.success('Attribute updated successfully');
      } else {
        // await fetch('/api/attributes', {
        //   method: 'POST',
        //   body: JSON.stringify(payload),
        // });
        console.log('Create payload:', payload);
        message.success('Attribute created successfully');
      }

      setModalVisible(false);
      loadAttributes();
    } catch (error) {
      message.error('Failed to save attribute');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProductAttribute> = [
    {
      title: 'Name (EN)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      sorter: (a, b) => a.nameEn.localeCompare(b.nameEn),
    },
    {
      title: 'Name (ID)',
      dataIndex: 'nameId',
      key: 'nameId',
      sorter: (a, b) => a.nameId.localeCompare(b.nameId),
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Tag color={record.isUsedByProducts ? 'green' : 'default'}>
          {record.isUsedByProducts ? 'In Use' : 'Not Used'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('id-ID'),
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
          <Popconfirm
            title="Delete Attribute"
            description={
              record.isUsedByProducts
                ? 'Cannot delete: This attribute is used by products'
                : 'Are you sure you want to delete this attribute?'
            }
            onConfirm={() => handleDelete(record)}
            disabled={record.isUsedByProducts}
            okText="Delete"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isUsedByProducts}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Product Attribute Library"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Product Management', path: '/products' },
          { title: 'Attribute Library' },
        ]}
      />

      <Card>
        <Tabs
          activeKey={currentType}
          onChange={(key) => setCurrentType(key as AttributeType)}
          tabPosition="left"
          style={{ minHeight: 600 }}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ marginBottom: 16 }}
            >
              Add Attribute
            </Button>
          }
        >
          {attributeTypes.map((type) => (
            <TabPane tab={type} key={type}>
              <Table
                columns={columns}
                dataSource={attributes[type]}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} attributes`,
                }}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title={editingAttribute ? 'Edit Attribute' : 'Add Attribute'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="Attribute Type">
            <Input disabled value={currentType} />
          </Form.Item>

          <Form.Item
            name="nameEn"
            label="Name (English)"
            rules={[
              { required: true, message: 'English name is required' },
              { max: 100, message: 'Max 100 characters' },
            ]}
          >
            <Input placeholder="Enter attribute name in English" />
          </Form.Item>

          <Form.Item
            name="nameId"
            label="Name (Indonesian)"
            rules={[
              { required: true, message: 'Indonesian name is required' },
              { max: 100, message: 'Max 100 characters' },
            ]}
          >
            <Input placeholder="Enter attribute name in Indonesian" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingAttribute ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
