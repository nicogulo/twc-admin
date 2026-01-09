import { createBrowserRouter, useLocation } from 'react-router-dom';
import {
  AccountDeactivePage,
  Error400Page,
  Error403Page,
  Error404Page,
  Error500Page,
  Error503Page,
  ErrorPage,
  PasswordResetPage,
  SignInPage,
  SignUpPage,
  VerifyEmailPage,
  WelcomePage,
} from '../pages';
import { ProductListPage } from '../pages/products';
import { ProductDetailPage } from '../pages/products/ProductDetail';
import { ProductWooCommerceFormPage } from '../pages/products/ProductWooCommerceForm';
import { BrandManagementPage } from '../pages/products/BrandManagement';
import { DashboardLayout } from '../layouts';
import React, { ReactNode, useEffect } from 'react';
import { HomepageSettingsPage } from '../pages/homepage/HomepageSettingsPage';
import { AboutUsSettingsPage } from '../pages/aboutus/AboutUsSettingsPage';
import { SystemSettingsPage } from '../pages/system/SystemSettingsPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Custom scroll restoration function
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    }); // Scroll to the top when the location changes
  }, [pathname]);

  return null; // This component doesn't render anything
};

type PageProps = {
  children: ReactNode;
};

// Create an HOC to wrap your route components with ScrollToTop
const PageWrapper = ({ children }: PageProps) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};

// Create the router - TWC Admin Panel Routes
const router = createBrowserRouter([
  // Root Route - Dashboard (Protected)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  // Homepage Settings Route (Protected)
  {
    path: '/homepage',
    element: (
      <ProtectedRoute>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomepageSettingsPage />,
      },
    ],
  },
  // Product Management Routes (Protected)
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <ProductListPage />,
      },
      {
        path: 'add',
        element: <ProductWooCommerceFormPage />,
      },
      {
        path: 'edit/:id',
        element: <ProductWooCommerceFormPage />,
      },
      {
        path: ':id',
        element: <ProductDetailPage />,
      },
    ],
  },
  // Brand Management Route (Protected)
  {
    path: '/brands',
    element: (
      <ProtectedRoute>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <BrandManagementPage />,
      },
    ],
  },
  // About Us Settings Route (Protected)
  {
    path: '/about',
    element: (
      <ProtectedRoute>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AboutUsSettingsPage />,
      },
    ],
  },
  // System Settings Route (Protected - Admin Only)
  {
    path: '/system',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <PageWrapper children={<DashboardLayout />} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <SystemSettingsPage />,
      },
    ],
  },
  // Authentication Routes
  {
    path: '/auth',
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'password-reset',
        element: <PasswordResetPage />,
      },
      {
        path: 'account-delete',
        element: <AccountDeactivePage />,
      },
    ],
  },
  {
    path: 'errors',
    errorElement: <ErrorPage />,
    children: [
      {
        path: '400',
        element: <Error400Page />,
      },
      {
        path: '403',
        element: <Error403Page />,
      },
      {
        path: '404',
        element: <Error404Page />,
      },
      {
        path: '500',
        element: <Error500Page />,
      },
      {
        path: '503',
        element: <Error503Page />,
      },
    ],
  },
]);

export default router;
