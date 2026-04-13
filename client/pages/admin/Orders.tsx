import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatOrderDate, formatOrderId } from "@/lib/utils";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const today = new Date();
  const defaultEndDate = today.toISOString().slice(0, 10);
  const defaultStart = new Date(today);
  defaultStart.setMonth(defaultStart.getMonth() - 3);
  const [startDate, setStartDate] = useState(
    defaultStart.toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("processing");

  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Failed to fetch orders",
        description: error.message || "Check your RLS policies.",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
      // Initialize notes state from fetched orders so textareas are controlled
      const notesMap: Record<string, string> = {};
      (data || []).forEach((o: any) => {
        if (o && o.id) notesMap[o.id] = o.admin_note ?? "";
      });
      setOrderNotes(notesMap);
      console.log("Orders fetched:", data?.length); // Debug log
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const confirmed = window.confirm(
      `Confirm update status for this order to '${newStatus}'?`,
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: `Order updated to ${newStatus}` });
      fetchOrders();
    }
  };

  const saveOrderNote = async (orderId: string) => {
    const raw = orderNotes[orderId];
    const note = raw === "" ? null : raw ?? null;
    const { error } = await supabase.from("orders").update({ admin_note: note }).eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Note saved" });
      fetchOrders();
    }
  };

  const deleteOrderNote = async (orderId: string) => {
    const confirmed = window.confirm("Delete this note? This will remove it for the customer.");
    if (!confirmed) return;

    const { error } = await supabase.from("orders").update({ admin_note: null }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
    } else {
      // remove from local state too
      setOrderNotes((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
      toast({ title: "Success", description: "Note deleted" });
      fetchOrders();
    }
  };

  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!selectedOrders.length) {
      toast({
        title: "No orders selected",
        description: "Please select orders first.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Change status of ${selectedOrders.length} selected orders to '${bulkStatus}'?`,
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .update({ order_status: bulkStatus })
      .in("id", selectedOrders);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Bulk status update failed",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Selected orders updated" });
      setSelectedOrders([]);
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const rawPhone = (order.customer_info?.phone || "")
      .toString()
      .toLowerCase();
    const formattedOrderId = formatOrderId(order.id).toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      formattedOrderId.includes(q) ||
      order.customer_info?.firstName?.toLowerCase().includes(q) ||
      order.customer_info?.email?.toLowerCase().includes(q) ||
      rawPhone.includes(q);

    const matchesStatus =
      statusFilter === "all" || order.order_status === statusFilter;

    const orderDate = order.created_at
      ? new Date(order.created_at).toISOString().slice(0, 10)
      : null;
    const matchesDate =
      orderDate &&
      (!startDate || orderDate >= startDate) &&
      (!endDate || orderDate <= endDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / rowsPerPage),
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "payment_processing":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "payment_failed":
        return "bg-rose-100 text-rose-800 hover:bg-rose-100";
      case "processing":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "order received":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const exportOrdersToXls = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Mobile",
      "Total",
      "Status",
      "Shipping Address",
      "Billing Address",
      "Payment Method",
    ];

    const ordersToExport =
      selectedOrders.length > 0
        ? filteredOrders.filter((order) => selectedOrders.includes(order.id))
        : filteredOrders;

    const rows = ordersToExport.map((order) => {
      const shipping = order.shipping_address
        ? `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.zip}, ${order.shipping_address.country}`
        : "";
      const billing = order.billing_address
        ? `${order.billing_address.street}, ${order.billing_address.city}, ${order.billing_address.state}, ${order.billing_address.zip}, ${order.billing_address.country}`
        : "";
      return [
        formatOrderId(order.id),
        formatOrderDate(order.created_at),
        `${order.customer_info?.firstName || ""} ${order.customer_info?.lastName || ""}`.trim(),
        order.customer_info?.phone || "",
        order.total_price,
        order.order_status,
        shipping,
        billing,
        order.payment_method || "",
      ];
    });

    const tsv = [headers, ...rows].map((row) => row.join("\t")).join("\n");
    const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-purple-900">
            Orders
          </h2>
          <p className="text-muted-foreground">
            Manage and track customer orders.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, Customer Name, Email, or Mobile..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-auto"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-auto"
          />
          {/* <Button
                        variant="secondary"
                        onClick={() => {
                            const resetEnd = new Date();
                            const resetStart = new Date();
                            resetStart.setMonth(resetStart.getMonth() - 3);
                            setStartDate(resetStart.toISOString().slice(0, 10));
                            setEndDate(resetEnd.toISOString().slice(0, 10));
                            setCurrentPage(1);
                        }}
                    >
                        Last 3 months
                    </Button> */}
        </div>
        {/* <Button variant="outline" onClick={async () => {
                    const { data: ordersWithItems, error } = await supabase
                        .from('orders')
                        .select('*, order_items(*)')
                        .order('created_at', { ascending: false });

                    if (error) {
                        toast({ title: "Export Failed", description: error.message, variant: "destructive" });
                        return;
                    }

                    const doc = new jsPDF();

                    const tableRows: any[] = [];

                    ordersWithItems?.forEach(order => {
                        const orderDate = new Date(order.created_at).toLocaleDateString();
                        const customer = `${order.customer_info?.firstName} ${order.customer_info?.lastName}\n${order.customer_info?.email}\n${order.customer_info?.phone}`;
                        const address = `${order.shipping_address?.street}, ${order.shipping_address?.city}, ${order.shipping_address?.zip}`;

                        // Main Order Row
                        tableRows.push([
                            order.id,
                            orderDate,
                            customer,
                            'Order Summary', // Item placeholder for main row
                            '-', // Qty
                            order.order_status,
                            `Rs. ${order.total_price}`
                        ]);

                        // Detail Rows for Items
                        if (order.order_items && order.order_items.length > 0) {
                            order.order_items.forEach((item: any) => {
                                tableRows.push([
                                    '', // ID
                                    '', // Date
                                    '', // Customer
                                    `  - ${item.title}`, // Indented Item
                                    item.quantity,
                                    '', // Status
                                    `Rs. ${item.price}` // Price
                                ]);
                            });
                        }
                    });

                    autoTable(doc, {
                        head: [['Order ID', 'Date', 'Customer Info', 'Item / Details', 'Qty', 'Status', 'Total/Price']],
                        body: tableRows,
                        startY: 20,
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [75, 0, 130] }, // Purple header
                        alternateRowStyles: { fillColor: [245, 245, 245] },
                    });

                    doc.text("All Orders Detailed Report", 14, 15);
                    doc.save(`orders_report_${new Date().toISOString().slice(0, 10)}.pdf`);
                }}>
                    Download PDF Report
                </Button> */}
        <Button variant="outline" onClick={exportOrdersToXls}>
          Export XLS
        </Button>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Bulk status:</label>
          <Select
            value={bulkStatus}
            onValueChange={(val) => setBulkStatus(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="order received">Order Received</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleBulkUpdateStatus}
          >
            Apply to selected
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="payment_processing">
              Payment Processing
            </SelectItem>
            <SelectItem value="payment_failed">Payment Failed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="order received">Order Received</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length > 0 &&
                      selectedOrders.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleToggleOrderSelection(order.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs font-mono">
                      {formatOrderId(order.id)}
                    </TableCell>
                    <TableCell>{formatOrderDate(order.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.customer_info?.firstName}{" "}
                          {order.customer_info?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.customer_info?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.customer_info?.phone || "N/A"}</TableCell>
                    <TableCell>₹{order.total_price}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(order.order_status)}
                        variant="outline"
                      >
                        {order.order_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>
                                Order Details - {formatOrderId(order.id)}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                              <div>
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Customer Info
                                </h3>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {order.customer_info?.firstName}{" "}
                                    {order.customer_info?.lastName}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {order.customer_info?.email}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {order.customer_info?.phone}
                                  </p>
                                  <p>
                                    <span className="font-medium">Sex:</span>{" "}
                                    {order.customer_info?.sex || "N/A"}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Date of Birth:
                                    </span>{" "}
                                    {order.customer_info?.dob || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Payment Info
                                </h3>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    {order.payment_status}
                                  </p>
                                  <p>
                                    <span className="font-medium">Total:</span>{" "}
                                    ₹{order.total_price}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Created:
                                    </span>{" "}
                                    {formatOrderDate(order.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Shipping Address
                                </h3>
                                <div className="text-sm text-gray-600">
                                  {order.shipping_address?.street}
                                  <br />
                                  {order.shipping_address?.city},{" "}
                                  {order.shipping_address?.state}
                                  <br />
                                  {order.shipping_address?.zip},{" "}
                                  {order.shipping_address?.country}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Billing Address
                                </h3>
                                <div className="text-sm text-gray-600">
                                  {order.billing_address?.street || "N/A"}
                                  <br />
                                  {order.billing_address?.city || ""}
                                  {order.billing_address?.city ? ", " : ""}
                                  {order.billing_address?.state || ""}
                                  <br />
                                  {order.billing_address?.zip || ""}
                                  {order.billing_address?.zip ? ", " : ""}
                                  {order.billing_address?.country || ""}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Product Details
                                </h3>
                                <div className="space-y-2">
                                  {order.order_items &&
                                  order.order_items.length > 0 ? (
                                    order.order_items.map(
                                      (item: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3 p-2 border rounded"
                                        >
                                          <img
                                            src={
                                              item.image ||
                                              "/placeholder-product.jpg"
                                            }
                                            alt={item.title}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium text-sm">
                                              {item.title}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                              Qty: {item.quantity} × ₹
                                              {item.price}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">
                                              ₹{item.quantity * item.price}
                                            </p>
                                          </div>
                                        </div>
                                      ),
                                    )
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No items found
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-purple-900 mb-2">
                                  Order Action
                                </h3>
                                <Select
                                  defaultValue={order.order_status}
                                  onValueChange={(val) =>
                                    updateOrderStatus(order.id, val)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Update Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="processing">
                                      Processing
                                    </SelectItem>
                                    <SelectItem value="order received">
                                      Order Received
                                    </SelectItem>
                                    <SelectItem value="shipped">
                                      Shipped
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                      Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Admin Note
                                  </label>
                                  <textarea
                                    className="mt-1 block w-full border rounded p-2 text-sm"
                                    placeholder="Add an internal note for the customer (visible in their order history)"
                                    value={orderNotes[order.id] ?? order.admin_note ?? ""}
                                    onChange={(e) =>
                                      setOrderNotes((prev) => ({
                                        ...prev,
                                        [order.id]: e.target.value,
                                      }))
                                    }
                                    rows={3}
                                  />
                                  <div className="mt-2 flex gap-2">
                                    <Button size="sm" onClick={() => saveOrderNote(order.id)}>
                                      Save Note
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteOrderNote(order.id)}
                                    >
                                      Delete Note
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-gray-50">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(filteredOrders.length, currentPage * rowsPerPage)} of{" "}
              {filteredOrders.length} orders
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
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded p-1"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
