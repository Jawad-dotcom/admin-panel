// app/(protected)/dashboard/orders/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrders, getOrderUserDisplay, type Order, type OrderStatus } from "@/app/hooks/useOrders";
import {
  ShoppingCart, Search, RefreshCw, Filter,
  Eye, Clock, CheckCircle2, Truck, XCircle,
  AlertCircle, Hourglass, TrendingUp,
} from "lucide-react";

// ─── Status Config ────────────────────────────────────────
export const STATUS_CONFIG: Record<OrderStatus, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType;
}> = {
  Pending:    { label: "Pending",    color: "#a78bfa", bg: "#a78bfa12", border: "#a78bfa30", icon: Hourglass },
  Processing: { label: "Processing", color: "#f97316", bg: "#f9731612", border: "#f9731630", icon: Clock },
  Confirmed:  { label: "Confirmed",  color: "#3b82f6", bg: "#3b82f612", border: "#3b82f630", icon: AlertCircle },
  Shipped:    { label: "Shipped",    color: "#38bdf8", bg: "#38bdf812", border: "#38bdf830", icon: Truck },
  Delivered:  { label: "Delivered",  color: "#22c55e", bg: "#22c55e12", border: "#22c55e30", icon: CheckCircle2 },
  Cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "#ef444412", border: "#ef444430", icon: XCircle },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG["Pending"];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <Icon size={10} />
      {s.label}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

function formatPrice(n: number) {
  return "₨ " + (n ?? 0).toLocaleString("en-PK");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "2-digit", month: "short" });
}

// ─── Page ─────────────────────────────────────────────────
export default function OrdersPage() {
  const { data: orders, isLoading, isError, refetch, isFetching } = useOrders();

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  const filtered = (orders ?? []).filter((o) => {
    const userDisplay = getOrderUserDisplay(o).toLowerCase();
    const matchSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      userDisplay.includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalRevenue = (orders ?? [])
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-400" />
            Orders
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isLoading ? "..." : `${orders?.length ?? 0} total orders`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Revenue pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <TrendingUp size={13} className="text-green-400" />
            <span className="text-xs font-semibold text-green-400">
              {isLoading ? "..." : formatPrice(totalRevenue)}
            </span>
          </div>
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-all disabled:opacity-40">
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by order # or customer..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111113] border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-[#111113] border border-[#27272a] rounded-xl px-2 py-1 flex-wrap">
          <button onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === "all"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}>
            All ({orders?.length ?? 0})
          </button>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = (orders ?? []).filter((o) => o.orderStatus === s).length;
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={filterStatus === s ? { background: cfg.bg, color: cfg.color } : {}}>
                {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
          ⚠ Orders load nahi ho sake. Refresh karo.
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e21]">
              {["Order #", "Customer", "Items", "Amount", "Payment", "Status", "Date", "Action"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(7).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1a1d]">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-sm text-zinc-600">
                  {search || filterStatus !== "all"
                    ? "Koi order nahi mila is filter ke sath"
                    : "Abhi koi order nahi hai"}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order._id}
                  className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors">

                  {/* Order # */}
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-indigo-400 font-semibold">
                      {order.orderNumber ?? `#${order._id.slice(-6).toUpperCase()}`}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-medium text-zinc-200 truncate max-w-[130px]">
                      {getOrderUserDisplay(order)}
                    </p>
                  </td>

                  {/* Items count */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-zinc-400">
                      {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-white">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {order.paymentInfo?.method ?? "COD"}
                      </span>
                      <span className={`block text-[10px] font-semibold mt-0.5 ${
                        order.paymentInfo?.status === "Paid" ? "text-green-400" : "text-zinc-600"
                      }`}>
                        {order.paymentInfo?.status ?? "Pending"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.orderStatus} />
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-mono text-zinc-600">
                      {timeAgo(order.createdAt)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/orders/${order._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all w-fit">
                      <Eye size={11} /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e21] flex justify-between items-center">
            <p className="text-[11px] text-zinc-600 font-mono">
              {filtered.length} of {orders?.length} orders
            </p>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="text-green-400">
                {(orders ?? []).filter(o => o.orderStatus === "Delivered").length} delivered
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-red-400">
                {(orders ?? []).filter(o => o.orderStatus === "Cancelled").length} cancelled
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}