// components/products/ProductForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useAddProduct,
  useEditProduct,
  type Product,
} from "@/app/hooks/useProducts";
import { useCategories } from "@/app/hooks/useCategories";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Package,
  Loader2,
  Star,
} from "lucide-react";

interface Props {
  mode: "add" | "edit";
  product?: Product;
}

interface VariantRow {
  label: string;
  value: string;
  stock: number;
  price: string;
}

// ─── Input ────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 transition-colors";

// ─── Page ─────────────────────────────────────────────────
export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const isPending = addProduct.isPending || editProduct.isPending;

  // Basic fields
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(Number(product?.price ?? ""));
  const [discountPrice, setDiscount] = useState(
    Number(product?.discountPrice ?? ""),
  );
  const [category, setCategory] = useState(
    typeof product?.category === "object"
      ? product.category._id
      : (product?.category ?? ""),
  );
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product?.images?.map((i) => i.url) ?? [],
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.map((v) => ({
      label: v.label,
      value: v.value,
      stock: v.stock,
      price: String(v.price ?? ""),
    })) ?? [],
  );
  const hasVariants = variants.length > 0;

  // Specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    product?.specifications
      ? Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value,
        }))
      : [],
  );

  // ─── Handlers ───────────────────────────────────────────
  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  }

  // Agar edit mode + ye image existing product ki hai, toh usko remove karne ke liye uski public_id ko removedImages state mein add karo. Naye images ke liye, bas unko imageFiles state se remove kar do.
  function removeImage(i: number) {
    // Agar edit mode + ye image existing product ki hai
    if (mode === "edit" && product?.images?.[i]) {
      const publicId = product.images[i].public_id;
      setRemovedImages((prev) => [...prev, publicId]);
    } else {
      // new images ke liye
      setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    }

    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { label: "Size", value: "", stock: 0, price: "" },
    ]);
  }

  function updateVariant(
    i: number,
    field: keyof VariantRow,
    val: string | number,
  ) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)),
    );
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateSpec(i: number, field: "key" | "value", val: string) {
    setSpecs((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
  }

  function removeSpec(i: number) {
    setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", String(price));
    if (discountPrice) formData.append("discountPrice", String(discountPrice));
    formData.append("category", category);
    if (brand) formData.append("brand", brand.trim());
    formData.append("isActive", String(isActive));
    formData.append("isFeatured", String(isFeatured));

   // ✅ Ye line change karo:
if (hasVariants) {
  formData.append("variants", JSON.stringify(variants.map((v) => ({
    label: v.label,
    value: v.value,
    stock: v.stock,
    price: v.price ? Number(v.price) : undefined,
  }))));
  // stock mat bhejo
} else {
  formData.append("stock", stock);
  formData.append("variants", JSON.stringify([])); // ← YE ADD KARO
}

    if (specs.length > 0) {
      const specObj = specs.reduce<Record<string, string>>((acc, s) => {
        if (s.key.trim()) acc[s.key.trim()] = s.value.trim();
        return acc;
      }, {});
      formData.append("specifications", JSON.stringify(specObj));
    }

    imageFiles.forEach((file) => formData.append("images", file));

    if (mode === "add") {
      addProduct.mutate(formData, {
        onSuccess: () => router.push("/dashboard/products"),
      });
    }
    if (mode === "edit" && !product?._id) {
      console.error("Product ID missing for edit mode");
      return;
    }

    if (mode === "edit" && removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    if (mode === "edit" && product?._id) {
      editProduct.mutate(
        { id: product._id, formData },
        {
          onSuccess: () => router.push("/dashboard/products"),
        },
      );
      console.log("Submitted form data for edit:", {
        id: product!._id,
        name,
        description,
        price,
        discountPrice,
        category,
        brand,
        stock,
        isActive,
        isFeatured,
        variants,
        specs,
        imageFiles,
      });
    }
  }

  return (
    <div className="p-8 max-w-[780px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package size={18} className="text-orange-400" />
            {mode === "add" ? "Add Product" : `Edit: ${product?.name}`}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === "add"
              ? "Naya product add karo"
              : "Product details update karo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Basic Info
          </p>

          <Field label="Product Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Nike Air Max 90"
              className={inputCls}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Product description..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike, Samsung..."
                className={inputCls}
              />
            </Field>
            <Field label="Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Select category</option>
                {(categories ?? []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Pricing
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₨)" required>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                min="1"
                placeholder="0"
                className={inputCls}
              />
            </Field>
            <Field label="Discount Price (₨)">
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min="1"
                placeholder="Optional"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Stock / Variants */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Stock & Variants
            </p>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              <Plus size={11} /> Add Variant
            </button>
          </div>

          {!hasVariants ? (
            <Field label="Stock Quantity">
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                placeholder="0"
                className={inputCls}
              />
            </Field>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-1">
                <span>Label</span>
                <span>Value</span>
                <span>Stock</span>
                <span>Price (₨)</span>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <input
                    value={v.label}
                    onChange={(e) => updateVariant(i, "label", e.target.value)}
                    placeholder="Size"
                    className={`${inputCls} text-xs py-2`}
                  />
                  <input
                    value={v.value}
                    onChange={(e) => updateVariant(i, "value", e.target.value)}
                    placeholder="XL"
                    className={`${inputCls} text-xs py-2`}
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      updateVariant(i, "stock", Number(e.target.value))
                    }
                    min="0"
                    placeholder="0"
                    className={`${inputCls} text-xs py-2`}
                  />
                  <div className="flex gap-2">
                    <input
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, "price", e.target.value)
                      }
                      placeholder="Optional"
                      className={`${inputCls} text-xs py-2`}
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Product Images{" "}
            {mode === "add" && <span className="text-red-400">*</span>}
          </p>

          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border border-[#27272a]"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors"
                >
                  <X size={10} className="text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-semibold bg-black/60 text-white rounded-b-xl py-0.5">
                    Main
                  </span>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-[#27272a] rounded-xl flex flex-col items-center justify-center gap-1 text-zinc-600 hover:border-orange-500/40 hover:text-orange-400 transition-all"
            >
              <Upload size={16} />
              <span className="text-[9px] font-medium">Add</span>
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="hidden"
          />
          <p className="text-[11px] text-zinc-600">
            First image main image hogi. Multiple images select kar sakte ho.
          </p>
        </div>

        {/* Specifications */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Specifications
            </p>
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all"
            >
              <Plus size={11} /> Add Spec
            </button>
          </div>

          {specs.length === 0 ? (
            <p className="text-xs text-zinc-600">
              e.g. Color → Red, Material → Cotton
            </p>
          ) : (
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={s.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                    placeholder="Key (e.g. Color)"
                    className={`${inputCls} text-xs py-2 flex-1`}
                  />
                  <input
                    value={s.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    placeholder="Value (e.g. Red)"
                    className={`${inputCls} text-xs py-2 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            Settings
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Status</label>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setIsActive(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isActive === val
                        ? val
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-zinc-700/40 border-zinc-600 text-zinc-300"
                        : "border-[#27272a] text-zinc-600 hover:border-[#3f3f46]"
                    }`}
                  >
                    {val ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2">
                Featured
              </label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                  isFeatured
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "border-[#27272a] text-zinc-600 hover:border-[#3f3f46]"
                }`}
              >
                <Star
                  size={12}
                  className={isFeatured ? "fill-yellow-400" : ""}
                />
                {isFeatured ? "Featured" : "Not Featured"}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#27272a] text-zinc-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim() || !price || !category}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {mode === "add" ? "Adding..." : "Saving..."}
              </>
            ) : mode === "add" ? (
              "Add Product"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
