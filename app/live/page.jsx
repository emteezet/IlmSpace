"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mic2, Users, Clock, Play } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function LivePage() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLiveSessions();
      const interval = setInterval(fetchLiveSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchLiveSessions = async () => {
    try {
      const url =
        user.role === "student"
          ? `/api/sessions?status=live&studentId=${user.id}`
          : "/api/sessions?status=live";

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch live sessions:", error);
    }
    setFetching(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Mic2 className="w-8 h-8 text-emerald-500" />
          Live Spaces
        </h1>
        <p className="text-gray-400">
          Join live audio classes happening right now
        </p>
      </div>

      {/* Live Sessions */}
      {fetching ? (
        <div className="text-center py-12 text-gray-400">
          Loading live sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 bg-[#111] border border-white/5 rounded-2xl text-center">
          <Mic2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No live sessions right now</p>
          <p className="text-sm text-gray-500 mt-2">
            Check back soon for live audio classes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Live Now
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">
                {session.title}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Hosted by {session.teacher?.name || "Unknown"}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">
                    {session.participants?.length || 0} listening
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">
                    Started at{" "}
                    {new Date(session.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                <Play className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                Join Live
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
