"use client";

import { Star, Users, Mic2 } from "lucide-react";
import Link from "next/link";

export default function ClassCard({ classData, onEnroll, isPending }) {
  return (
    <div className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
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
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Users className="w-4 h-4" />
          <span>{classData.students?.length || 0} students</span>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors">
        {classData.name}
      </h3>
      <p className="text-gray-400 text-sm mb-6 line-clamp-2">
        {classData.description || "No description available"}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
          <Star className="w-5 h-5 text-gold-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {classData.teacher?.name || "Unknown Teacher"}
          </p>
          <p className="text-xs text-gray-500">Teacher</p>
        </div>
        {onEnroll && (
          <button
            onClick={onEnroll}
            disabled={isPending}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg transition-all"
          >
            {isPending ? "Joining..." : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
