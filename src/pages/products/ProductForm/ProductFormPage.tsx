import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Space,
  Upload,
  Switch,
  Row,
  Col,
  Divider,
  message,
  Steps,
  DatePicker,
  Table,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProductAttribute, PricePerformanceEntry } from '../../../types';
import { PageHeader } from '../../../components';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

// Validation rules
const validateYear = (year: number | undefined): boolean => {
  if (!year) return true;
  return year >= 1900 && year <= new Date().getFullYear();
};

const validateImageFile = (file: File): boolean => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(
    file.type
  );
  const isValidSize = file.size / 1024 / 1024 < 5; // Max 5MB
  if (!isValidType) {
    message.error('Only JPG, PNG, and WEBP files are allowed');
  }
  if (!isValidSize) {
    message.error('Image must be smaller than 5MB');
  }
  return isValidType && isValidSize;
};

const validateVideoFile = (file: File): boolean => {
  const isValidType = file.type === 'video/mp4';
  const isValidSize = file.size / 1024 / 1024 < 100; // Max 100MB
  if (!isValidType) {
    message.error('Only MP4 files are allowed');
  }
  if (!isValidSize) {
    message.error('Video must be smaller than 100MB');
  }
  return isValidType && isValidSize;
};

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'id'>('en');

  // Parser function for InputNumber to handle number formatting
  const numberParser: any = (value: string | undefined) => {
    const parsed = value?.replace(/\$\s?|(,*)/g, '') || '';
    return parsed ? Number(parsed) : 0;
  };

  // Form state
  const [thumbnailFile, setThumbnailFile] = useState<UploadFile | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<UploadFile[]>([]);
  const [videoFile, setVideoFile] = useState<UploadFile | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePerformanceEntry[]>([]);

  // Mock attributes - Replace with API calls
  const [attributes, setAttributes] = useState<
    Record<string, ProductAttribute[]>
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

  const [brands, setBrands] = useState([
    { id: '1', nameEn: 'Rolex', nameId: 'Rolex' },
    { id: '2', nameEn: 'Omega', nameId: 'Omega' },
  ]);

  useEffect(() => {
    if (id) {
      loadProduct(id);
      setBrands([{ id: '1', nameEn: 'Rolex', nameId: 'Rolex' }]);
      setAttributes({});
    }
    loadAttributes();
  }, [id]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/products/${productId}`);
      // const product = await response.json();
      // form.setFieldsValue(product);
      message.info(`'Loading product...' ${productId}`);
    } catch (error) {
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadAttributes = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/attributes');
      // const data = await response.json();
      // setAttributes(data);
    } catch (error) {
      message.error('Failed to load attributes');
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      // Validate cross-field rules
      const yearOfProduction = values.yearOfProduction;
      const yearOfPurchase = values.yearOfPurchase;

      if (
        yearOfProduction &&
        yearOfPurchase &&
        yearOfPurchase < yearOfProduction
      ) {
        message.error('Year of Purchase must be >= Year of Production');
        setLoading(false);
        return;
      }

      // Prepare form data with multi-language fields
      const formData = new FormData();

      // Add all fields to formData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Add files
      if (thumbnailFile?.originFileObj) {
        formData.append('thumbnail', thumbnailFile.originFileObj);
      }

      galleryFiles.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append(`gallery_${index}`, file.originFileObj);
        }
      });

      if (videoFile?.originFileObj) {
        formData.append('video', videoFile.originFileObj);
      }

      // Add price history
      formData.append('priceHistory', JSON.stringify(priceHistory));

      // TODO: API call to save product
      // const response = await fetch(id ? `/api/products/${id}` : '/api/products', {
      //   method: id ? 'PUT' : 'POST',
      //   body: formData,
      // });

      message.success(
        id ? 'Product updated successfully' : 'Product created successfully'
      );
      navigate('/products');
    } catch (error) {
      message.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const addPriceEntry = () => {
    const newEntry: PricePerformanceEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      price: 0,
      source: '',
    };
    setPriceHistory([...priceHistory, newEntry]);
  };

  const removePriceEntry = (id: string) => {
    setPriceHistory(priceHistory.filter((entry) => entry.id !== id));
  };

  const steps = [
    {
      title: 'Status & Basic Info',
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* A. Product Status Metadata */}
          <Card title="A. Product Status Metadata" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="listingCode"
                  label="Listing Code"
                  rules={[
                    { required: true, message: 'Listing code is required' },
                    { min: 3, max: 20, message: 'Must be 3-20 characters' },
                  ]}
                >
                  <Input placeholder="e.g., TWC-001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Status is required' }]}
                  initialValue="Draft"
                >
                  <Select>
                    <Option value="Draft">Draft</Option>
                    <Option value="Published">Published</Option>
                    <Option value="Archived">Archived</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* B. Basic Info */}
          <Card title="B. Basic Information" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="brandId"
                  label="Brand"
                  rules={[{ required: true, message: 'Brand is required' }]}
                >
                  <Select placeholder="Select brand">
                    {brands.map((brand) => (
                      <Option key={brand.id} value={brand.id}>
                        {language === 'en' ? brand.nameEn : brand.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="referenceNumber" label="Reference Number">
                  <Input placeholder="e.g., 126610LN" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="modelNameEn"
                  label="Model Name (EN)"
                  rules={[
                    { required: true, message: 'Model name (EN) is required' },
                    { max: 200, message: 'Max 200 characters' },
                  ]}
                >
                  <Input placeholder="Model name in English" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modelNameId"
                  label="Model Name (ID)"
                  rules={[
                    { required: true, message: 'Model name (ID) is required' },
                    { max: 200, message: 'Max 200 characters' },
                  ]}
                >
                  <Input placeholder="Model name in Indonesian" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="watchType"
                  label="Watch Type"
                  rules={[
                    { required: true, message: 'Watch type is required' },
                  ]}
                >
                  <Select>
                    <Option value="Brand New">Brand New</Option>
                    <Option value="Pre-Owned">Pre-Owned</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="condition"
                  label="Condition"
                  rules={[{ required: true, message: 'Condition is required' }]}
                >
                  <Select>
                    <Option value="New Unworn">New Unworn</Option>
                    <Option value="Like New">Like New</Option>
                    <Option value="Very Good">Very Good</Option>
                    <Option value="Good">Good</Option>
                    <Option value="Fair">Fair</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Gender is required' }]}
                >
                  <Select>
                    <Option value="Mens watch">Mens watch</Option>
                    <Option value="Womens watch">Womens watch</Option>
                    <Option value="Unisex">Unisex</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="yearOfProduction"
                  label="Year of Production"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value && !validateYear(value)) {
                          return Promise.reject('Invalid year (1900-current)');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 2020"
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="yearOfPurchase"
                  label="Year of Purchase"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value && !validateYear(value)) {
                          return Promise.reject('Invalid year (1900-current)');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 2021"
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ max: 120, message: 'Max 120 characters' }]}
                >
                  <Input placeholder="e.g., Jakarta, Indonesia" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="descriptionEn"
                  label="Description (EN)"
                  rules={[{ max: 2000, message: 'Max 2000 characters' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Product description in English"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="descriptionId"
                  label="Description (ID)"
                  rules={[{ max: 2000, message: 'Max 2000 characters' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Product description in Indonesian"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      ),
    },
    {
      title: 'Technical Specs',
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* C. Caliber */}
          <Card title="C. Caliber" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="movementId" label="Movement">
                  <Select placeholder="Select movement" showSearch allowClear>
                    {attributes['Movement']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="caliber" label="Caliber">
                  <Input placeholder="e.g., 3235" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="powerReserve" label="Power Reserve">
                  <Input placeholder="e.g., 70 hours" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="numberOfJewels" label="Number of Jewels">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 31"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* D. Case */}
          <Card title="D. Case" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="caseMaterialId" label="Case Material">
                  <Select placeholder="Select material" showSearch allowClear>
                    {attributes['Case Material']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bezelMaterialId" label="Bezel Material">
                  <Select placeholder="Select material" showSearch allowClear>
                    {attributes['Bezel Material']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="caseDiameter" label="Case Diameter (mm)">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 40"
                    min={0}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="caseThickness" label="Case Thickness (mm)">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 12.5"
                    min={0}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="crystalId" label="Crystal">
                  <Select placeholder="Select crystal" showSearch allowClear>
                    {attributes['Crystal']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="waterResistance" label="Water Resistance">
                  <Input placeholder="e.g., 300m / 1000ft" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* E. Bracelet/Strap */}
          <Card title="E. Bracelet/Strap" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="braceletMaterialId" label="Bracelet Material">
                  <Select placeholder="Select material" showSearch allowClear>
                    {attributes['Bracelet Material']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="braceletColorId" label="Bracelet Color">
                  <Select placeholder="Select color" showSearch allowClear>
                    {attributes['Bracelet Color']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="claspTypeId" label="Clasp Type">
                  <Select placeholder="Select clasp type" showSearch allowClear>
                    {attributes['Clasp Type']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="claspMaterialId" label="Clasp Material">
                  <Select placeholder="Select material" showSearch allowClear>
                    {attributes['Clasp Material']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      ),
    },
    {
      title: 'Features & Media',
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* F. Functions Tagging */}
          <Card title="F. Functions Tagging" size="small">
            <Form.Item name="functionTagIds" label="Functions">
              <Select
                mode="multiple"
                placeholder="Select functions"
                showSearch
                allowClear
              >
                {attributes['Function Tags']?.map((attr) => (
                  <Option key={attr.id} value={attr.id}>
                    {language === 'en' ? attr.nameEn : attr.nameId}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {/* G. Completeness */}
          <Card title="G. Completeness" size="small">
            <Form.Item name="scopeOfDeliveryIds" label="Scope of Delivery">
              <Select
                mode="multiple"
                placeholder="Select items"
                showSearch
                allowClear
              >
                {attributes['Scope of Delivery']?.map((attr) => (
                  <Option key={attr.id} value={attr.id}>
                    {language === 'en' ? attr.nameEn : attr.nameId}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hasOriginalBox"
                  label="Original Box"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hasOriginalPapers"
                  label="Original Papers"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* H. Images/Media */}
          <Card title="H. Images & Media" size="small">
            <Form.Item
              label="Product Thumbnail"
              required
              rules={[{ required: true, message: 'Thumbnail is required' }]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                fileList={thumbnailFile ? [thumbnailFile] : []}
                beforeUpload={(file) => {
                  if (validateImageFile(file)) {
                    setThumbnailFile({
                      uid: file.uid,
                      name: file.name,
                      status: 'done',
                      url: URL.createObjectURL(file),
                      originFileObj: file,
                    });
                  }
                  return false;
                }}
                onRemove={() => setThumbnailFile(null)}
              >
                {!thumbnailFile && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                JPG, PNG, or WEBP. Max 5MB. Min 800x800px.
              </div>
            </Form.Item>

            <Form.Item label="Gallery Images (Max 20)">
              <Upload
                listType="picture-card"
                multiple
                maxCount={20}
                fileList={galleryFiles}
                beforeUpload={(file) => {
                  if (validateImageFile(file) && galleryFiles.length < 20) {
                    const newFile: UploadFile = {
                      uid: file.uid,
                      name: file.name,
                      status: 'done',
                      url: URL.createObjectURL(file),
                      originFileObj: file,
                    };
                    setGalleryFiles([...galleryFiles, newFile]);
                  }
                  return false;
                }}
                onRemove={(file) => {
                  setGalleryFiles(
                    galleryFiles.filter((f) => f.uid !== file.uid)
                  );
                }}
              >
                {galleryFiles.length < 20 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                Drag to reorder images. Max 20 images.
              </div>
            </Form.Item>

            <Form.Item label="Product Video (Optional)">
              <Upload
                maxCount={1}
                fileList={videoFile ? [videoFile] : []}
                beforeUpload={(file) => {
                  if (validateVideoFile(file)) {
                    setVideoFile({
                      uid: file.uid,
                      name: file.name,
                      status: 'done',
                      url: URL.createObjectURL(file),
                      originFileObj: file,
                    });
                  }
                  return false;
                }}
                onRemove={() => setVideoFile(null)}
              >
                <Button icon={<UploadOutlined />}>Upload Video</Button>
              </Upload>
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                MP4 format only. Max 100MB.
              </div>
            </Form.Item>
          </Card>

          {/* I. Additional Info */}
          <Card title="I. Additional Information" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="dialId" label="Dial">
                  <Select placeholder="Select dial" showSearch allowClear>
                    {attributes['Dial']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dialNumeralsId" label="Dial Numerals">
                  <Select placeholder="Select numerals" showSearch allowClear>
                    {attributes['Dial Numerals']?.map((attr) => (
                      <Option key={attr.id} value={attr.id}>
                        {language === 'en' ? attr.nameEn : attr.nameId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isLimitedEdition"
                  label="Limited Edition"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.isLimitedEdition !==
                    currentValues.isLimitedEdition
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('isLimitedEdition') ? (
                      <Form.Item
                        name="limitedEditionNumber"
                        label="Edition Number"
                      >
                        <Input placeholder="e.g., 123/500" />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      ),
    },
    {
      title: 'Pricing',
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* J. Price Performance */}
          <Card title="J. Current Price" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="currentPrice"
                  label="Price"
                  rules={[{ required: true, message: 'Price is required' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 150000000"
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={numberParser}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: 'Currency is required' }]}
                  initialValue="IDR"
                >
                  <Select>
                    <Option value="IDR">IDR</Option>
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                    <Option value="SGD">SGD</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            title="Price Performance History (Max 240 entries)"
            size="small"
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addPriceEntry}
                disabled={priceHistory.length >= 240}
              >
                Add Entry
              </Button>
            }
          >
            <Table
              dataSource={priceHistory}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  width: 200,
                  render: (_, record) => (
                    <DatePicker
                      value={
                        record.date
                          ? (new Date(record.date) as unknown as any)
                          : null
                      }
                      onChange={(date) => {
                        const updated = priceHistory.map((entry) =>
                          entry.id === record.id
                            ? { ...entry, date: date?.toISOString() || '' }
                            : entry
                        );
                        setPriceHistory(updated);
                      }}
                    />
                  ),
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  width: 200,
                  render: (_, record) => (
                    <InputNumber
                      value={record.price}
                      onChange={(value) => {
                        const updated = priceHistory.map((entry) =>
                          entry.id === record.id
                            ? { ...entry, price: value || 0 }
                            : entry
                        );
                        setPriceHistory(updated);
                      }}
                      style={{ width: '100%' }}
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={numberParser}
                    />
                  ),
                },
                {
                  title: 'Source',
                  dataIndex: 'source',
                  key: 'source',
                  render: (_, record) => (
                    <Input
                      value={record.source}
                      onChange={(e) => {
                        const updated = priceHistory.map((entry) =>
                          entry.id === record.id
                            ? { ...entry, source: e.target.value }
                            : entry
                        );
                        setPriceHistory(updated);
                      }}
                      placeholder="e.g., Chrono24"
                    />
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
                  width: 80,
                  render: (_, record) => (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePriceEntry(record.id)}
                    />
                  ),
                },
              ]}
              pagination={false}
              scroll={{ y: 400 }}
              size="small"
            />
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              Historical pricing data for trend analysis. You can also import
              CSV.
            </div>
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={id ? 'Edit Product' : 'Add Product'}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Products', path: '/products' },
          { title: id ? 'Edit' : 'Add' },
        ]}
      />

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
        >
          Back to List
        </Button>
        <Select value={language} onChange={setLanguage} style={{ width: 100 }}>
          <Option value="en">EN</Option>
          <Option value="id">ID</Option>
        </Select>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            {steps.map((step) => (
              <Step key={step.title} title={step.title} />
            ))}
          </Steps>

          <div style={{ minHeight: 400 }}>{steps[currentStep].content}</div>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
            <Space>
              {currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  {id ? 'Update Product' : 'Create Product'}
                </Button>
              )}
            </Space>
          </Space>
        </Form>
      </Card>
    </>
  );
};
