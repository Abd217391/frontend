"use client";

import { API_BASE_URL } from "@/utils/constants";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";


export default function SignUpPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Role state
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    setRole(roleParam);
  }, []);

  if (!mounted) return null;

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role first");
      router.push("/join-us");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // --- FETCH UPDATED WITH CORRECT URL AND HEADERS ---
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // CORRECTED THIS LINE
        body: JSON.stringify({ name, phone, email, password, role }),
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = { detail: await res.text() };
      }

      if (!res.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      alert("Signup successful! Please login.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] px-6 py-10 mx-auto">
      {/* ... (Rest of your UI is exactly the same) ... */}
      <form className="space-y-6" onSubmit={handleSignup}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e1b4b]">Sign Up</h1>
          <p className="text-gray-500 mt-2">Please fill your information below</p>
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
            <User size={20} />
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full pl-12 h-14 rounded-lg outline-none text-gray-900 placeholder-gray-400 font-medium border border-transparent bg-[#F5F7FA] focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF]">
            <Phone size={20} />
          </span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="w-full pl-12 h-14 rounded-lg outline-none text-gray-900 placeholder-gray-400 font-medium border border-transparent bg-[#F5F7FA] focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
            <Mail size={20} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full pl-12 h-14 rounded-lg outline-none text-gray-900 placeholder-gray-400 font-medium border border-transparent bg-[#F5F7FA] focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
            <Lock size={20} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-12 pr-10 h-14 rounded-lg outline-none text-gray-900 placeholder-gray-400 font-medium border border-transparent bg-[#F5F7FA] focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
            <Lock size={20} />
          </span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full pl-12 pr-10 h-14 rounded-lg outline-none text-gray-900 placeholder-gray-400 font-medium border border-transparent bg-[#F5F7FA] focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10"
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-40 h-14 bg-[#0066FF] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-8"
        >
          {loading ? "Signing up..." : "Sign Up"}
          {!loading && <ArrowRight size={20} />}
        </button>

        <hr className="opacity-10" />
        <div className="pt-6 text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link href="/login" className="text-[#0066FF] font-bold hover:underline">
            Login to your account
          </Link>
        </div>
      </form>
    </div>
  );
}