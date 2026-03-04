// app/(protected)/dashboard/products/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { useProductById } from "@/app/hooks/useProducts";
import ProductForm from "@/app/components/products/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, isError } = useProductById(id);
  console.log("Product data in EditProductPage:", product);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-zinc-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading product...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-400">Error fetching product.</p>
      </div>
    );
  }
  if ( !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-400">Product nahi mila.</p>
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}