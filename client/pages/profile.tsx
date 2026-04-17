import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatOrderDate, formatOrderId } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tabs = [
  "Profile Information",
  "Order History",
  "Address Information",
] as const;

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Order History State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabParam = query.get("tab");
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
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const meta = user.user_metadata || {};

    let defaultFullName = prof?.first_name || "";
    if (prof?.last_name) defaultFullName += ` ${prof.last_name}`;

    if (!defaultFullName || defaultFullName.trim() === '') {
      defaultFullName = meta.full_name || meta.name || meta.first_name || "";
      if (meta.last_name) defaultFullName += ` ${meta.last_name}`;
    }

    setProfile(prof || null);
    setFirstName(defaultFullName.trim());
    setLastName("");
    setPhone(prof?.phone || meta.phone || "");
    setSex(prof?.sex || meta.gender || meta.sex || "");
    setDob(prof?.dob || meta.dob || "");
    setAvatarUrl(prof?.avatar_url || meta.avatar_url || meta.picture || "");

    if (prof) {
      setDefaultAddressId(prof.default_address_id);
    }

    // Orders with Items
    const { data: ords } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (ords) {
      setOrders(ords);
      setCurrentPage(1);
    }

    // Addresses
    const { data: addrs } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id);
    if (addrs) setAddresses(addrs);
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);

    const nameParts = firstName.trim().split(' ');
    const newFirstName = nameParts[0] || '';
    const newLastName = nameParts.slice(1).join(' ') || '';

    const updates = {
      id: user!.id, // Required for upsert
      first_name: newFirstName,
      last_name: newLastName,
      phone: phone,
      sex: sex,
      dob: dob || null,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
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

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error deleting profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await signOut();
      toast({
        title: "Profile deleted",
        description: "Your profile information has been removed.",
      });
      navigate("/");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id,
      default_address_id: addressId,
      updated_at: new Date(),
    });
    if (error) {
      toast({
        title: "Error setting default address",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Default address updated" });
      setDefaultAddressId(addressId);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    if (
      !newAddressLine.trim() ||
      !newCity ||
      !newState ||
      !newPincode ||
      !newCountry
    ) {
      toast({ title: "Please fill all address fields" });
      return;
    }

    setLoadingProfile(true);

    try {
      if (editingAddressId) {
        // Update existing address
        const { error } = await supabase
          .from("user_addresses")
          .update({
            street: newAddressLine,
            city: newCity,
            state: newState,
            zip: newPincode,
            country: newCountry,
          })
          .eq("id", editingAddressId);

        if (error) throw error;

        const updated = addresses.map((a) =>
          a.id === editingAddressId
            ? {
              ...a,
              street: newAddressLine,
              city: newCity,
              state: newState,
              zip: newPincode,
              country: newCountry,
            }
            : a,
        );
        setAddresses(updated);
        toast({ title: "Address updated successfully" });
        setEditingAddressId(null);
      } else {
        // Create new address
        const { data: newAddr, error } = await supabase
          .from("user_addresses")
          .insert({
            user_id: user.id,
            street: newAddressLine,
            city: newCity,
            state: newState,
            zip: newPincode,
            country: newCountry,
          })
          .select()
          .single();

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
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive",
      });
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
      // If the address being deleted is the default address, clear the default_address_id first
      // to avoid a foreign-key constraint violation in the database.
      if (defaultAddressId === id) {
        await supabase
          .from("profiles")
          .update({ default_address_id: null })
          .eq("id", user!.id);
        setDefaultAddressId(null);
      }

      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setAddresses(addresses.filter((a) => a.id !== id));
      toast({ title: "Address deleted successfully" });
      setShowDeleteConfirm(null);
    } catch (error: any) {
      toast({
        title: "Error deleting address",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-[150px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">
            You must be logged in to view your profile.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-brand-yellow text-brand-blue"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-[110px] md:pt-[145px] pb-0 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-24 py-8 md:py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-curemist-purple">My Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile, orders, and addresses</p>
          </div>

          {/* Logout Button - Top Right */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => signOut().then(() => navigate("/login"))}
              variant="destructive"
              className="text-sm px-6 py-2"
            >
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <nav className="sticky top-32 flex flex-col space-y-3 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-curemist-purple to-brand-blue p-6 text-white ">
                  <h2 className="font-bold text-xl text-[#0c1f4a]  drop-shadow-md">Settings</h2>
                </div>
                <div className="px-2 pb-2">
                  {tabs.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setActive(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${i === active
                        ? "bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue shadow-md scale-105 border-l-4 border-brand-blue"
                        : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent hover:border-gray-300"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </nav>
            </aside>

            {/* Content Section */}
            <section className="lg:col-span-3 bg-white rounded-xl border border-gray-300 shadow-lg min-h-[600px] overflow-hidden">
              {/* Content Header Background */}
              <div className="bg-gradient-to-r from-curemist-purple via-blue-600 to-brand-blue h-1"></div>

              <div className="p-8 md:p-10">{/* Profile Information Tab */}
                {active === 0 && (
                  <div className="space-y-8">
                    {/* Profile Header */}
                    <div className="pb-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-curemist-purple mb-1">Profile Information</h2>
                      <p className="text-gray-600 text-sm">Update your personal information and profile picture</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Profile Image Section */}
                      <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 flex-shrink-0">
                        <Avatar className="w-28 h-28 border-4 border-brand-yellow shadow-lg">
                          <AvatarImage src={avatarUrl} className="object-cover" />
                          <AvatarFallback className="text-3xl font-bold text-white bg-gradient-to-br from-curemist-purple to-brand-blue">
                            {firstName?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="w-full text-center flex flex-col items-center gap-3">
                          <label
                            htmlFor="avatar-upload"
                            className="text-sm font-semibold text-white cursor-pointer bg-gradient-to-r from-brand-yellow to-[#d4a835] hover:shadow-lg px-4 py-2 rounded-lg transition-all duration-200"
                          >
                            {loadingProfile ? "Uploading..." : "Upload Photo"}
                          </label>
                          {avatarUrl && (
                            <button
                              onClick={async () => {
                                if (!confirm("Remove profile photo?")) return;
                                setLoadingProfile(true);
                                const { error } = await supabase
                                  .from("profiles")
                                  .update({ avatar_url: null })
                                  .eq("id", user.id);
                                if (error) {
                                  toast({
                                    title: "Error removing photo",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                } else {
                                  setAvatarUrl("");
                                  toast({ title: "Photo removed" });
                                }
                                setLoadingProfile(false);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 underline font-medium"
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
                                const fileExt = file.name.split(".").pop();
                                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                const filePath = `${fileName}`;

                                const { error: uploadError } =
                                  await supabase.storage
                                    .from("avatars")
                                    .upload(filePath, file);

                                if (uploadError) throw uploadError;

                                const {
                                  data: { publicUrl },
                                } = supabase.storage
                                  .from("avatars")
                                  .getPublicUrl(filePath);

                                setAvatarUrl(publicUrl);

                                // Auto-save avatar update
                                await supabase
                                  .from("profiles")
                                  .update({ avatar_url: publicUrl })
                                  .eq("id", user.id);
                                toast({ title: "Profile photo updated!" });
                              } catch (error: any) {
                                toast({
                                  title: "Error uploading image",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              } finally {
                                setLoadingProfile(false);
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">Full Name</label>
                          <input
                            className="border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">Phone Number</label>
                          <input
                            type="tel"
                            maxLength={10}
                            pattern="\d{10}"
                            className="border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                            value={phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setPhone(val);
                            }}
                            placeholder="Mobile Number"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">Email Address</label>
                          <input
                            className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={user.email || ""}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">Gender</label>
                          <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">Date of Birth</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            max="2009-12-31"
                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loadingProfile}
                        className="bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue font-bold px-8 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        {loadingProfile ? "SAVING..." : "SAVE CHANGES"}
                      </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="font-bold text-lg mb-6 text-curemist-purple">
                        Change Password
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">New Password</label>
                          <div className="relative">
                            <input
                              className="w-full border border-gray-300 p-3 rounded-lg pr-10 focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="Enter new password"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? (
                                <FiEyeOff size={20} />
                              ) : (
                                <FiEye size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700 mb-2 text-sm">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              className="w-full border border-gray-300 p-3 rounded-lg pr-10 focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="Confirm password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? (
                                <FiEyeOff size={20} />
                              ) : (
                                <FiEye size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={handleUpdatePassword}
                          disabled={loadingPass}
                          className="bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          {loadingPass ? "UPDATING..." : "UPDATE PASSWORD"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order History Tab */}
                {active === 1 && (
                  <div>
                    <div className="pb-6 border-b border-gray-200 mb-6">
                      <h2 className="text-2xl font-bold text-curemist-purple mb-1">Order History</h2>
                      <p className="text-gray-600 text-sm">View and manage your orders</p>
                    </div>
                    {orders.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 mb-6 text-lg">
                          You don't have any orders yet.
                        </p>
                        <button
                          onClick={() => navigate("/")}
                          className="bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          START SHOPPING
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {paginatedOrders.map((ord) => (
                          <div
                            key={ord.id}
                            className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                          >
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300 bg-white flex-shrink-0 shadow-sm">
                                  {ord.order_items?.[0]?.image ? (
                                    <img
                                      src={ord.order_items[0].image}
                                      alt={
                                        ord.order_items[0].title || "Product image"
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">
                                    Order Placed
                                  </p>
                                  <p className="text-base font-semibold text-gray-800">
                                    {formatOrderDate(ord.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">
                                  Total Amount
                                </p>
                                <p className="text-xl font-bold text-curemist-purple">
                                  ₹{ord.total_price}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">
                                  Order ID
                                </p>
                                <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                  {formatOrderId(ord.id)}
                                </p>
                              </div>
                              <div className="px-4 py-2 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase">
                                {ord.order_status}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewOrder(ord)}
                                  className="border border-gray-300 hover:bg-gray-100"
                                >
                                  <FiEye className="h-4 w-4 mr-1" />
                                  <span>View Details</span>
                                </Button>
                              </div>
                            </div>
                            <div className="p-6 bg-white">
                              {ord.admin_note && (
                                <p className="text-sm text-gray-700 font-medium">
                                  <span className="text-gray-600">Note:</span> {ord.admin_note}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 font-medium">
                                <span className="text-gray-600">Items:</span> {ord.order_items?.length ?? 0} item{(ord.order_items?.length ?? 0) === 1 ? "" : "s"}
                              </p>
                              {ord.order_items && ord.order_items.length > 0 && (
                                <p className="text-sm text-gray-700 mt-2">
                                  <span className="text-gray-600">First item:</span>{" "}
                                  <span className="font-semibold text-curemist-purple">
                                    {ord.order_items[0].title}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {orders.length > pageSize && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-700 font-medium">
                              Showing{" "}
                              {Math.min(
                                orders.length,
                                (currentPage - 1) * pageSize + 1,
                              )}{" "}
                              - {Math.min(orders.length, currentPage * pageSize)} of{" "}
                              {orders.length} orders
                            </p>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="border border-gray-300 hover:bg-gray-100"
                              >
                                Previous
                              </Button>
                              <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                                Page {currentPage} of {totalPages}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="border border-gray-300 hover:bg-gray-100"
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Dialog
                      open={showOrderDialog}
                      onOpenChange={setShowOrderDialog}
                    >
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>
                            {selectedOrder
                              ? `Order ID: ${formatOrderId(selectedOrder.id)}`
                              : ""}
                          </DialogDescription>
                        </DialogHeader>

                        {selectedOrder ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-lg border p-4">
                                <h4 className="font-semibold mb-2">Order Info</h4>
                                <div className="text-sm space-y-1 text-gray-700">
                                  <p>
                                    <span className="font-medium">Placed:</span>{" "}
                                    {formatOrderDate(selectedOrder.created_at)}
                                  </p>
                                  <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    {selectedOrder.order_status}
                                  </p>
                                  <p>
                                    <span className="font-medium">Total:</span> ₹
                                    {selectedOrder.total_price}
                                  </p>
                                  {selectedOrder.subtotal && (
                                    <p>
                                      <span className="font-medium">Subtotal:</span>{" "}
                                      ₹{selectedOrder.subtotal}
                                    </p>
                                  )}
                                  {selectedOrder.discount_amount && (
                                    <p>
                                      <span className="font-medium">Discount:</span>{" "}
                                      ₹{selectedOrder.discount_amount}
                                    </p>
                                  )}
                                  {selectedOrder.coupon_discount && (
                                    <p>
                                      <span className="font-medium">Coupon:</span> ₹
                                      {selectedOrder.coupon_discount}
                                    </p>
                                  )}
                                  {selectedOrder.gst_amount && (
                                    <p>
                                      <span className="font-medium">GST:</span> ₹
                                      {selectedOrder.gst_amount}
                                    </p>
                                  )}
                                  {selectedOrder.payment_method && (
                                    <p>
                                      <span className="font-medium">
                                        Payment Method:
                                      </span>{" "}
                                      {selectedOrder.payment_method}
                                    </p>
                                  )}
                                  {selectedOrder.admin_note && (
                                    <p className="mt-2">
                                      <span className="font-medium">Note:</span> {selectedOrder.admin_note}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="rounded-lg border p-4">
                                <h4 className="font-semibold mb-2">Items</h4>
                                <div className="space-y-3">
                                  {selectedOrder.order_items?.map((item: any) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between gap-4 p-3 bg-gray-50 rounded"
                                    >
                                      <div className="flex-1">
                                        <p className="font-semibold">
                                          {item.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                          Price: ₹{item.price}
                                        </p>
                                        {item.discount && (
                                          <p className="text-xs text-gray-500">
                                            Discount: ₹{item.discount}
                                          </p>
                                        )}
                                        {item.gst && (
                                          <p className="text-xs text-gray-500">
                                            GST: ₹{item.gst}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="rounded-lg border p-4">
                                <h4 className="font-semibold mb-2">
                                  Shipping Address
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>{selectedOrder.shipping_address?.street}</p>
                                  <p>
                                    {selectedOrder.shipping_address?.city},{" "}
                                    {selectedOrder.shipping_address?.state}
                                  </p>
                                  <p>
                                    {selectedOrder.shipping_address?.zip},{" "}
                                    {selectedOrder.shipping_address?.country}
                                  </p>
                                </div>
                              </div>
                              <div className="rounded-lg border p-4">
                                <h4 className="font-semibold mb-2">
                                  Billing Address
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>{selectedOrder.billing_address?.street}</p>
                                  <p>
                                    {selectedOrder.billing_address?.city},{" "}
                                    {selectedOrder.billing_address?.state}
                                  </p>
                                  <p>
                                    {selectedOrder.billing_address?.zip},{" "}
                                    {selectedOrder.billing_address?.country}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            No order selected.
                          </p>
                        )}

                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setShowOrderDialog(false);
                              setSelectedOrder(null);
                            }}
                          >
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-curemist-purple mb-1">Address Information</h2>
                        <p className="text-gray-600 text-sm">Manage your delivery addresses</p>
                      </div>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                      >
                        + ADD NEW ADDRESS
                      </button>
                    </div>
                    {addresses.length === 0 && !showAddForm ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-lg">
                          No addresses saved yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((a, i) => (
                          <div
                            key={i}
                            className={`border-2 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all ${defaultAddressId === a.id ? "border-brand-yellow bg-yellow-50 shadow-md" : "border-gray-300 hover:shadow-md"}`}
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="pt-1 flex-shrink-0">
                                <input
                                  type="radio"
                                  name="default_addr"
                                  checked={defaultAddressId === a.id}
                                  onChange={() => handleSetDefaultAddress(a.id)}
                                  className="w-5 h-5 cursor-pointer text-brand-yellow focus:ring-brand-yellow"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                  <div className="min-w-0">
                                    <p className="font-bold text-base sm:text-lg text-gray-800 break-words">
                                      {a.street}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">
                                      {a.city}, {a.state} - {a.zip}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {a.country}
                                    </p>
                                  </div>
                                  {defaultAddressId === a.id && (
                                    <span className="text-xs bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue px-3 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                              <button
                                onClick={() => handleEditAddress(a)}
                                className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                              >
                                Edit
                              </button>
                              {defaultAddressId !== a.id && (
                                <button
                                  onClick={() => setShowDeleteConfirm(a.id)}
                                  className="w-full sm:w-auto px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Delete Address Confirmation */}
                    {showDeleteConfirm && (
                      <div className="mt-6 p-6 border-2 border-red-200 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-800 mb-4 font-medium">
                          Are you sure you want to delete this address?
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDeleteAddress(showDeleteConfirm)}
                            disabled={loadingProfile}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show Address Form */}
                    {showAddForm && (
                      <div className="mt-8 border-2 border-gray-300 pt-8 bg-gradient-to-b from-gray-50 to-white p-8 rounded-lg">
                        <h3 className="font-bold text-xl mb-6 text-curemist-purple">
                          {editingAddressId ? "Edit Address" : "Add New Address"}
                        </h3>
                        <div className="grid grid-cols-1 gap-5">
                          <input
                            value={newAddressLine}
                            onChange={(e) => setNewAddressLine(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                            placeholder="Address Line (Street, Flat, etc.)"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <input
                              value={newCity}
                              onChange={(e) => setNewCity(e.target.value)}
                              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="City"
                            />
                            <input
                              value={newState}
                              onChange={(e) => setNewState(e.target.value)}
                              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="State"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <input
                              value={newPincode}
                              onChange={(e) => setNewPincode(e.target.value)}
                              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="Pincode/Zip"
                            />
                            <input
                              value={newCountry}
                              onChange={(e) => setNewCountry(e.target.value)}
                              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all"
                              placeholder="Country"
                            />
                          </div>

                          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 font-semibold px-6 py-2 rounded-lg border border-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveAddress}
                              disabled={loadingProfile}
                              className="bg-gradient-to-r from-brand-yellow to-[#d4a835] text-brand-blue px-8 py-2 rounded-lg font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                            >
                              {editingAddressId ? "Update Address" : "Save Address"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
