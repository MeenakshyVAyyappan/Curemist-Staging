import { ShoppingCart, User, LogOut, Settings, Menu, X, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

  const { setIsCartOpen } = useCart();

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
      <div className="bg-brand-blue h-[50px] overflow-hidden relative">
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

      {/* Main Navigation */}
      <div className="bg-brand-yellow h-[60px] md:h-[95px]">
        <div className="container mx-auto px-2 md:px-6 lg:px-24 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/Logo/curemist.svg"
              className="h-[28px] md:h-[62px] w-auto"
            />
          </Link>
          {/* Right Actions */}
          <div className="flex items-center gap-1.5 md:gap-6 justify-end flex-shrink-0">
            <div className="flex items-center justify-center bg-[#FDE073] border md:border-2 border-white text-[#173b75] font-bold text-[10px] sm:text-xs md:text-sm px-2 py-1 md:px-4 md:py-1.5 rounded-full shadow-sm whitespace-nowrap gap-1">
              <Award className="w-3 h-3 md:w-[18px] md:h-[18px]" />
              Patented
            </div>
            <img
              src="/Headerlogo/curemist 4.png"
              alt="CureMist Certified Logo"
              className="block h-8 sm:h-10 md:h-20 w-auto object-contain"
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

          <div className="flex flex-col gap-8 mt-8">
            <Link
              to="/blog"
              className="text-xl font-semibold text-black"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BLOG
            </Link>

            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xl font-medium text-black text-left"
              >
                <User className="w-6 h-6 flex-shrink-0" />
                <span>Login / My Account</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-brand-yellow text-black font-bold text-lg border-2 border-black rounded-full w-full h-full flex items-center justify-center box-border">
                      {user?.email?.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xl font-medium">My Profile</span>
                </div>
                <div className="pl-14 flex flex-col gap-6">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 text-black text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-6 h-6" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-red-500 text-lg font-medium text-left"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xl font-medium text-black text-left"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>
                <CartCount />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Render Profile Popup if visible */}
    </header>
  );
}
