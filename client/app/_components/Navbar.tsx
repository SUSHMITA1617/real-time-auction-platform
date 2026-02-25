"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    setIsLoggedIn(Boolean(localToken || cookieToken));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
    setIsLoggedIn(false);
    router.push("/login");
  };

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      pathname === href
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-blue-50"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href={isLoggedIn ? "/dashboard" : "/login"} className="text-sm font-semibold text-slate-800">
          RealTime Auctions
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={linkClass("/login")}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
