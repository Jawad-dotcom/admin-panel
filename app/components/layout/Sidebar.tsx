// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Star,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

const NAV = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Products",  href: "/dashboard/products",  icon: Package },
      { label: "Categories",href: "/dashboard/categories", icon: Tag },
    ],
  },
  {
    group: "Commerce",
    items: [
      { label: "Orders",  href: "/dashboard/orders",  icon: ShoppingCart },
      { label: "Users",   href: "/dashboard/users",   icon: Users },
      { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await api.post("/auth/logout");
    Cookies.remove("jwt");
    Cookies.remove("admin_token");
    router.push("/login");
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#09090b] border-r border-[#27272a] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">
            Admin<span className="text-indigo-400">.</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-600 uppercase px-2 mb-1">
              {group.group}
            </p>
            {group.items.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all mb-0.5 ${
                    active
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#27272a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}