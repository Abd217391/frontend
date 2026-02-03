"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Image,
  Tag,
  User,
  Clock,
  Info,
  Users,
} from "lucide-react";

import { Bug } from "@/types/bugs";


interface Assignee {
  id: number;
  name: string;
  email: string;
}

interface Props {
  bug: Bug;
  isOpen: boolean;
  onClose: () => void;
}

export default function BugDetailsModal({ bug, isOpen, onClose }: Props) {
  const [status, setStatus] = useState(bug.status);
  const [loading, setLoading] = useState(false);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [mounted, setMounted] = useState(false); 

  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    setStatus(bug.status);
  }, [bug.status]);

  useEffect(() => {
    setMounted(true);

    const fetchAssignees = async () => {
      if (!bug.id || !token || !isOpen) return;
      try {
        // --- UPDATED URL ---
        const res = await fetch(
          `${API_BASE_URL}/bugs/${bug.id}/assignees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setAssignees(data);
        }
      } catch (err) {
        console.error("Failed to load assignees", err);
      }
    };

    fetchAssignees();
  }, [bug.id, isOpen, token]);

  if (!isOpen || !mounted) return null;

  const handleUpdateStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // --- UPDATED URL ---
      const res = await fetch(
        `${API_BASE_URL}/developer/bugs/${bug.id}/status?status_update=${encodeURIComponent(status)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        },
      );
      if (res.ok) {
        onClose();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${bug.type === "bug" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
              >
                {bug.type || "Bug"}
              </span>
              <span className="text-gray-400 text-xs font-mono">#{bug.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{bug.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {bug.description || "No description provided."}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Status Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Status
              </label>
              {role === "developer" ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["new", "started", "resolved"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg inline-block capitalize">
                  {bug.status}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Deadline
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium py-2">
                <Calendar size={16} className="text-slate-400" />
                {bug.deadline
                  ? new Date(bug.deadline).toLocaleDateString()
                  : "No deadline"}
              </div>
            </div>
          </div>

          {/* Assigned Team */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Users size={14} /> Assigned Team
            </label>
            <div className="flex flex-wrap gap-2">
              {assignees.length > 0 ? (
                assignees.map((dev) => (
                  <div
                    key={dev.id}
                    className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                      {dev.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-indigo-700">
                      {dev.name}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No developers assigned yet.
                </span>
              )}
            </div>
          </div>

          {/* Screenshot */}
          {bug.screenshot_url && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Screenshot Attachment
              </label>
              <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <img
                  src={bug.screenshot_url}
                  alt="bug screenshot"
                  className="w-full object-contain max-h-[300px] bg-slate-50 cursor-pointer"
                  onClick={() => window.open(bug.screenshot_url, "_blank")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {role === "developer" && (
          <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleUpdateStatus}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Bug Status"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}