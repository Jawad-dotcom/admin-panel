// hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────
export interface DashboardOrder {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name?: string; email?: string } | null;
  totalPrice: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  orderStatus: "Pending" | "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentInfo: { method: string; status: string };
  createdAt: string;
  notes?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: DashboardOrder[];
  ordersByStatus: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
}

// ─── Helper: user display se nikaalo ─────────────────────
export function getOrderUser(order: DashboardOrder): string {
  if (!order.user) return "Guest";
  if (typeof order.user === "string") return `#${order.user.slice(-6).toUpperCase()}`;
  return order.user.email ?? order.user.name ?? `#${order.user._id.slice(-6).toUpperCase()}`;
}

// ─── Fetch ────────────────────────────────────────────────
async function fetchDashboardStats(): Promise<DashboardStats> {
  const [ordersRes, productsRes, categoriesRes] = await Promise.all([
    api.get("/orders/admin/all"),  // ✅ admin route
    api.get("/products"),
    api.get("/categories"),
  ]);

  const orders: DashboardOrder[] = ordersRes.data.orders ?? [];
  const products   = productsRes.data.products    ?? [];
  const categories = categoriesRes.data.categories ?? [];

  // Revenue — cancelled orders exclude
  const totalRevenue =
    ordersRes.data.totalRevenue ??
    orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  // All 6 statuses — Pending bhi add kiya
  const ALL_STATUSES = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const ordersByStatus = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});
  orders.forEach((o) => {
    if (o.orderStatus in ordersByStatus) ordersByStatus[o.orderStatus]++;
  });

  // Revenue last 6 months
  const now = new Date();
  const revenueByMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("default", { month: "short" });
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return (
          od.getMonth() === d.getMonth() &&
          od.getFullYear() === d.getFullYear() &&
          o.orderStatus !== "Cancelled"
        );
      })
      .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
    return { month: label, revenue };
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalProducts: products.length,
    totalCategories: categories.length,
    recentOrders,
    ordersByStatus,
    revenueByMonth,
  };
}

// ─── Hook ─────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}