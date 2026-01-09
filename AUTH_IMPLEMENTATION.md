# TWC Admin Panel - Authentication Implementation

## 🔐 Authentication Features

### Implemented Components:

1. **JWT Authentication**

   - Login with WordPress credentials
   - Token-based authentication
   - Automatic token refresh
   - Cookie-based session storage

2. **Protected Routes**

   - All dashboard routes protected
   - Role-based access control
   - Admin-only routes (System Settings)
   - Redirect to login when not authenticated

3. **Auth Context & Hooks**

   - `useAuth()` - Access auth state and methods
   - `useHasCapability()` - Check user capabilities
   - `useHasRole()` - Check user roles
   - `useIsAdmin()` - Check admin status

4. **API Integration**
   - Complete WordPress/WooCommerce API
   - Products, Users, Activity Logs
   - Price History, Testimonials, Posts
   - Automatic token injection in requests

## 🚀 Quick Start

### 1. Configure API Base URL

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=https://your-site.com
```

### 2. Test Credentials

Default test user (from MDX):

```
Username: testuser
Password: gq)am&z3mnGSSzWApD@HgQ(2
```

### 3. Start Development Server

```bash
yarn dev
```

## 📁 Project Structure

```
src/
├── services/
│   └── api.ts                 # API client & all endpoints
├── context/
│   └── AuthContext.tsx        # Auth state management
├── hooks/
│   └── useAuth.tsx            # Auth hooks
├── components/
│   └── ProtectedRoute.tsx     # Route protection HOC
└── pages/
    └── authentication/
        └── SignIn.tsx         # Login page (updated)
```

## 🔧 Usage Examples

### In Components:

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### API Calls:

```tsx
import { productAPI } from '../services/api';

async function loadProducts() {
  try {
    const products = await productAPI.getAll({
      per_page: 20,
      page: 1,
    });
    console.log(products);
  } catch (error) {
    console.error('Failed to load products', error);
  }
}
```

### Protected Routes:

```tsx
// Already implemented in routes.tsx
<ProtectedRoute requireAdmin={true}>
  <SystemSettingsPage />
</ProtectedRoute>
```

## 🔑 Authentication Flow

1. User enters credentials in `/auth/signin`
2. Call `login()` from `useAuth()`
3. API requests JWT token from WordPress
4. Token saved to cookie (7 days expiry)
5. Get user info from `/wp-json/wp/v2/users/me`
6. User redirected to dashboard
7. All API requests auto-include Bearer token
8. Token validated on each protected route
9. Auto-refresh on 401 errors
10. Logout clears cookies and redirects to login

## 📋 Available API Endpoints

### Authentication

- `POST /wp-json/jwt-auth/v1/token` - Login
- `POST /wp-json/jwt-auth/v1/token/validate` - Validate token
- `POST /wp-json/jwt-auth/v1/token/refresh` - Refresh token
- `GET /wp-json/wp/v2/users/me` - Current user

### User Management

- `GET /wp-json/wp/v2/users` - List users
- `POST /wp-json/wp/v2/users` - Create user
- `PUT /wp-json/wp/v2/users/:id` - Update user
- `DELETE /wp-json/wp/v2/users/:id` - Delete user

### Products (WooCommerce)

- `GET /wp-json/wc/v3/products` - List products
- `POST /wp-json/wc/v3/products` - Create product
- `PUT /wp-json/wc/v3/products/:id` - Update product
- `DELETE /wp-json/wc/v3/products/:id` - Delete product

### Activity Logs

- `GET /wp-json/simple-history/v1/events` - Get activity logs
- `GET /wp-json/simple-history/v1/stats/summary` - Activity summary

See `src/services/api.ts` for complete endpoint list.

## 🛡️ Security Features

- JWT token stored in httpOnly cookies (can be configured)
- Automatic token refresh on expiry
- 401 interceptor redirects to login
- CSRF protection via WordPress nonce
- Role-based access control
- Capability-based permissions

## 🔄 Token Refresh

Token automatically refreshes when:

- API returns 401 error
- Token is expired but refresh token valid
- Happens transparently in background

If refresh fails:

- User logged out automatically
- Redirected to login page
- Cookies cleared

## 📝 Notes

1. Requires WordPress with JWT Authentication plugin:

   - https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

2. For activity logs, install Simple History:

   - https://wordpress.org/plugins/simple-history/

3. WooCommerce required for product endpoints

4. Update `.env` with your WordPress site URL before testing

## 🧪 Testing

1. Navigate to `/auth/signin`
2. Use test credentials provided above
3. Should redirect to dashboard after login
4. Try accessing protected routes
5. Test logout functionality
6. Verify token refresh (check Network tab)

## 🐛 Troubleshooting

**Login fails with CORS error:**

- Add CORS headers to WordPress
- Or use proxy in `vite.config.ts`

**Token not persisting:**

- Check cookie settings
- Verify domain matches
- Check browser localStorage/cookies

**401 errors after login:**

- Verify WordPress JWT plugin installed
- Check token in cookie
- Validate API URL in `.env`
