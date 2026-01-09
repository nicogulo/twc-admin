import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Switch,
  Upload,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PageHeader } from '../../../components';
import { productAPI, brandAPI } from '../../../services/api';

const { Option } = Select;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export const ProductWooCommerceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageList, setImageList] = useState<any[]>([]);
  const isEditMode = !!id;

  // Parser function for InputNumber to handle currency formatting
  const priceParser: any = (value: string | undefined) => {
    const parsed = value?.replace(/Rp\s?|(,*)/g, '') || '';
    return parsed ? parseFloat(parsed) : 0;
  };

  useEffect(() => {
    loadCategories();
    loadTags();
    loadBrands();
    if (isEditMode) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await productAPI.getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandAPI.getAll({ per_page: 100 });
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const product = await productAPI.getById(parseInt(id!, 10));

      // Set form values
      form.setFieldsValue({
        name: product.name,
        type: product.type,
        status: product.status,
        featured: product.featured,
        catalog_visibility: product.catalog_visibility,
        sku: product.sku,
        global_unique_id: product.global_unique_id || '',
        regular_price: product.regular_price
          ? parseFloat(product.regular_price)
          : undefined,
        sale_price: product.sale_price
          ? parseFloat(product.sale_price)
          : undefined,
        manage_stock: product.manage_stock,
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status || 'instock',
        backorders: product.backorders || 'no',
        sold_individually: product.sold_individually || false,
        weight: product.weight || '',
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || '',
        shipping_class: product.shipping_class || '',
        virtual: product.virtual || false,
        downloadable: product.downloadable || false,
        tax_status: product.tax_status || 'taxable',
        tax_class: product.tax_class || '',
        reviews_allowed:
          product.reviews_allowed !== undefined
            ? product.reviews_allowed
            : true,
        purchase_note: product.purchase_note || '',
        menu_order: product.menu_order || 0,
        categories: product.categories?.map((cat: any) => cat.id) || [],
        tags: product.tags?.map((tag: any) => tag.id) || [],
        brands: product.brands?.map((brand: any) => brand.id) || [],
      });

      setDescription(product.description || '');
      setShortDescription(product.short_description || '');

      // Extract meta data
      if (product.meta_data && Array.isArray(product.meta_data)) {
        product.meta_data.forEach((item: any) => {
          // Handle switch fields (c_box, c_paper, c_manual, c_warranty)
          if (
            ['c_box', 'c_paper', 'c_manual', 'c_warranty'].includes(item.key)
          ) {
            form.setFieldValue(
              item.key,
              item.value === '1' || item.value === 1
            );
          } else {
            form.setFieldValue(item.key, item.value);
          }
        });
      }

      // Set images
      if (product.images && product.images.length > 0) {
        const images = product.images.map((img: any, index: number) => ({
          uid: `${index}`,
          name: img.name || `image-${index}`,
          status: 'done',
          url: img.src,
        }));
        setImageList(images);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      message.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('Image list before processing:', imageList);

      // Process images: upload new files and collect image URLs
      const processedImages = await Promise.all(
        imageList.map(async (img) => {
          console.log('Processing image:', img);

          // If image has URL (existing image from server), use it
          if (img.url) {
            return { src: img.url };
          }

          // If image is newly uploaded file, need to upload to WordPress Media
          if (img.originFileObj) {
            try {
              console.log('Uploading new image:', img.name);
              const formData = new FormData();
              formData.append('file', img.originFileObj);

              // Upload to WordPress Media Library
              const mediaResponse = await productAPI.uploadMedia(formData);
              console.log('Media uploaded successfully:', mediaResponse);
              return { src: mediaResponse.source_url, id: mediaResponse.id };
            } catch (error) {
              console.error('Failed to upload image:', error);
              message.warning(`Failed to upload image: ${img.name}`);
              return null;
            }
          }

          // If image has response (already uploaded), use it
          if (img.response?.source_url) {
            return { src: img.response.source_url, id: img.response.id };
          }

          console.warn('Image has no valid source:', img);
          return null;
        })
      );

      // Filter out failed uploads
      const validImages = processedImages.filter((img) => img !== null);
      console.log('Valid images for payload:', validImages);

      // Prepare meta data array
      const metaDataArray = [
        { key: 'reference', value: values.reference || '' },
        { key: 'series', value: values.series || '' },
        {
          key: 'basic-info-listing-code',
          value: values['basic-info-listing-code'] || '',
        },
        { key: 'basic-info-model', value: values['basic-info-model'] || '' },
        {
          key: 'basic-info-case-material',
          value: values['basic-info-case-material'] || '',
        },
        {
          key: 'basic-info-year-production',
          value: values['basic-info-year-production'] || '',
        },
        {
          key: 'basic-info-year-purchase',
          value: values['basic-info-year-purchase'] || '',
        },
        { key: 'basic-info-gender', value: values['basic-info-gender'] || '' },
        {
          key: 'basic-info-bracelet-material',
          value: values['basic-info-bracelet-material'] || '',
        },
        { key: 'basic-info-status', value: values['basic-info-status'] || '' },
        {
          key: 'basic-info-condition',
          value: values['basic-info-condition'] || '',
        },
        {
          key: 'basic-info-scope-of-delivery',
          value: values['basic-info-scope-of-delivery'] || '',
        },
        {
          key: 'basic-info-location',
          value: values['basic-info-location'] || '',
        },
        { key: 'caliber-movement', value: values['caliber-movement'] || '' },
        {
          key: 'caliber-caliber-movement',
          value: values['caliber-caliber-movement'] || '',
        },
        {
          key: 'caliber-power-reserve',
          value: values['caliber-power-reserve'] || '',
        },
        {
          key: 'caliber-number-of-jewels',
          value: values['caliber-number-of-jewels'] || '',
        },
        {
          key: 'caliber-base-caliber',
          value: values['caliber-base-caliber'] || '',
        },
        { key: 'case-material', value: values['case-material'] || '' },
        {
          key: 'case-water-resistance',
          value: values['case-water-resistance'] || '',
        },
        { key: 'case-crystal', value: values['case-crystal'] || '' },
        {
          key: 'case-dial-numerals',
          value: values['case-dial-numerals'] || '',
        },
        { key: 'case-diameter', value: values['case-diameter'] || '' },
        {
          key: 'case-bezel-material',
          value: values['case-bezel-material'] || '',
        },
        { key: 'case-dial', value: values['case-dial'] || '' },
        { key: 'bracelet-material', value: values['bracelet-material'] || '' },
        { key: 'bracelet-clasp', value: values['bracelet-clasp'] || '' },
        { key: 'bracelet-color', value: values['bracelet-color'] || '' },
        {
          key: 'bracelet-clasp-material',
          value: values['bracelet-clasp-material'] || '',
        },
        { key: 'c_box', value: values.c_box ? '1' : '0' },
        { key: 'c_paper', value: values.c_paper ? '1' : '0' },
        { key: 'c_manual', value: values.c_manual ? '1' : '0' },
        { key: 'c_warranty', value: values.c_warranty ? '1' : '0' },
        {
          key: 'is_new',
          value: values['basic-info-status'] === 'Brand New' ? '1' : '0',
        },
        { key: 'is_avail', value: values.is_avail || '0' },
        { key: 'is_limited', value: values.is_limited || '0' },
        { key: 'is_auto', value: values.is_auto || '0' },
        { key: 'rate', value: values.rate?.toString() || '' },
        { key: 'add_info', value: values.add_info || '' },
        { key: 'a_contact', value: values.a_contact || '' },
      ].filter((item) => item.value !== ''); // Only include non-empty values

      // Prepare payload matching WooCommerce API
      const payload: any = {
        name: values.name,
        type: values.type || 'simple',
        status: values.status || 'publish',
        featured: values.featured || false,
        catalog_visibility: values.catalog_visibility || 'visible',
        description: description,
        short_description: shortDescription,
        sku: values.sku || '',
        global_unique_id: values.global_unique_id || '',
        regular_price: values.regular_price
          ? values.regular_price.toString()
          : '',
        sale_price: values.sale_price ? values.sale_price.toString() : '',
        tax_status: values.tax_status || 'taxable',
        tax_class: values.tax_class || '',
        manage_stock: values.manage_stock || false,
        stock_quantity: values.stock_quantity || null,
        stock_status: values.stock_status || 'instock',
        backorders: values.backorders || 'no',
        sold_individually: values.sold_individually || false,
        weight: values.weight || '',
        dimensions: {
          length: values.length || '',
          width: values.width || '',
          height: values.height || '',
        },
        shipping_class: values.shipping_class || '',
        virtual: values.virtual || false,
        downloadable: values.downloadable || false,
        reviews_allowed:
          values.reviews_allowed !== undefined ? values.reviews_allowed : true,
        purchase_note: values.purchase_note || '',
        menu_order: values.menu_order || 0,
        categories: values.categories
          ? values.categories.map((id: number) => ({ id }))
          : [],
        tags: values.tags ? values.tags.map((id: number) => ({ id })) : [],
        brands: values.brands
          ? values.brands.map((id: number) => ({ id }))
          : [],
        images: validImages,
        meta_data: metaDataArray,
      };

      if (isEditMode) {
        await productAPI.update(parseInt(id!, 10), payload);
        message.success('Product updated successfully');
      } else {
        await productAPI.create(payload);
        message.success('Product created successfully');
      }

      navigate('/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      message.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    // Add preview URL for newly uploaded files
    const updatedList = newFileList.map((file: any) => {
      if (!file.url && !file.preview && file.originFileObj) {
        // Create preview URL for new uploads
        file.preview = URL.createObjectURL(file.originFileObj);
      }
      return file;
    });
    setImageList(updatedList);
  };

  const uploadProps = {
    fileList: imageList,
    beforeUpload: (file: any) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }

      return false; // Prevent auto upload, we'll handle it manually
    },
    onChange: handleUploadChange,
    onRemove: (file: any) => {
      // Clean up preview URL if exists
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    },
    listType: 'picture-card' as const,
    accept: 'image/*',
    multiple: true,
  };

  return (
    <>
      <PageHeader
        title={isEditMode ? 'Edit Product' : 'Add New Product'}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Products', path: '/products' },
          { title: isEditMode ? 'Edit Product' : 'Add New Product' },
        ]}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'simple',
            status: 'publish',
            featured: false,
            catalog_visibility: 'visible',
            manage_stock: false,
            stock_status: 'instock',
            backorders: 'no',
            tax_status: 'taxable',
            virtual: false,
            downloadable: false,
            reviews_allowed: true,
            sold_individually: false,
            menu_order: 0,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Card title="Basic Information" style={{ marginBottom: 24 }}>
                <Form.Item
                  label="Product Name"
                  name="name"
                  rules={[
                    { required: true, message: 'Please enter product name' },
                  ]}
                >
                  <Input placeholder="Enter product name" size="large" />
                </Form.Item>

                <Form.Item label="Description">
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    style={{ height: 200, marginBottom: 50 }}
                  />
                </Form.Item>

                <Form.Item label="Short Description">
                  <ReactQuill
                    theme="snow"
                    value={shortDescription}
                    onChange={setShortDescription}
                    style={{ height: 150, marginBottom: 50 }}
                  />
                </Form.Item>
              </Card>

              <Card title="Product Data" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="SKU" name="sku">
                      <Input placeholder="Enter SKU" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Global Unique ID"
                      name="global_unique_id"
                      tooltip="GTIN, UPC, EAN or ISBN"
                    >
                      <Input placeholder="Enter GTIN/UPC/EAN/ISBN" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Regular Price (Rp)"
                      name="regular_price"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter regular price',
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="0"
                        formatter={(value) =>
                          `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={priceParser}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Sale Price (Rp)" name="sale_price">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="0"
                        formatter={(value) =>
                          `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={priceParser}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Tax Status" name="tax_status">
                      <Select placeholder="Select tax status">
                        <Option value="taxable">Taxable</Option>
                        <Option value="shipping">Shipping only</Option>
                        <Option value="none">None</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Tax Class" name="tax_class">
                      <Input placeholder="Enter tax class" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Manage Stock"
                  name="manage_stock"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.manage_stock !== currentValues.manage_stock
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('manage_stock') ? (
                      <>
                        <Form.Item label="Stock Quantity" name="stock_quantity">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="0"
                          />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Stock Status" name="stock_status">
                              <Select placeholder="Select stock status">
                                <Option value="instock">In Stock</Option>
                                <Option value="outofstock">Out of Stock</Option>
                                <Option value="onbackorder">
                                  On Backorder
                                </Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Allow Backorders"
                              name="backorders"
                            >
                              <Select placeholder="Select backorder option">
                                <Option value="no">Do not allow</Option>
                                <Option value="notify">
                                  Allow, but notify customer
                                </Option>
                                <Option value="yes">Allow</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <Form.Item label="Stock Status" name="stock_status">
                        <Select placeholder="Select stock status">
                          <Option value="instock">In Stock</Option>
                          <Option value="outofstock">Out of Stock</Option>
                          <Option value="onbackorder">On Backorder</Option>
                        </Select>
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </Card>

              <Card title="Shipping" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Weight (kg)" name="weight">
                      <Input placeholder="0" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Shipping Class" name="shipping_class">
                      <Input placeholder="Enter shipping class slug" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Length (cm)" name="length">
                      <Input placeholder="0" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Width (cm)" name="width">
                      <Input placeholder="0" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Height (cm)" name="height">
                      <Input placeholder="0" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Product Images">
                <Form.Item
                  label="Upload Images"
                  help="Maximum file size: 5MB. Supported formats: JPG, PNG, WEBP. Images will be uploaded to WordPress Media Library."
                >
                  <Upload {...uploadProps}>
                    <div>
                      <UploadOutlined style={{ fontSize: 24 }} />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                  {imageList.length > 0 && (
                    <div style={{ marginTop: 8, color: '#666' }}>
                      {imageList.length} image(s) selected
                    </div>
                  )}
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Product Categories" style={{ marginBottom: 24 }}>
                <Form.Item label="Categories" name="categories">
                  <Select
                    mode="multiple"
                    placeholder="Select categories"
                    loading={categories.length === 0}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Tags" name="tags">
                  <Select
                    mode="multiple"
                    placeholder="Select tags"
                    loading={tags.length === 0}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {tags.map((tag) => (
                      <Option key={tag.id} value={tag.id}>
                        {tag.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Brands" name="brands">
                  <Select
                    placeholder="Select brands"
                    loading={brands.length === 0}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {brands.map((brand) => (
                      <Option key={brand.id} value={brand.id}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: brand?.name,
                          }}
                        />
                      </Option>
                    ))}
                  </Select>
                </Form.Item>{' '}
              </Card>

              <Card title="Product Status" style={{ marginBottom: 24 }}>
                <Form.Item label="Type" name="type">
                  <Select>
                    <Option value="simple">Simple Product</Option>
                    <Option value="variable">Variable Product</Option>
                    <Option value="grouped">Grouped Product</Option>
                    <Option value="external">External Product</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Status" name="status">
                  <Select>
                    <Option value="publish">Published</Option>
                    <Option value="draft">Draft</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="private">Private</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Visibility" name="catalog_visibility">
                  <Select>
                    <Option value="visible">Visible</Option>
                    <Option value="catalog">Catalog</Option>
                    <Option value="search">Search</Option>
                    <Option value="hidden">Hidden</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Featured"
                  name="featured"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Virtual"
                  name="virtual"
                  valuePropName="checked"
                  tooltip="Virtual products are intangible and aren't shipped"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Downloadable"
                  name="downloadable"
                  valuePropName="checked"
                  tooltip="Downloadable products give access to files upon purchase"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Reviews Allowed"
                  name="reviews_allowed"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Sold Individually"
                  name="sold_individually"
                  valuePropName="checked"
                  tooltip="Limit purchases to 1 item per order"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Menu Order"
                  name="menu_order"
                  tooltip="Custom sort order"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  label="Purchase Note"
                  name="purchase_note"
                  tooltip="Note sent to customer after purchase"
                >
                  <Input.TextArea rows={3} placeholder="Enter purchase note" />
                </Form.Item>
              </Card>

              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    block
                    size="large"
                  >
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/products')}
                    block
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Meta Data Section */}
          <Row gutter={24} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Product Meta Data" style={{ marginBottom: 24 }}>
                {/* Basic Info Section */}
                <Card
                  type="inner"
                  title="Basic Info"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Reference" name="reference">
                        <Input placeholder="e.g., 126610LN" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Series" name="series">
                        <Input placeholder="e.g., Submariner" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Listing Code"
                        name="basic-info-listing-code"
                      >
                        <Input placeholder="e.g., TWC-2024-001" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Model" name="basic-info-model">
                        <Input placeholder="e.g., Submariner Date" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Case Material"
                        name="basic-info-case-material"
                      >
                        <Input placeholder="e.g., Stainless Steel" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Year Production"
                        name="basic-info-year-production"
                      >
                        <Input placeholder="e.g., 2023" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="Year Purchase"
                        name="basic-info-year-purchase"
                      >
                        <Input placeholder="e.g., 2024" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Gender" name="basic-info-gender">
                        <Select placeholder="Select gender">
                          <Option value="Men">Men</Option>
                          <Option value="Women">Women</Option>
                          <Option value="Unisex">Unisex</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Bracelet Material"
                        name="basic-info-bracelet-material"
                      >
                        <Input placeholder="e.g., Stainless Steel" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Status" name="basic-info-status">
                        <Select placeholder="Select status">
                          <Option value="Brand New">Brand New</Option>
                          <Option value="Pre-Owned">Pre-Owned</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues['basic-info-status'] !==
                          currentValues['basic-info-status']
                        }
                      >
                        {({ getFieldValue }) => {
                          const isDisabled =
                            getFieldValue('basic-info-status') === 'Brand New';

                          // Clear condition value when Brand New is selected
                          if (
                            isDisabled &&
                            getFieldValue('basic-info-condition')
                          ) {
                            form.setFieldValue('basic-info-condition', '');
                          }

                          return (
                            <Form.Item
                              label="Condition"
                              name="basic-info-condition"
                              tooltip={
                                isDisabled
                                  ? 'Condition is N/A for Brand New items'
                                  : undefined
                              }
                            >
                              <Select
                                placeholder="Select condition"
                                disabled={isDisabled}
                              >
                                <Option value="Like New">Like New</Option>
                                <Option value="Very Good">Very Good</Option>
                                <Option value="Good">Good</Option>
                                <Option value="Fair">Fair</Option>
                                <Option value="Incomplete">Incomplete</Option>
                              </Select>
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Scope of Delivery"
                        name="basic-info-scope-of-delivery"
                      >
                        <Input placeholder="e.g., Full Set" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Location" name="basic-info-location">
                        <Input placeholder="e.g., Jakarta" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Caliber Section */}
                <Card type="inner" title="Caliber" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Movement" name="caliber-movement">
                        <Select placeholder="Select movement">
                          <Option value="Automatic">Automatic</Option>
                          <Option value="Manual">Manual</Option>
                          <Option value="Quartz">Quartz</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Caliber/Movement"
                        name="caliber-caliber-movement"
                      >
                        <Input placeholder="e.g., 3235" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Power Reserve"
                        name="caliber-power-reserve"
                      >
                        <Input placeholder="e.g., 70 hours" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Number of Jewels"
                        name="caliber-number-of-jewels"
                      >
                        <Input placeholder="e.g., 31" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Base Caliber"
                        name="caliber-base-caliber"
                      >
                        <Input placeholder="e.g., 3235" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Case Section */}
                <Card type="inner" title="Case" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Material" name="case-material">
                        <Input placeholder="e.g., Oystersteel" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Water Resistance"
                        name="case-water-resistance"
                      >
                        <Input placeholder="e.g., 300m" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Crystal" name="case-crystal">
                        <Input placeholder="e.g., Sapphire" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="Dial Numerals"
                        name="case-dial-numerals"
                      >
                        <Input placeholder="e.g., Index" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Diameter" name="case-diameter">
                        <Input placeholder="e.g., 41mm" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Bezel Material"
                        name="case-bezel-material"
                      >
                        <Input placeholder="e.g., Ceramic" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Dial" name="case-dial">
                        <Input placeholder="e.g., Black" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Bracelet Section */}
                <Card
                  type="inner"
                  title="Bracelet"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Material" name="bracelet-material">
                        <Input placeholder="e.g., Oystersteel" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Clasp" name="bracelet-clasp">
                        <Input placeholder="e.g., Oysterlock" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Color" name="bracelet-color">
                        <Input placeholder="e.g., Silver" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Clasp Material"
                        name="bracelet-clasp-material"
                      >
                        <Input placeholder="e.g., Stainless Steel" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Box & Papers Section */}
                <Card
                  type="inner"
                  title="Box & Papers"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label="Box"
                        name="c_box"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Papers"
                        name="c_paper"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Manual"
                        name="c_manual"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Warranty"
                        name="c_warranty"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Others Section */}
                <Card type="inner" title="Others" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Availability" name="is_avail">
                        <Select placeholder="Select">
                          <Option value="0">Unavailable</Option>
                          <Option value="1">Available</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Limited Edition" name="is_limited">
                        <Select placeholder="Select">
                          <Option value="0">No</Option>
                          <Option value="1">Yes</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Automatic" name="is_auto">
                        <Select placeholder="Select">
                          <Option value="0">No</Option>
                          <Option value="1">Yes</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Rate (1-5)" name="rate">
                        <InputNumber
                          min={1}
                          max={5}
                          style={{ width: '100%' }}
                          placeholder="1-5"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item label="Contact" name="a_contact">
                        <Input placeholder="e.g., +62812345678" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Additional Info" name="add_info">
                        <Input.TextArea
                          rows={3}
                          placeholder="Enter additional information"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
};
