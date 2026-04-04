import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  dob: string;
}

interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function Checkout() {
  const { items, subtotal, clearCart, appliedCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string>("");
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sex: "",
    dob: "",
  });

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  // Billing Address
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({ ...prev, email: user.email || "" }));

      // Fetch Profile
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setCustomerInfo({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            sex: data.sex || "",
            dob: data.dob || "",
          });

          if (data.default_address_id) {
            const { data: defAddr } = await supabase
              .from("user_addresses")
              .select("*")
              .eq("id", data.default_address_id)
              .single();
            if (defAddr) {
              handleAddressSelect(defAddr);
            }
          }
        }
      };

      // Fetch Addresses
      const fetchAddresses = async () => {
        const { data } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .limit(3);
        if (data) setSavedAddresses(data);
      };

      fetchProfile();
      fetchAddresses();

      // Real-time subscription to profile changes
      const subscription = supabase
        .channel(`profile:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            // Refetch profile when it changes
            fetchProfile();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  // Intersection Observer for sticky button
  useEffect(() => {
    const payButton = document.getElementById('main-pay-button');
    if (!payButton) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyButton(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    observer.observe(payButton);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleAddressSelect = (addr: Address) => {
    setShippingAddress(addr);
    setSelectedAddressId(addr.id || null);
  };

  // Tax, Discount and Shipping Calculation
  // Calculate MRP (Incl 5% GST) - sum of all original prices
  const mrpTotal = items.reduce((sum, item) => {
    const itemOriginalPrice = item.originalPrice || item.price;
    return sum + itemOriginalPrice * item.quantity;
  }, 0);

  // Calculate 5% discount amount (difference between MRP and offer price)
  const discountAmount = Math.round(mrpTotal - subtotal);

  // GST is already included in the subtotal (offer price)
  const gstAmount = Math.round(subtotal * 0.05);
  const shippingFee = 0; // Free shipping for all orders

  // Coupon Discount
  const couponDiscount = appliedCoupon?.discount || 0;

  const totalPrice = Math.max(0, Math.round(subtotal - couponDiscount));

  // Create pending order with items in Supabase
  const createPendingOrder = async () => {
    if (!user) {
      console.error("No user found when creating order");
      return null;
    }

    const orderData: any = {
      user_id: user.id,
      customer_info: customerInfo,
      shipping_address: shippingAddress,
      billing_address: sameAsBilling ? shippingAddress : billingAddress,
      subtotal,
      mrp_total: mrpTotal,
      discount_amount: discountAmount,
      coupon_discount: couponDiscount,
      shipping_fee: shippingFee,
      gst_amount: gstAmount,
      total_price: totalPrice,
      payment_status: "pending",
      payment_method: "razorpay",
      order_status: "payment_processing",
    };

    // Save address if non-selected and < 3 saved addresses
    if (!selectedAddressId && savedAddresses.length < 3) {
      const { data: existingAddresses } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("street", shippingAddress.street)
        .eq("city", shippingAddress.city)
        .eq("state", shippingAddress.state)
        .eq("zip", shippingAddress.zip)
        .eq("country", shippingAddress.country);

      if (!existingAddresses || existingAddresses.length === 0) {
        await supabase.from("user_addresses").insert({
          user_id: user.id,
          ...shippingAddress,
        });
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: null,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    setCurrentOrderId(order.id);
    setCurrentOrderStatus("payment_processing");
    return order;
  };

  // Save final status after Razorpay verification
  const finalizeOrderStatus = async (
    status: "paid" | "payment_failed",
    razorpayPaymentId?: string,
  ) => {
    if (!currentOrderId || !user) {
      console.error("No current order to finalize");
      return null;
    }

    const updateData: any = {
      payment_status: status === "paid" ? "paid" : "failed",
      order_status: status === "paid" ? "order received" : "payment_failed",
      razorpay_payment_id: razorpayPaymentId || null,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", currentOrderId);
    if (error) {
      console.error("Failed to finalize order status:", error);
      throw error;
    }

    setCurrentOrderStatus(updateData.order_status);

    if (status === "paid") {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        sex: customerInfo.sex,
        dob: customerInfo.dob || null,
        updated_at: new Date(),
      });

      if (profileError) console.error("Error syncing profile:", profileError);

      await clearCart();
    }

    return true;
  };

  // Razorpay payment handler
  const initiateRazorpayPayment = async () => {
    try {
      console.log("Creating Razorpay order with amount:", totalPrice);

      // 1. Create Razorpay order on server
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });

      const data = await response.json();
      console.log("Razorpay order response:", data);

      if (!response.ok) {
        console.error("Razorpay order creation failed:", data);
        if (data.error?.toLowerCase().includes("payment gateway not configured")) {
          toast({
            title: "Payment gateway not configured",
            description:
              "Server environment is missing Razorpay credentials. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and try again.",
            variant: "destructive",
          });
          setLoading(false);
          setProcessingPayment(false);
          return;
        }
        throw new Error(data.error || "Failed to create payment order");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Curemist",
        description: "Ayurvedic Wound Spray Purchase",
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            console.log("Payment successful, verifying...", response);

            // 3. Verify payment on server
            const verifyRes = await fetch("/api/verify-razorpay-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log("Verification response:", verifyData);

            if (verifyData.verified) {
              // 4. Finalize pending order
              console.log("Finalizing order status in database...");
              await finalizeOrderStatus("paid", response.razorpay_payment_id);

              toast({
                title: "Payment Successful! 🎉",
                description: "Your order has been placed successfully.",
              });
              
              // Show thank you modal
              setShowThankYouModal(true);
              
              setTimeout(() => {
                setProcessingPayment(false);
                setShowThankYouModal(false);
                navigate("/profile?tab=1");
              }, 3000);
            } else {
              await finalizeOrderStatus("payment_failed");
              toast({
                title: "Payment Verification Failed",
                description:
                  "Please contact support with payment ID: " +
                  response.razorpay_payment_id,
                variant: "destructive",
              });
            }
          } catch (err: any) {
            console.error("Payment verification error:", err);
            toast({
              title: "Error",
              description: err.message || "Failed to process payment",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}`,
        },
        theme: {
          color: "#4A0E4E",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime.",
              variant: "destructive",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        setLoading(false);
        setProcessingPayment(false);
        console.error("Payment failed:", response);

        if (currentOrderId) {
          await finalizeOrderStatus("payment_failed");
        }

        toast({
          title: "Payment Failed",
          description:
            response.error?.description ||
            "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setProcessingPayment(false);
      console.error("Razorpay error:", err);
      toast({
        title: "Payment Error",
        description: err.message || "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
      });
      navigate("/login");
      return;
    }

    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      toast({
        title: "Error",
        description: "Please fill in all shipping address fields",
      });
      return;
    }

    if (!sameAsBilling) {
      if (
        !billingAddress.street ||
        !billingAddress.city ||
        !billingAddress.state ||
        !billingAddress.zip ||
        !billingAddress.country
      ) {
        toast({
          title: "Error",
          description: "Please fill in all billing address fields",
        });
        return;
      }
    }

    try {
      await createPendingOrder();
      await initiateRazorpayPayment();
    } catch (err: any) {
      setLoading(false);
      setProcessingPayment(false);
      toast({
        title: "Payment Error",
        description: err.message || "Could not create order before payment",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-[150px] flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-brand-yellow text-brand-blue px-6 py-3 rounded font-bold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {(processingPayment || loading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Order processing, please wait...
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Do not click back or refresh. Your payment is being completed.
            </p>
            <p className="text-sm text-gray-600">
              You will be redirected to your order history automatically.
            </p>
          </div>
        </div>
      )}
      
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="mb-3 text-3xl font-bold text-green-600">
              Thank You! 🎉
            </h2>
            
            <p className="mb-2 text-lg font-semibold text-gray-900">
              Payment Successful
            </p>
            
            <p className="mb-6 text-sm text-gray-600">
              Your order has been placed successfully! We're preparing your items for shipment.
            </p>
            
            <div className="mb-6 space-y-1 rounded-lg bg-gray-50 p-4 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Order ID:</span> {currentOrderId?.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">
                We'll email you tracking information soon.
              </p>
            </div>
            
            <p className="text-xs text-gray-500">
              Redirecting to your orders in a moment...
            </p>
          </div>
        </div>
      )}
      <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-24 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-curemist-purple mb-4 md:mb-6">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handlePlaceOrder}
                onInvalidCapture={(e) => {
                  setShowErrors(true);
                  const firstInvalid = e.currentTarget.querySelector(
                    ":invalid",
                  ) as HTMLElement;
                  if (e.target === firstInvalid && firstInvalid) {
                    const headerOffset = 180;
                    const elementPosition =
                      firstInvalid.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                    firstInvalid.focus({ preventScroll: true });
                    e.preventDefault();
                  }
                }}
                className="space-y-4"
              >
                {/* Saved Addresses Selection */}
                {savedAddresses.length > 0 && (
                  <section className="bg-white rounded-lg border p-4">
                    <h2 className="text-lg font-bold text-curemist-purple mb-3">
                      Saved Addresses
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Show default address first */}
                      {(() => {
                        const defaultAddress = savedAddresses.find(addr => addr.id === selectedAddressId) || savedAddresses[0];
                        return (
                          <div
                            key="default"
                            className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === defaultAddress.id ? "border-brand-yellow bg-yellow-50" : ""}`}
                            onClick={() => handleAddressSelect(defaultAddress)}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === defaultAddress.id}
                              readOnly
                              className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                            />
                            <div className="text-sm">
                              <p className="font-semibold">{defaultAddress.street}</p>
                              <p>
                                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zip}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Show other addresses if expanded */}
                      {showAllAddresses && savedAddresses.slice(1).map((addr, idx) => (
                        <div
                          key={idx + 1}
                          className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === addr.id ? "border-brand-yellow bg-yellow-50" : ""}`}
                          onClick={() => handleAddressSelect(addr)}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddressId === addr.id}
                            readOnly
                            className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                          />
                          <div className="text-sm">
                            <p className="font-semibold">{addr.street}</p>
                            <p>
                              {addr.city}, {addr.state} - {addr.zip}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add more link */}
                      {savedAddresses.length > 1 && !showAllAddresses && (
                        <button
                          type="button"
                          onClick={() => setShowAllAddresses(true)}
                          className="text-left text-sm text-brand-yellow hover:text-brand-yellow/80 font-medium transition-colors"
                        >
                          + Add more...
                        </button>
                      )}

                      {/* Add new address option */}
                      <div
                        className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === null ? "border-brand-yellow bg-yellow-50" : ""}`}
                        onClick={() => {
                          setSelectedAddressId(null);
                          setShippingAddress({
                            street: "",
                            city: "",
                            state: "",
                            zip: "",
                            country: "",
                          });
                        }}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === null}
                          readOnly
                          className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                        />
                        <p className="text-sm font-semibold">Add New Address</p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Customer Information and Shipping Address */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <section className="bg-white rounded-lg border p-4">
                    <h2 className="text-lg font-bold text-curemist-purple mb-3">
                      Customer Information
                    </h2>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={customerInfo.firstName}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="First Name"
                            required
                          />
                          {showErrors && !customerInfo.firstName && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={customerInfo.lastName}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="Last Name"
                            required
                          />
                          {showErrors && !customerInfo.lastName && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              email: e.target.value,
                            })
                          }
                          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                          placeholder="Email Address"
                          required
                        />
                        {showErrors && !customerInfo.email && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            Required
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          minLength={10}
                          maxLength={10}
                          pattern="\d{10}"
                          value={customerInfo.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, ""); // restrict to digits
                            setCustomerInfo({ ...customerInfo, phone: val });
                          }}
                          className={`w-full border p-2 rounded focus:outline-none focus:ring-2 text-sm ${
                            showErrors &&
                            (!customerInfo.phone ||
                              customerInfo.phone.length < 10)
                              ? "border-red-500 focus:ring-red-500"
                              : "focus:ring-brand-yellow"
                          }`}
                          placeholder="Phone Number"
                          required
                        />
                        {showErrors &&
                          (!customerInfo.phone ||
                            customerInfo.phone.length < 10) && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Valid 10-digit number required
                            </p>
                          )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Gender *
                          </label>
                          <select
                            value={customerInfo.sex}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                sex: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-sm"
                            required
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {showErrors && !customerInfo.sex && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            value={customerInfo.dob}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                dob: e.target.value,
                              })
                            }
                            max="2009-12-31"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            required
                          />
                          {showErrors && !customerInfo.dob && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section className="bg-white rounded-lg border p-4">
                    <h2 className="text-lg font-bold text-curemist-purple mb-3">
                      Shipping Address
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              street: e.target.value,
                            })
                          }
                          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                          placeholder="Street Address"
                          required
                        />
                        {showErrors && !shippingAddress.street && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            Required
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City/Town *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="City/Town"
                            required
                          />
                          {showErrors && !shippingAddress.city && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.state}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                state: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="State/Province"
                            required
                          />
                          {showErrors && !shippingAddress.state && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            ZIP/Postal Code *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.zip}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                zip: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="ZIP/Postal Code"
                            required
                          />
                          {showErrors && !shippingAddress.zip && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.country}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                country: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="Country"
                            required
                          />
                          {showErrors && !shippingAddress.country && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                              Required
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Billing Address */}
                <section className="bg-white rounded-lg border p-4">
                  <h2 className="text-lg font-bold text-curemist-purple mb-3">
                    Billing Address
                  </h2>
                  <div className="mb-3 flex items-center">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                    />
                    <label
                      htmlFor="sameAddress"
                      className="ml-2 text-sm font-medium"
                    >
                      Billing address is the same as shipping address
                    </label>
                  </div>

                  {!sameAsBilling && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.street}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              street: e.target.value,
                            })
                          }
                          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                          placeholder="Street Address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City/Town *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="City/Town"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.state}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                state: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="State/Province"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            ZIP/Postal Code *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.zip}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                zip: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="ZIP/Postal Code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.country}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                country: e.target.value,
                              })
                            }
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Payment Method Selection */}
                <section className="bg-white rounded-lg border p-4">
                  <h2 className="text-lg font-bold text-curemist-purple mb-3">
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {/* Pay Online - Razorpay */}
                    <div className="border-2 rounded-lg p-3 border-[#4A0E4E] bg-purple-50 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              Pay Online
                            </h3>
                            <p className="text-xs text-gray-500">
                              UPI, Cards, Net Banking, Wallets
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-1 opacity-70">
                            <img
                              src="https://cdn.razorpay.com/static/assets/logo/payment/upi.svg"
                              alt="UPI"
                              className="h-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <img
                              src="https://cdn.razorpay.com/static/assets/logo/payment/visa.svg"
                              alt="Visa"
                              className="h-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <img
                              src="https://cdn.razorpay.com/static/assets/logo/payment/mastercard.svg"
                              alt="Mastercard"
                              className="h-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-500 mb-0.5">
                              Powered by
                            </span>
                            <img
                              src="/Razorpay/razorpaylogo.png"
                              alt="Razorpay"
                              className="h-16 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-purple-200">
                        <p className="text-xs text-gray-600">
                          ✔ Secure payment processed by Razorpay
                          <br />
                          ✔ UPI, Debit/Credit Cards, Net Banking & Wallets accepted
                          <br />✔ Instant order confirmation
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Place Order Button */}
                <button
                  id="main-pay-button"
                  type="submit"
                  disabled={loading || processingPayment}
                  className="w-full font-bold py-3 rounded-lg text-base transition-colors disabled:opacity-50 shadow-md bg-[#4A0E4E] text-white hover:bg-[#3a0b3e]"
                >
                  {loading || processingPayment
                    ? "Processing..."
                    : `Pay ₹${totalPrice} Now`}
                </button>

                {currentOrderId &&
                  (currentOrderStatus === "payment_failed" ||
                    currentOrderStatus === "payment_processing") && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true);
                        setProcessingPayment(true);
                        initiateRazorpayPayment();
                      }}
                      className="w-full mt-2 font-semibold py-2 rounded-lg text-sm transition-colors shadow-md bg-amber-500 text-white hover:bg-amber-600"
                    >
                      Retry Payment
                    </button>
                  )}
              </form>

              {/* Sticky Pay Button for Mobile */}
              {showStickyButton && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Total: ₹{totalPrice}</span>
                    <span className="text-green-600 text-xs">Free Shipping</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) {
                        toast({
                          title: "Error",
                          description: "You must be logged in to place an order.",
                        });
                        navigate("/login");
                        return;
                      }
                      handlePlaceOrder(e as any);
                    }}
                    disabled={loading || processingPayment}
                    className="w-full font-bold py-3 rounded-lg text-base transition-colors disabled:opacity-50 shadow-md bg-[#4A0E4E] text-white hover:bg-[#3a0b3e]"
                  >
                    {loading || processingPayment
                      ? "Processing..."
                      : `Pay ₹${totalPrice} Now`}
                  </button>
                </div>
              )}

              {/* Add padding bottom for mobile sticky button */}
              {showStickyButton && <div className="lg:hidden h-24"></div>}
            </div>

            {/* Order Summary Sidebar */}
            <aside className="bg-white rounded-lg border p-4 h-fit lg:sticky lg:top-32">
              <h2 className="text-lg font-bold text-curemist-purple mb-3">
                Order Summary
              </h2>

              {/* Itemized List */}
              <div className="space-y-3 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
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
                      className="border-b pb-2 last:border-b-0"
                    >
                      <div className="font-medium text-sm mb-1">{shortTitle}</div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex justify-between">
                          <span>MRP (incl 5% GST):</span>
                          <span>₹{mrpWithGST}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>{discountPercentage}% off:</span>
                          <span>-₹{discountAmountItem}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Price:</span>
                          <span>₹{salePrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Qty:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-sm">
                          <span>Total:</span>
                          <span>₹{salePrice * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Total MRP (incl GST)</span>
                  <span>₹{Math.round(mrpTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-brand-blue">₹{Math.round(subtotal)}</span>
                </div>
                {/* Coupon Discount Display */}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-3 mb-3">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-brand-blue">
                  ₹{totalPrice}
                </span>
              </div>

              <p className="text-green-600 text-xs mb-3 text-center">
                ✔ Free shipping All Over India!
              </p>

              {/* Payment method badge */}
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-100 text-purple-800">
                  💳 Paying Online
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
