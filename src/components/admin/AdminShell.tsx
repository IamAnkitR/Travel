"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChartColumn, LayoutDashboard, LogOut, MapPin, MessageCircle, UserCheck } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/registrations", label: "Registrations", icon: UserCheck },
  { href: "/admin/states", label: "States", icon: MapPin },
  { href: "/admin/destinations", label: "Destinations", icon: ChartColumn },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/leads", label: "Leads", icon: MessageCircle },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside className="w-[220px] shrink-0 bg-stone-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-5 font-semibold text-[15px] border-b border-white/10">
          Overview Admin
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium transition ${
                  active ? "bg-white text-stone-900" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
          <Link href="/" className="block mt-1 px-3 text-[11px] text-white/40 hover:text-white/70">
            ← Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
