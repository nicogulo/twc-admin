import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Image,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components';
import { productAPI } from '../../../services/api';

const { Option } = Select;
const { Title } = Typography;

// WooCommerce Product interface for API response
interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: any[];
  stock_status: string;
  has_options: boolean;
  _links: any;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
}

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    WooCommerceProduct[]
  >([]);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    category?: number;
    brandIds?: number[];
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Language preference (from context or settings)
  const [language, setLanguage] = useState<'en' | 'id'>('en');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadInitialData = useCallback(async () => {
    try {
      // Load brands and categories
      const [brandsRes, categoriesRes] = await Promise.all([
        productAPI.getBrands({ per_page: 100 }),
        productAPI.getCategories({ per_page: 100 }),
      ]);
      setBrands(brandsRes);
      setCategories(categoriesRes.data);
    } catch (error: any) {
      console.error('Failed to load initial data:', error);
      message.error(
        error.response?.data?.message || 'Failed to load brands and categories'
      );
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        per_page: pagination.pageSize,
        page: pagination.current,
        orderby: 'date',
        order: 'desc',
      };

      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.category) {
        params.category = filters.category;
      }
      if (filters.brandIds && filters.brandIds.length > 0) {
        params.brand = filters.brandIds.join(',');
      }

      // Use axios directly to get headers
      const response = await productAPI.getAll(params);

      setFilteredProducts(response.data || response);

      // WooCommerce returns pagination info in response headers
      // x-wp-total: total number of items
      // x-wp-totalpages: total number of pages
      const totalItems = response.headers?.['x-wp-total']
        ? parseInt(response.headers['x-wp-total'], 10)
        : (response.data || response).length;

      setPagination((prev) => ({
        ...prev,
        total: totalItems,
      }));
    } catch (error: any) {
      console.error('Failed to load products:', error);
      message.error(error.response?.data?.message || 'Failed to load products');
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

  const handleRefresh = () => {
    loadProducts();
  };

  const handleDelete = (record: WooCommerceProduct) => {
    Modal.confirm({
      title: 'Delete Product',
      content: (
        <div>
          <p>Are you sure you want to delete this product?</p>
          <p>
            <strong>{record.name}</strong>
          </p>
          <p style={{ color: '#999', fontSize: '12px' }}>
            This will move the product to trash. You can permanently delete it
            later from WooCommerce.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await productAPI.delete(record.id, false); // false = move to trash, true = permanent delete
          message.success('Product moved to trash successfully');
          loadProducts();
        } catch (error: any) {
          console.error('Failed to delete product:', error);
          message.error(
            error.response?.data?.message || 'Failed to delete product'
          );
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      publish: 'green',
      draft: 'orange',
      pending: 'blue',
      private: 'purple',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      publish: 'Published',
      draft: 'Draft',
      pending: 'Pending',
      private: 'Private',
    };
    return labels[status] || status;
  };

  const columns: ColumnsType<WooCommerceProduct> = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 80,
      render: (images: WooCommerceProduct['images']) => (
        <Image
          src={images?.[0]?.src || 'https://via.placeholder.com/60'}
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      sorter: (a, b) => (a.sku || '').localeCompare(b.sku || ''),
      render: (sku) => sku || '-',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.categories.length > 0 && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {record.categories.map((cat) => cat.name).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      sorter: (a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'),
      render: (price: string, record) => {
        if (!price || price === '0') {
          return <span style={{ color: '#999' }}>Not set</span>;
        }
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              Rp {parseFloat(price).toLocaleString('id-ID')}
            </div>
            {record.on_sale && record.sale_price && (
              <div style={{ fontSize: '12px', color: '#52c41a' }}>
                Sale: Rp {parseFloat(record.sale_price).toLocaleString('id-ID')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock_status',
      key: 'stock',
      width: 120,
      render: (stockStatus: string, record) => {
        const statusColors: Record<string, string> = {
          instock: 'green',
          outofstock: 'red',
          onbackorder: 'orange',
        };
        const statusLabels: Record<string, string> = {
          instock: 'In Stock',
          outofstock: 'Out of Stock',
          onbackorder: 'On Backorder',
        };
        return (
          <div>
            <Tag color={statusColors[stockStatus] || 'default'}>
              {statusLabels[stockStatus] || stockStatus}
            </Tag>
            {record.manage_stock && record.stock_quantity !== null && (
              <div
                style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}
              >
                Qty: {record.stock_quantity}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'total_sales',
      key: 'sales',
      width: 80,
      sorter: (a, b) => a.total_sales - b.total_sales,
      render: (sales) => sales || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => navigate(`/products/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => navigate(`/products/edit/${record.id}`),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Product Management"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Product Management' },
        ]}
      />

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Search and Action Bar */}
          <Row gutter={16} justify="space-between" align="middle">
            <Col flex="auto">
              <Space size="middle">
                <Input
                  placeholder="Search by product name, SKU, or description..."
                  prefix={<SearchOutlined />}
                  style={{ width: 400 }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  allowClear
                />
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/products/add')}
                >
                  Add Product
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Advanced Filters */}
          {showFilters && (
            <Card size="small" title="Filters">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Select Status"
                    style={{ width: '100%' }}
                    value={filters.status}
                    onChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                    allowClear
                  >
                    <Option value="publish">Published</Option>
                    <Option value="draft">Draft</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="private">Private</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Select Category"
                    style={{ width: '100%' }}
                    value={filters.category}
                    onChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name} ({category.count || 0})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    mode="multiple"
                    placeholder="Select Brands"
                    style={{ width: '100%' }}
                    value={filters.brandIds}
                    onChange={(value) =>
                      setFilters({ ...filters, brandIds: value })
                    }
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {brands.map((brand) => (
                      <Option key={brand.id} value={brand.id}>
                        {brand.name} ({brand.count || 0})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Button
                    onClick={() => {
                      setFilters({});
                      setShowFilters(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Col>
              </Row>
            </Card>
          )}

          {/* Results Summary */}
          <div>
            <Title level={5}>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 && 's'} found
              {loading && ' (loading...)'}
            </Title>
          </div>

          {/* Products Table */}
          <Table
            columns={columns}
            dataSource={filteredProducts}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
          />
        </Space>
      </Card>
    </>
  );
};
