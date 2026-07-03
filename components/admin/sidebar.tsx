"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/bookings", label: "Bookings", icon: "📋" },
  { href: "/admin/calculator", label: "Cost Calculator", icon: "🧮" },
  { href: "/admin/routes", label: "Route Costs", icon: "🗺️" },
  { href: "/admin/vehicles", label: "Vehicles", icon: "🚐" },
  { href: "/admin/addons", label: "Add-Ons", icon: "✨" },
  { href: "/admin/availability", label: "Availability", icon: "📅" },
  { href: "/admin/analytics", label: "Revenue", icon: "💰" },
  { href: "/admin/planner", label: "AI Tour Planner", icon: "🤖" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src="/logo.png"
              alt="Best Coast Tours logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Best Coast Tours</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sky-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 px-6 py-4">
        <p className="text-xs text-slate-500">Tour Management ERP</p>
        <p className="text-xs text-slate-600">v1.0.0</p>
      </div>
    </aside>
  );
}
