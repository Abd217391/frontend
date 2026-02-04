"use client";

import { API_BASE_URL } from "@/utils/constants";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/dashboard/Navbar";
import AddProjectModal from "@/components/manager/AddProjectModal";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Images for projects card
const PROJECT_IMAGES = [
  "/image1.png", "/image2.png", "/image3.png",
  "/image4.png", "/image5.png", "/image6.png",
];

interface Project {
  id: number;
  title: string;
  description: string;
  tasksDone: string;
  color: string;
  iconColor: string;
  progress: string;
  projectImage: string;
}

export default function ManagerDashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 1. Fetch User Role for logic (Manager vs Developer)
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

  // 2. Fetch Projects based on Role
  async function fetchProjects() {
    if (!token || !role) return;
    try {
      const url = role === "manager" || role === "qa"
          ? `${API_BASE_URL}/${role}/projectstodisplaythehisownprojects`
          : `${API_BASE_URL}/developer/projects`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      const mapped = Array.isArray(data) ? data.map((p: any, i: number) => ({
            id: p.id,
            title: p.title || "Untitled Project",
            description: p.description || "No description provided.",
            tasksDone: "0 / 0",
            progress: "0/0",
            projectImage: PROJECT_IMAGES[i % PROJECT_IMAGES.length],
            color: ["bg-cyan-500", "bg-lime-300", "bg-pink-300", "bg-indigo-400", "bg-orange-400", "bg-blue-400"][i % 6],
            iconColor: ["text-cyan-700", "text-lime-600", "text-pink-500", "text-indigo-600", "text-orange-500", "text-blue-500"][i % 6],
          })) : [];
      setProjects(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProjects([]);
    }
  }

  useEffect(() => {
    if (role && token) fetchProjects();
  }, [role, token]);

  // Search and Pagination Logic
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  const containerClass = "max-w-[1000px] mx-auto px-6";

  return (
    <div className="min-h-screen bg-white text-[#475569]">
      {/* SHARED NAVBAR COMPONENT */}
      <Navbar />

      <main className={`${containerClass} py-8`}>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-5">
          <div className="border-l-[3px] border-[#22C55E] pl-3">
            <h1 className="text-base font-bold text-[#1E293B]">Visnext Software Solutions</h1>
            <p className="text-[#94A3B8] text-[11px]">Hi {role}, welcome back</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] bg-[#F8FAFC] border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[12px] outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            {role === "manager" && (
              <button 
                onClick={() => setIsProjectModalOpen(true)} 
                className="bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-[12px] font-semibold hover:bg-blue-600 transition"
              >
                <Plus size={14} /> Add Project
              </button>
            )}
          </div>
        </div>

        <hr className="opacity-5 mb-6" />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {currentProjects.length ? (
            currentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/bugs?project_id=${p.id}&project_name=${encodeURIComponent(p.title)}`)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition cursor-pointer h-fit space-y-1.5"
              >
                <div className={`w-9 h-9 ${p.color} mb-3 rounded-b-md flex items-center justify-center shadow-sm`}>
                  <img className="h-5" src={p.projectImage} alt="" />
                </div>
                <h1 className="font-bold text-black">{p.title}</h1>
                <p className="text-[11px] text-[#64748B] line-clamp-2">{p.description}</p>
                <p className="text-[11px] mt-1 font-medium">Tasks Done: {p.tasksDone}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-[#F8FAFC] rounded-xl">
              <p className="text-[#94A3B8]">No projects found.</p>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {filteredProjects.length > 0 && (
          <div className="mt-10 flex justify-between items-center border-t border-gray-50 pt-6">
            <p className="text-[11px] text-[#94A3B8] font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#94A3B8] font-medium">Display</span>
                <select className="bg-white border border-gray-200 rounded-md px-1 py-0.5 text-[11px] outline-none">
                  <option>{itemsPerPage}</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-[#E2E8F0] rounded-md text-[#64748B] disabled:opacity-50 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${
                      currentPage === i + 1 
                        ? "bg-[#3B82F6] text-white shadow-sm" 
                        : "text-[#64748B] hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-[#E2E8F0] rounded-md text-[#64748B] disabled:opacity-50 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isProjectModalOpen && role === "manager" && (
        <AddProjectModal
          setIsProjectModalOpen={setIsProjectModalOpen}
          handleAddProject={fetchProjects}
        />
      )}
    </div>
  );
}