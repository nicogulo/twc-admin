import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider, Layout, Menu, MenuProps, SiderProps } from 'antd';
import {
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  ProductOutlined,
  HomeOutlined,
  FileTextOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components';
import { Link, useLocation } from 'react-router-dom';
import {
  PATH_PRODUCTS,
  PATH_LANDING,
  PATH_HOMEPAGE,
  PATH_BRANDS,
  PATH_ABOUT,
  PATH_SYSTEM,
} from '../../constants';
import { COLOR } from '../../App.tsx';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
};

const items: MenuProps['items'] = [
  getItem(
    <Link to={PATH_LANDING.root}>Dashboard</Link>,
    'dashboard',
    <DashboardOutlined />
  ),
  getItem(
    <Link to={PATH_HOMEPAGE.root}>Homepage Settings</Link>,
    'homepage',
    <HomeOutlined />
  ),
  getItem(
    <Link to={PATH_BRANDS.root}>Brand Management</Link>,
    'brands',
    <TagsOutlined />
  ),
  getItem('Product Management', 'products', <ShoppingOutlined />, [
    getItem(
      <Link to={PATH_PRODUCTS.list}>Product List</Link>,
      'product-list',
      <UnorderedListOutlined />
    ),
    getItem(
      <Link to={PATH_PRODUCTS.add}>Add Product</Link>,
      'product-add',
      <ProductOutlined />
    ),
  ]),
  getItem(
    <Link to={PATH_ABOUT.root}>About Us Page</Link>,
    'about',
    <FileTextOutlined />
  ),
  getItem(
    <Link to={PATH_SYSTEM.root}>System Settings</Link>,
    'system',
    <SettingOutlined />
  ),
];

const rootSubmenuKeys = ['products'];

type SideNavProps = SiderProps;

const SideNav = ({ ...others }: SideNavProps) => {
  const nodeRef = useRef(null);
  const { pathname } = useLocation();
  const [openKeys, setOpenKeys] = useState(['']);
  const [current, setCurrent] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  useEffect(() => {
    const paths = pathname.split('/');
    setOpenKeys(paths);
    setCurrent(paths[paths.length - 1]);
  }, [pathname]);

  return (
    <Sider ref={nodeRef} breakpoint="lg" collapsedWidth="0" {...others}>
      <Logo
        color="blue"
        asLink
        href={PATH_LANDING.root}
        justify="center"
        gap="small"
        imgSize={{ h: 28, w: 28 }}
        style={{ padding: '1rem 0' }}
        withLogo={false}
      />
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'none',
              itemSelectedBg: COLOR['100'],
              itemHoverBg: COLOR['50'],
              itemSelectedColor: COLOR['600'],
            },
          },
        }}
      >
        <Menu
          mode="inline"
          items={items}
          onClick={onClick}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={[current]}
          style={{ border: 'none' }}
        />
      </ConfigProvider>
    </Sider>
  );
};

export default SideNav;
