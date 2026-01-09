import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Table,
  Tag,
  Button,
  Alert,
  Spin,
} from 'antd';
import {
  ShoppingOutlined,
  TagsOutlined,
  AppstoreOutlined,
  PlusOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components';
import { productAPI, brandAPI } from '../../services/api';
import { Column, Pie } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

const { Title, Text } = Typography;

interface DashboardStats {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  publishedProducts: number;
  draftProducts: number;
  instockProducts: number;
  outstockProducts: number;
}

interface BrandWithCount {
  id: number;
  name: string;
  count: number;
}

interface CategoryWithCount {
  id: number;
  name: string;
  count: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    publishedProducts: 0,
    draftProducts: 0,
    instockProducts: 0,
    outstockProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [topBrands, setTopBrands] = useState<BrandWithCount[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryWithCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const [productsResponse, brandsResponse, categoriesResponse] =
        await Promise.all([
          productAPI.getAll({ per_page: 1 }), // Just get header for total count
          brandAPI.getAll({ per_page: 1 }),
          productAPI.getCategories({ per_page: 1 }),
        ]);

      // Get totals from headers
      const totalProducts = parseInt(
        productsResponse.headers['x-wp-total'] || '0'
      );

      const totalBrands = parseInt(brandsResponse.headers['x-wp-total'] || '0');
      const totalCategories = parseInt(
        categoriesResponse.headers['x-wp-total'] || '0'
      );

      // Fetch recent products for table
      const recentProductsResponse = await productAPI.getAll({
        per_page: 5,
        orderby: 'date',
        order: 'desc',
      });

      // Fetch top brands and categories with product counts
      const [topBrandsResponse, topCategoriesResponse] = await Promise.all([
        brandAPI.getAll({ per_page: 5, orderby: 'count', order: 'desc' }),
        productAPI.getCategories({
          per_page: 5,
          orderby: 'count',
          order: 'desc',
        }),
      ]);

      // Fetch product statistics by status
      const [publishedResponse, draftResponse] = await Promise.all([
        productAPI.getAll({ per_page: 1, status: 'publish' }),
        productAPI.getAll({ per_page: 1, status: 'draft' }),
      ]);

      // Fetch stock status statistics
      const [instockResponse, outstockResponse] = await Promise.all([
        productAPI.getAll({ per_page: 1, stock_status: 'instock' }),
        productAPI.getAll({ per_page: 1, stock_status: 'outofstock' }),
      ]);

      setStats({
        totalProducts,
        totalBrands,
        totalCategories,
        publishedProducts: parseInt(
          publishedResponse.headers['x-wp-total'] || '0'
        ),
        draftProducts: parseInt(draftResponse.headers['x-wp-total'] || '0'),
        instockProducts: parseInt(instockResponse.headers['x-wp-total'] || '0'),
        outstockProducts: parseInt(
          outstockResponse.headers['x-wp-total'] || '0'
        ),
      });

      setRecentProducts(recentProductsResponse.data);
      setTopBrands(
        topBrandsResponse.data.map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          count: brand.count || 0,
        }))
      );
      setTopCategories(
        topCategoriesResponse.data.map((category: any) => ({
          id: category.id,
          name: category.name,
          count: category.count || 0,
        }))
      );
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Product Status Chart Data
  const statusChartData = [
    { status: 'Published', value: stats.publishedProducts },
    { status: 'Draft', value: stats.draftProducts },
  ];

  // Stock Status Chart Data
  const stockChartData = [
    { type: 'In Stock', value: stats.instockProducts },
    { type: 'Out of Stock', value: stats.outstockProducts },
  ];

  // Top Brands Chart Data
  const topBrandsChartData = topBrands.map((brand) => ({
    brand: brand.name,
    count: brand.count,
  }));

  // Top Categories Chart Data
  const topCategoriesChartData = topCategories.map((category) => ({
    category: category.name,
    count: category.count,
  }));

  // Recent Products Table Columns
  const recentProductsColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: {record.sku || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'regular_price',
      key: 'price',
      render: (price: string) =>
        price ? `Rp ${parseInt(price).toLocaleString('id-ID')}` : 'N/A',
    },
    {
      title: 'Stock',
      dataIndex: 'stock_status',
      key: 'stock_status',
      render: (status: string) => (
        <Tag color={status === 'instock' ? 'success' : 'error'}>
          {status === 'instock' ? 'In Stock' : 'Out of Stock'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'publish' ? 'blue' : 'default'}>
          {status === 'publish' ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/products/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const statusChartConfig = {
    data: statusChartData,
    xField: 'status',
    yField: 'value',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      status: { alias: 'Product Status' },
      value: { alias: 'Count' },
    },
  };

  const stockChartConfig = {
    appendPadding: 10,
    data: stockChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const topBrandsChartConfig = {
    data: topBrandsChartData,
    xField: 'brand',
    yField: 'count',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: true,
      },
    },
    meta: {
      brand: { alias: 'Brand' },
      count: { alias: 'Products' },
    },
  };

  const topCategoriesChartConfig = {
    data: topCategoriesChartData,
    xField: 'category',
    yField: 'count',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: true,
      },
    },
    meta: {
      category: { alias: 'Category' },
      count: { alias: 'Products' },
    },
    color: '#faad14',
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '50px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Loading dashboard data..."
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" breadcrumbs={[{ title: 'Dashboard' }]} />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={stats.totalProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => <CountUp end={value as number} />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#3f8600' }} />{' '}
                {stats.publishedProducts} published
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Brands"
                value={stats.totalBrands}
                prefix={<TagsOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => <CountUp end={value as number} />}
              />
              <Button
                type="link"
                size="small"
                onClick={() => navigate('/brands')}
              >
                View Brands
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Categories"
                value={stats.totalCategories}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#cf1322' }}
                formatter={(value) => <CountUp end={value as number} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Stock Status"
                value={stats.instockProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => <CountUp end={value as number} />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowDownOutlined style={{ color: '#cf1322' }} />{' '}
                {stats.outstockProducts} out of stock
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Product Status Distribution">
              <Column {...statusChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Stock Availability">
              <Pie {...stockChartConfig} />
            </Card>
          </Col>
        </Row>

        {/* Top Brands & Categories Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Top 5 Categories by Product Count">
              {topBrandsChartData.length > 0 ? (
                <Column {...topBrandsChartConfig} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No brand data available</Text>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top 5 Categories by Product Count">
              {topCategoriesChartData.length > 0 ? (
                <Column {...topCategoriesChartConfig} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No category data available</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Products Table */}
        <Card
          title="Recent Products"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products/add')}
            >
              Add Product
            </Button>
          }
        >
          <Table
            dataSource={recentProducts}
            columns={recentProductsColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>

        {/* Quick Actions */}
        <Card>
          <Title level={4}>Quick Actions</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                block
                icon={<PlusOutlined />}
                onClick={() => navigate('/products/add')}
              >
                Add New Product
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                block
                icon={<TagsOutlined />}
                onClick={() => navigate('/brands')}
              >
                Manage Brands
              </Button>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                block
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            </Col>
          </Row>
        </Card>
      </Space>
    </>
  );
};
