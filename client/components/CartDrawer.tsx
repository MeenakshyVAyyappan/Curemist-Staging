import { ShoppingCart, X, Plus, Minus, Ticket, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQty, removeItem, subtotal, appliedCoupon, setAppliedCoupon } =
    useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

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

  useEffect(() => {
    if (isCartOpen) {
      fetchAvailableCoupons();
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(user ? "/checkout" : "/checkout?guest=true");
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;
    setIsApplying(true);

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (data) {
        let discount = 0;
        if (data.discount_percentage) {
          discount = Math.round(subtotal * data.discount_percentage);
        } else if (data.discount_amount) {
          discount = data.discount_amount;
        }
        setAppliedCoupon({ code: code.trim().toUpperCase(), discount });
        setCouponCode("");
        toast({
          title: "Coupon Applied!",
          description: `You saved ₹${discount}`,
        });
      } else {
        setAppliedCoupon(null);
        toast({
          title: "Invalid Coupon",
          description: "Please check the code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Coupon error:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
    });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white overflow-hidden p-0 border-l border-gray-200">
        <SheetHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold font-Montserrat text-brand-blue">
              <ShoppingCart className="w-5 h-5" />
              Your Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 font-Montserrat">
              <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-brand-blue font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 font-Montserrat group">
                  <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-brand-blue text-sm line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size}
                      </p>
                    )}
                    
                    <div className="flex items-end justify-between mt-auto pb-1">
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brand-blue hover:bg-white rounded disabled:opacity-30 transition-all"
                          onClick={() =>
                            updateQty(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-brand-blue">
                          {item.quantity}
                        </span>
                        <button
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brand-blue hover:bg-white rounded transition-all"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-400 mb-0.5">Price</div>
                        <span className="font-bold text-brand-blue text-lg leading-none">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] font-bold text-red-500/80 hover:text-red-500 uppercase tracking-tighter mt-2 flex items-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white space-y-5 font-Montserrat">
            {/* Coupon Code Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Ticket className="w-3 h-3" />
                Have a coupon?
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplying || !couponCode}
                  className="h-11 px-6 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[80px]"
                >
                  {isApplying ? "..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs font-medium text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Coupon "{appliedCoupon.code}" applied (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-red-500 font-bold hover:underline px-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available Coupons List */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Available Offers</p>
                  <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {availableCoupons.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-brand-blue/30 transition-all group">
                        <div>
                          <p className="text-xs font-bold text-brand-blue">{c.code}</p>
                          <p className="text-[10px] text-gray-500">
                            {c.discount_percentage
                              ? `${(c.discount_percentage * 100).toFixed(0)}% off`
                              : `Flat ₹${c.discount_amount} off`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyCoupon(c.code)}
                          className="text-[10px] font-bold text-brand-blue hover:text-white hover:bg-brand-blue px-3 py-1 rounded-full border border-brand-blue/30 transition-all"
                        >
                          Use Code
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleCheckout}
                className="w-full h-14 bg-brand-yellow text-brand-blue rounded-xl font-bold hover:bg-brand-yellow/90 transition-all flex items-center justify-between px-6 shadow-lg shadow-brand-yellow/20 group"
              >
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] opacity-70 uppercase tracking-[0.1em] mb-0.5">Total Amount</span>
                  <span className="text-xl font-extrabold flex items-baseline">
                    ₹{subtotal - (appliedCoupon?.discount || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">Buy Now</span>
                  <div className="bg-brand-blue/10 p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </SheetContent>

    </Sheet>
  );
}
