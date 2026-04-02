import { ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate("/cart");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white overflow-hidden p-0 border-l border-gray-200">
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold font-Montserrat text-brand-blue">
            <ShoppingCart className="w-5 h-5" />
            Your Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </SheetTitle>
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
                <div key={item.id} className="flex gap-4 font-Montserrat">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md border border-gray-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-blue text-sm line-clamp-2">{item.title}</h3>
                      {item.size && <p className="text-xs text-gray-500 mt-1">{item.size}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-sm font-medium min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-brand-blue">₹{item.price * item.quantity}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:underline mt-1"
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
          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4 font-Montserrat">
            <div className="flex items-center justify-between text-lg font-bold text-brand-blue">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <p className="text-xs text-gray-500 text-center">Shipping & taxes calculated at checkout</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleViewCart}
                className="w-full py-3 px-4 bg-white border-2 border-brand-blue text-brand-blue rounded-md font-bold hover:bg-gray-50 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-brand-yellow text-brand-blue rounded-md font-bold hover:bg-brand-yellow/90 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
