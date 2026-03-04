// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────
export interface ProductImage {
  public_id: string;
  url: string;
}

export interface ProductVariant {
  label: string;
  value: string;
  stock: number;
  price?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: ProductImage[];
  category: { _id: string; name: string } | string;
  subCategory?: string;
  brand?: string;
  stock: number;
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

// ─── GET ALL ──────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");        // GET /api/products
      return res.data.products as Product[];
    },
  });
}

// ─── GET BY ID ────────────────────────────────────────────
export function useProductById(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await api.get(`/product/${id}`);   // ✅ GET /api/product/:id
      return res.data.product as Product;
      
    },
    enabled: !!id, // ID available hone par hi query run karo
  });
}

// ─── ADD ──────────────────────────────────────────────────
export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/add-product", formData, {  // ✅ POST /api/add-product
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product add ho gaya!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Product add nahi ho saka");
    },
  });
}

// ─── EDIT ─────────────────────────────────────────────────
export function useEditProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
        const res = await api.put(`/edit-product/${id}`, formData, {  // ✅ PUT /api/edit-product/:id
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Response from edit-product API:", res.data);
        return res.data;
       
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product update ho gaya!");
      
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Product update nahi ho saka");
    },
  });
}

// ─── DELETE ───────────────────────────────────────────────
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/delete-product/${id}`);  // ✅ DELETE /api/delete-product/:id
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product delete ho gaya!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Product delete nahi ho saka");
    },
  });
}