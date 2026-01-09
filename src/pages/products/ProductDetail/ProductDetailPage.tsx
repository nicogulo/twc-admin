import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Image,
  Tag,
  Descriptions,
  Button,
  Space,
  Spin,
  message,
  Divider,
  Typography,
  Alert,
  Tabs,
  Table,
} from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components';
import { productAPI } from '../../../services/api';

const { Title, Text } = Typography;

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
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  meta_data: any[];
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<WooCommerceProduct | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getById(parseInt(id!, 10));
      setProduct(data);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      message.error(error.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
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

  const getStockStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      instock: 'green',
      outofstock: 'red',
      onbackorder: 'orange',
    };
    return colors[status] || 'default';
  };

  const getStockStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      instock: 'In Stock',
      outofstock: 'Out of Stock',
      onbackorder: 'On Backorder',
    };
    return labels[status] || status;
  };

  // Helper to get metadata value
  const getMetaValue = (key: string) => {
    const meta = product?.meta_data?.find((m: any) => m.key === key);
    return meta?.value || '-';
  };

  // Helper to format metadata for display
  const renderMetaValue = (value: any) => {
    if (!value || value === '-') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    // Handle "1" and "0" as boolean
    if (value === '1' || value === 1) return 'Yes';
    if (value === '0' || value === 0) return 'No';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <PageHeader
          title="Product Not Found"
          breadcrumbs={[
            { title: 'Dashboard', path: '/' },
            { title: 'Products', path: '/products' },
            { title: 'Detail' },
          ]}
        />
        <Alert
          message="Product Not Found"
          description="The product you are looking for does not exist."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Products', path: '/products' },
          { title: product.name },
        ]}
      />

      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
        >
          Back to List
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/products/edit/${product.id}`)}
        >
          Edit Product
        </Button>
      </Space>

      <Row gutter={[24, 24]}>
        {/* Product Images */}
        <Col xs={24} lg={10}>
          <Card title="Product Images">
            {product.images && product.images.length > 0 ? (
              <div>
                <Image.PreviewGroup>
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.name}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                  <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                    {product.images.slice(1).map((img) => (
                      <Col span={6} key={img.id}>
                        <Image
                          src={img.src}
                          alt={img.alt || product.name}
                          style={{ width: '100%', borderRadius: 4 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">No images available</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Information */}
        <Col xs={24} lg={14}>
          <Card title="Product Information">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Price & Status */}
              <div>
                <Space size="large">
                  <div>
                    <Text type="secondary">Price</Text>
                    <div style={{ marginTop: 8 }}>
                      {product.on_sale && product.sale_price ? (
                        <>
                          <Text
                            delete
                            style={{ marginRight: 8, color: '#999' }}
                          >
                            Rp{' '}
                            {parseFloat(product.regular_price).toLocaleString(
                              'id-ID'
                            )}
                          </Text>
                          <Title
                            level={3}
                            style={{ margin: 0, color: '#52c41a' }}
                          >
                            Rp{' '}
                            {parseFloat(product.sale_price).toLocaleString(
                              'id-ID'
                            )}
                          </Title>
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            ON SALE
                          </Tag>
                        </>
                      ) : (
                        <Title level={3} style={{ margin: 0 }}>
                          {product.price
                            ? `Rp ${parseFloat(product.price).toLocaleString(
                                'id-ID'
                              )}`
                            : 'Not set'}
                        </Title>
                      )}
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: 60 }} />
                  <div>
                    <Text type="secondary">Status</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        color={getStatusColor(product.status)}
                        style={{ fontSize: 14 }}
                      >
                        {product.status.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </div>

              <Divider />

              {/* Product Details */}
              <Descriptions column={2} bordered>
                <Descriptions.Item label="SKU" span={2}>
                  {product.sku || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {product.type}
                </Descriptions.Item>
                <Descriptions.Item label="Featured">
                  {product.featured ? (
                    <Tag color="gold">Featured</Tag>
                  ) : (
                    <Tag>Not Featured</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Stock Status" span={2}>
                  <Tag color={getStockStatusColor(product.stock_status)}>
                    {getStockStatusLabel(product.stock_status)}
                  </Tag>
                  {product.manage_stock && product.stock_quantity !== null && (
                    <Text style={{ marginLeft: 8 }}>
                      Quantity: {product.stock_quantity}
                    </Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Total Sales" span={2}>
                  {product.total_sales} sold
                </Descriptions.Item>
                <Descriptions.Item label="Categories" span={2}>
                  {product.categories.length > 0 ? (
                    <Space wrap>
                      {product.categories.map((cat) => (
                        <Tag key={cat.id} color="blue">
                          {cat.name}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Tags" span={2}>
                  {product.tags.length > 0 ? (
                    <Space wrap>
                      {product.tags.map((tag) => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                      ))}
                    </Space>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Permalink" span={2}>
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {product.permalink}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Date Created">
                  {new Date(product.date_created).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Last Modified">
                  {new Date(product.date_modified).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        {/* Product Description */}
        {(product.description || product.short_description) && (
          <Col xs={24}>
            <Card title="Product Description">
              {product.short_description && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Short Description</Title>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.short_description,
                    }}
                  />
                </div>
              )}
              {product.description && (
                <div>
                  <Title level={5}>Full Description</Title>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.description,
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        )}

        {/* Product Metadata - Detailed Specifications */}
        <Col xs={24}>
          <Card title="Technical Specifications">
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Basic Information',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Listing Code" span={2}>
                        {renderMetaValue(
                          getMetaValue('basic-info-listing-code')
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Model">
                        {renderMetaValue(getMetaValue('basic-info-model'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Reference Number">
                        {renderMetaValue(getMetaValue('reference'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Watch Type">
                        {renderMetaValue(getMetaValue('basic-info-status'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Condition">
                        {renderMetaValue(getMetaValue('basic-info-condition'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {renderMetaValue(getMetaValue('basic-info-gender'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Year of Production">
                        {renderMetaValue(
                          getMetaValue('basic-info-year-production')
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Year of Purchase">
                        {renderMetaValue(
                          getMetaValue('basic-info-year-purchase')
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Location" span={2}>
                        {renderMetaValue(getMetaValue('basic-info-location'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="New" span={1}>
                        {renderMetaValue(getMetaValue('is_new'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Available" span={1}>
                        {renderMetaValue(getMetaValue('is_avail'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Limited Edition" span={1}>
                        {renderMetaValue(getMetaValue('is_limited'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Automatic" span={1}>
                        {renderMetaValue(getMetaValue('is_auto'))}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: '2',
                  label: 'Caliber/Movement',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Movement" span={2}>
                        {renderMetaValue(getMetaValue('caliber-movement'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Caliber">
                        {renderMetaValue(
                          getMetaValue('caliber-caliber-movement')
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Base Caliber">
                        {renderMetaValue(getMetaValue('caliber-base-caliber'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Power Reserve">
                        {renderMetaValue(getMetaValue('caliber-power-reserve'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Number of Jewels">
                        {renderMetaValue(
                          getMetaValue('caliber-number-of-jewels')
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: '3',
                  label: 'Case',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Case Material">
                        {renderMetaValue(getMetaValue('case-material'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bezel Material">
                        {renderMetaValue(getMetaValue('case-bezel-material'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Crystal">
                        {renderMetaValue(getMetaValue('case-crystal'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Diameter">
                        {renderMetaValue(getMetaValue('case-diameter'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Water Resistance">
                        {renderMetaValue(getMetaValue('case-water-resistance'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dial">
                        {renderMetaValue(getMetaValue('case-dial'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dial Numerals" span={2}>
                        {renderMetaValue(getMetaValue('case-dial-numerals'))}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: '4',
                  label: 'Bracelet/Strap',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Bracelet Material">
                        {renderMetaValue(getMetaValue('bracelet-material'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bracelet Color">
                        {renderMetaValue(getMetaValue('bracelet-color'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Clasp Type">
                        {renderMetaValue(getMetaValue('bracelet-clasp'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Clasp Material">
                        {renderMetaValue(
                          getMetaValue('bracelet-clasp-material')
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: '5',
                  label: 'Completeness',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Scope of Delivery" span={2}>
                        {renderMetaValue(
                          getMetaValue('basic-info-scope-of-delivery')
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Original Box">
                        {renderMetaValue(getMetaValue('c_box'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Original Papers">
                        {renderMetaValue(getMetaValue('c_paper'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Manual">
                        {renderMetaValue(getMetaValue('c_manual'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Warranty">
                        {renderMetaValue(getMetaValue('c_warranty'))}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: '6',
                  label: 'Additional Info',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Series" span={2}>
                        {renderMetaValue(getMetaValue('series'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Additional Info" span={2}>
                        {renderMetaValue(getMetaValue('add_info'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Rating">
                        {renderMetaValue(getMetaValue('rate'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Contact">
                        {renderMetaValue(getMetaValue('a_contact'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Post Time">
                        {renderMetaValue(getMetaValue('post_time'))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Edit Time">
                        {renderMetaValue(getMetaValue('last_edit_time'))}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* All Metadata Table */}
        {product.meta_data && product.meta_data.length > 0 && (
          <Col xs={24}>
            <Card title="All Product Metadata">
              <Table
                dataSource={product.meta_data}
                columns={[
                  {
                    title: 'Key',
                    dataIndex: 'key',
                    key: 'key',
                    width: '40%',
                  },
                  {
                    title: 'Value',
                    dataIndex: 'value',
                    key: 'value',
                    render: (value: any) => {
                      if (typeof value === 'object') {
                        return <pre>{JSON.stringify(value, null, 2)}</pre>;
                      }
                      return renderMetaValue(value);
                    },
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 20 }}
                size="small"
              />
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
};
