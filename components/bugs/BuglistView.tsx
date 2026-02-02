import React from "react";
import { Calendar, MoreVertical, User } from "lucide-react";

import { Bug } from "@/types/bugs";

interface BugListViewProps {
  bugs: Bug[];
  onBugClick: (bug: Bug) => void;
}

const BugListView: React.FC<BugListViewProps> = ({ bugs, onBugClick }) => {
  // Helper to get text color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "text-red-500";
      case "started":
        return "text-blue-500";
      case "resolved":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white border border-[#F1F5F9] rounded-b-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F8FAFC] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-[#F1F5F9]">
          <tr>
            <th className="px-6 py-4">Bug Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Assigned To</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {bugs.map((bug) => (
            <tr
              key={bug.id}
              onClick={() => onBugClick(bug)}
              className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      bug.status.toLowerCase() === "new"
                        ? "bg-red-500"
                        : bug.status.toLowerCase() === "started"
                        ? "bg-blue-500"
                        : bug.status.toLowerCase() === "resolved"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-[13px] font-medium text-[#475569]">
                    {bug.title}
                  </span>
                </div>
              </td>
              <td className={`px-6 py-4 text-[12px] font-semibold capitalize ${getStatusColor(bug.status)}`}>
                {bug.status}
              </td>
              <td className="px-6 py-4 text-[#64748B] text-[12px]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#3B82F6]" />
                  {bug.deadline
                    ? new Date(bug.deadline).toLocaleDateString()
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex -space-x-2">
                  {Array.isArray(bug.assignees) && bug.assignees.length > 0 ? (
                    bug.assignees.slice(0, 3).map((u, i) => (
                      <div
                        key={i}
                        title={u.name}
                        className="w-7 h-7 rounded-full bg-[#1E293B] border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                      >
                        {u.name?.substring(0, 2).toUpperCase() || "??"}
                      </div>
                    ))
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#F1F5F9] border-2 border-white flex items-center justify-center text-[#94A3B8]">
                      <User size={12} />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button className="p-1 hover:bg-gray-100 rounded-md">
                  <MoreVertical size={16} className="text-[#94A3B8]" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BugListView;
