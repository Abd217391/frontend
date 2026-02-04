"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/dashboard/Navbar";// 1. Import your shared Navbar
import {
  User,
  Phone,
  Mail,
  Lock,
  Edit2,
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
}

export default function ProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            password: "",
          });
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: string) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (field === "password") {
        if (!formData.password) {
          alert("Password cannot be empty");
          return;
        }
        payload.password = formData.password;
      } else {
        payload[field] = formData[field as keyof typeof formData];
      }

      const res = await fetch(`${API_BASE_URL}/auth/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setEditingField(null);
      if (field === "password") setFormData((prev) => ({ ...prev, password: "" }));
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="p-10 text-center text-sm font-medium text-slate-400">Loading Profile...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 2. SHARED NAVBAR COMPONENT */}
      <Navbar />

      <main className="max-w-[1000px] mx-auto pt-12 flex flex-col items-center px-6">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10 w-full">
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm mb-4 overflow-hidden">
              <img
                src="/profile.png"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-[#1E293B]">Profile Settings</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">{profile?.role}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 w-full">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Full Name</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
                <User className="text-gray-400" size={16} />
                {editingField === "name" ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button disabled={isSubmitting} onClick={() => handleSave("name")} className="text-[11px] font-bold text-blue-600">SAVE</button>
                  </div>
                ) : (
                  <div className="flex flex-1 justify-between items-center">
                    <span className="text-sm text-[#1E293B]">{profile?.name}</span>
                    <Edit2 className="cursor-pointer text-gray-400 hover:text-blue-500 transition" size={14} onClick={() => setEditingField("name")} />
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Email Address</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
                <Mail className="text-gray-400" size={16} />
                {editingField === "email" ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button disabled={isSubmitting} onClick={() => handleSave("email")} className="text-[11px] font-bold text-blue-600">SAVE</button>
                  </div>
                ) : (
                  <div className="flex flex-1 justify-between items-center">
                    <span className="text-sm text-[#1E293B]">{profile?.email}</span>
                    <Edit2 className="cursor-pointer text-gray-400 hover:text-blue-500 transition" size={14} onClick={() => setEditingField("email")} />
                  </div>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Phone Number</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
                <Phone className="text-gray-400" size={16} />
                {editingField === "phone" ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button disabled={isSubmitting} onClick={() => handleSave("phone")} className="text-[11px] font-bold text-blue-600">SAVE</button>
                  </div>
                ) : (
                  <div className="flex flex-1 justify-between items-center">
                    <span className="text-sm text-[#1E293B]">{profile?.phone || "No phone added"}</span>
                    <Edit2 className="cursor-pointer text-gray-400 hover:text-blue-500 transition" size={14} onClick={() => setEditingField("phone")} />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Account Password</label>
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
                <Lock className="text-gray-400" size={16} />
                {editingField === "password" ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-gray-400 uppercase font-bold">{showPassword ? "Hide" : "Show"}</button>
                    <button disabled={isSubmitting} onClick={() => handleSave("password")} className="text-[11px] font-bold text-blue-600">UPDATE</button>
                  </div>
                ) : (
                  <div className="flex flex-1 justify-between items-center">
                    <span className="text-sm text-[#1E293B]">••••••••</span>
                    <Edit2 className="cursor-pointer text-gray-400 hover:text-blue-500 transition" size={14} onClick={() => setEditingField("password")} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}