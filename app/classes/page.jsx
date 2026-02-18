"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Search, Filter } from "lucide-react";
import ClassCard from "@/components/ClassCard";

export const dynamic = 'force-dynamic';

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fetching, setFetching] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  const categories = ["Quran", "Arabic", "Fiqh", "History", "General"];

  useEffect(() => {
    if (user && user.role === "student") {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (user) fetchClasses();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, selectedCategory]);

  const fetchClasses = async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({
        studentId: user.id,
        joined: "false",
      });
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/classes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
    setFetching(false);
  };

  const handleEnroll = async (classId) => {
    setEnrolling(classId);
    try {
      const res = await fetch(`/api/classes/${classId}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setClasses(classes.filter((c) => c._id !== classId));
      }
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
    setEnrolling(null);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-500" />
          Discover Classes
        </h1>
        <p className="text-gray-400">
          Browse and join classes from teachers worldwide
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search classes..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? "" : cat)
              }
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      {fetching ? (
        <div className="text-center py-12 text-gray-400">
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No classes found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData) => (
            <ClassCard
              key={classData._id}
              classData={classData}
              onEnroll={() => handleEnroll(classData._id)}
              isPending={enrolling === classData._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
