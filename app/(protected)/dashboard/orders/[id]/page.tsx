// app/(protected)/dashboard/orders/[id]/page.tsx
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAdminOrderById, useUpdateOrderStatus,
  getOrderUserDisplay, type OrderStatus,
} from "@/app/hooks/useOrders";
import { STATUS_CONFIG } from "../page";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  User, ClipboardList, Loader2, ChevronDown,
} from "lucide-react";

function formatPrice(n: number) {
  return "₨ " + (n ?? 0).toLocaleString("en-PK");
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

// ─── Section Card ─────────────────────────────────────────
function Card({ title, icon: Icon, iconColor, children }: {
  title: string; icon: React.ElementType;
  iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e1e21] flex items-center gap-2">
        <Icon size={14} style={{ color: iconColor }} />
        <p className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, valueClass = "" }: {
  label: string; value: React.ReactNode; valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[#1e1e21] last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-xs font-medium text-right max-w-[200px] ${valueClass || "text-zinc-200"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Status Updater ───────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = [
  "Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"
];

function StatusUpdater({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const [open, setOpen]     = useState(false);
  const updateStatus        = useUpdateOrderStatus();
  const cfg                 = STATUS_CONFIG[current] ?? STATUS_CONFIG["Pending"];
  const Icon                = cfg.icon;

  function select(status: OrderStatus) {
    if (status === current) { setOpen(false); return; }
    updateStatus.mutate({ id: orderId, status }, {
      onSuccess: () => setOpen(false),
    });
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={updateStatus.isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50"
        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
        {updateStatus.isPending
          ? <Loader2 size={13} className="animate-spin" />
          : <Icon size={13} />}
        {current}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl w-44">
            {STATUS_FLOW.map((s) => {
              const sc   = STATUS_CONFIG[s];
              const SIcon = sc.icon;
              const isCurrentStatus = s === current;
              return (
                <button key={s} onClick={() => select(s)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-all hover:bg-zinc-800/60 ${
                    isCurrentStatus ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{ color: sc.color }}
                  disabled={isCurrentStatus}>
                  <SIcon size={12} />
                  {sc.label}
                  {isCurrentStatus && (
                    <span className="ml-auto text-[9px] text-zinc-600">current</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { data: order, isLoading, isError } = useAdminOrderById(id);
  console.log("Order details:", order, { id });

  if (isLoading) {
    return (
      <div className="p-8 max-w-[900px] mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-sm text-red-400">Order nahi mila.</p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG["Pending"];

  return (
    <div className="p-8 max-w-[900px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {order.orderNumber ?? `#${order._id.slice(-6).toUpperCase()}`}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(order.createdAt).toLocaleString("en-PK", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Status updater */}
        <StatusUpdater orderId={order._id} current={order.orderStatus} />
      </div>

      {/* Status progress bar */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800 z-0" />
          {(["Pending", "Processing", "Confirmed", "Shipped", "Delivered"] as OrderStatus[]).map((s, i) => {
            const scfg   = STATUS_CONFIG[s];
            const SIcon  = scfg.icon;
            const isDone = STATUS_FLOW.indexOf(order.orderStatus) >= STATUS_FLOW.indexOf(s)
              && order.orderStatus !== "Cancelled";
            return (
              <div key={s} className="flex flex-col items-center gap-2 z-10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isDone ? scfg.bg : "#18181b",
                    border: `2px solid ${isDone ? scfg.color : "#27272a"}`,
                  }}>
                  <SIcon size={13} style={{ color: isDone ? scfg.color : "#52525b" }} />
                </div>
                <span className="text-[10px] font-medium"
                  style={{ color: isDone ? scfg.color : "#52525b" }}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
        {order.orderStatus === "Cancelled" && (
          <p className="text-center text-xs text-red-400 mt-4 font-semibold">
            ✕ This order has been cancelled
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Customer */}
        <Card title="Customer" icon={User} iconColor="#6366f1">
          <InfoRow label="Name / Email" value={getOrderUserDisplay(order)} />
          {order.notes && (
            <InfoRow label="Notes" value={order.notes} valueClass="text-yellow-400" />
          )}
        </Card>

        {/* Payment */}
        <Card title="Payment" icon={CreditCard} iconColor="#22c55e">
          <InfoRow label="Method" value={order.paymentInfo?.method ?? "COD"} />
          <InfoRow label="Status"
            value={order.paymentInfo?.status ?? "Pending"}
            valueClass={order.paymentInfo?.status === "Paid" ? "text-green-400" : "text-orange-400"} />
          {order.paymentInfo?.paidAt && (
            <InfoRow label="Paid At"
              value={new Date(order.paymentInfo.paidAt).toLocaleDateString("en-PK")} />
          )}
          <InfoRow label="Items Price" value={formatPrice(order.itemsPrice)} />
          <InfoRow label="Tax" value={formatPrice(order.taxPrice)} />
          <InfoRow label="Shipping" value={formatPrice(order.shippingPrice)} />
          <InfoRow label="Total" value={formatPrice(order.totalPrice)} valueClass="text-white font-bold text-sm" />
        </Card>

        {/* Shipping Address */}
        <Card title="Shipping Address" icon={MapPin} iconColor="#f97316">
          <InfoRow label="Street"  value={order.shippingAddress?.street ?? "—"} />
          <InfoRow label="City"    value={order.shippingAddress?.city ?? "—"} />
          <InfoRow label="State"   value={order.shippingAddress?.state ?? "—"} />
          <InfoRow label="Country" value={order.shippingAddress?.country ?? "—"} />
          <InfoRow label="Zip"     value={order.shippingAddress?.zipCode ?? "—"} />
          <InfoRow label="Phone"   value={order.shippingAddress?.phone ?? "—"} />
        </Card>

        {/* Order Summary */}
        <Card title="Order Summary" icon={ClipboardList} iconColor="#a78bfa">
          <InfoRow label="Order Status"
            value={order.orderStatus}
            valueClass={`font-semibold`}
          />
          <InfoRow label="Total Items" value={order.orderItems?.length ?? 0} />
          {order.deliveredAt && (
            <InfoRow label="Delivered At"
              value={new Date(order.deliveredAt).toLocaleDateString("en-PK")} />
          )}
          <InfoRow label="Created"
            value={new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "2-digit", month: "short", year: "numeric",
            })} />
        </Card>
      </div>

      {/* Order Items */}
      <Card title="Order Items" icon={Package} iconColor="#f97316">
        <div className="space-y-3">
          {order.orderItems?.map((item) => (
            <div key={item._id}
              className="flex items-center gap-4 p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              {/* Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#27272a] flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Package size={14} className="text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                {/* <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p> */}
                {item.variant && (
                  <p className="text-[11px] text-indigo-400 mt-0.5">Variant: {item.variant}</p>
                )}
              </div>

              {/* Qty + Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-zinc-500">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}