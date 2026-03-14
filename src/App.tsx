/**
 * SHOPIFY ROUTING MAP:
 * /                    → templates/index.liquid
 * /collections/:handle → templates/collection.liquid
 * /products/:handle    → templates/product.liquid
 * /cart                → templates/cart.liquid (TODO)
 * /pages/:handle       → templates/page.liquid (TODO)
 * 
 * Note: Shopify uses /products/ (plural), not /product/
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import WarrantyPage from "./pages/WarrantyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import ReturnsPage from "./pages/ReturnsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <VehicleProvider>
      <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </VehicleProvider>
  </QueryClientProvider>
);

export default App;
