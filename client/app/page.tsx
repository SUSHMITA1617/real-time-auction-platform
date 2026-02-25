"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [auctions, setAuctions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const res = await API.get("/auctions/ongoing");
      setAuctions(res.data);
    };

    fetchAuctions();
  }, []);

    // Redirect to /dashboard
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard");
    }
    return null;
}