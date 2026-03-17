/**
 * SHOPIFY ROUTING MAP:
 * /                    → templates/index.liquid
 * /collections/:handle → templates/collection.liquid
 * /products/:handle    → templates/product.liquid
 * /cart                → templates/cart.liquid (TODO)
 * /pages/:handle       → templates/page.liquid (TODO)
 * /account/*           → templates/customers/*.liquid
 *
 * Note: Shopify uses /products/ (plural), not /product/
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import TermsPage from "./pages/TermsPage.tsx";
import ReturnsPage from "./pages/ReturnsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import HelpCenterPage from "./pages/HelpCenterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import AccountPage from "./pages/AccountPage.tsx";
import OrderDetailPage from "./pages/OrderDetailPage.tsx";

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
        <Route path="/policies/terms-of-service" element={<TermsPage />} />
        <Route path="/policies/refund-policy" element={<ReturnsPage />} />
        <Route path="/policies/privacy-policy" element={<PrivacyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/account/login" element={<LoginPage />} />
        <Route path="/account/register" element={<RegisterPage />} />
        <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />
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
