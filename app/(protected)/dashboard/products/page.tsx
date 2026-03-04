// app/(protected)/dashboard/products/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts, useDeleteProduct, type Product } from "@/app/hooks/useProducts";
import {
  Plus, Search, Pencil, Trash2, Package,
  RefreshCw, Star, ToggleLeft, ToggleRight, Filter,
} from "lucide-react";

// ─── Confirm Dialog ───────────────────────────────────────
function ConfirmDialog({
  name, onConfirm, onCancel, loading,
}: {
  name: string; onConfirm: () => void;
  onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Product delete karein?</h3>
        <p className="text-sm text-zinc-400 mb-5">
          <span className="text-white font-medium">"{name}"</span> aur iske saare
          images Cloudinary se permanently delete ho jayenge.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-[#27272a] text-zinc-400 hover:text-white transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

// ─── Page ─────────────────────────────────────────────────
export default function ProductsPage() {
  const { data: products, isLoading, isError, refetch, isFetching } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filter
  const filtered = (products ?? []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true :
      filterStatus === "active" ? p.isActive :
      !p.isActive;
    return matchSearch && matchStatus;
  });

  function formatPrice(n: number) {
    return "₨ " + n.toLocaleString("en-PK");
  }

  function getCategoryName(cat: Product["category"]) {
    if (!cat) return "—";
    if (typeof cat === "string") return cat;
    return cat.name;
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package size={22} className="text-orange-400" />
            Products
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isLoading ? "..." : `${products?.length ?? 0} total products`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 rounded-xl text-zinc-500 border border-[#27272a] hover:border-[#3f3f46] hover:text-white transition-all disabled:opacity-40">
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          <Link href="/dashboard/products/add"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors">
            <Plus size={15} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by name or brand..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111113] border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
        </div>
        <div className="flex items-center gap-2 bg-[#111113] border border-[#27272a] rounded-xl px-3">
          <Filter size={13} className="text-zinc-500" />
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filterStatus === s
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
          ⚠ Products load nahi ho sake. Refresh karo.
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e21]">
              {["Image", "Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1a1d]">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-sm text-zinc-600">
                  {search ? `"${search}" se koi product nahi mila` : "Koi product nahi — add karo"}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product._id}
                  className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors">

                  {/* Image */}
                  <td className="px-5 py-3.5">
                    {product.images?.[0]?.url ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#27272a] bg-zinc-800">
                        <img src={product.images[0].url} alt={product.name}
                          className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-[#27272a] flex items-center justify-center">
                        <Package size={14} className="text-zinc-600" />
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                      {product.isFeatured && (
                        <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    {product.brand && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{product.brand}</p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {getCategoryName(product.category)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
                    {product.discountPrice && (
                      <p className="text-[11px] text-green-400 mt-0.5">
                        Sale: {formatPrice(product.discountPrice)}
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-3.5">
                    {product.variants && product.variants.length > 0 ? (
                      <span className="text-[11px] font-mono text-indigo-400">
                        {product.variants.length} variants
                      </span>
                    ) : (
                      <span className={`text-xs font-semibold font-mono ${
                        product.stock === 0 ? "text-red-400" :
                        product.stock < 10 ? "text-yellow-400" :
                        "text-green-400"
                      }`}>
                        {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    {product.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        <ToggleRight size={11} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700">
                        <ToggleLeft size={11} /> Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/products/${product._id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all">
                        <Pencil size={11} /> Edit
                      </Link>
                      <button onClick={() => setDeleteTarget(product)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e21] flex items-center justify-between">
            <p className="text-[11px] text-zinc-600 font-mono">
              {filtered.length} of {products?.length} products
            </p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-600">
              <span className="text-green-400">
                {products?.filter(p => p.isActive).length} active
              </span>
              <span>·</span>
              <span className="text-red-400">
                {products?.filter(p => p.stock === 0).length} out of stock
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          loading={deleteProduct.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteProduct.mutate(deleteTarget._id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
        />
      )}
    </div>
  );
}