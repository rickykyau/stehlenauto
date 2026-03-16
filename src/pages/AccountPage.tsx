import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogOut, MapPin, Package, Pencil, Plus, Trash2, User } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCustomer } from "@/contexts/CustomerContext";
import { useVehicle } from "@/contexts/VehicleContext";
import { updateCustomer, createAddress, deleteAddress } from "@/lib/shopify-customer";
import { getStoredToken } from "@/lib/shopify-customer";

const AccountPage = () => {
  const { customer, loading, logout, refresh } = useCustomer();
  const { vehicle, vehicleLabel } = useVehicle();
  const navigate = useNavigate();

  // Edit details state
  const [editingDetails, setEditingDetails] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Add address state
  const [addingAddress, setAddingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({ address1: "", address2: "", city: "", province: "", zip: "", country: "US" });
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    if (!loading && !customer) {
      navigate("/account/login");
    }
  }, [loading, customer, navigate]);

  useEffect(() => {
    if (customer) {
      setEditFirst(customer.firstName || "");
      setEditLast(customer.lastName || "");
      setEditEmail(customer.email || "");
    }
  }, [customer]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!customer) return null;

  const orders = customer.orders.edges;
  const addresses = customer.addresses.edges;

  const handleSaveDetails = async () => {
    setDetailsError("");
    const token = getStoredToken();
    if (!token) return;
    setDetailsLoading(true);
    const result = await updateCustomer(token, {
      firstName: editFirst,
      lastName: editLast,
      email: editEmail,
    });
    setDetailsLoading(false);
    if (result.success) {
      setEditingDetails(false);
      await refresh();
    } else {
      setDetailsError(result.errors?.[0]?.message || "Update failed.");
    }
  };

  const handleAddAddress = async () => {
    setAddrError("");
    const token = getStoredToken();
    if (!token) return;
    if (!addrForm.address1 || !addrForm.city || !addrForm.province || !addrForm.zip) {
      setAddrError("Please fill in all required fields.");
      return;
    }
    setAddrLoading(true);
    const result = await createAddress(token, addrForm);
    setAddrLoading(false);
    if (result.success) {
      setAddingAddress(false);
      setAddrForm({ address1: "", address2: "", city: "", province: "", zip: "", country: "US" });
      await refresh();
    } else {
      setAddrError(result.errors?.[0]?.message || "Could not add address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const token = getStoredToken();
    if (!token) return;
    await deleteAddress(token, id);
    await refresh();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-xl md:text-2xl tracking-widest text-foreground">
            WELCOME, {(customer.firstName || "").toUpperCase()}!
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors font-display text-[10px] tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Vehicle */}
          <div className="border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">MY VEHICLE</span>
            </div>
            {vehicle ? (
              <p className="font-body text-sm text-foreground">{vehicleLabel}</p>
            ) : (
              <p className="font-body text-sm text-muted-foreground">No vehicle saved.</p>
            )}
          </div>

          {/* Account Details */}
          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">ACCOUNT DETAILS</span>
              </div>
              {!editingDetails && (
                <button onClick={() => setEditingDetails(true)} className="text-primary hover:brightness-110 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {editingDetails ? (
              <div className="space-y-3">
                {detailsError && <p className="text-sm text-destructive font-body">{detailsError}</p>}
                <input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} placeholder="First Name"
                  className="w-full h-10 px-3 bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
                <input value={editLast} onChange={(e) => setEditLast(e.target.value)} placeholder="Last Name"
                  className="w-full h-10 px-3 bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email"
                  className="w-full h-10 px-3 bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
                <div className="flex gap-2">
                  <button onClick={handleSaveDetails} disabled={detailsLoading}
                    className="h-9 px-4 bg-primary text-primary-foreground font-display text-[10px] tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
                    {detailsLoading && <Loader2 className="w-3 h-3 animate-spin" />} SAVE
                  </button>
                  <button onClick={() => setEditingDetails(false)} className="h-9 px-4 border border-border text-muted-foreground font-display text-[10px] tracking-widest hover:text-foreground transition-colors">
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-body text-sm text-foreground">{customer.firstName} {customer.lastName}</p>
                <p className="font-body text-sm text-muted-foreground">{customer.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="mt-8 border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">ORDER HISTORY</span>
          </div>
          {orders.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(({ node: order }) => (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.orderNumber}`}
                  state={{ order }}
                  className="flex items-center justify-between py-3 px-4 border border-border hover:bg-accent/50 transition-colors group"
                >
                  <div>
                    <p className="font-display text-xs tracking-widest text-foreground group-hover:text-primary transition-colors">
                      {order.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm text-primary">${parseFloat(order.totalPrice.amount).toFixed(2)}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5 uppercase">{order.fulfillmentStatus.replace(/_/g, " ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="mt-8 border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">ADDRESSES</span>
            </div>
            {!addingAddress && (
              <button onClick={() => setAddingAddress(true)} className="flex items-center gap-1 text-primary hover:brightness-110 transition-colors font-display text-[10px] tracking-widest">
                <Plus className="w-3.5 h-3.5" /> ADD
              </button>
            )}
          </div>

          {addingAddress && (
            <div className="mb-4 p-4 border border-border bg-background space-y-3">
              {addrError && <p className="text-sm text-destructive font-body">{addrError}</p>}
              <input value={addrForm.address1} onChange={(e) => setAddrForm({ ...addrForm, address1: e.target.value })} placeholder="Address Line 1 *"
                className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
              <input value={addrForm.address2} onChange={(e) => setAddrForm({ ...addrForm, address2: e.target.value })} placeholder="Address Line 2"
                className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
              <div className="grid grid-cols-2 gap-3">
                <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="City *"
                  className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
                <input value={addrForm.province} onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })} placeholder="State/Province *"
                  className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} placeholder="ZIP/Postal *"
                  className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
                <input value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} placeholder="Country"
                  className="w-full h-10 px-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddAddress} disabled={addrLoading}
                  className="h-9 px-4 bg-primary text-primary-foreground font-display text-[10px] tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
                  {addrLoading && <Loader2 className="w-3 h-3 animate-spin" />} SAVE ADDRESS
                </button>
                <button onClick={() => { setAddingAddress(false); setAddrError(""); }}
                  className="h-9 px-4 border border-border text-muted-foreground font-display text-[10px] tracking-widest hover:text-foreground transition-colors">
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !addingAddress ? (
            <p className="font-body text-sm text-muted-foreground">No saved addresses.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map(({ node: addr }) => (
                <div key={addr.id} className="flex items-start justify-between py-3 px-4 border border-border">
                  <div>
                    <p className="font-body text-sm text-foreground">{addr.address1}</p>
                    {addr.address2 && <p className="font-body text-sm text-muted-foreground">{addr.address2}</p>}
                    <p className="font-body text-sm text-muted-foreground">{addr.city}, {addr.province} {addr.zip}</p>
                    <p className="font-body text-sm text-muted-foreground">{addr.country}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default AccountPage;
