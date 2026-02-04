"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // 1. Import usePathname
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { API_BASE_URL } from "@/utils/constants";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // 2. Get the current URL path
  const [role, setRole] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchRole() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRole(data.role);
      } catch {
        setRole(null);
      }
    }
    fetchRole();
  }, [token, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  // 3. Helper function to check if a link is active
  const isActive = (path: string) => pathname.includes(path);

  const containerClass = "max-w-[1000px] mx-auto px-6";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className={`${containerClass} flex items-center justify-between py-2`}>
        <div className="flex items-center gap-10">
          <div className="cursor-pointer" onClick={() => router.push("/dashboard/project")}>
            <img src="/logo.png" alt="ManageBug" className="h-5 object-contain" />
          </div>
          
          <div className="flex items-center gap-5">
            {/* PROJECTS BUTTON */}
            <button 
              onClick={() => router.push("/dashboard/project")} 
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                isActive("/dashboard/project") ? "text-[#3B82F6]" : "text-[#94A3B8] hover:text-[#3B82F6]"
              }`}
            >
              <img 
                src="/projects.png" 
                alt="" 
                className={`h-3.5 w-3.5 ${isActive("/dashboard/project") ? "" : "opacity-50"}`} 
              />
              <span>Projects</span>
            </button>

            {/* BUGS BUTTON - This will now turn blue when you are on the bugs page */}
            <button 
              onClick={() => router.push(`/dashboard/bugs`)} 
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                isActive("/dashboard/bugs") ? "text-[#3B82F6]" : "text-[#94A3B8] hover:text-[#3B82F6]"
              }`}
            >
              <img 
                src="/bug.png" 
                alt="" 
                className={`h-3.5 ${isActive("/dashboard/bugs") ? "" : "opacity-50"}`} 
              />
              <span>Bugs</span>
            </button>
          </div>
        </div>

        {/* User Profile Area (Remains the same) */}
        <div className="flex items-center gap-4">
          <Bell size={16} className="text-[#94A3B8] cursor-pointer" />
          <div className="relative">
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-[#F8FAFC] px-2 py-1 rounded-md border border-gray-100 cursor-pointer">
              <div className="w-6 h-6 bg-[#0F172A] rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                {role ? role[0].toUpperCase() : "U"}
              </div>
              <span className="text-[11px] font-bold text-[#1E293B]">{role?.toUpperCase()}.</span>
              <ChevronDown className={isProfileOpen ? "rotate-180" : ""} size={12} />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                <button onClick={() => { setIsProfileOpen(false); router.push("/dashboard/profile"); }} className="w-full text-left px-3 py-1.5 text-[11px] flex items-center gap-2 hover:bg-gray-50 border-b border-gray-50">
                  <User size={12} /> Profile
                </button>
                <button onClick={handleLogout} className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 flex items-center gap-2 hover:bg-red-50">
                  <LogOut size={12} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}