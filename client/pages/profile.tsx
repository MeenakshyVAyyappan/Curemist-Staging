import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';import { formatOrderDate } from "@/lib/utils";import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tabs = ['Profile Information', 'Order History', 'Address Information'] as const;

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState<number>(0);

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("");
  const [dob, setDob] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // New address form state
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Order History State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabParam = query.get('tab');
    if (tabParam !== null) {
      const tabIndex = Number(tabParam);
      if (!Number.isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.length) {
        setActive(tabIndex);
      }
    }
  }, [location.search]);

  const fetchData = async () => {
    if (!user) return;

    // Profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (prof) {
      setProfile(prof);
      setFirstName(prof.first_name || "");
      setLastName(prof.last_name || "");
      setPhone(prof.phone || "");
      setSex(prof.sex || "");
      setDob(prof.dob || "");
      setAvatarUrl(prof.avatar_url || "");
      setDefaultAddressId(prof.default_address_id);
    } else {
      // If profile doesn't exist for some reason, pre-fill from user metadata if available
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
    }

    // Orders with Items
    const { data: ords } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (ords) {
      setOrders(ords);
      setCurrentPage(1);
    }

    // Addresses
    const { data: addrs } = await supabase.from('user_addresses').select('*').eq('user_id', user.id);
    if (addrs) setAddresses(addrs);
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    const updates = {
      id: user!.id, // Required for upsert
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      sex: sex,
      dob: dob || null,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
      fetchData();
    }
    setLoadingProfile(false);
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    // Note: Deleting from 'auth.users' requires service role or admin API. 
    // Here we delete the public profile data and sign out.
    // If cascade delete is set up in Supabase, this might clear related data.

    const { error } = await supabase.from('profiles').delete().eq('id', user.id);

    if (error) {
      toast({ title: "Error deleting profile", description: error.message, variant: "destructive" });
    } else {
      await signOut();
      toast({ title: "Profile deleted", description: "Your profile information has been removed." });
      navigate("/");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      default_address_id: addressId,
      updated_at: new Date()
    });
    if (error) {
      toast({ title: "Error setting default address", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Default address updated" });
      setDefaultAddressId(addressId);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    if (!newAddressLine.trim() || !newCity || !newState || !newPincode || !newCountry) {
      toast({ title: "Please fill all address fields" });
      return;
    }

    setLoadingProfile(true);
    
    try {
      if (editingAddressId) {
        // Update existing address
        const { error } = await supabase.from('user_addresses').update({
          street: newAddressLine,
          city: newCity,
          state: newState,
          zip: newPincode,
          country: newCountry
        }).eq('id', editingAddressId);

        if (error) throw error;
        
        const updated = addresses.map(a => 
          a.id === editingAddressId 
            ? { ...a, street: newAddressLine, city: newCity, state: newState, zip: newPincode, country: newCountry }
            : a
        );
        setAddresses(updated);
        toast({ title: "Address updated successfully" });
        setEditingAddressId(null);
      } else {
        // Create new address
        const { data: newAddr, error } = await supabase.from('user_addresses').insert({
          user_id: user.id,
          street: newAddressLine,
          city: newCity,
          state: newState,
          zip: newPincode,
          country: newCountry
        }).select().single();

        if (error) throw error;
        
        setAddresses([...addresses, newAddr]);
        toast({ title: "Address saved" });
        
        // If no default address, set this one
        if (!defaultAddressId && newAddr) {
          handleSetDefaultAddress(newAddr.id);
        }
      }

      setNewAddressLine(""); 
      setNewCity(""); 
      setNewState(""); 
      setNewPincode(""); 
      setNewCountry("");
      setShowAddForm(false);
    } catch (error: any) {
      toast({ title: "Error saving address", description: error.message, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    setNewAddressLine(address.street);
    setNewCity(address.city);
    setNewState(address.state);
    setNewPincode(address.zip);
    setNewCountry(address.country);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    setLoadingProfile(true);
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(addresses.filter(a => a.id !== id));
      toast({ title: "Address deleted successfully" });
      setShowDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: "Error deleting address", description: error.message, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setNewAddressLine("");
    setNewCity("");
    setNewState("");
    setNewPincode("");
    setNewCountry("");
    setShowAddForm(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoadingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoadingPass(false);

    if (error) {
      toast({ title: "Error updating password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-[150px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">You must be logged in to view your profile.</p>
          <Button onClick={() => navigate('/login')} className="bg-brand-yellow text-brand-blue">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} className="bg-brand-yellow hover:bg-[#816306] text-[#311659] text-sm">Back to Home</Button>
          </div>
          <Button onClick={() => signOut().then(() => navigate('/login'))} variant="destructive" className="text-sm">Logout</Button>
        </div>

        <div className="text-xl md:text-2xl font-bold text-curemist-purple mb-6">My Profile</div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="lg:col-span-1">
            <nav className="flex flex-col space-y-2">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActive(i)}
                  className={`text-left p-3 rounded ${i === active ? 'bg-brand-yellow text-brand-blue font-semibold' : 'text-muted-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </aside>

          <section className="lg:col-span-3 bg-white rounded border p-6 min-h-[500px]">
            {/* Profile Information Tab */}
            {active === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-24 h-24 border-2 border-brand-yellow">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold text-brand-blue bg-gray-100">
                        {firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full max-w-xs text-center flex flex-col items-center gap-2">
                      <label htmlFor="avatar-upload" className="text-xs font-semibold text-brand-blue cursor-pointer bg-brand-yellow px-3 py-1 rounded hover:bg-[#816306] hover:text-[#311659] transition-colors">
                        {loadingProfile ? "Uploading..." : "Upload Photo"}
                      </label>
                      {avatarUrl && (
                        <button
                          onClick={async () => {
                            if (!confirm("Remove profile photo?")) return;
                            setLoadingProfile(true);
                            const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
                            if (error) {
                              toast({ title: "Error removing photo", description: error.message, variant: "destructive" });
                            } else {
                              setAvatarUrl("");
                              toast({ title: "Photo removed" });
                            }
                            setLoadingProfile(false);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                          disabled={loadingProfile}
                        >
                          Remove Photo
                        </button>
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            setLoadingProfile(true);
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                            const filePath = `${fileName}`;

                            const { error: uploadError } = await supabase.storage
                              .from('avatars')
                              .upload(filePath, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(filePath);

                            setAvatarUrl(publicUrl);

                            // Auto-save avatar update
                            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
                            toast({ title: "Profile photo updated!" });
                          } catch (error: any) {
                            toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
                          } finally {
                            setLoadingProfile(false);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">First Name</label>
                      <input
                        className="border p-3 rounded bg-white"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Last Name</label>
                      <input
                        className="border p-3 rounded bg-white"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        className="border p-3 rounded bg-white"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // restrict to digits
                          setPhone(val);
                        }}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Email Address</label>
                      <input className="border p-3 rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={user.email || ''} readOnly />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Gender</label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="border p-3 rounded bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        max="2009-12-31"
                        className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleUpdateProfile} disabled={loadingProfile} className="bg-brand-yellow text-brand-blue font-bold px-8">
                    {loadingProfile ? "SAVING..." : "SAVE CHANGES"}
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-bold mb-4 text-[#311659]">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">New Password</label>
                      <div className="relative">
                        <input
                          className="w-full border p-3 rounded pr-10"
                          placeholder="New Password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          className="w-full border p-3 rounded pr-10"
                          placeholder="Confirm Password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={loadingPass} className="bg-brand-yellow text-brand-blue font-bold">
                      {loadingPass ? "UPDATING..." : "UPDATE PASSWORD"}
                    </Button>
                  </div>
                </div>



              </div>
            )}

            {/* Order History Tab */}
            {active === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Order History</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You don't have any orders yet.</p>
                    <button onClick={() => navigate('/')} className="bg-brand-yellow text-brand-blue px-6 py-2 rounded font-bold">START SHOPPING</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paginatedOrders.map((ord) => (
                      <div key={ord.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-md overflow-hidden border bg-white flex-shrink-0">
                              {ord.order_items?.[0]?.image ? (
                                <img
                                  src={ord.order_items[0].image}
                                  alt={ord.order_items[0].title || "Product image"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Order Placed</p>
                              <p className="text-sm font-medium">{formatOrderDate(ord.created_at)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                            <p className="text-sm font-medium">₹{ord.total_price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                            <p className="text-xs font-mono text-gray-600">{ord.id}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                            {ord.order_status}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewOrder(ord)}>
                              <FiEye className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600">
                            {ord.order_items?.length ?? 0} item{(ord.order_items?.length ?? 0) === 1 ? '' : 's'} in this order.
                          </p>
                          {ord.order_items && ord.order_items.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">First item: <span className="font-medium">{ord.order_items[0].title}</span></p>
                          )}
                        </div>
                      </div>
                    ))}

                    {orders.length > pageSize && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          Showing {Math.min(orders.length, (currentPage - 1) * pageSize + 1)} - {Math.min(orders.length, currentPage * pageSize)} of {orders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                      <DialogDescription>
                        {selectedOrder ? `Order ID: ${selectedOrder.id}` : ""}
                      </DialogDescription>
                    </DialogHeader>

                    {selectedOrder ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-lg border p-4">
                            <h4 className="font-semibold mb-2">Order Info</h4>
                            <div className="text-sm space-y-1 text-gray-700">
                              <p><span className="font-medium">Placed:</span> {formatOrderDate(selectedOrder.created_at)}</p>
                              <p><span className="font-medium">Status:</span> {selectedOrder.order_status}</p>
                              <p><span className="font-medium">Total:</span> ₹{selectedOrder.total_price}</p>
                              {selectedOrder.subtotal && <p><span className="font-medium">Subtotal:</span> ₹{selectedOrder.subtotal}</p>}
                              {selectedOrder.discount_amount && <p><span className="font-medium">Discount:</span> ₹{selectedOrder.discount_amount}</p>}
                              {selectedOrder.coupon_discount && <p><span className="font-medium">Coupon:</span> ₹{selectedOrder.coupon_discount}</p>}
                              {selectedOrder.gst_amount && <p><span className="font-medium">GST:</span> ₹{selectedOrder.gst_amount}</p>}
                              {selectedOrder.payment_method && <p><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method}</p>}
                            </div>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-3">
                              {selectedOrder.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between gap-4 p-3 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                                    {item.discount && <p className="text-xs text-gray-500">Discount: ₹{item.discount}</p>}
                                    {item.gst && <p className="text-xs text-gray-500">GST: ₹{item.gst}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="rounded-lg border p-4">
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{selectedOrder.shipping_address?.street}</p>
                              <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                              <p>{selectedOrder.shipping_address?.zip}, {selectedOrder.shipping_address?.country}</p>
                            </div>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h4 className="font-semibold mb-2">Billing Address</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{selectedOrder.billing_address?.street}</p>
                              <p>{selectedOrder.billing_address?.city}, {selectedOrder.billing_address?.state}</p>
                              <p>{selectedOrder.billing_address?.zip}, {selectedOrder.billing_address?.country}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No order selected.</p>
                    )}

                    <DialogFooter>
                      <Button onClick={() => {
                        setShowOrderDialog(false);
                        setSelectedOrder(null);
                      }}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>


              </div>
            )}

            {/* Address Information Tab */}
            {active === 2 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-brand-yellow text-brand-blue px-4 py-2 rounded font-bold text-sm"
                  >
                    + ADD NEW ADDRESS
                  </button>
                </div>
                {addresses.length === 0 && !showAddForm ? (
                  <div className="text-muted-foreground text-center py-8">No addresses yet.</div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((a, i) => (
                      <div key={i} className={`border p-4 rounded-lg flex items-start justify-between gap-4 ${defaultAddressId === a.id ? 'border-brand-yellow bg-yellow-50' : ''}`}>
                        <div className="flex items-start gap-4 flex-1">
                          <div className="pt-1">
                            <input
                              type="radio"
                              name="default_addr"
                              checked={defaultAddressId === a.id}
                              onChange={() => handleSetDefaultAddress(a.id)}
                              className="w-4 h-4 cursor-pointer text-brand-yellow focus:ring-brand-yellow"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-800">{a.street}</p>
                                <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.zip}</p>
                                <p className="text-sm text-gray-600">{a.country}</p>
                              </div>
                              {defaultAddressId === a.id && (
                                <span className="text-xs bg-brand-yellow text-brand-blue px-2 py-1 rounded font-bold">Default</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(a)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(a.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delete Address Confirmation */}
                {showDeleteConfirm && (
                  <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">Are you sure you want to delete this address?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeleteAddress(showDeleteConfirm)}
                        disabled={loadingProfile}
                        className="px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-medium text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Show Address Form */}
                {showAddForm && (
                  <div className="mt-8 border-t pt-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        value={newAddressLine}
                        onChange={(e) => setNewAddressLine(e.target.value)}
                        className="border p-3 rounded"
                        placeholder="Address Line (Street, Flat, etc.)"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="City"
                        />
                        <input
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="State"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="Pincode/Zip"
                        />
                        <input
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="Country"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 font-semibold px-4"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          disabled={loadingProfile}
                          className="bg-brand-yellow text-brand-blue px-6 py-3 rounded font-bold shadow-sm hover:shadow disabled:opacity-50"
                        >
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
