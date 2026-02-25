"use client";

import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-blue-200">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">Sign In to Your Account</h2>
        {error && <div className="mb-4 text-red-600 text-sm text-center font-medium">{error}</div>}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-semibold">Email</label>
          <input
            type="email"
            className="w-full border border-blue-300 rounded-lg p-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 bg-blue-50 placeholder-gray-400"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-semibold">Password</label>
          <input
            type="password"
            className="w-full border border-blue-300 rounded-lg p-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 bg-blue-50 placeholder-gray-400"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-xl hover:from-blue-700 hover:to-blue-500 transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}