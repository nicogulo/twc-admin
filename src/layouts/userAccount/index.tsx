import { AppLayout } from '../app';
import {
  Col,
  Descriptions,
  DescriptionsProps,
  Image,
  Row,
  theme,
  Typography,
  Avatar,
  Spin,
} from 'antd';
import { Card } from '../../components';
import { Outlet } from 'react-router-dom';
import { useStylesContext } from '../../context';
import { useProfile } from '../../hooks';
import { UserOutlined } from '@ant-design/icons';

const { Link } = Typography;

import './styles.css';
import { useMemo } from 'react';

export const UserAccountLayout = () => {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const stylesContext = useStylesContext();

  // Use profile hook to get real user data
  const { profile, loading } = useProfile();

  // Generate description items from profile data
  const descriptionItems: DescriptionsProps['items'] = useMemo(() => {
    if (!profile) return [];

    const items: DescriptionsProps['items'] = [
      {
        key: 'id',
        label: 'User ID',
        children: <span>{profile.id || '-'}</span>,
      },
      {
        key: 'name',
        label: 'Name',
        children: <span>{profile.name || '-'}</span>,
      },
      {
        key: 'slug',
        label: 'Username',
        children: <span>{profile.slug || '-'}</span>,
      },
    ];

    // Add website if available
    if (profile.url) {
      items.push({
        key: 'website',
        label: 'Website',
        children: (
          <Link href={profile.url} target="_blank">
            {profile.url}
          </Link>
        ),
      });
    }

    // Add description if available
    if (profile.description) {
      items.push({
        key: 'description',
        label: 'Bio',
        children: <span>{profile.description}</span>,
        span: 2,
      });
    }

    // Add super admin badge
    if ('is_super_admin' in profile && profile.is_super_admin) {
      items.push({
        key: 'role',
        label: 'Role',
        children: (
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            Super Admin
          </span>
        ),
      });
    }

    return items;
  }, [profile]);

  if (loading) {
    return (
      <AppLayout>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Loading profile...</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout>
        <Card className="user-profile-card-nav card">
          <Row {...stylesContext?.rowProps}>
            <Col xs={24} sm={8} lg={4}>
              {profile?.avatar_urls?.['96'] ? (
                <Image
                  src={profile.avatar_urls['96']}
                  alt={`${profile.name} profile image`}
                  height="100%"
                  width="100%"
                  style={{ borderRadius }}
                  preview={false}
                />
              ) : (
                <Avatar
                  size={150}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#1890ff',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              )}
            </Col>
            <Col xs={24} sm={16} lg={20}>
              <Descriptions
                title="User Info"
                items={descriptionItems}
                column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              />
            </Col>
          </Row>
        </Card>
        <div style={{ marginTop: '1.5rem' }}>
          <Outlet />
        </div>
      </AppLayout>
    </>
  );
};
