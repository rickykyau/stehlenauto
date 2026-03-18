/**
 * SHOPIFY ROUTING MAP:
 * /                    → templates/index.liquid
 * /collections/:handle → templates/collection.liquid
 * /products/:handle    → templates/product.liquid
 * /cart                → templates/cart.liquid (TODO)
 * /pages/:handle       → templates/page.liquid (TODO)
 * /account             → Shopify hosted account
 *
 * Note: Shopify uses /products/ (plural), not /product/
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
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import WarrantyPage from "./pages/WarrantyPage.tsx";
import ShopifyPolicyPage from "./pages/ShopifyPolicyPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import HelpCenterPage from "./pages/HelpCenterPage.tsx";
import AccountPage from "./pages/AccountPage.tsx";
import OrderDetailPage from "./pages/OrderDetailPage.tsx";
import ShopifyRedirect from "./components/ShopifyRedirect.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";

const queryClient = new QueryClient();

const AppInner = () => {
  useCartSync();
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/collections/:handle" element={<CollectionPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
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
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders/:id" element={<OrderDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
