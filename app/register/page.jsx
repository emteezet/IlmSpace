"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, Loader2, BookOpen, Star } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
      );
      if (!res.success) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-[#111] border border-white/5 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-gold-500 bg-clip-text text-transparent mb-2">
          Join IlmSpace
        </h1>
        <p className="text-gray-400">Start your Islamic education today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "student" })}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              formData.role === "student"
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                : "bg-white/5 border-white/10 text-gray-500"
            }`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-bold">Student</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "teacher" })}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              formData.role === "teacher"
                ? "bg-gold-500/10 border-gold-500 text-gold-500"
                : "bg-white/5 border-white/10 text-gray-500"
            }`}
          >
            <Star className="w-6 h-6" />
            <span className="text-sm font-bold">Teacher</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-500 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
