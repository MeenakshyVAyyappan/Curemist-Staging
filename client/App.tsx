import "./global.css";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";

import { CartProvider } from "@/lib/cart";
import { AuthProvider, useAuth } from "@/lib/auth";

import Preloader from "@/components/Preloader";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";

import Index from "./pages/Index";
import Blog from "./pages/blog";
import BlogDetail from "./pages/blogdetails";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import Profile from "./pages/profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ContactUs from "./pages/contact";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsAndConditions from "./pages/terms-and-conditions";
import ShippingInformation from "./pages/shipping-information";
import ProductDetailsPage from "./pages/product-details";

// Admin Components
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminCoupons from "./pages/admin/Coupons";
import AdminLogin from "./pages/admin/Login";

const queryClient = new QueryClient();

/* ---------------- ROUTE WRAPPER ---------------- */

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    const pendingJson = window.localStorage.getItem("pendingCartItem");
    if (!pendingJson) return;

    try {
      const pending = JSON.parse(pendingJson) as { redirectTo?: string };
      if (pending?.redirectTo && pending.redirectTo !== location.pathname) {
        navigate(pending.redirectTo, { replace: true });
      }
    } catch (err) {
      console.error("Unable to parse pending cart redirect:", err);
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (firstLoad.current) {
      firstLoad.current = false;
      timer = setTimeout(() => setLoading(false), 2000);
    } else {
      setLoading(true);
      timer = setTimeout(() => setLoading(false), 1200);
    }

    // Handle Supabase Auth Redirects (Email Verification, Password Reset)
    if (location.hash) {
      const params = new URLSearchParams(location.hash.substring(1));
      const type = params.get("type");
      const accessToken = params.get("access_token");

      if (type === "signup" && accessToken && user) {
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified. Welcome!",
        });
        navigate("/?welcome=true", { replace: true });
      }

      if (type === "recovery") {
        toast({
          title: "Password Reset",
          description: "Please set a new password.",
        });
        if (location.pathname !== "/reset-password") {
          navigate("/reset-password" + location.hash, { replace: true });
        }
      }
    }

    return () => clearTimeout(timer);
  }, [location, user, navigate]);

  const hideWhatsApp = ["/login", "/checkout"].includes(location.pathname);
  const hideWhatsAppOnMobile = location.pathname.startsWith("/product/");

  return (
    <>
      {loading && <Preloader />}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/shipping-information" element={<ShippingInformation />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideWhatsApp && <WhatsAppButton hideOnMobile={hideWhatsAppOnMobile} />}
    </>
  );
}

/* ---------------- APP ROOT ---------------- */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <CartDrawer />
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
