"use client";

import { API_BASE_URL } from "@/utils/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, ArrowRight } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    try {
      const formData = new URLSearchParams({ username: email, password });

      // Updated URL to use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);

      // Updated URL to use API_BASE_URL
      const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      const userData = await userRes.json();
      localStorage.setItem("role", userData.role);

      router.replace("/dashboard/project");
    } catch {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full h-14 pl-12 rounded-lg bg-[#F5F7FA] border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-gray-400 text-gray-900";

  return (
    <div className="w-full max-w-[440px] px-6 py-10">
      <h1 className="text-3xl font-bold text-[#1e1b4b]">Login</h1>
      <p className="text-gray-500 mt-2 mb-8">Please enter your login details</p>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            className={inputStyle}
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            type="password"
            className={`${inputStyle} pr-12`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Eye
            className="absolute right-4 top-4 text-gray-400 cursor-pointer hover:text-gray-600"
            size={20}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-40 h-15 mt-4 bg-[#0066FF] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
          <ArrowRight size={20} />
        </button>

        <hr className="opacity-10" />

        <p className="text-center text-sm text-gray-500 pt-4">
          Do not have an account?{" "}
          <Link
            href="/join-us"
            className="text-[#0066FF] font-bold hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}