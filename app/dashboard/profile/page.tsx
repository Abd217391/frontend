"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  User,
  Phone,
  Mail,
  Lock,
  LogOut,
  Edit2,
  Eye,
} from "lucide-react";

// --- URL LOGIC ADDED HERE ---


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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        // --- UPDATED URL ---
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
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: "",
          });
        } else {
          console.error("Profile fetch failed:", res.status);
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading)
    return (
      <div className="p-10 text-center text-sm font-medium text-slate-400">
        Loading Profile...
      </div>
    );

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

      // --- UPDATED URL ---
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
      alert(`${field} updated successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-100 py-1 px-8 flex items-center justify-between">
        <div className="flex items-center ">
          <img
            src="/logo.png"
            alt="ManageBug"
            className="h-5 cursor-pointer absolute left-65"
            onClick={() => router.push("/dashboard/project")}
          />
          <div className="flex gap-8 text-[12px] font-semibold text-gray-400 absolute left-95">
            <button
              onClick={() => router.push("/dashboard/project")}
              className="hover:text-blue-500 flex items-center gap-1"
            >
              <img src="/projects.png" alt="Projects" className="h-4 w-4" />
              Projects
            </button>
            <button
              onClick={() => router.push("/dashboard/bugs")}
              className="hover:text-blue-500 flex items-center gap-1"
            >
              <img src="/bug.png" alt="Bugs" className="h-4 w-4" />
              Bugs
            </button>
          </div>
        </div>
        <div className="flex items-center gap-5 relative right-54 ">
          <Bell size={18} className="text-gray-300" />
          <div
            className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer  "
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-7 h-7 bg-[#1E293B] rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-gray-700 uppercase">
              {profile?.role || role}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto pt-16 flex flex-col items-center px-6">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-white shadow-sm relative left-19">
              <img
                src="/profile.png"
                alt="Profile"
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B] relative right-110">Profile Settings</h2>
          </div>

          <div className="space-y-6 w-full max-w-md">
            {/* Name */}
            <div className="flex items-center gap-2 relative">
              <User className="text-gray-400" size={18} />
              {editingField === "name" ? (
                <>
                  <input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  />
                  <button onClick={() => handleSave("name")} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg">Save</button>
                  <button onClick={() => setEditingField(null)} className="ml-2 px-2 py-1 bg-gray-200 rounded-lg">Cancel</button>
                </>
              ) : (
                <>
                  <div className="flex-1 py-2 px-3 bg-gray-100 rounded-lg">{profile?.name}</div>
                  <Edit2 className="cursor-pointer text-gray-500" size={16} onClick={() => setEditingField("name")} />
                </>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 relative">
              <Mail className="text-gray-400" size={18} />
              {editingField === "email" ? (
                <>
                  <input
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  />
                  <button onClick={() => handleSave("email")} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg">Save</button>
                  <button onClick={() => setEditingField(null)} className="ml-2 px-2 py-1 bg-gray-200 rounded-lg">Cancel</button>
                </>
              ) : (
                <>
                  <div className="flex-1 py-2 px-3 bg-gray-100 rounded-lg">{profile?.email}</div>
                  <Edit2 className="cursor-pointer text-gray-500" size={16} onClick={() => setEditingField("email")} />
                </>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 relative">
              <Phone className="text-gray-400" size={18} />
              {editingField === "phone" ? (
                <>
                  <input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  />
                  <button onClick={() => handleSave("phone")} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg">Save</button>
                  <button onClick={() => setEditingField(null)} className="ml-2 px-2 py-1 bg-gray-200 rounded-lg">Cancel</button>
                </>
              ) : (
                <>
                  <div className="flex-1 py-2 px-3 bg-gray-100 rounded-lg">{profile?.phone}</div>
                  <Edit2 className="cursor-pointer text-gray-500" size={16} onClick={() => setEditingField("phone")} />
                </>
              )}
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 relative">
              <Lock className="text-gray-400" size={18} />
              {editingField === "password" ? (
                <>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                    placeholder="New password"
                  />
                  <button onClick={() => handleSave("password")} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg">Save</button>
                  <button onClick={() => setEditingField(null)} className="ml-2 px-2 py-1 bg-gray-200 rounded-lg">Cancel</button>
                  <button onClick={() => setShowPassword((prev) => !prev)} className="ml-2 px-2 py-1 bg-gray-100 rounded-lg">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 py-2 px-3 bg-gray-100 rounded-lg">********</div>
                  <Edit2 className="cursor-pointer text-gray-500" size={16} onClick={() => setEditingField("password")} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}