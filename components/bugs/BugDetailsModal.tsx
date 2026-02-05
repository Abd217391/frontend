"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import {
  X,
  Calendar,
  Users,
  ScanText,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle
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

  // --- OCR State ---
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    setStatus(bug.status);
    setExtractedText(""); 
  }, [bug.status, bug.id]);

  useEffect(() => {
    setMounted(true);
    const fetchAssignees = async () => {
      if (!bug.id || !token || !isOpen) return;
      try {
        const res = await fetch(`${API_BASE_URL}/bugs/${bug.id}/assignees`, {
          headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignees(data);
        }
      } catch (err) { console.error("Failed to load assignees", err); }
    };
    fetchAssignees();
  }, [bug.id, isOpen, token]);

  // --- PRE-PROCESSING & OCR Logic ---
  const handleExtractText = async () => {
    if (!bug.screenshot_url) return;
    setIsScanning(true);
    setExtractedText(""); 

    try {
      // 1. Load the image into a canvas to fix blurriness
      const img = new Image();
      img.crossOrigin = "anonymous"; // Prevents CORS issues
      img.src = bug.screenshot_url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      canvas.width = img.width;
      canvas.height = img.height;

      // 2. Apply Filters to sharpen blurry text
      // We increase contrast to 150% and make it grayscale to help the AI
      ctx.filter = "contrast(1.5) grayscale(1)";
      ctx.drawImage(img, 0, 0);

      // 3. Run OCR on the processed image
      const processedImageData = canvas.toDataURL("image/png");
      const { data: { text } } = await Tesseract.recognize(
        processedImageData,
        'eng'
      );

      // Clean up common OCR noise
      const cleanedText = text.replace(/[^\x20-\x7E\n]/g, "");
      setExtractedText(cleanedText.trim());
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Error reading image. Ensure the image is clear and try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !mounted) return null;

  const handleUpdateStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/developer/bugs/${bug.id}/status?status_update=${encodeURIComponent(status)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      });
      if (res.ok) onClose();
      else alert("Failed to update status");
    } catch (err) { alert("Error updating status"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${bug.type === "bug" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                {bug.type || "Issue"}
              </span>
              <span className="text-gray-400 text-xs font-mono">#{bug.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{bug.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {bug.description || "No description provided."}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-50/50 border">
              <label className="text-[10px] font-bold text-gray-400 mb-1 block">Status</label>
              {role === "developer" ? (
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white border rounded-lg px-2 py-1 text-sm outline-none">
                  {["new", "started", "resolved"].map((opt) => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-bold capitalize border-transparent ">{bug.status}</div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gray-50/50 border">
              <label className="text-[10px] font-bold text-gray-400 mb-1 block">Deadline</label>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <Calendar size={14} className="text-slate-400" />
                {bug.deadline ? new Date(bug.deadline).toLocaleDateString() : "No deadline"}
              </div>
            </div>
          </div>

          {/* Screenshot & OCR Container */}
          {bug.screenshot_url && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Attachment</label>
                <button 
                  onClick={handleExtractText}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {isScanning ? <Loader2 size={12} className="animate-spin" /> : <ScanText size={12} />}
                  {isScanning ? "Processing..." : "Extract Code"}
                </button>
              </div>

              <div className="rounded-xl border-2 border-slate-100 overflow-hidden relative bg-slate-50">
                <img
                  src={bug.screenshot_url}
                  alt="bug evidence"
                  className="w-full object-contain max-h-[250px] cursor-pointer"
                  onClick={() => window.open(bug.screenshot_url, "_blank")}
                />
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[9px] text-white flex items-center gap-1">
                  <AlertCircle size={10} /> If blurry, zoom in your editor before screenshotting
                </div>
              </div>

              {/* OCR Output Box */}
              {extractedText && (
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                    <span className="text-[9px] font-bold text-slate-400">COPIED CODE FROM IMAGE</span>
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition">
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-4 max-h-40 overflow-y-auto">
                    <pre className="text-[12px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                      {extractedText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {role === "developer" && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-gray-600">Cancel</button>
            <button onClick={handleUpdateStatus} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}