"use client";

import { Star, Users, Mic2 } from "lucide-react";
import Link from "next/link";

export default function ClassCard({ classData, onEnroll, isPending }) {
  return (
    <div className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl flex flex-col h-full">
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <span
          className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider flex-shrink-0 ${
            classData.category === "Quran"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : classData.category === "Arabic"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : classData.category === "Fiqh"
                  ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                  : "bg-gold-500/10 text-gold-500 border-gold-500/20"
          }`}
        >
          {classData.category}
        </span>
        <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="truncate">{classData.students?.length || 0}</span>
        </div>
      </div>

      <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
        {classData.name}
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 flex-1">
        {classData.description || "No description available"}
      </p>

      <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/5">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30 flex-shrink-0">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold truncate">
            {classData.teacher?.name || "Unknown Teacher"}
          </p>
          <p className="text-xs text-gray-500">Teacher</p>
        </div>
        {onEnroll && (
          <button
            onClick={onEnroll}
            disabled={isPending}
            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs sm:text-sm rounded-lg transition-all flex-shrink-0 whitespace-nowrap"
          >
            {isPending ? "Joining..." : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
