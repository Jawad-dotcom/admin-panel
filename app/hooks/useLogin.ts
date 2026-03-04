// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await api.post("/auth/login", data);
      return res.data;n
    },
      onSuccess: (data) => {
      // token ko cookie mein save karo
      Cookies.set("admin_token", data.token, { expires: 7 });
    },
  });
}