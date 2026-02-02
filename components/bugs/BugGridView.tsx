import React from "react";
import { Calendar, MoreVertical, User } from "lucide-react";

import { Bug } from "@/types/bugs";

interface BugGridViewProps {
  bugs: Bug[];
  onBugClick: (bug: Bug) => void;
}

const BugGridView: React.FC<BugGridViewProps> = ({ bugs, onBugClick }) => {
  return (
    <div className="grid sm:[px786] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6   ">
      {bugs.map((bug) => (
        <div
          key={bug.id}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                {bug.title}
              </h3>
              <MoreVertical size={18} className="text-gray-400" />
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-blue-400 font-medium">Due Date</span>
                <span className="text-gray-700 font-medium">
                  {bug.deadline || "No date"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400 font-medium">
                  Assigned To
                </span>
                <div className="flex -space-x-2">
                  {Array.isArray(bug.assignees) && bug.assignees.length > 0 ? (
                    bug.assignees.map((u, i) => (
                      <div
                        key={i}
                        title={u.name}
                        className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
                      >
                        {u.name?.substring(0, 2).toUpperCase() || "??"}
                      </div>
                    ))
                  ) : (
                    <User size={14} className="text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onBugClick(bug)}
            className="w-full mt-auto bg-gray-50 hover:bg-gray-100 text-slate-700 font-semibold py-2 rounded-lg text-sm transition"
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default BugGridView;
