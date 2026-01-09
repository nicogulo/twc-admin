import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Input,
  Modal,
  Tag,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageHeader, BrandForm } from '../../../components';
import { brandAPI, productAPI } from '../../../services/api';
import type { ColumnsType } from 'antd/es/table';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: {
    src: string;
    alt?: string;
  };
  count: number;
  menu_order?: number;
}

interface Product {
  id: number;
  name: string;
  regular_price: string;
  stock_status: string;
}

// Drag Handle Component - only this will be draggable
const DragHandle: React.FC<{ id: number }> = ({ id }) => {
  const { attributes, listeners, setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ cursor: 'grab', padding: '8px', display: 'inline-block' }}
    >
      <HolderOutlined style={{ color: '#999', fontSize: 16 }} />
    </div>
  );
};

// Sortable Row Component
const SortableRow: React.FC<any> = (props) => {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return <tr {...props} ref={setNodeRef} style={style} />;
};

export const BrandManagementPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isSorting, setIsSorting] = useState(false);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Load brands when debounced search text or pagination changes
  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, debouncedSearchText]);

  // Reset to page 1 when search text changes
  useEffect(() => {
    if (debouncedSearchText !== searchText) {
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await brandAPI.getAll({
        page: pagination.current,
        per_page: pagination.pageSize,
        search: debouncedSearchText,
      });

      const dataOrdered = response.data.sort((a: Brand, b: Brand) => {
        const orderA = a.menu_order || 0;
        const orderB = b.menu_order || 0;
        return orderA - orderB;
      });

      setBrands(dataOrdered);

      // Get total from headers
      const total = parseInt(response.headers['x-wp-total'] || '0', 10);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error: any) {
      console.error('Failed to load brands:', error);
      message.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setDebouncedSearchText(searchText);
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setModalVisible(true);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Handle image upload if present
      if (values.imageFile) {
        const formData = new FormData();
        formData.append('file', values.imageFile);
        const mediaResponse = await productAPI.uploadMedia(formData);
        values.image = {
          src: mediaResponse.source_url,
          alt: values.name,
        };
        delete values.imageFile;
      }

      // Check for duplicate menu_order
      const newMenuOrder = values.menu_order || 0;

      // Fetch all brands to check for conflicts
      const allBrandsResponse = await brandAPI.getAll({ per_page: 100 });
      const allBrands = allBrandsResponse.data;

      // Find brands with the same or higher menu_order (excluding the current brand if editing)
      const conflictingBrands = allBrands.filter((brand: Brand) => {
        const isSameBrand = selectedBrand && brand.id === selectedBrand.id;
        const hasConflict = (brand.menu_order || 0) >= newMenuOrder;
        return !isSameBrand && hasConflict;
      });

      // If there are conflicting brands, increment their menu_order
      if (conflictingBrands.length > 0) {
        const updates = conflictingBrands.map((brand: Brand) => ({
          id: brand.id,
          menu_order: (brand.menu_order || 0) + 1,
        }));

        // Batch update conflicting brands
        await brandAPI.batch({ update: updates });
      }

      // Now save the current brand
      if (selectedBrand) {
        await brandAPI.update(selectedBrand.id, values);
        message.success('Brand updated successfully');
      } else {
        await brandAPI.create(values);
        message.success('Brand created successfully');
      }

      setModalVisible(false);
      loadBrands();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      message.error(error.response?.data?.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await brandAPI.delete(id);
      message.success('Brand deleted successfully');
      loadBrands();
    } catch (error: any) {
      console.error('Failed to delete brand:', error);
      message.error(error.response?.data?.message || 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = async (brand: Brand) => {
    setSelectedBrand(brand);
    setProductsModalVisible(true);
    setLoading(true);
    try {
      const response = await productAPI.getAll({
        brand: brand.id,
        per_page: 100,
      });
      setBrandProducts(response.data);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = brands.findIndex((item) => item.id === active.id);
    const newIndex = brands.findIndex((item) => item.id === over.id);

    const newBrands = arrayMove(brands, oldIndex, newIndex);
    setBrands(newBrands);

    // Update menu_order for all affected brands
    setIsSorting(true);
    try {
      const updates = newBrands.map((brand, index) => ({
        id: brand.id,
        menu_order: index + 1,
      }));

      await brandAPI.batch({
        update: updates,
      });

      message.success('Brand order updated successfully');
      loadBrands();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      message.error('Failed to update brand order');
      loadBrands(); // Reload to restore original order
    } finally {
      setIsSorting(false);
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: '',
      key: 'drag',
      width: 50,
      render: (_, record) => <DragHandle id={record.id} />,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: any) =>
        image?.src ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            No Image
          </div>
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span dangerouslySetInnerHTML={{ __html: text }} />
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
    },
    {
      title: 'Order',
      dataIndex: 'menu_order',
      key: 'menu_order',
      width: 80,
      align: 'center' as const,
      sorter: (a, b) => (a.menu_order || 0) - (b.menu_order || 0),
      render: (order: number) => order || 0,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
      render: (text: string) =>
        text ? <span dangerouslySetInnerHTML={{ __html: text }} /> : '-',
    },
    {
      title: 'Products',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,

      render: (_, record: Brand) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewProducts(record)}
            title="View Products"
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this brand?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const productColumns: ColumnsType<Product> = [
    {
      title: 'Product ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span dangerouslySetInnerHTML={{ __html: text }} />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'regular_price',
      key: 'regular_price',
      render: (price: string) =>
        price ? `Rp ${parseFloat(price).toLocaleString('id-ID')}` : '-',
    },
    {
      title: 'Stock Status',
      dataIndex: 'stock_status',
      key: 'stock_status',
      render: (status: string) => {
        const color =
          status === 'instock'
            ? 'green'
            : status === 'outofstock'
              ? 'red'
              : 'orange';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Brand Management"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Brands' }]}
      />

      <Card>
        <Space
          style={{
            marginBottom: 16,
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Input
              placeholder="Search brands..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
            <Button onClick={handleSearch}>Search</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Brand
          </Button>
        </Space>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={brands.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={columns}
              dataSource={brands}
              rowKey="id"
              loading={loading || isSorting}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} brands`,
                onChange: (page, pageSize) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize,
                  }));
                },
              }}
              components={{
                body: {
                  row: SortableRow,
                },
              }}
            />
          </SortableContext>
        </DndContext>
      </Card>

      <BrandForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={selectedBrand}
        isEditMode={!!selectedBrand}
        loading={loading}
      />

      <Modal
        title={`Products in "${selectedBrand?.name}" Brand`}
        open={productsModalVisible}
        onCancel={() => setProductsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={productColumns}
          dataSource={brandProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </>
  );
};
