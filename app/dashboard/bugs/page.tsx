"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useEffect, useState, Suspense } from "react";

import Sentiment from "sentiment"; 
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  RefreshCw,
  Smile,
  AlertCircle,   // Added icon for High Risk
  ShieldCheck,   // Added icon for Low Risk
  MinusCircle    // Added icon for Neutral
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/dashboard/Navbar"; 
import AddBugModal from "@/components/qa/AddBugModal";
import BugDetailsModal from "@/components/bugs/BugDetailsModal";
import BugListView from "@/components/bugs/BuglistView";
import BugGridView from "@/components/bugs/BugGridView";
import { Bug } from "@/types/bugs";

const sentimentAnalyzer = new Sentiment(); // Initialize outside component

interface Project {
  id: number;
  title: string;
}

function BugDashboardContent() {
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
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const containerClass = "max-w-[1000px] mx-auto px-6";

  const fetchProjects = async (authToken: string, userRole: string) => {
    try {
      const url = userRole === "manager" || userRole === "qa"
          ? `${API_BASE_URL}/${userRole}/projectstodisplaythehisownprojects`
          : `${API_BASE_URL}/developer/projects`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map((p: any) => ({ id: p.id, title: p.title || "Untitled Project" })) : [];
      setProjectsList(mapped);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setProjectsList([]);
    }
  };

  const fetchBugs = async (projId: string | null | undefined, authToken: string, userRole: string) => {
    setLoading(true);
    setError(false);
    try {
      let url = "";
      if (userRole === "manager" || userRole === "qa") {
        url = projId ? `${API_BASE_URL}/${userRole}/projects/${projId}/bugs` : `${API_BASE_URL}/bugs`;
      } else if (userRole === "developer") {
        url = projId ? `${API_BASE_URL}/developer/projects/${projId}/bugs` : `${API_BASE_URL}/bugs`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}`, accept: "application/json" } });
      if (!res.ok) { setBugs([]); setLoading(false); return; }
      const data = await res.json();
      
      setBugs(data.map((b: any) => {
          // --- FEATURE: Sentiment Analysis Per Bug ---
          const analysis = sentimentAnalyzer.analyze(`${b.title} ${b.description || ""}`);
          let sentimentData = { label: "Standard", color: "text-blue-500", icon: <MinusCircle size={12} /> };
          
          if (analysis.score <= -1) {
            sentimentData = { label: "High Risk", color: "text-red-500", icon: <AlertCircle size={12} /> };
          } else if (analysis.score >= 3) {
            sentimentData = { label: "Low Risk", color: "text-emerald-500", icon: <ShieldCheck size={12} /> };
          }

          return {
            id: b.id,
            title: b.title,
            status: b.status || "new",
            type: b.type || "bug", 
            assignees: b.assignments?.map((a: any) => ({ name: a.user?.name || "Unknown" })) || [],
            deadline: b.deadline,
            description: b.description,
            screenshot_url: b.screenshot_url,
            sentiment: sentimentData // Injected feature
          };
      }));
    } catch (err) { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    
    setToken(storedToken);
    setRole(storedRole);
    setMounted(true);

    if (storedToken && storedRole) {
      fetchProjects(storedToken, storedRole);
      fetchBugs(projectIdParam, storedToken, storedRole);
    }
  }, [projectIdParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredBugs = bugs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredBugs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBugs = filteredBugs.slice(startIndex, startIndex + rowsPerPage);

  const handleProjectChange = (projId: string) => {
    if (!token || !role) return;
    if (!projId) {
      setProjectName(null); fetchBugs(null, token, role); router.push("/dashboard/bugs");
    } else {
      const selectedProject = projectsList.find((p) => p.id === Number(projId));
      if (selectedProject) {
        setProjectName(selectedProject.title);
        router.push(`/dashboard/bugs?project_id=${selectedProject.id}&project_name=${encodeURIComponent(selectedProject.title)}`);
        fetchBugs(projId, token, role);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-[#475569] font-sans">
      <Navbar />

      <main className={`${containerClass} py-8`}>
        {/* Sentiment Legend - Injected without disturbing existing layout */}
        <div className="flex gap-4 mb-4">
           <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
             <AlertCircle size={10} /> High Risk
           </div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
             <ShieldCheck size={10} /> Low Risk
           </div>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-[#1E293B]">{projectName ? `${projectName} ` : "All Bugs Listing"}</h1>
          <div className="flex items-center gap-2">
            {projectsList.length > 0 && (
              <select 
                value={projectIdParam || ""} 
                onChange={(e) => handleProjectChange(e.target.value)} 
                className="text-xs border border-gray-200 rounded-lg p-1 bg-white outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">All Projects</option>
                {projectsList.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
            {role === "qa" && projectIdParam && (
              <button 
                onClick={() => setIsAddBugOpen(true)} 
                className="bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold hover:bg-blue-600 transition"
              >
                <Plus size={12} /> New Task Bug
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="bg-[#F8FAFC] border-2 border-dashed rounded-2xl p-12 flex flex-col items-center text-center">
            <Smile size={20} className="rotate-180 text-red-400 mb-2" />
            <h3 className="text-sm font-bold">Something went wrong</h3>
            <button onClick={() => { if(token && role) fetchBugs(projectIdParam, token, role)}} className="mt-3 flex items-center gap-2 bg-slate-800 text-white px-4 py-1.5 rounded-md text-xs"><RefreshCw size={12} /> Try Again</button>
          </div>
        ) : !loading && bugs.length === 0 ? (
          <div className="bg-[#F8FAFC] border-2 border-dashed rounded-2xl p-12 text-center">
            <h3 className="text-sm font-bold text-[#94A3B8]">No bugs found for this selection</h3>
          </div>
        ) : (
          <>
            <div className="bg-white p-3 rounded-t-xl border flex justify-between items-center">
              <div className="relative w-64">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder="Search bugs..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-9 pr-3 py-1.5 w-full bg-[#F8FAFC] border rounded-lg text-xs outline-none" 
                />
              </div>
              <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg gap-1">
                <button onClick={() => setViewMode("list")} className={`p-1 rounded transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}><List size={14} /></button>
                <button onClick={() => setViewMode("grid")} className={`p-1 rounded transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}><LayoutGrid size={14} /></button>
              </div>
            </div>

            <div className="bg-white rounded-b-xl border border-t-0 shadow-sm min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center py-12 gap-2 text-[#94A3B8]">
                  <RefreshCw className="animate-spin" size={20} />
                  <p className="text-xs">Fetching bugs...</p>
                </div>
              ) : viewMode === "list" ? (
                <BugListView bugs={currentBugs} onBugClick={setSelectedBug} />
              ) : (
                <BugGridView bugs={currentBugs} onBugClick={setSelectedBug} />
              )}
            </div>

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
                      onChange={(e) => { 
                        setRowsPerPage(Number(e.target.value)); 
                        setCurrentPage(1); 
                      }} 
                      className="bg-white border border-gray-200 rounded-md px-1 py-0.5 text-[11px] outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="w-7 h-7 flex items-center justify-center bg-[#F1F5F9] rounded-md disabled:opacity-50 hover:bg-gray-200"><ChevronLeft size={14} /></button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold ${currentPage === i + 1 ? "bg-[#3B82F6] text-white shadow-sm" : "text-[#64748B] hover:bg-gray-50"}`}>{i + 1}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="w-7 h-7 flex items-center justify-center bg-[#F1F5F9] rounded-md disabled:opacity-50 hover:bg-gray-200"><ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {role === "qa" && projectIdParam && token && (
        <AddBugModal 
          isOpen={isAddBugOpen} 
          onClose={() => { setIsAddBugOpen(false); fetchBugs(projectIdParam, token, role); }} 
          projectId={Number(projectIdParam)} 
          handleBugAdded={() => { setIsAddBugOpen(false); fetchBugs(projectIdParam, token, role); }} 
        />
      )}

      {selectedBug && (
        <BugDetailsModal 
          bug={selectedBug} 
          isOpen={!!selectedBug} 
          onClose={() => { setSelectedBug(null); if(token && role) fetchBugs(projectIdParam, token, role); }} 
        />
      )}
    </div>
  );
}

export default function BugDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-gray-400">Loading components...</div>}>
      <BugDashboardContent />
    </Suspense>
  );
}