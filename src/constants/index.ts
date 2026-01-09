// TWC Admin Panel Constants

import {
  PATH_AUTH,
  PATH_LANDING,
  PATH_HOMEPAGE,
  PATH_BRANDS,
  PATH_ABOUT,
  PATH_SYSTEM,
  PATH_PRODUCTS,
  PATH_ERRORS,
  PATH_PROFILE,
} from './routes.ts';

const HOMEPAGE_ITEMS = [
  { title: 'Homepage Settings', path: PATH_HOMEPAGE.root },
];

const BRAND_ITEMS = [{ title: 'Brand Management', path: PATH_BRANDS.root }];

const PRODUCT_ITEMS = [
  { title: 'Product List', path: PATH_PRODUCTS.list },
  { title: 'Add Product', path: PATH_PRODUCTS.add },
];

const ABOUT_ITEMS = [{ title: 'About Us Page', path: PATH_ABOUT.root }];

const SYSTEM_ITEMS = [{ title: 'System Settings', path: PATH_SYSTEM.root }];

const USER_PROFILE_ITEMS = [{ title: 'details', path: PATH_PROFILE.details }];

const AUTH_ITEMS = [
  { title: 'sign in', path: PATH_AUTH.signin },
  { title: 'sign up', path: PATH_AUTH.signup },
  { title: 'welcome', path: PATH_AUTH.welcome },
  { title: 'verify email', path: PATH_AUTH.verifyEmail },
  { title: 'password reset', path: PATH_AUTH.passwordReset },
  { title: 'account delete', path: PATH_AUTH.accountDelete },
];

const ERROR_ITEMS = [
  { title: 'error 400', path: PATH_ERRORS.error400 },
  { title: 'error 403', path: PATH_ERRORS.error403 },
  { title: 'error 404', path: PATH_ERRORS.error404 },
  { title: 'error 500', path: PATH_ERRORS.error500 },
  { title: 'error 503', path: PATH_ERRORS.error503 },
];

// Temporary dummy exports for backward compatibility (will be removed)
export const PATH_DASHBOARD = { root: '/', default: '/' };
export const PATH_CORPORATE = { root: '/about' };
export const PATH_USER_PROFILE = PATH_PROFILE;
export const PATH_GITHUB = { repo: '#' };
export const PATH_DOCS = { help: '#' };
export const PATH_ERROR = PATH_ERRORS;
export const DASHBOARD_ITEMS: any[] = [];
export const CORPORATE_ITEMS: any[] = [];
export { USER_PROFILE_ITEMS };
export const AUTHENTICATION_ITEMS = AUTH_ITEMS;

export {
  PATH_LANDING,
  PATH_HOMEPAGE,
  PATH_BRANDS,
  PATH_ABOUT,
  PATH_SYSTEM,
  PATH_PROFILE,
  PATH_PRODUCTS,
  PATH_AUTH,
  PATH_ERRORS,
  HOMEPAGE_ITEMS,
  BRAND_ITEMS,
  PRODUCT_ITEMS,
  ABOUT_ITEMS,
  SYSTEM_ITEMS,
  AUTH_ITEMS,
  ERROR_ITEMS,
};
