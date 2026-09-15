"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, LayoutDashboard, LogOut, MessageCircle } from "lucide-react";

const NAV = [
  { href: "/partner", label: "Listings", icon: LayoutDashboard, exact: true },
  { href: "/partner/leads", label: "Leads", icon: MessageCircle },
];

const CHROME_FREE_PATHS = new Set(["/partner/login", "/partner/register"]);

export default function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (CHROME_FREE_PATHS.has(pathname)) return <>{children}</>;

  const logout = async () => {
    await fetch("/api/partner/logout", { method: "POST" });
    router.push("/partner/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
        <div className="max-w-[960px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/partner" className="flex items-center gap-2 font-semibold text-[15px]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              Partner Portal
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition ${
                      active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
