import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/pixel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CustomerInfo {
  firstName: string;
  email: string;
  phone: string;
  sex: string;
  dob: string;
}

interface Address {
  id?: string;
  full_name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function Checkout() {
  const { items, subtotal, clearCart, appliedCoupon, setAppliedCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Detect guest checkout mode from URL param
  const isGuestCheckout = !user && new URLSearchParams(window.location.search).get('guest') === 'true';

  useEffect(() => {
    // Only redirect to login if NOT logged in AND NOT guest checkout
    if (!user && !isGuestCheckout) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  }, [user, navigate, isGuestCheckout]);

  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string>("");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  // New state for redesign
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressMenuOpen, setAddressMenuOpen] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const COD_CHARGE = 50;

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    email: "",
    phone: "",
    sex: "",
    dob: "",
  });

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // Billing always same as shipping - section removed from UI
  const sameAsBilling = true;
  const [showErrors, setShowErrors] = useState(false);

  // New address form (for modal)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // Edit address state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState<Address>({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

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
      setAppliedCoupon({ code: coupon.trim().toUpperCase(), discount });
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
    } else {
      setAppliedCoupon(null);
      alert("Invalid coupon code");
    }
  };

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
      fetchAvailableCoupons();
      if (appliedCoupon?.code) {
        setCoupon(appliedCoupon.code);
      }

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
    } else if (isGuestCheckout) {
      // Guest checkout: only fetch coupons (no profile/addresses)
      fetchAvailableCoupons();
      if (appliedCoupon?.code) {
        setCoupon(appliedCoupon.code);
      }
    }
  }, [user, isGuestCheckout]);


  // Close address menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setAddressMenuOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddressSelect = (addr: Address) => {
    setShippingAddress(addr);
    setSelectedAddressId(addr.id || null);
  };

  // Tax, Discount and Shipping Calculation
  const mrpTotal = items.reduce((sum, item) => {
    const itemOriginalPrice = item.originalPrice || item.price;
    return sum + itemOriginalPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round(mrpTotal - subtotal);
  const gstAmount = Math.round(subtotal * 0.05);
  const shippingFee = 0;
  const couponDiscount = appliedCoupon?.discount || 0;
  const codCharge = paymentMethod === "cod" ? COD_CHARGE : 0;
  const totalPrice = Math.max(0, Math.round(subtotal - couponDiscount + codCharge));

  // Create pending order with items in Supabase
  const createPendingOrder = async () => {
    // For guest checkout, user can be null
    if (!user && !isGuestCheckout) {
      console.error("No user found and not guest checkout");
      return null;
    }

    const finalCustomerInfo = {
      ...customerInfo,
      firstName: customerInfo.firstName || shippingAddress.full_name || "",
      phone: customerInfo.phone || shippingAddress.phone || "",
    };

    const orderData: any = {
      user_id: user ? user.id : null,
      customer_info: finalCustomerInfo,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      subtotal,
      mrp_total: mrpTotal,
      discount_amount: discountAmount,
      coupon_discount: couponDiscount,
      cod_charge: codCharge,
      shipping_fee: shippingFee,
      gst_amount: gstAmount,
      total_price: totalPrice,
      payment_status: paymentMethod === "cod" ? "cod_pending" : "cancelled",
      payment_method: paymentMethod === "cod" ? "cod" : "razorpay",
      order_status: paymentMethod === "cod" ? "order received" : "payment_cancelled",
    };

    // Add guest_email for guest orders
    if (isGuestCheckout && customerInfo.email) {
      orderData.guest_email = customerInfo.email;
    }

    // Only save addresses for logged-in users
    if (user && !selectedAddressId && savedAddresses.length < 3) {
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
      product_id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    setCurrentOrderId(order.id);
    setCurrentOrderStatus("payment_cancelled");
    return order;
  };

  const cancelPendingOrder = async (orderId: string) => {
    if (!orderId) return;

    // Safety check: ensure we don't cancel a paid order
    const { data: order } = await supabase
      .from("orders")
      .select("payment_status, order_status")
      .eq("id", orderId)
      .single();

    if (order && (order.payment_status === "paid" || order.order_status === "payment_successful")) {
      return; 
    }

    await supabase
      .from("orders")
      .update({
        payment_status: "cancelled",
        order_status: "payment_cancelled",
      })
      .eq("id", orderId);
  };

  const finalizeOrderStatus = async (
    orderId: string,
    status: "paid" | "payment_failed",
    razorpayPaymentId?: string,
  ) => {
    if (!orderId || (!user && !isGuestCheckout)) {
      console.error("No current order to finalize");
      return null;
    }

    const updateData: any = {
      payment_status: status === "paid" ? "paid" : "failed",
      order_status: status === "paid" ? "payment_successful" : "payment_failed",
      razorpay_payment_id: razorpayPaymentId || null,
    };

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);
    if (error) {
      console.error("Failed to finalize order status:", error);
      throw error;
    }

    setCurrentOrderStatus(updateData.order_status);

    if (status === "paid") {
      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          first_name: customerInfo.firstName,
          phone: customerInfo.phone,
          updated_at: new Date(),
        });

        if (profileError) console.error("Error syncing profile:", profileError);
      }

      await clearCart();
    }

    return true;
  };

  const initiateRazorpayPayment = async (orderId: string) => {
    let paymentHandled = false;
    try {
      console.log("Creating Razorpay order with amount:", totalPrice);

      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "INR",
          receipt: orderId, // Pass actual DB order ID
        }),
      });

      const data = await response.json();
      console.log("Razorpay order response:", data);

      if (response.ok && data.orderId) {
        // Save the razorpay_order_id to database immediately so we can track it
        await supabase
          .from("orders")
          .update({ razorpay_order_id: data.orderId })
          .eq("id", orderId);
      }

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

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Curemist",
        description: "Ayurvedic Wound Spray Purchase",
        order_id: data.orderId,
        handler: async (response: any) => {
          paymentHandled = true;
          try {
            console.log("Payment successful, verifying...", response);

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
              console.log("Finalizing order status in database...");
              await finalizeOrderStatus(orderId, "paid", response.razorpay_payment_id);

              trackEvent("Purchase", { value: totalPrice, currency: "INR" });

              toast({
                title: "Payment Successful! 🎉",
                description: "Your order has been placed successfully.",
              });

              setShowThankYouModal(true);

              setTimeout(() => {
                setProcessingPayment(false);
                setShowThankYouModal(false);
                navigate(user ? "/profile?tab=1" : "/");
              }, 3000);
            } else {
              await finalizeOrderStatus(orderId, "payment_failed");
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
            setIsRazorpayOpen(false);
          }
        },
        prefill: {
          name: customerInfo.firstName || shippingAddress.full_name || "Curemist Customer",
          email: customerInfo.email,
          contact: customerInfo.phone || shippingAddress.phone || "",
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}`,
        },
        theme: {
          color: "#4A0E4E",
        },
        modal: {
          ondismiss: async () => {
            if (paymentHandled) return;
            
            setCurrentOrderId(null);
            setCurrentOrderStatus("");
            setLoading(false);
            setProcessingPayment(false);
            setIsRazorpayOpen(false);

            let isPaid = false;
            if (orderId) {
              const { data: order } = await supabase
                .from("orders")
                .select("payment_status")
                .eq("id", orderId)
                .single();
                
              if (order && order.payment_status === "paid") {
                isPaid = true;
              } else {
                await cancelPendingOrder(orderId);
              }
            }
            
            if (!isPaid) {
              toast({
                title: "Payment Cancelled",
                description: "You can try again anytime.",
                variant: "destructive",
              });
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        paymentHandled = true;
        setLoading(false);
        setProcessingPayment(false);
        setIsRazorpayOpen(false);
        console.error("Payment failed:", response);

        if (orderId) {
          await finalizeOrderStatus(orderId, "payment_failed");
        }

        toast({
          title: "Payment Failed",
          description:
            response.error?.description ||
            "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
      setIsRazorpayOpen(true);
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setProcessingPayment(false);
      setIsRazorpayOpen(false);
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
    if (!user && !isGuestCheckout) {
      toast({
        title: "Error",
        description: "You must be logged in or use guest checkout.",
      });
      navigate("/login");
      return;
    }

    // === Guest checkout: Strong validation ===
    if (isGuestCheckout) {
      setShowErrors(true);
      const errors: string[] = [];

      if (!customerInfo.firstName || customerInfo.firstName.trim().length < 2) {
        errors.push("Full Name is required (minimum 2 characters)");
      }
      if (!customerInfo.phone || customerInfo.phone.length !== 10) {
        errors.push("A valid 10-digit Phone number is required");
      }
      if (!shippingAddress.street || shippingAddress.street.trim().length < 5) {
        errors.push("Street Address is required (minimum 5 characters)");
      }
      if (!shippingAddress.city || shippingAddress.city.trim().length < 2 || /\d/.test(shippingAddress.city)) {
        errors.push("A valid City name is required");
      }
      if (!shippingAddress.state || shippingAddress.state.trim().length < 2 || /\d/.test(shippingAddress.state)) {
        errors.push("A valid State name is required");
      }
      if (!shippingAddress.zip || shippingAddress.zip.length !== 6) {
        errors.push("A valid 6-digit PIN Code is required");
      }
      if (!shippingAddress.country || shippingAddress.country.trim().length < 2) {
        errors.push("Country is required");
      }
      if (pincodeError) {
        errors.push(pincodeError);
      }

      if (errors.length > 0) {
        toast({
          title: "Please fill all required fields",
          description: errors[0],
          variant: "destructive",
        });
        return;
      }
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

    // Ensure we have a name and phone
    const hasName = customerInfo.firstName || shippingAddress.full_name;
    const hasPhone = customerInfo.phone || shippingAddress.phone;

    if (!hasName || !hasPhone) {
      toast({
        title: "Missing Information",
        description: "Customer name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    if (!validateAddress(shippingAddress)) return;

    // === COD Flow ===
    if (paymentMethod === "cod") {
      try {
        setLoading(true);
        setProcessingPayment(true);
        const order = await createPendingOrder();
        if (!order) throw new Error("Failed to create order");

        // Save profile info only for logged-in users
        if (user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: user.id,
            first_name: customerInfo.firstName,
            phone: customerInfo.phone,
            updated_at: new Date(),
          });
          if (profileError) console.error("Error syncing profile:", profileError);
        }

        await clearCart();

        trackEvent("Purchase", { value: totalPrice, currency: "INR" });

        toast({
          title: "Order Placed! 🎉",
          description: "Your Cash on Delivery order has been placed successfully.",
        });

        setShowThankYouModal(true);
        setTimeout(() => {
          setProcessingPayment(false);
          setLoading(false);
          setShowThankYouModal(false);
          navigate(user ? "/profile?tab=1" : "/");
        }, 3000);
      } catch (err: any) {
        setLoading(false);
        setProcessingPayment(false);
        toast({
          title: "Order Error",
          description: err.message || "Could not place your order",
          variant: "destructive",
        });
      }
      return;
    }

    // === Online Payment (Razorpay) Flow ===
    try {
      if (currentOrderId && (currentOrderStatus === "payment_failed" || currentOrderStatus === "payment_cancelled")) {
        setLoading(true);
        setProcessingPayment(true);
        await initiateRazorpayPayment(currentOrderId);
      } else {
        setLoading(true);
        const order = await createPendingOrder();
        if (!order) throw new Error("Failed to create order");
        await initiateRazorpayPayment(order.id);
      }
    } catch (err: any) {
      setLoading(false);
      setProcessingPayment(false);
      setIsRazorpayOpen(false);
      toast({
        title: "Payment Error",
        description: err.message || "Could not create order before payment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!addrId) return;
    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addrId);
    if (!error) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addrId));
      if (selectedAddressId === addrId) {
        setSelectedAddressId(null);
        setShippingAddress({ street: "", city: "", state: "", zip: "", country: "" });
      }
    }
  };

  const validateAddress = (addr: Address) => {
    if (!addr.zip || addr.zip.length !== 6) {
      toast({ title: "Error", description: "PIN Code must be 6 digits", variant: "destructive" });
      return false;
    }
    if (pincodeError) {
      toast({ title: "Error", description: pincodeError, variant: "destructive" });
      return false;
    }
    if (!addr.city || addr.city.length < 3 || /\d/.test(addr.city)) {
      toast({ title: "Error", description: "Please enter a valid city name", variant: "destructive" });
      return false;
    }
    if (!addr.state || addr.state.length < 3 || /\d/.test(addr.state)) {
      toast({ title: "Error", description: "Please enter a valid state name", variant: "destructive" });
      return false;
    }
    if (!addr.country || addr.country.length < 2) {
      toast({ title: "Error", description: "Please enter a valid country", variant: "destructive" });
      return false;
    }
    return true;
  };

  // Save new address to Supabase and select it
  const handleSaveAndDeliverNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast({ title: "Please fill all address fields", variant: "destructive" });
      return;
    }
    if (!validateAddress(newAddress)) return;
    const addrToSave = {
      ...newAddress,
      full_name: newAddress.full_name || customerInfo.firstName,
      phone: newAddress.phone || customerInfo.phone,
      country: newAddress.country || "India",
    };
    if (user) {
      const { data: saved, error } = await supabase
        .from("user_addresses")
        .insert({ user_id: user.id, ...addrToSave })
        .select()
        .single();
      if (saved && !error) {
        setSavedAddresses((prev) => [...prev, saved]);
        handleAddressSelect(saved);
      } else {
        // fallback: set without persisting id
        setShippingAddress(addrToSave);
        setSelectedAddressId(null);
      }
    } else {
      setShippingAddress(addrToSave);
      setSelectedAddressId(null);
    }
    setNewAddress({ full_name: "", phone: "", street: "", city: "", state: "", zip: "", country: "" });
    setShowNewAddressForm(false);
    setShowAddressModal(false);
  };

  // Update existing address in Supabase
  const handleUpdateAddress = async () => {
    if (!editingAddressId) return;
    if (!editAddress.street || !editAddress.city || !editAddress.state || !editAddress.zip) {
      toast({ title: "Please fill all address fields", variant: "destructive" });
      return;
    }
    if (!validateAddress(editAddress)) return;
    const { error } = await supabase
      .from("user_addresses")
      .update({
        full_name: editAddress.full_name,
        phone: editAddress.phone,
        street: editAddress.street,
        city: editAddress.city,
        state: editAddress.state,
        zip: editAddress.zip,
        country: editAddress.country || "India",
      })
      .eq("id", editingAddressId);

    if (!error) {
      setSavedAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddressId ? { ...a, ...editAddress } : a
        )
      );
      // If currently selected address was edited, update shipping address too
      if (selectedAddressId === editingAddressId) {
        setShippingAddress({ ...editAddress });
      }
      toast({ title: "Address updated successfully" });
    } else {
      toast({ title: "Failed to update address", description: error.message, variant: "destructive" });
    }
    setEditingAddressId(null);
    setEditAddress({ full_name: "", phone: "", street: "", city: "", state: "", zip: "", country: "" });
  };

  const lookupPincode = async (pincode: string, type: 'new' | 'edit' | 'shipping') => {
    if (pincode.length !== 6) {
      setPincodeError(null);
      return;
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        setPincodeError(null);
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District;
        const state = postOffice.State;

        if (type === 'new') {
          setNewAddress(prev => ({ ...prev, city, state }));
        } else if (type === 'edit') {
          setEditAddress(prev => ({ ...prev, city, state }));
        } else if (type === 'shipping') {
          setShippingAddress(prev => ({ ...prev, city, state }));
        }
      } else {
        setPincodeError("Please enter a valid pincode");
      }
    } catch (error) {
      console.error("Pincode lookup failed:", error);
      setPincodeError("Invalid pincode or service unavailable");
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

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  return (
    <>
      <style>{`
        /* Checkout Redesign Styles */
        .checkout-page {
          background: #f7f7f8;
          min-height: 100vh;
        }
        .checkout-header-bar {
          background: #fff;
          border-bottom: 1px solid #efefef;
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .checkout-section-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 12px;
        }
        .checkout-section-header {
          padding: 14px 18px 10px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
        }
        /* Address card */
        .addr-display-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 18px;
          gap: 14px;
        }
        .addr-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0eef8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .addr-name {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 2px;
        }
        .addr-line {
          font-size: 12.5px;
          color: #555;
          line-height: 1.5;
        }
        .addr-phone {
          font-size: 12px;
          color: #777;
          margin-top: 3px;
        }
        .change-btn {
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          color: #4A0E4E;
          border: 1.5px solid #4A0E4E;
          background: transparent;
          border-radius: 20px;
          padding: 5px 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .change-btn:hover {
          background: #4A0E4E;
          color: #fff;
        }
        .free-delivery-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #1a8c3b;
        }
        /* Order Summary */
        .order-summary-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          cursor: pointer;
          user-select: none;
        }
        .order-summary-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .summary-item-count {
          font-size: 12px;
          color: #888;
          background: #f5f5f5;
          border-radius: 20px;
          padding: 2px 9px;
          font-weight: 600;
        }
        .summary-total {
          font-size: 16px;
          font-weight: 800;
          color: #1a1a1a;
        }
        .chevron-icon {
          transition: transform 0.25s ease;
        }
        .chevron-icon.open {
          transform: rotate(180deg);
        }
        .order-items-panel {
          border-top: 1px solid #f0f0f0;
          padding: 0 18px;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease, padding 0.2s;
        }
        .order-items-panel.open {
          max-height: 900px;
          padding: 14px 18px;
        }
        .order-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .order-item-row:last-child {
          border-bottom: none;
        }
        .order-item-img {
          width: 54px;
          height: 54px;
          border-radius: 8px;
          object-fit: cover;
          background: #f3f3f3;
          flex-shrink: 0;
        }
        .order-item-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.35;
        }
        .order-item-qty {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
        }
        .order-item-price {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          white-space: nowrap;
        }
        .order-totals-grid {
          margin-top: 14px;
          border-top: 1px dashed #e8e8e8;
          padding-top: 12px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #555;
          padding: 3px 0;
        }
        .totals-row.green { color: #1a8c3b; }
        .totals-row.bold {
          font-size: 15px;
          font-weight: 800;
          color: #1a1a1a;
          padding-top: 10px;
          border-top: 1px solid #efefef;
          margin-top: 6px;
        }
        /* Coupons Section */
        .coupon-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px 10px;
        }
        .coupon-input {
          flex: 1;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .coupon-input:focus { border-color: #4A0E4E; }
        .coupon-apply-btn {
          background: #4A0E4E;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .coupon-apply-btn:hover { background: #3a0b3e; }
        .coupon-list-area {
          padding: 10px 18px 14px;
          max-height: 300px;
          overflow-y: auto;
        }
        .coupon-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1.5px dashed #ddd;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 10px;
          gap: 10px;
          transition: border-color 0.2s;
        }
        .coupon-card:hover { border-color: #4A0E4E; }
        .coupon-code-chip {
          font-size: 13px;
          font-weight: 800;
          color: #4A0E4E;
          letter-spacing: 0.06em;
          font-family: 'Courier New', monospace;
        }
        .coupon-desc {
          font-size: 12px;
          color: #666;
          margin-top: 1px;
        }
        .coupon-use-btn {
          font-size: 12px;
          font-weight: 700;
          color: #4A0E4E;
          border: 1.5px solid #4A0E4E;
          background: transparent;
          border-radius: 16px;
          padding: 4px 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .coupon-use-btn:hover {
          background: #4A0E4E;
          color: #fff;
        }
        .applied-coupon-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0fbf4;
          border: 1px solid #c6eed4;
          border-radius: 8px;
          padding: 8px 14px;
          margin: 0 18px 10px;
        }
        /* Address Modal / Bottom Sheet */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 60;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .modal-overlay {
            align-items: center;
          }
        }
        .modal-sheet {
          background: #fff;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding-bottom: env(safe-area-inset-bottom, 16px);
          animation: slideUp 0.3s ease;
        }
        @media (min-width: 768px) {
          .modal-sheet {
            border-radius: 16px;
            max-width: 480px;
            max-height: 85vh;
          }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 18px 12px;
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }
        .modal-title {
          font-size: 15px;
          font-weight: 800;
          color: #1a1a1a;
        }
        .modal-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f5f5f5;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          color: #555;
        }
        .modal-close-btn:hover { background: #eaeaea; }
        .add-new-address-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #4A0E4E;
          border: 1.5px solid #4A0E4E;
          background: transparent;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .add-new-address-btn:hover {
          background: #4A0E4E;
          color: #fff;
        }
        .saved-address-card {
          border: 1.5px solid #efefef;
          border-radius: 12px;
          padding: 14px;
          margin: 10px 18px;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .saved-address-card.selected {
          border-color: #4A0E4E;
          background: #faf7fb;
        }
        .saved-address-card:hover {
          box-shadow: 0 2px 10px rgba(74,14,78,0.1);
        }
        .addr-card-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .addr-type-chip {
          font-size: 10px;
          font-weight: 700;
          background: #efefef;
          color: #555;
          border-radius: 10px;
          padding: 1px 8px;
          letter-spacing: 0.04em;
        }
        .addr-menu-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .addr-menu-btn:hover { color: #333; }
        .addr-dropdown {
          position: absolute;
          top: 34px;
          right: 14px;
          background: #fff;
          border: 1px solid #efefef;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          z-index: 10;
          min-width: 110px;
          overflow: hidden;
        }
        .addr-dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          color: #333;
          font-family: inherit;
        }
        .addr-dropdown-item:hover { background: #f8f8f8; }
        .addr-dropdown-item.danger { color: #e53e3e; }
        .deliver-here-btn {
          width: 100%;
          margin-top: 12px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .deliver-here-btn:hover { background: #333; }
        .deliver-here-btn.selected {
          background: #4A0E4E;
        }
        .deliver-here-btn.selected:hover { background: #3a0b3e; }
        /* Address form inside modal */
        .new-addr-form {
          padding: 14px 18px 18px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          margin-bottom: 5px;
        }
        .form-input {
          width: 100%;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 12px;
          box-sizing: border-box;
          font-family: inherit;
        }
        .form-input:focus { border-color: #4A0E4E; }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        /* Sticky bottom bar */
        .sticky-pay-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #efefef;
          padding: 12px 16px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          z-index: 40;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          animation: slideUp 0.2s ease;
        }
        .sticky-pay-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sticky-razorpay-logo {
          height: 28px;
          object-fit: contain;
        }
        .sticky-pay-label {
          font-size: 11px;
          color: #666;
          font-weight: 600;
        }
        .sticky-pay-btn {
          background: #4A0E4E;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 24px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          font-family: inherit;
          white-space: nowrap;
        }
        .sticky-pay-btn:hover { background: #3a0b3e; }
        .sticky-pay-btn:active { transform: scale(0.97); }
        .sticky-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        /* Desktop layout adjustments */
        @media (min-width: 1024px) {
          .checkout-desktop-grid {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 28px;
            align-items: start;
          }
          .checkout-right-sticky {
            position: sticky;
            top: 120px;
          }
          .sticky-pay-bar {
            display: none;
          }
          /* Desktop scaling - larger fonts & spacing */
          .addr-name { font-size: 16px; }
          .addr-line { font-size: 14px; }
          .addr-phone { font-size: 13px; }
          .change-btn { font-size: 13px; padding: 7px 18px; }
          .free-delivery-badge { font-size: 14px; padding: 10px 20px 16px; }
          .section-label-top { font-size: 11px; padding: 18px 20px 6px; }
          .checkout-section-card { margin-bottom: 16px; border-radius: 14px; }
          .addr-display-row { padding: 18px 20px; gap: 16px; }
          .addr-icon { width: 38px; height: 38px; }
          .coupon-input { font-size: 14px; padding: 12px 16px; }
          .coupon-apply-btn { font-size: 14px; padding: 12px 24px; }
          .coupon-input-row { padding: 16px 20px 12px; }
          .applied-coupon-badge { margin: 0 20px 12px; padding: 10px 16px; }
          .coupon-card { padding: 12px 16px; }
          .coupon-code-chip { font-size: 14px; }
          .coupon-desc { font-size: 13px; }
          .coupon-use-btn { font-size: 13px; padding: 6px 18px; }
          .coupon-list-area { padding: 12px 20px 16px; }
          .order-summary-toggle { padding: 16px 20px; }
          .order-items-panel.open { padding: 16px 20px; }
          .order-item-img { width: 62px; height: 62px; }
          .order-item-title { font-size: 14px; }
          .order-item-qty { font-size: 13px; }
          .order-item-price { font-size: 15px; }
          .totals-row { font-size: 14px; padding: 4px 0; }
          .totals-row.bold { font-size: 16px; }
          .modal-title { font-size: 16px; }
          .main-inline-pay-btn { font-size: 17px; padding: 18px; }
          .desktop-razorpay-label { font-size: 14px; }
          .secure-badge { font-size: 12px; }
          .no-address-form-wrapper { padding: 18px 20px 22px; }
          .checkout-form-field label { font-size: 13px; }
          .checkout-form-field input { font-size: 14px; padding: 12px 14px; }
        }
        /* Main pay button shown inline on desktop */
        .main-pay-btn-wrapper {
          margin-top: 4px;
        }
        .main-inline-pay-btn {
          width: 100%;
          background: #4A0E4E;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .main-inline-pay-btn:hover { background: #3a0b3e; }
        .main-inline-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        /* Processing overlay */
        .processing-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.7);
          padding: 16px;
        }
        .processing-card {
          max-width: 380px;
          width: 100%;
          border-radius: 16px;
          background: #fff;
          padding: 28px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }
        /* Thank you modal */
        .thankyou-card {
          max-width: 420px;
          width: 100%;
          border-radius: 20px;
          background: #fff;
          padding: 40px 32px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: bounceIn 0.4s ease;
        }
        @keyframes bounceIn {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        /* Section label (delivery details) */
        .section-label-top {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #aaa;
          text-transform: uppercase;
          padding: 16px 18px 4px;
        }
        /* New address form inline / checkout form */
        .checkout-form-field {
          margin-bottom: 14px;
        }
        .checkout-form-grid {
          display: grid;
          gap: 12px;
        }
        .checkout-form-grid-2 {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .checkout-form-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .checkout-form-field label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          margin-bottom: 5px;
        }
        .checkout-form-field input,
        .checkout-form-field textarea {
          width: 100%;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          font-family: inherit;
          background: #fff;
        }
        .checkout-form-field input:focus,
        .checkout-form-field textarea:focus { border-color: #4A0E4E; }
        .checkout-form-field input.error,
        .checkout-form-field textarea.error { border-color: #e53e3e; }
        .checkout-form-field textarea {
          resize: vertical;
        }
        .field-error {
          font-size: 11px;
          color: #e53e3e;
          margin-top: 3px;
        }
        /* Secure badge */
        .secure-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #888;
          justify-content: center;
          margin-top: 8px;
        }
        /* Razorpay section on desktop right panel */
        .desktop-pay-section {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          padding: 18px;
          margin-bottom: 12px;
        }
        .desktop-razorpay-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .desktop-razorpay-label {
          font-size: 13px;
          color: #555;
          font-weight: 600;
        }
        .no-address-form-wrapper {
          padding: 14px 18px 18px;
        }
      `}</style>
      <Header />

      {/* Processing overlay */}
      {(processingPayment || (loading && !isRazorpayOpen)) && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>
              Processing your order...
            </h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
              Do not click back or refresh.
            </p>
            <p style={{ fontSize: 12, color: '#999' }}>
              You'll be redirected to your orders automatically.
            </p>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="processing-overlay">
          <div className="thankyou-card">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', marginBottom: 8 }}>Thank You! 🎉</h2>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              {paymentMethod === "cod" ? "Order Placed" : "Payment Successful"}
            </p>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              {paymentMethod === "cod"
                ? "Your Cash on Delivery order has been placed! Pay ₹" + totalPrice + " upon delivery."
                : "Your order has been placed! We're preparing your items for shipment."}
            </p>
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'left' }}>
              <p style={{ fontSize: 12, color: '#666' }}>
                <span style={{ fontWeight: 700 }}>Order ID:</span> {currentOrderId?.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>We'll email you tracking information soon.</p>
            </div>
            <p style={{ fontSize: 12, color: '#aaa' }}>{user ? 'Redirecting to your orders in a moment...' : 'Redirecting to homepage in a moment...'}</p>
          </div>
        </div>
      )}

      {/* Address Selection Modal / Bottom Sheet */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Select Delivery Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="add-new-address-btn"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  <span>+</span> Add New Address
                </button>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowAddressModal(false)}
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* New Address Form */}
            {showNewAddressForm && !editingAddressId && (
              <div className="new-addr-form" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Add a New Address</p>
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="Your full name"
                  value={newAddress.full_name ?? ""}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                />
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={newAddress.phone ?? ""}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={10}
                />
                <label className="form-label">Street Address *</label>
                <input
                  className="form-input"
                  placeholder="House no, Street, Area"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                />

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">PIN Code *</label>
                    <input
                      className="form-input"
                      placeholder="PIN code"
                      value={newAddress.zip}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewAddress({ ...newAddress, zip: val });
                        if (val.length === 6) {
                          lookupPincode(val, 'new');
                        } else {
                          setPincodeError(null);
                        }
                      }}
                      maxLength={6}
                    />
                    {pincodeError && <p className="field-error">{pincodeError}</p>}
                  </div>
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      className="form-input"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  {/* <div>
                    <label className="form-label">State *</label>
                    <input
                      className="form-input"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div> */}
                </div>
                <div className="form-grid-2">
                  {/* <div>
                    <label className="form-label">PIN Code *</label>
                    <input
                      className="form-input"
                      placeholder="PIN code"
                      value={newAddress.zip}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewAddress({ ...newAddress, zip: val });
                        if (val.length === 6) {
                          lookupPincode(val, 'new');
                        } else {
                          setPincodeError(null);
                        }
                      }}
                      maxLength={6}
                    />
                    {pincodeError && <p className="field-error">{pincodeError}</p>}
                  </div> */}
                  <div>
                    <label className="form-label">State *</label>
                    <input
                      className="form-input"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Country *</label>
                    <input
                      className="form-input"
                      placeholder="Country"
                      value={newAddress.country || "India"}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  className="deliver-here-btn selected"
                  style={{ marginTop: 4 }}
                  onClick={handleSaveAndDeliverNewAddress}
                >
                  Deliver Here
                </button>
              </div>
            )}

            {/* Edit Address Form */}
            {editingAddressId && (
              <div className="new-addr-form" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Edit Address</p>
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="Your full name"
                  value={editAddress.full_name ?? ""}
                  onChange={(e) => setEditAddress({ ...editAddress, full_name: e.target.value })}
                />
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={editAddress.phone ?? ""}
                  onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={10}
                />
                <label className="form-label">Street Address *</label>
                <input
                  className="form-input"
                  placeholder="House no, Street, Area"
                  value={editAddress.street}
                  onChange={(e) => setEditAddress({ ...editAddress, street: e.target.value })}
                />
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">PIN Code *</label>
                    <input
                      className="form-input"
                      placeholder="PIN code"
                      value={editAddress.zip}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setEditAddress({ ...editAddress, zip: val });
                        if (val.length === 6) {
                          lookupPincode(val, 'edit');
                        } else {
                          setPincodeError(null);
                        }
                      }}
                      maxLength={6}
                    />
                    {pincodeError && <p className="field-error">{pincodeError}</p>}
                  </div>
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      className="form-input"
                      placeholder="City"
                      value={editAddress.city}
                      onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">State *</label>
                    <input
                      className="form-input"
                      placeholder="State"
                      value={editAddress.state}
                      onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Country *</label>
                    <input
                      className="form-input"
                      placeholder="Country"
                      value={editAddress.country || "India"}
                      onChange={(e) => setEditAddress({ ...editAddress, country: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    className="deliver-here-btn"
                    style={{ background: '#888' }}
                    onClick={() => {
                      setEditingAddressId(null);
                      setEditAddress({ full_name: "", phone: "", street: "", city: "", state: "", zip: "", country: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="deliver-here-btn selected"
                    onClick={handleUpdateAddress}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            {/* Saved Addresses List */}
            {!editingAddressId && (
              <div style={{ padding: '8px 0' }}>
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`saved-address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  >
                    <div className="addr-card-name-row">
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                        {addr.full_name || customerInfo.firstName}
                      </span>
                      <span className="addr-type-chip">Home</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                      {addr.street}, {addr.city}, {addr.state}, {addr.zip}
                    </p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{customerInfo.email}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{addr.phone || customerInfo.phone}</p>

                    {/* Three-dot menu */}
                    <button
                      className="addr-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressMenuOpen(addressMenuOpen === addr.id ? null : (addr.id || null));
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                    </button>
                    {addressMenuOpen === addr.id && (
                      <div className="addr-dropdown">
                        <button
                          className="addr-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddressId(addr.id || null);
                            setEditAddress({
                              full_name: addr.full_name || customerInfo.firstName,
                              phone: addr.phone || customerInfo.phone,
                              street: addr.street,
                              city: addr.city,
                              state: addr.state,
                              zip: addr.zip,
                              country: addr.country,
                            });
                            setShowNewAddressForm(false);
                            setAddressMenuOpen(null);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="addr-dropdown-item danger"
                          onClick={() => {
                            handleDeleteAddress(addr.id!);
                            setAddressMenuOpen(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <button
                      className={`deliver-here-btn ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => {
                        handleAddressSelect(addr);
                        setShowAddressModal(false);
                      }}
                    >
                      Deliver Here
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Checkout Page */}
      <div className="checkout-page" style={{ paddingTop: 'calc(110px + 0px)' }}>
        {/* Secure payment header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #efefef', padding: '8px 0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a8c3b" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a8c3b' }}>100% Secured Payment</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px', paddingBottom: 80 }}>
          <div className="checkout-desktop-grid">
            {/* LEFT COLUMN */}
            <div>
              {/* === DELIVERY ADDRESS SECTION === */}
              <p className="section-label-top">Delivery Details</p>

              {/* Guest Checkout Banner */}
              {isGuestCheckout && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '1px solid #f59e0b',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Guest Checkout</p>
                    <p style={{ fontSize: 11, color: '#a16207' }}>All fields are mandatory. Please fill in every detail.</p>
                  </div>
                </div>
              )}

              <div className="checkout-section-card">
                {!isGuestCheckout && savedAddresses.length > 0 && selectedAddressId ? (
                  /* Show saved address display */
                  <>
                    <div className="addr-display-row">
                      <div className="addr-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A0E4E" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="addr-name">Deliver To: {selectedAddress?.full_name || customerInfo.firstName}</p>
                        <p className="addr-line">
                          {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip}
                        </p>
                        <p className="addr-phone">+91 {selectedAddress?.phone || customerInfo.phone}</p>
                      </div>
                      <button
                        className="change-btn"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Change
                      </button>
                    </div>
                    <div className="free-delivery-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a8c3b" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      Free Delivery Across India
                    </div>
                  </>
                ) : !isGuestCheckout && savedAddresses.length > 0 ? (
                  /* Saved addresses exist but none selected - show to pick */
                  <>
                    <div className="addr-display-row">
                      <div className="addr-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A0E4E" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="addr-name">Select Delivery Address</p>
                        <p className="addr-line">Tap to choose from your saved addresses</p>
                      </div>
                      <button className="change-btn" onClick={() => setShowAddressModal(true)}>
                        Select
                      </button>
                    </div>
                    <div style={{ padding: '0 18px 14px' }}>
                      <button className="deliver-here-btn selected" onClick={() => setShowAddressModal(true)}>
                        Choose Address
                      </button>
                    </div>
                  </>
                ) : (
                  /* No saved address - show new address form inline */
                  <div className="no-address-form-wrapper">
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>Enter Delivery Address</p>
                    <form onSubmit={handlePlaceOrder}>
                      <div className="checkout-form-field">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          className={showErrors && !customerInfo.firstName ? 'error' : ''}
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                        {showErrors && !customerInfo.firstName && <p className="field-error">Full name is required</p>}
                      </div>
                      <div className="checkout-form-field">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          className={showErrors && (!customerInfo.phone || customerInfo.phone.length < 10) ? 'error' : ''}
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value.replace(/\D/g, "") })}
                          placeholder="10-digit number"
                          maxLength={10}
                          required
                        />
                        {showErrors && isGuestCheckout && (!customerInfo.phone || customerInfo.phone.length !== 10) && <p className="field-error">10-digit phone number is required</p>}
                      </div>
                      <div className="checkout-form-field">
                        <label>Street Address *</label>
                        <textarea
                          className={showErrors && !shippingAddress.street ? 'error min-h-[80px]' : 'min-h-[80px]'}
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          placeholder="House no, Street, Area"
                          required
                        />
                      </div>
                      <div className="checkout-form-grid checkout-form-grid-2">
                        <div className="checkout-form-field">
                          <label>PIN Code *</label>
                          <input
                            type="text"
                            className={showErrors && !shippingAddress.zip ? 'error' : ''}
                            value={shippingAddress.zip}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setShippingAddress({ ...shippingAddress, zip: val });
                              if (val.length === 6) {
                                lookupPincode(val, 'shipping');
                              } else {
                                setPincodeError(null);
                              }
                            }}
                            placeholder="PIN code"
                            maxLength={6}
                            required
                          />
                          {pincodeError && <p className="field-error">{pincodeError}</p>}
                        </div>
                        <div className="checkout-form-field">
                          <label>City *</label>
                          <input
                            type="text"
                            className={showErrors && !shippingAddress.city ? 'error' : ''}
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            placeholder="City"
                            required
                          />
                        </div>
                      </div>
                      <div className="checkout-form-grid checkout-form-grid-2">
                        <div className="checkout-form-field">
                          <label>State *</label>
                          <input
                            type="text"
                            className={showErrors && !shippingAddress.state ? 'error' : ''}
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            placeholder="State"
                            required
                          />
                        </div>
                        <div className="checkout-form-field">
                          <label>Country *</label>
                          <input
                            type="text"
                            className={showErrors && !shippingAddress.country ? 'error' : ''}
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                            placeholder="Country"
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* === OFFERS & COUPONS SECTION === */}
              <p className="section-label-top">Offers & Coupons</p>
              <div className="checkout-section-card">
                {/* Applied coupon badge */}
                {appliedCoupon && (
                  <div className="applied-coupon-badge">
                    <span style={{ fontSize: 16 }}>🏷️</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1a8c3b' }}>
                        {appliedCoupon.code} applied
                      </span>
                      <span style={{ fontSize: 12, color: '#555', marginLeft: 6 }}>-₹{couponDiscount} saved</span>
                    </div>
                    <button
                      onClick={() => { setAppliedCoupon(null); setCoupon(""); }}
                      style={{ fontSize: 12, fontWeight: 700, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Coupon Input */}
                <div className="coupon-input-row">
                  <input
                    className="coupon-input"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button className="coupon-apply-btn" onClick={applyCoupon}>Apply</button>
                </div>

                {couponApplied && (
                  <p style={{ fontSize: 12, color: '#1a8c3b', fontWeight: 600, padding: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Coupon applied successfully!
                  </p>
                )}

                {/* Flat coupon list - no tabs */}
                {availableCoupons.length > 0 && (
                  <div className="coupon-list-area">
                    {availableCoupons.map((c) => (
                      <div key={c.code} className="coupon-card">
                        <div>
                          <p className="coupon-code-chip">{c.code}</p>
                          <p className="coupon-desc">
                            {c.discount_percentage
                              ? `${(c.discount_percentage * 100).toFixed(0)}% off on your order`
                              : `Flat ₹${c.discount_amount} off`}
                          </p>
                        </div>
                        <button
                          className="coupon-use-btn"
                          onClick={() => {
                            setCoupon(c.code);
                          }}
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Billing address section removed - always same as shipping */}

              {/* === PAYMENT METHOD SECTION === */}
              <p className="section-label-top">Payment Method</p>
              <div className="checkout-section-card">
                <div style={{ padding: '14px 18px' }}>
                  {/* Pay Online Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      border: paymentMethod === 'razorpay' ? '2px solid #4A0E4E' : '1.5px solid #e0e0e0',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: paymentMethod === 'razorpay' ? '#faf7fb' : '#fff',
                      transition: 'all 0.2s',
                      marginBottom: 10,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      style={{ accentColor: '#4A0E4E', width: 18, height: 18 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Pay Online</p>
                      <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Razorpay · UPI, Cards, Net Banking & more</p>
                    </div>
                    <img
                      src="/Razorpay/razorpayllogo01.png"
                      alt="Razorpay"
                      style={{ height: 20, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 16px',
                      border: paymentMethod === 'cod' ? '2px solid #4A0E4E' : '1.5px solid #e0e0e0',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: paymentMethod === 'cod' ? '#faf7fb' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: '#4A0E4E', width: 18, height: 18, marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Cash on Delivery</p>
                      <p style={{ fontSize: 12, color: '#c47d15', fontWeight: 600, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                        ₹{COD_CHARGE} extra charge applies for Cash on Delivery
                      </p>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 14h4" />
                    </svg>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Order Summary Desktop */}
            <div className="checkout-right-sticky">
              {/* Order Summary Card */}
              <div className="desktop-pay-section">
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>Order Summary</p>

                <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
                  {items.map((item) => {
                    const originalPrice = item.originalPrice || item.price;
                    const salePrice = item.price;
                    const shortTitle = `CureMist Ayurvedic....${item.size === "Combo" ? "Combo pack (12.5g + 25g)" : item.size}`;
                    const discountAmountItem = originalPrice - salePrice;

                    return (
                      <div key={item.id} className="order-item-row">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="order-item-img" />
                        ) : (
                          <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f3f3' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p className="order-item-title">{shortTitle}</p>
                          <p className="order-item-qty">Qty: {item.quantity}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="order-item-price">₹{salePrice * item.quantity}</p>
                          {discountAmountItem > 0 && (
                            <p style={{ fontSize: 11, color: '#aaa', textDecoration: 'line-through' }}>₹{originalPrice * item.quantity}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-totals-grid">
                  <div className="totals-row">
                    <span>Total MRP (incl. GST)</span>
                    <span>₹{Math.round(mrpTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="totals-row green">
                      <span>Total Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="totals-row">
                    <span>GST (5%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="totals-row green">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  {codCharge > 0 && (
                    <div className="totals-row">
                      <span>COD Charge</span>
                      <span>₹{codCharge}</span>
                    </div>
                  )}
                  <div className="totals-row green">
                    <span>Shipping</span>
                    <span>Free 🚚</span>
                  </div>
                  <div className="totals-row bold">
                    <span>To Pay</span>
                    <span style={{ color: '#4A0E4E' }}>₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Pay Button */}
              <div className="desktop-pay-section" style={{ padding: 0, overflow: 'hidden' }}>
                {/* <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src="/Razorpay/razorpayllogo01.png"
                    alt="Razorpay"
                    style={{ height: 24, objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="desktop-razorpay-label">Pay using Razorpay</span>
                </div> */}
                <div style={{ padding: '0 14px 14px' }} className="hidden md:block">
                  <button
                    id="main-pay-button"
                    type="button"
                    onClick={handlePlaceOrder as any}
                    disabled={loading || processingPayment}
                    className="main-inline-pay-btn"
                  >
                    {loading || processingPayment
                      ? "Processing..."
                      : paymentMethod === "cod"
                        ? `Place Order · ₹${totalPrice}`
                        : `Pay ₹${totalPrice}`}
                  </button>
                </div>
                {/* <div className="secure-badge" style={{ paddingBottom: 14 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  100% Secure & Encrypted Payment
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM BAR (mobile only) - always shown, hidden via CSS on desktop */}
        <div className="sticky-pay-bar">
          <div className="sticky-pay-left">
            {paymentMethod === "razorpay" ? (
              <>
                <img
                  src="/Razorpay/razorpayllogo01.png"
                  alt="Razorpay"
                  className="sticky-razorpay-logo"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <p className="sticky-pay-label">Pay using Razorpay</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1a8c3b' }}>Free Delivery 🚚</p>
                </div>
              </>
            ) : (
              <div>
                <p className="sticky-pay-label" style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Cash on Delivery</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#c47d15' }}>+₹{COD_CHARGE} COD charge</p>
              </div>
            )}
          </div>
          <button
            className="sticky-pay-btn"
            onClick={handlePlaceOrder as any}
            disabled={loading || processingPayment}
          >
            {loading || processingPayment
              ? "Processing..."
              : paymentMethod === "cod"
                ? `Place Order · ₹${totalPrice}`
                : `Pay ₹${totalPrice}`}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
