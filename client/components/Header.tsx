import { ShoppingCart, User, LogOut, Settings, Menu, X, Award } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

// Cart Count Component
function CartCount() {
  const { count } = useCart();
  return <span>Cart ({count})</span>;
}

export default function Header() {
  // State for showing/hiding profile popup
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // auth
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isProductDetailsPage = location.pathname.startsWith("/product/");
  const { setIsCartOpen } = useCart();

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle logout
  const handleLogout = () => {
    signOut();
    setShowProfileMenu(false);
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Top Scrolling Banner */}
      {location.pathname === "/" && (
        <div className={`bg-brand-blue h-[50px] overflow-hidden relative ${isProductDetailsPage ? "hidden md:block" : ""}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="marquee-track">
            <div className="marquee-content">
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
            </div>

            {/* DUPLICATE for seamless loop */}
            <div className="marquee-content">
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
              <span>
                Instant Film Protection. 3x Faster Healing. 100% Ayurvedic Care
                •
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Navigation */}
      <div className="bg-brand-yellow h-[60px] md:h-[95px]">
        <div className="container mx-auto px-2 md:px-6 lg:px-24 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center flex-shrink-0">
            <img
              src="/Logo/curemist.svg"
              className="h-[28px] md:h-[62px] w-auto"
            />
          </Link>
          {/* Right Actions */}
          <div className="flex items-center gap-1.5 md:gap-6 justify-end flex-shrink-0">
            {/* Hide Patented badge and logo on mobile */}
            <div className="flex items-center justify-center gap-1 bg-[#FDE073] border border-white md:border-2 text-[#173b75] font-bold text-[8px] sm:text-lg md:text-sm px-2 py-1 rounded-full shadow-sm whitespace-nowrap min-w-fit leading-none">
          <Award className="w-2.5 h-2.5 md:w-[18px] md:h-[18px] shrink-0" />
           <span className="leading-none">Patented</span>
           </div>
            <img
              src="/Headerlogo/curemist 4.png"
              alt="CureMist Certified Logo"
              className="hidden sm:block h-8 sm:h-10 md:h-20 w-auto object-contain"
            />

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/blog"
                className="flex items-center text-black text-sm font-semibold hover:opacity-80"
              >
                BLOG
              </Link>
              {/* Profile Button / Login.... */}
              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center gap-0.5 text-black text-sm font-medium hover:opacity-80 flex-shrink-0"
                >
                  <User className="w-[17px] h-[22px] flex-shrink-0" />
                  <span className="text-sm">Login</span>
                </Link>
              ) : (
                <div
                  className="flex items-center gap-3 relative flex-shrink-0"
                  ref={profileMenuRef}
                >
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 text-black text-sm font-medium hover:opacity-80"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-brand-yellow text-black font-bold text-sm border-2 border-black rounded-full w-full h-full flex items-center justify-center box-border">
                        {user?.email?.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">My Profile</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-black text-sm font-medium hover:bg-brand-yellow rounded-t-lg transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-b-lg transition-colors border-t border-gray-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1 text-black text-sm font-medium hover:opacity-80 flex-shrink-0"
              >
                <ShoppingCart className="w-[26px] h-[23px]" />
                <span className="text-sm">
                  <CartCount />
                </span>
              </button>
            </div>

            {/* Mobile Header Actions (Login/Profile & Cart) */}
            <div className="md:hidden flex items-center gap-3">
              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-black p-1 hover:opacity-80"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-1 text-black p-1 hover:opacity-80"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-brand-yellow text-black font-bold text-xs border border-black rounded-full w-full h-full flex items-center justify-center box-border">
                      {user?.email?.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 text-black p-1 hover:opacity-80"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  <CartCount />
                </span>
              </button>
            </div>

            {/* Mobile Hamburger Menu Icon */}
            <button
              className="md:hidden flex items-center text-black p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white pt-20 px-6 flex flex-col md:hidden">
          <button
            className="absolute top-6 right-6 text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col mt-8">
            {/* Profile/Login Section */}
            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xl font-medium text-black text-left py-4 px-0"
              >
                <User className="w-6 h-6 flex-shrink-0" />
                <span>Login / My Profile</span>
              </Link>
            ) : (
              <div className="flex flex-col py-4 px-0">
                <div className="flex items-center gap-3 pb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-brand-yellow text-black font-bold text-lg border-2 border-black rounded-full w-full h-full flex items-center justify-center box-border">
                      {user?.email?.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xl font-medium">My Profile</span>
                </div>
                <div className="flex flex-col gap-0 border-l-2 border-brand-yellow pl-6">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 text-black text-lg font-medium py-3 px-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-red-500 text-lg font-medium text-left py-3 px-0"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-gray-200 my-2"></div>

            {/* Cart */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xl font-medium text-black text-left py-4 px-0"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>
                <CartCount />
              </span>
            </button>

            {/* Divider */}
            <div className="border-t-2 border-gray-200 my-2"></div>

            {/* Navigation Links */}
            <Link
              to="/blog"
              className="text-xl font-medium text-black py-4 px-0 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>

            <Link
              to="/contact"
              className="text-xl font-medium text-black py-4 px-0 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            {/* Divider */}
            <div className="border-t-2 border-gray-200 my-2"></div>

            {/* Legal Links */}
            <Link
              to="/privacy-policy"
              className="text-lg font-medium text-gray-700 py-3 px-0 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms-conditions"
              className="text-lg font-medium text-gray-700 py-3 px-0 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Terms & Conditions
            </Link>

            <Link
              to="/shipping-information"
              className="text-lg font-medium text-gray-700 py-3 px-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shipping Information
            </Link>
          </div>
        </div>
      )}

      {/* Render Profile Popup if visible */}
    </header>
  );
}
