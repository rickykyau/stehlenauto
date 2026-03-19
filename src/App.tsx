/**
 * SHOPIFY ROUTING MAP:
 * /                    → templates/index.liquid
 * /collections/:handle → templates/collection.liquid
 * /products/:handle    → templates/product.liquid
 * /cart                → templates/cart.liquid (TODO)
 * /pages/:handle       → templates/page.liquid (TODO)
 * /account             → Shopify hosted account
 * /admin               → Admin panel
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useCartSync } from "@/hooks/useCartSync";
import { usePageTracking } from "@/hooks/usePageTracking";
import { initGA4 } from "@/lib/analytics";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import WarrantyPage from "./pages/WarrantyPage.tsx";
import ShopifyPolicyPage from "./pages/ShopifyPolicyPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import HelpCenterPage from "./pages/HelpCenterPage.tsx";
import AccountPage from "./pages/AccountPage.tsx";
import AccountSettingsPage from "./pages/AccountSettingsPage.tsx";
import MyOrdersPage from "./pages/MyOrdersPage.tsx";
import MyAddressesPage from "./pages/MyAddressesPage.tsx";
import MyVehiclesPage from "./pages/MyVehiclesPage.tsx";
import OrderDetailPage from "./pages/OrderDetailPage.tsx";
import ShopifyRedirect from "./components/ShopifyRedirect.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminPromoCodesPage from "./pages/admin/AdminPromoCodesPage.tsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.tsx";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder.tsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.tsx";
import AdminContentPage from "./pages/admin/AdminContentPage.tsx";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage.tsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.tsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.tsx";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage.tsx";
import AdminPromoCodeDetailPage from "./pages/admin/AdminPromoCodeDetailPage.tsx";
import AdminChatLogsPage from "./pages/admin/AdminChatLogsPage.tsx";
import AdminSupportTicketsPage from "./pages/admin/AdminSupportTicketsPage.tsx";
import ChatWidget from "./components/ChatWidget.tsx";

const queryClient = new QueryClient();

const RouterContent = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <CartDrawer />
      <Routes>
        {/* Storefront */}
        <Route path="/" element={<><AnnouncementBanner /><Index /></>} />
        <Route path="/collections/:handle" element={<><AnnouncementBanner /><CollectionPage /></>} />
        <Route path="/products/:slug" element={<><AnnouncementBanner /><ProductDetailPage /></>} />
        <Route path="/pages/warranty" element={<WarrantyPage />} />
        <Route path="/privacy-policy" element={<ShopifyPolicyPage field="privacyPolicy" fallbackTitle="Privacy Policy" />} />
        <Route path="/policies/privacy-policy" element={<ShopifyPolicyPage field="privacyPolicy" fallbackTitle="Privacy Policy" />} />
        <Route path="/terms" element={<ShopifyPolicyPage field="termsOfService" fallbackTitle="Terms of Service" />} />
        <Route path="/policies/terms-of-service" element={<ShopifyPolicyPage field="termsOfService" fallbackTitle="Terms of Service" />} />
        <Route path="/refund-policy" element={<ShopifyPolicyPage field="refundPolicy" fallbackTitle="Refund Policy" />} />
        <Route path="/policies/refund-policy" element={<ShopifyPolicyPage field="refundPolicy" fallbackTitle="Refund Policy" />} />
        <Route path="/shipping-policy" element={<ShopifyPolicyPage field="shippingPolicy" fallbackTitle="Shipping Policy" />} />
        <Route path="/policies/shipping-policy" element={<ShopifyPolicyPage field="shippingPolicy" fallbackTitle="Shipping Policy" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account/login" element={<LoginPage />} />
        <Route path="/account/register" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/settings" element={<AccountSettingsPage />} />
        <Route path="/account/orders" element={<MyOrdersPage />} />
        <Route path="/account/addresses" element={<MyAddressesPage />} />
        <Route path="/account/vehicles" element={<MyVehiclesPage />} />
        <Route path="/account/orders/:id" element={<OrderDetailPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="promo-codes" element={<AdminPromoCodesPage />} />
          <Route path="promo-codes/:id" element={<AdminPromoCodeDetailPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="audit-log" element={<AdminAuditLogPage />} />
          <Route path="chat-logs" element={<AdminChatLogsPage />} />
          <Route path="support-tickets" element={<AdminSupportTicketsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const AppInner = () => {
  useCartSync();
  useEffect(() => { initGA4(); }, []);
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <VehicleProvider>
      <CustomerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppInner />
        </TooltipProvider>
      </CustomerProvider>
    </VehicleProvider>
  </QueryClientProvider>
);

export default App;
