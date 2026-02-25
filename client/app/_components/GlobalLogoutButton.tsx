"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalLogoutButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const hasToken = () => {
    const localToken = localStorage.getItem("token");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    return Boolean(localToken || cookieToken);
  };

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(hasToken());
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
    setIsLoggedIn(false);
    router.push("/login");
  };

  if (!isLoggedIn || pathname === "/login") return null;

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      Logout
    </button>
  );
}
