// hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────
export type OrderStatus =
  | "Pending" | "Processing" | "Confirmed"
  | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
  _id: string;
  product: { _id: string; name: string; images: { url: string }[]; price: number } | null;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name?: string; email?: string; username?: string } | string | null;
  orderItems: OrderItem[];
  shippingAddress: {
    street: string; city: string; state: string;
    country: string; zipCode: string; phone: string;
  };
  paymentInfo: { method: string; status: string; paidAt?: string };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── helpers ──────────────────────────────────────────────
export function getOrderUserDisplay(order: Order): string {
  if (!order.user) return "Guest";
  if (typeof order.user === "string") return `#${order.user.slice(-6).toUpperCase()}`;
  return order.user.email ?? order.user.username ?? order.user.name ?? `#${order.user._id.slice(-6).toUpperCase()}`;
}

// ─── GET ALL (admin) ──────────────────────────────────────
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/orders/admin/all");
      console.log("Fetched orders:", res.data.orders);
      return res.data.orders as Order[];
    },
  });
}

// ─── GET BY ID (admin) ──────────────────────────────────────
export function useAdminOrderById(id: string) {
  return useQuery({
    queryKey: ["adminOrder", id],
    queryFn: async () => {
      const res = await api.get(`/orders/admin/${id}`);
      return res.data.order as Order;
    },
    enabled: !!id,
  });
}

// ─── GET BY ID (admin uses getOrderDetails but bypasses user check) ──
export function useOrderById(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      console.log("Fetched order id rana:", res.data.order);
      return res.data.order as Order;
    },
    enabled: !!id,
  });
}

// ─── UPDATE STATUS (admin) ────────────────────────────────
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await api.put(`/orders/admin/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
      toast.success("Order status update ho gaya!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Status update nahi ho saka");
    },
  });
}