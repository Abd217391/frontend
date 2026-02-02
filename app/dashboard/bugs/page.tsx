"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  RefreshCw,
  Smile,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import AddBugModal from "@/components/qa/AddBugModal";
import BugDetailsModal from "@/components/bugs/BugDetailsModal";
import BugListView from "@/components/bugs/BuglistView";
import BugGridView from "@/components/bugs/BugGridView";
import { Bug } from "@/types/bugs";


interface Project {
  id: number;
  title: string;
}

export default function BugDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("project_id");
  const projectNameParam = searchParams.get("project_name");

  const [projectName, setProjectName] = useState<string | null>(projectNameParam);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isAddBugOpen, setIsAddBugOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Pagination Config
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const containerClass = "max-w-[1000px] mx-auto px-6";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const fetchProjects = async () => {
    if (!token || !role) return;
    try {
      const url = role === "manager" || role === "qa"
          ? `http://localhost:8000/${role}/projectstodisplaythehisownprojects`
          : `http://localhost:8000/developer/projects`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map((p: any) => ({ id: p.id, title: p.title || "Untitled Project" })) : [];
      setProjectsList(mapped);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setProjectsList([]);
    }
  };

  const fetchBugs = async (projId?: string | null) => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      let url = "";
      if (role === "manager" || role === "qa") {
        url = projId ? `http://localhost:8000/${role}/projects/${projId}/bugs` : `http://localhost:8000/bugs`;
      } else if (role === "developer") {
        url = projId ? `http://localhost:8000/developer/projects/${projId}/bugs` : `http://localhost:8000/bugs`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } });
      if (!res.ok) { setBugs([]); setLoading(false); return; }
      const data = await res.json();
      setBugs(data.map((b: any) => ({
          id: b.id,
          title: b.title,
          status: b.status || "new",
          assignees: b.assignments?.map((a: any) => ({ name: a.user?.name || "Unknown" })) || [],
          deadline: b.deadline,
          description: b.description,
        })));
    } catch (err) { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => {
    setMounted(true);
    fetchProjects();
    fetchBugs(projectIdParam);
  }, [projectIdParam, token, role]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Logic for filtering and slicing
  const filteredBugs = bugs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredBugs.length / rowsPerPage);
  
  // FIXED: Calculation for current display slice
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBugs = filteredBugs.slice(startIndex, startIndex + rowsPerPage);

  const handleLogout = () => { localStorage.clear(); router.replace("/login"); };

  const handleProjectChange = (projId: string) => {
    if (!projId) {
      setProjectName(null); fetchBugs(null); router.push("/dashboard/bugs");
    } else {
      const selectedProject = projectsList.find((p) => p.id === Number(projId));
      if (selectedProject) {
        setProjectName(selectedProject.title);
        router.push(`/dashboard/bugs?project_id=${selectedProject.id}&project_name=${encodeURIComponent(selectedProject.title)}`);
        fetchBugs(projId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#475569] font-sans">
      {mounted ? (
        <>
          <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className={`${containerClass} flex items-center justify-between py-2`}>
              <div className="flex items-center gap-10">
                <div className="cursor-pointer" onClick={() => router.push("/dashboard/project")}>
                  <img src="/logo.png" alt="ManageBug" className="h-5" />
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => router.push("/dashboard/project")} className="flex items-center gap-1.5 text-[#94A3B8] text-[13px] font-medium hover:text-[#3B82F6]">
                    <img src="/projects.png" className="h-3.5 w-3.5" alt="" />
                    <span>Projects</span>
                  </button>
                  <button onClick={() => { setProjectName(null); fetchBugs(null); router.push("/dashboard/bugs"); }} className="flex items-center gap-1.5 text-[#3B82F6] text-[13px] font-medium">
                    <img src="/bug.png" className="h-3.5" alt="" />
                    <span>Bugs</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Bell size={12} className="text-[#94A3B8] cursor-pointer" />
                <div className="relative">
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-[#F8FAFC] px-2 py-1 rounded-md border border-gray-100 cursor-pointer">
                    <div className="w-6 h-6 bg-[#0F172A] rounded-md flex items-center justify-center text-white text-[10px] font-bold">V</div>
                    <span className="text-[11px] font-bold text-[#1E293B] uppercase">{role || "User"}</span>
                    <ChevronDown size={10} />
                  </div>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg py-1 z-50">
                      <button onClick={handleLogout} className="w-full px-3 py-1.5 text-[11px] text-red-500 flex items-center gap-2 hover:bg-red-50"><LogOut size={10} /> Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className={`${containerClass} py-8`}>
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold text-[#1E293B]">{projectName ? `${projectName} ` : "All Bugs Listing"}</h1>
              <div className="flex items-center gap-2">
                {projectsList.length > 0 && (
                  <select value={projectIdParam || ""} onChange={(e) => handleProjectChange(e.target.value)} className="text-xs border border-gray-200 rounded-lg p-1 bg-white">
                    <option value="">All Projects</option>
                    {projectsList.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                )}
                {role === "qa" && projectIdParam && (
                  <button onClick={() => setIsAddBugOpen(true)} className="bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"><Plus size={12} /> New Task Bug</button>
                )}
              </div>
            </div>

            {error ? (
              <div className="bg-[#F8FAFC] border-2 border-dashed rounded-2xl p-12 flex flex-col items-center text-center">
                <Smile size={20} className="rotate-180 text-red-400 mb-2" />
                <h3 className="text-sm font-bold">Something went wrong</h3>
                <button onClick={() => fetchBugs(projectIdParam)} className="mt-3 flex items-center gap-2 bg-slate-800 text-white px-4 py-1.5 rounded-md text-xs"><RefreshCw size={12} /> Try Again</button>
              </div>
            ) : !loading && bugs.length === 0 ? (
              <div className="bg-[#F8FAFC] border-2 border-dashed rounded-2xl p-12 text-center"><h3 className="text-sm font-bold">No bugs exist</h3></div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-t-xl border flex justify-between">
                  <div className="relative w-64">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Search bugs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 w-full bg-[#F8FAFC] border rounded-lg text-xs" />
                  </div>
                  <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg gap-1">
                    <button onClick={() => setViewMode("list")} className={`p-1 rounded transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}><List size={14} /></button>
                    <button onClick={() => setViewMode("grid")} className={`p-1 rounded transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}><LayoutGrid size={14} /></button>
                  </div>
                </div>

                <div className="bg-white rounded-b-xl border shadow-sm min-h-[300px]">
                  {loading ? (
                    <div className="flex flex-col items-center py-12 gap-2"><RefreshCw className="animate-spin" size={20} /><p className="text-xs">Fetching bugs...</p></div>
                  ) : viewMode === "list" ? (
                    <BugListView bugs={currentBugs} onBugClick={setSelectedBug} />
                  ) : (
                    <BugGridView bugs={currentBugs} onBugClick={setSelectedBug} />
                  )}
                </div>

                {/* --- CORRECTED PAGINATION UI --- */}
                {filteredBugs.length > 0 && (
                  <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                    <p className="text-[11px] text-[#94A3B8] font-medium">
                      Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredBugs.length)} of {filteredBugs.length} entries
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#94A3B8] font-medium">Display</span>
                        <select 
                          value={rowsPerPage} 
                          onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                          className="bg-white border border-gray-200 rounded-md px-1 py-0.5 text-[11px] outline-none"
                        >
                          <option value={6}>6</option>
                          <option value={12}>12</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="w-7 h-7 flex items-center justify-center bg-[#F1F5F9] rounded-md text-[#64748B] disabled:opacity-50 hover:bg-gray-200"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {/* Generate page numbers dynamically */}
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${
                              currentPage === i + 1 
                                ? "bg-[#3B82F6] text-white shadow-sm" 
                                : "text-[#64748B] hover:bg-gray-100"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="w-7 h-7 flex items-center justify-center bg-[#F1F5F9] rounded-md text-[#64748B] disabled:opacity-50 hover:bg-gray-200"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {role === "qa" && projectIdParam && (
            <AddBugModal isOpen={isAddBugOpen} onClose={() => { setIsAddBugOpen(false); fetchBugs(projectIdParam); }} projectId={Number(projectIdParam)} handleBugAdded={() => { setIsAddBugOpen(false); fetchBugs(projectIdParam); }} />
          )}

          {selectedBug && (
            <BugDetailsModal bug={selectedBug} isOpen={!!selectedBug} onClose={() => { setSelectedBug(null); fetchBugs(projectIdParam); }} />
          )}
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-xs">Loading application...</p></div>
      )}
    </div>
  );
}