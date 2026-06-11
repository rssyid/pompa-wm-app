"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components";

interface UserPayload {
  username: string;
  role: string;
}

export default function Navigation({ user }: { user: UserPayload | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", color: "bg-nb-yellow" },
    { href: "/dashboard/aset", label: "Aset Pompa", icon: "💧", color: "bg-nb-cyan" },
    { href: "/dashboard/mutasi", label: "Mutasi", icon: "🔄", color: "bg-nb-pink" },
    { href: "/dashboard/inspeksi", label: "Inspeksi", icon: "🔍", color: "bg-nb-green" },
    { href: "/dashboard/riwayat", label: "Riwayat", icon: "📋", color: "bg-nb-orange" },
  ];

  // Hanya admin yang bisa melihat Master Data
  if (user?.role === "admin") {
    navItems.push({ href: "/dashboard/master", label: "Master Data", icon: "📁", color: "bg-nb-orange" });
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="border-4 border-black bg-nb-yellow p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tight">
              POMPA<span className="text-nb-purple">WM</span>
            </h1>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 border-4 border-black font-black text-sm text-black uppercase tracking-wide transition-all duration-150 ${
                    isActive
                      ? `${item.color} shadow-none translate-x-[2px] translate-y-[2px]`
                      : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 border-4 border-black px-3 py-1 bg-gray-100 dark:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-sm font-bold text-black dark:text-white">👤 {user.username}</span>
                <span className="text-xs font-black bg-nb-blue text-black px-1.5 py-0.5 border-2 border-black uppercase">{user.role}</span>
              </div>
            )}
            <ThemeToggle />
            <button onClick={handleLogout} className="border-4 border-black bg-nb-red px-3 py-1.5 font-black text-white text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
              LOGOUT
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 border-3 border-black font-bold text-xs text-black uppercase tracking-wide whitespace-nowrap transition-all duration-150 ${
                  isActive ? `${item.color} shadow-none` : "bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
