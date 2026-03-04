import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface AppUser {
  _id: string;
  username?: string;
  name?: string;
  email: string;
  profilePic?: string;
  isAdmin: boolean;
  createdAt: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/auth/admin/all");
      return res.data.users as AppUser[];
    },
  });
}

export function useToggleAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/auth/admin/toggle-admin/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message ?? "Admin status updated!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Toggle nahi ho saka");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/auth/admin/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User delete ho gaya!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "User delete nahi ho saka");
    },
  });
}