import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function CartPage() {
  const {
    items,
    count,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setAvailableCoupons(data);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (data) {
      let discount = 0;
      if (data.discount_percentage) {
        discount = Math.round(subtotal * data.discount_percentage);
      } else if (data.discount_amount) {
        discount = data.discount_amount;
      }
      setCouponDiscount(discount);
      setAppliedCoupon({ code: coupon.trim().toUpperCase(), discount });
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
    } else {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      alert("Invalid coupon code");
    }
  };

  const mrpTotal = items.reduce((sum, item) => {
    const itemOriginalPrice = item.originalPrice || item.price;
    return sum + itemOriginalPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round(mrpTotal - subtotal);
  const gstAmount = Math.round(subtotal * 0.05);
  const totalPayable = Math.max(0, Math.round(subtotal - couponDiscount));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col pt-[110px] md:pt-[145px]">
        {items.length === 0 ? (
          /* ─── EMPTY CART: centered card ─── */
          <div className="flex-1 flex items-center justify-center py-16 px-4">
            <div className="w-full max-w-md">
              {/* Brand Header Strip */}
              <div className="bg-brand-blue rounded-t-2xl py-5 px-6 flex items-center justify-center">
                <img
                  src="https://curemist-website.vercel.app/Logo.png"
                  alt="CureMist"
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              {/* Card Body */}
              <div className="bg-[#FFF8EC] border border-brand-yellow rounded-b-2xl py-10 px-6 flex flex-col items-center shadow-md">
                <div className="bg-brand-yellow/20 rounded-full p-6 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 text-brand-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-brand-blue mb-2">
                  Your Cart is Empty
                </h2>
                <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                  Looks like you haven't added any
                  <br />
                  CureMist products yet.
                </p>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("product-cards");
                      if (el) {
                        const offsetTop = el.offsetTop - 120;
                        window.scrollTo({ top: offsetTop, behavior: "smooth" });
                      }
                    }, 100);
                  }}
                  className="bg-brand-yellow text-brand-blue font-bold px-10 py-3 rounded-xl hover:bg-brand-yellow/80 transition-colors text-base shadow-sm"
                >
                  Go Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── FILLED CART: 3-col grid ─── */
          <div className="container mx-auto px-4 md:px-6 lg:px-24 py-6 md:py-8">
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left: Items */}
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold">
                    Your Cart ({count} item{count !== 1 ? "s" : ""})
                  </h2>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 font-semibold border border-red-200 px-3 md:px-4 py-2 rounded flex-1 md:flex-none"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        navigate(-1);
                        setTimeout(() => {
                          const el = document.getElementById("product-cards");
                          if (el) {
                            const offsetTop = el.offsetTop - 120;
                            window.scrollTo({
                              top: offsetTop,
                              behavior: "smooth",
                            });
                          }
                        }, 100);
                      }}
                      className="text-sm bg-brand-yellow px-3 md:px-4 py-2 rounded text-brand-blue font-semibold flex-1 md:flex-none"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex flex-col md:flex-row md:items-center gap-4 border rounded p-3 md:p-4"
                    >
                      <img
                        src={it.image}
                        alt={it.title}
                        className="w-full md:w-28 h-40 md:h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{it.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {it.size}
                        </p>
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <div className="inline-flex items-center rounded-md bg-[#FFF8EC] p-2">
                            <button
                              onClick={() => updateQty(it.id, it.quantity - 1)}
                              className="px-3 py-2 text-lg text-brand-blue font-bold"
                            >
                              <FiMinus />
                            </button>
                            <div className="mx-3 bg-white px-6 py-2 rounded-md border shadow-sm">
                              {it.quantity.toString().padStart(2, "0")}
                            </div>
                            <button
                              onClick={() => updateQty(it.id, it.quantity + 1)}
                              className="px-3 py-2 text-lg text-brand-blue font-bold"
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <div className="ml-auto text-right">
                            {it.originalPrice &&
                              it.originalPrice !== it.price && (
                                <div className="text-sm text-gray-500 line-through">
                                  ₹{it.originalPrice}
                                </div>
                              )}
                            <div className="text-sm text-gray-700">
                              Price: ₹{it.price}
                            </div>
                            <div className="text-lg font-bold">
                              ₹{it.price * it.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Summary */}
              <aside className="rounded border p-4 md:p-6 bg-white">
                <h3 className="text-base md:text-lg font-semibold mb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm mb-4 pb-4 border-b max-h-96 overflow-y-auto">
                  {items.map((item) => {
                    const originalPrice = item.originalPrice || item.price;
                    const salePrice = item.price;
                    const mrpWithGST = originalPrice; // MRP already includes 5% GST

                    // Create truncated title: "CureMist Ayurvedic....{size}"
                    const shortTitle = `CureMist Ayurvedic....${item.size === "Combo" ? "Combo pack (12.5g + 25g)" : item.size}`;

                    // Determine discount percentage based on product size
                    let discountPercentage = 5; // default
                    if (item.size === "12.5 gm" || item.size === "25 gm") {
                      discountPercentage = 4;
                    } else if (item.size === "50 gm" || item.size === "Combo") {
                      discountPercentage = 5;
                    }

                    const discountAmountItem = originalPrice - salePrice;

                    return (
                      <div
                        key={item.id}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="font-medium mb-2">{shortTitle}</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>MRP (including 5% GST):</span>
                            <span>₹{mrpWithGST}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>{discountPercentage}% Discount:</span>
                            <span>-₹{discountAmountItem}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Sale Price:</span>
                            <span>₹{salePrice}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Quantity:</span>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-sm">
                            <span>Total for this item:</span>
                            <span>₹{salePrice * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Total MRP (Incl 5% GST)
                    </span>
                    <span className="font-medium">₹{Math.round(mrpTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Total Discount Amount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Total GST (5%)</span>
                    <span className="font-medium">₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Payable Amount</span>
                    <span className="font-bold text-brand-blue">
                      ₹{Math.round(subtotal)}
                    </span>
                  </div>
                </div>

                {couponDiscount > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                    <button
                      onClick={() => {
                        setCouponDiscount(0);
                        setAppliedCoupon(null);
                        setCoupon("");
                      }}
                      className="text-xs text-red-600 hover:underline font-medium mt-1"
                    >
                      Remove Coupon
                    </button>
                  </div>
                )}

                <div className="mb-4 mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Coupon Code
                    </label>
                    {availableCoupons.length > 0 && (
                      <button
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="text-xs text-brand-blue hover:underline font-medium"
                      >
                        {showCoupons ? "Hide" : "View Available Coupons"}
                      </button>
                    )}
                  </div>

                  {showCoupons && availableCoupons.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        🎉 Available Coupons:
                      </p>
                      <div className="space-y-2">
                        {availableCoupons.map((c) => (
                          <div
                            key={c.code}
                            className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 cursor-pointer hover:border-brand-blue transition-colors"
                            onClick={() => {
                              setCoupon(c.code);
                              setShowCoupons(false);
                            }}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-bold font-mono text-brand-blue">
                                {c.code}
                              </p>
                              <p className="text-xs text-gray-600">
                                {c.discount_percentage
                                  ? `${(c.discount_percentage * 100).toFixed(0)}% off`
                                  : `₹${c.discount_amount} off`}
                              </p>
                            </div>
                            <button
                              className="text-xs bg-brand-yellow text-brand-blue px-2 py-1 rounded font-semibold hover:bg-yellow-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoupon(c.code);
                                setShowCoupons(false);
                              }}
                            >
                              Use
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded text-sm"
                      placeholder="Enter coupon code"
                    />
                    <button
                      onClick={applyCoupon}
                      className="bg-brand-blue text-white px-3 md:px-4 py-2 rounded text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-green-600 text-sm font-semibold mt-2 flex items-center gap-1">
                      ✓ Coupon applied successfully!
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center border-t pt-4 mt-2">
                  <span className="font-bold text-base md:text-lg">Total</span>
                  <span className="font-bold text-base md:text-lg text-brand-blue">
                    ₹{totalPayable > 0 ? totalPayable : 0}
                  </span>
                </div>

                <p className="text-green-600 text-xs mt-2 text-center">
                  ✔ Free shipping All Over India!
                </p>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded mt-6 hover:bg-[#816306] transition-colors text-sm md:text-base"
                >
                  Checkout
                </button>
              </aside>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
