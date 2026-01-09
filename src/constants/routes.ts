// TWC Admin Panel Route Constants

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_LANDING = '/';
const ROOTS_HOMEPAGE = '/homepage';
const ROOTS_BRANDS = '/brands';
const ROOTS_PRODUCTS = '/products';
const ROOTS_ABOUT = '/about';
const ROOTS_SYSTEM = '/system';
const ROOTS_PROFILE = '/profile';
const ROOTS_AUTH = '/auth';
const ROOTS_ERRORS = '/errors';

export const PATH_LANDING = {
  root: ROOTS_LANDING,
};

export const PATH_HOMEPAGE = {
  root: ROOTS_HOMEPAGE,
};

export const PATH_BRANDS = {
  root: ROOTS_BRANDS,
};

export const PATH_PRODUCTS = {
  root: ROOTS_PRODUCTS,
  list: ROOTS_PRODUCTS,
  add: path(ROOTS_PRODUCTS, '/add'),
  edit: (id: string) => path(ROOTS_PRODUCTS, `/edit/${id}`),
};

export const PATH_ABOUT = {
  root: ROOTS_ABOUT,
};

export const PATH_SYSTEM = {
  root: ROOTS_SYSTEM,
};

export const PATH_PROFILE = {
  root: ROOTS_PROFILE,
  details: ROOTS_PROFILE,
};

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  signup: path(ROOTS_AUTH, '/signup'),
  signin: path(ROOTS_AUTH, '/signin'),
  welcome: path(ROOTS_AUTH, '/welcome'),
  verifyEmail: path(ROOTS_AUTH, '/verify-email'),
  passwordReset: path(ROOTS_AUTH, '/password-reset'),
  accountDelete: path(ROOTS_AUTH, '/account-delete'),
};

export const PATH_ERRORS = {
  root: ROOTS_ERRORS,
  error400: path(ROOTS_ERRORS, '/400'),
  error403: path(ROOTS_ERRORS, '/403'),
  error404: path(ROOTS_ERRORS, '/404'),
  error500: path(ROOTS_ERRORS, '/500'),
  error503: path(ROOTS_ERRORS, '/503'),
};
