"use client";

import { API_BASE_URL } from "@/utils/constants";
import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Calendar, CloudUpload, Check, User } from "lucide-react";



interface Developer {
  id: number;
  name: string;
}

interface AddBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  handleBugAdded: () => void;
}

const compressImage = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 800;
      const scaleSize = maxWidth / img.width;
      const width = img.width > maxWidth ? maxWidth : img.width;
      const height = img.width > maxWidth ? img.height * scaleSize : img.height;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
  };
};

export default function AddBugModal({
  isOpen,
  onClose,
  projectId,
  handleBugAdded,
}: AddBugModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [type, setType] = useState("bug");

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [assignedDevelopers, setAssignedDevelopers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!isOpen || !token) return;

    // --- UPDATED URL ---
    fetch(`${API_BASE_URL}/qa/developers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or Server Error");
        return res.json();
      })
      .then((data) => {
        const devs = Array.isArray(data)
          ? data
          : data.developers || data.data || [];
        setDevelopers(devs);
      })
      .catch((err) => {
        console.error("Dev fetch error:", err);
        setDevelopers([]);
      });
  }, [isOpen, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      compressImage(e.target.files[0], (base64) => setScreenshotUrl(base64));
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !deadline) {
      alert("Please fill in Title, Description, and Deadline.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bugPayload = {
        title,
        description,
        project_id: projectId,
        type,
        status: "new",
        deadline,
        screenshot_url: screenshotUrl || "",
      };

      // --- UPDATED URL ---
      const res = await fetch(
        `${API_BASE_URL}/qa/projects/${projectId}/bugs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bugPayload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create bug");
      }

      const createdBug = await res.json();
      const newBugId = createdBug.id;

      if (assignedDevelopers.length > 0 && newBugId) {
        // --- UPDATED URL ---
        const assignRes = await fetch(
          `${API_BASE_URL}/qa/bugs/${newBugId}/assign-developers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignedDevelopers),
          },
        );

        if (!assignRes.ok) {
          console.warn("Bug created, but assignments failed.");
        }
      }

      handleBugAdded();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDeveloper = (id: number) => {
    setAssignedDevelopers((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const getInitials = (name: string) =>
    name ? name.substring(0, 2).toUpperCase() : "??";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* ... UI code remains exactly the same ... */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition z-20"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold text-slate-900 mb-8">Add new bug</h2>

        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-medium">Assign to</span>
              <div className="flex items-center -space-x-2">
                {Array.isArray(developers) &&
                  developers
                    .filter((d) => assignedDevelopers.includes(d.id))
                    .slice(0, 3)
                    .map((dev) => (
                      <div
                        key={dev.id}
                        className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                      >
                        {getInitials(dev.name)}
                      </div>
                    ))}

                {assignedDevelopers.length === 0 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <User size={14} className="text-gray-400" />
                  </div>
                )}

                <button
                  onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 bg-white transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {isAssignDropdownOpen && (
              <div className="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase">
                  Select Developers
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {Array.isArray(developers) &&
                    developers.map((dev) => {
                      const isSelected = assignedDevelopers.includes(dev.id);
                      return (
                        <button
                          key={dev.id}
                          onClick={() => toggleDeveloper(dev.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
                            >
                              {getInitials(dev.name)}
                            </div>
                            <span
                              className={`text-sm ${isSelected ? "font-semibold text-blue-700" : "text-gray-700"}`}
                            >
                              {dev.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 relative">
            <span className="text-gray-900 font-medium">Add due date</span>
            <div
              className="relative cursor-pointer group"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              <div className="w-9 h-9 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 text-gray-500 transition bg-white">
                <Calendar size={18} />
              </div>
              <input
                ref={dateInputRef}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {deadline && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {deadline}
              </span>
            )}
          </div>

          <div className="ml-auto">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-50 text-xs font-semibold text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 outline-none border border-transparent focus:border-gray-200 cursor-pointer"
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Add title here"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
          />

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Details
            </label>
            <textarea
              placeholder="Add description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-lg text-gray-600 placeholder-gray-300 border-none focus:ring-0 focus:outline-none resize-none p-0 bg-transparent"
            />
          </div>

          <div className="mt-4">
            <div className="relative flex flex-col items-center justify-center w-full h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer overflow-hidden">
              {!screenshotUrl ? (
                <>
                  <CloudUpload size={32} className="text-slate-400 mb-2" />
                  <p className="text-slate-500 font-medium text-sm">
                    Drop file here or{" "}
                    <span className="text-blue-600 underline">browse</span>
                  </p>
                </>
              ) : (
                <div className="relative h-full w-full flex items-center justify-center bg-slate-100">
                  <img
                    src={screenshotUrl}
                    alt="Preview"
                    className="h-full object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setScreenshotUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all active:scale-95 ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Saving..." : "Create Bug"}
          </button>
        </div>
      </div>
    </div>
  );
}