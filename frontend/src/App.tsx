import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layouts
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AccountLayout from '@/components/layout/AccountLayout';
import SplashScreen from '@/components/common/SplashScreen';

// Storefront Pages
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';

// Auth Pages
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Account Pages
import AccountOrdersPage from '@/pages/account/OrdersPage';
import OrderDetailPage from '@/pages/account/OrderDetailPage';
import WishlistPage from '@/pages/account/WishlistPage';
import ProfilePage from '@/pages/account/ProfilePage';
import AddressesPage from '@/pages/account/AddressesPage';
import ChangePasswordPage from '@/pages/account/ChangePasswordPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminOverviewPage from '@/pages/admin/OverviewPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import CustomersPage from '@/pages/admin/CustomersPage';
import InventoryPage from '@/pages/admin/InventoryPage';
import DiscountCodesPage from '@/pages/admin/DiscountCodesPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import SettingsPage from '@/pages/admin/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SplashScreen />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(0 0% 7%)',
              color: 'hsl(0 0% 94%)',
              border: '1px solid hsl(0 0% 17%)',
              borderRadius: '0',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          }}
        />

        <Routes>
          {/* ═══ Storefront ═══ */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Account (nested) */}
            <Route element={<AccountLayout />}>
              <Route path="/account/orders" element={<AccountOrdersPage />} />
              <Route path="/account/orders/:id" element={<OrderDetailPage />} />
              <Route path="/account/wishlist" element={<WishlistPage />} />
              <Route path="/account/profile" element={<ProfilePage />} />
              <Route path="/account/addresses" element={<AddressesPage />} />
              <Route path="/account/password" element={<ChangePasswordPage />} />
            </Route>
          </Route>

          {/* ═══ Auth ═══ */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ═══ Admin ═══ */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/discount-codes" element={<DiscountCodesPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* ═══ Catch-all ═══ */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
