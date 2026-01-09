import React, { useState, useEffect } from 'react';
import { Card, Table, Image, Typography, Space, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Brand } from '../../types';
import { PageHeader } from '../../components';

const { Title } = Typography;
const { Option } = Select;

export const BrandListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [language, setLanguage] = useState<'en' | 'id'>('en');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockData: Brand[] = [
        {
          id: '1',
          nameEn: 'Rolex',
          nameId: 'Rolex',
          logoUrl: 'https://via.placeholder.com/80',
          totalWatches: 45,
          totalAccessories: 12,
          isActive: true,
        },
        {
          id: '2',
          nameEn: 'Omega',
          nameId: 'Omega',
          logoUrl: 'https://via.placeholder.com/80',
          totalWatches: 32,
          totalAccessories: 8,
          isActive: true,
        },
        {
          id: '3',
          nameEn: 'Patek Philippe',
          nameId: 'Patek Philippe',
          logoUrl: 'https://via.placeholder.com/80',
          totalWatches: 28,
          totalAccessories: 5,
          isActive: true,
        },
        {
          id: '4',
          nameEn: 'Audemars Piguet',
          nameId: 'Audemars Piguet',
          logoUrl: 'https://via.placeholder.com/80',
          totalWatches: 19,
          totalAccessories: 3,
          isActive: true,
        },
      ];
      setBrands(mockData);
    } catch (error) {
      message.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logo',
      width: 100,
      render: (url, record) => (
        <Image
          src={url}
          alt={record.nameEn}
          width={60}
          height={60}
          style={{ objectFit: 'contain' }}
          preview={false}
        />
      ),
    },
    {
      title: 'Brand Name',
      key: 'name',
      render: (_, record) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {language === 'en' ? record.nameEn : record.nameId}
        </span>
      ),
      sorter: (a, b) => {
        const aName = language === 'en' ? a.nameEn : a.nameId;
        const bName = language === 'en' ? b.nameEn : b.nameId;
        return aName.localeCompare(bName);
      },
    },
    {
      title: 'Total Watches',
      dataIndex: 'totalWatches',
      key: 'totalWatches',
      width: 150,
      sorter: (a, b) => a.totalWatches - b.totalWatches,
      render: (count) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
          {count}
        </span>
      ),
    },
    {
      title: 'Total Accessories',
      dataIndex: 'totalAccessories',
      key: 'totalAccessories',
      width: 180,
      sorter: (a, b) => a.totalAccessories - b.totalAccessories,
      render: (count) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
          {count}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Brand Management"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Brand Management' },
        ]}
      />

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title level={5}>Brand List (Read-Only)</Title>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: 100 }}
            >
              <Option value="en">EN</Option>
              <Option value="id">ID</Option>
            </Select>
          </div>

          <div style={{ color: '#666', marginBottom: 16 }}>
            Total watches and accessories are automatically calculated from
            product data.
          </div>

          <Table
            columns={columns}
            dataSource={brands}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} brands`,
            }}
          />
        </Space>
      </Card>
    </>
  );
};
