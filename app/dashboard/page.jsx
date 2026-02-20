"use client";

export const dynamic = "force-dynamic"; // Disable static generation for protected routes

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  BookOpen,
  School as SchoolIcon,
  Mic2,
  Users,
  Star,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import dynamicImport from "next/dynamic";

import CreateSchoolModal from "@/components/CreateSchoolModal";
import CreateClassModal from "@/components/CreateClassModal";
import CreateSessionModal from "@/components/CreateSessionModal";

// Dynamically import LiveSpace to avoid SSR issues with Agora SDK
const LiveSpace = dynamicImport(() => import("@/components/LiveSpace"), {
  ssr: false,
});

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [suggestedClasses, setSuggestedClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fetching, setFetching] = useState(true);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // Tab state for student dashboard

  useEffect(() => {
    if (user) {
      // Initial data load
      const loadInitialData = async () => {
        setFetching(true);
        if (user?.role === "teacher") {
          await Promise.all([fetchSchools(), fetchClasses(), fetchSessions()]);
        } else {
          await Promise.all([
            fetchJoinedClasses(),
            fetchSuggestedClasses(),
            fetchSessions(),
            fetchRecordings(),
          ]);
        }
        setFetching(false);
      };
      loadInitialData();
    }
  }, [user]);

  // Optimized effect for category and search filtering (no full reload)
  useEffect(() => {
    if (user && !loading) {
      const delaySearch = setTimeout(() => {
        if (user?.role === "teacher") {
          fetchClasses();
        } else {
          fetchJoinedClasses();
          fetchSuggestedClasses();
        }
      }, 300);
      return () => clearTimeout(delaySearch);
    }
  }, [searchTerm, selectedCategory]);

  const fetchSchools = async () => {
    const res = await fetch("/api/schools", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (data.success) setSchools(data.schools);
  };

  const fetchClasses = async () => {
    const res = await fetch(
      `/api/classes?search=${searchTerm}&category=${selectedCategory}`,
    );
    const data = await res.json();
    if (data.success) setClasses(data.classes);
  };

  const fetchJoinedClasses = async () => {
    const res = await fetch(
      `/api/classes?studentId=${user?.id}&joined=true&category=${selectedCategory}`,
    );
    const data = await res.json();
    if (data.success) setClasses(data.classes);
  };

  const fetchSuggestedClasses = async () => {
    const res = await fetch(
      `/api/classes?studentId=${user?.id}&joined=false&search=${searchTerm}&category=${selectedCategory}`,
    );
    const data = await res.json();
    if (data.success) setSuggestedClasses(data.classes);
  };

  const [recordings, setRecordings] = useState([]);
  const fetchRecordings = async () => {
    const url =
      user?.role === "student"
        ? `/api/sessions?status=ended&studentId=${user?.id}`
        : "/api/sessions?status=ended";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      setRecordings(data.sessions.filter((s) => s.recordingUrl));
    }
  };

  const fetchSessions = async () => {
    const url =
      user?.role === "student"
        ? `/api/sessions?status=live&studentId=${user?.id}`
        : "/api/sessions?status=live";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setSessions(data.sessions);
  };

  const handleEnroll = async (classId) => {
    const res = await fetch(`/api/classes/${classId}/enroll`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (data.success) {
      // Only refetch the filtered classes and suggestions, not everything
      await Promise.all([fetchJoinedClasses(), fetchSuggestedClasses()]);
    }
  };

  if (loading || fetching)
    return <div className="p-10 text-center">Loading dashboard...</div>;
  if (!user)
    return (
      <div className="p-10 text-center">
        Please log in to view your dashboard.
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeSession && (
        <LiveSpace
          session={activeSession}
          user={user}
          onLeave={() => setActiveSession(null)}
        />
      )}

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[40px] bg-gradient-to-br from-[#111] via-[#050505] to-[#000] border border-white/5 p-4 sm:p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500/10 blur-[80px] sm:blur-[120px] -mr-24 sm:-mr-48 -mt-24 sm:-mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-gold-500/5 blur-[60px] sm:blur-[100px] -ml-16 sm:-ml-32 -mb-16 sm:-mb-32"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
          <div className="space-y-4 sm:space-y-6 flex-1">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Welcome back, {user.name?.split(" ")[0]}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-white mb-2 italic">
              Elevate your <br />
              <span className="text-emerald-500 not-italic">Knowledge</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed">
              Experience the future of Islamic learning with curated content.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 w-full sm:min-w-[280px] md:min-w-[340px]">
            <div className="p-1 glass rounded-2xl sm:rounded-3xl shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes..."
                  className="bg-transparent border-none outline-none text-white placeholder-gray-500 flex-1 text-sm sm:text-lg font-bold"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              {user.role === "teacher" ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsSchoolModalOpen(true)}
                    className="px-3 sm:px-4 py-3 sm:py-4 glass hover:bg-white/10 text-white rounded-lg sm:rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
                  >
                    New School
                  </button>
                  <button
                    onClick={() => setIsClassModalOpen(true)}
                    className="px-3 sm:px-4 py-3 sm:py-4 glass hover:bg-white/10 text-white rounded-lg sm:rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
                  >
                    New Class
                  </button>
                  <button
                    onClick={() => setIsSessionModalOpen(true)}
                    className="col-span-2 px-4 sm:px-6 py-3 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg sm:rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Schedule Live Space
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg sm:rounded-2xl font-black transition-all shadow-2xl shadow-emerald-500/40 text-sm sm:text-base">
                    Explore All
                  </button>
                  <button className="px-3 sm:px-6 py-3 sm:py-5 glass hover:bg-white/10 text-white rounded-lg sm:rounded-2xl transition-all flex-shrink-0">
                    <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <CreateSchoolModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onCreated={fetchSchools}
      />
      <CreateClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        schools={schools}
        onCreated={fetchClasses}
      />
      <CreateSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        classes={classes}
        onCreated={fetchSessions}
      />

      {/* Content Section */}
      <div className="space-y-6">
        {/* Category Filter Pills */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-3">
            Filter by Category
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
            {["", "Quran", "Arabic", "Fiqh", "History", "General"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-black transition-all border whitespace-nowrap tracking-tight text-xs sm:text-sm ${
                    selectedCategory === cat
                      ? "bg-white text-black border-white shadow-2xl scale-105"
                      : "glass text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat || "ALL"}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Tab Navigation for Students */}
        {user.role === "student" && (
          <div className="space-y-4">
            <div className="flex gap-1 sm:gap-2 border-b border-white/10 overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-bold whitespace-nowrap transition-all border-b-2 text-xs sm:text-sm ${
                  activeTab === "overview"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === "live"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Mic2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Live
              </button>
              <button
                onClick={() => setActiveTab("myClasses")}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === "myClasses"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                My Classes
              </button>
              <button
                onClick={() => setActiveTab("discover")}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === "discover"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                Discover
              </button>
              <button
                onClick={() => setActiveTab("recordings")}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-bold whitespace-nowrap transition-all border-b-2 text-xs sm:text-sm ${
                  activeTab === "recordings"
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Recordings
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "overview" && (
                <StudentDashboard
                  joinedClasses={classes}
                  suggestedClasses={suggestedClasses}
                  sessions={sessions}
                  recordings={recordings}
                  onJoinSession={setActiveSession}
                  onEnroll={handleEnroll}
                />
              )}
              {activeTab === "live" && (
                <LiveSessionsTab
                  sessions={sessions}
                  onJoinSession={setActiveSession}
                />
              )}
              {activeTab === "myClasses" && (
                <MyClassesTab joinedClasses={classes} />
              )}
              {activeTab === "discover" && (
                <DiscoverTab
                  suggestedClasses={suggestedClasses}
                  onEnroll={handleEnroll}
                />
              )}
              {activeTab === "recordings" && (
                <RecordingsTab recordings={recordings} />
              )}
            </div>
          </div>
        )}

        {/* Teacher Dashboard */}
        {user.role === "teacher" && (
          <TeacherDashboard
            schools={schools}
            classes={classes}
            sessions={sessions}
            onJoinSession={setActiveSession}
          />
        )}
      </div>
    </div>
  );
}

function TeacherDashboard({ schools, classes, sessions, onJoinSession }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <SchoolIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500" />
          Your Schools
        </h2>
        {schools.length === 0 ? (
          <div className="p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
            You haven&apos;t created any schools yet.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {schools.map((school) => (
              <div
                key={school._id}
                className="p-3 sm:p-4 bg-[#111] border border-white/5 rounded-lg sm:rounded-xl flex items-center justify-between hover:border-white/10 transition-all"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">
                    {school.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">
                    {school.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          Upcoming Sessions
        </h2>
        {sessions.length === 0 ? (
          <div className="p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
            No upcoming sessions scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => onJoinSession(session)}
                className="p-3 sm:p-4 bg-[#111] border border-white/5 rounded-lg sm:rounded-xl group hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-bold group-hover:text-emerald-500 transition-colors uppercase text-xs tracking-widest">
                    {session.status}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(session.startTime).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm sm:text-lg font-semibold line-clamp-1">
                  {session.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StudentDashboard({
  joinedClasses,
  suggestedClasses,
  sessions,
  recordings,
  onJoinSession,
  onEnroll,
}) {
  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12">
      {/* Live Sessions Section */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <Mic2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          Live & Upcoming Sessions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sessions.length === 0 ? (
            <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
              No live or upcoming sessions at the moment.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => onJoinSession(session)}
                className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex-shrink-0 ${
                      session.status === "live"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    }`}
                  >
                    {session.status}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>0 listening</span>
                  </div>
                </div>
                <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                  {session.title}
                </h3>
                <p className="text-gray-400 text-xs mb-4 flex-1">
                  {new Date(session.startTime).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Past Recordings Section */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500" />
          Past Sessions & Recordings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recordings && recordings.length === 0 ? (
            <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
              No recordings available yet.
            </div>
          ) : (
            recordings?.map((recording) => (
              <div
                key={recording._id}
                className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
              >
                <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-widest line-clamp-2">
                  {recording.title}
                </h3>
                <p className="text-gray-400 text-xs mb-4 flex-1">
                  {new Date(recording.startTime).toLocaleDateString()}
                </p>
                <a
                  href={recording.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-lg sm:rounded-xl border border-emerald-500/20 transition-all text-xs sm:text-sm"
                >
                  Play Recording
                </a>
              </div>
            ))
          )}
        </div>
      </section>

      {/* My Classes Section */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500" />
          My Enrolled Classes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {joinedClasses.length === 0 ? (
            <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-400 bg-white/5 text-sm">
              You haven&apos;t joined any classes yet. Explore suggestions
              below!
            </div>
          ) : (
            joinedClasses.map((cls) => (
              <div
                key={cls._id}
                className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
              >
                <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                  {cls.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 flex-1">
                  {cls.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Joined</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Discovery Section */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          Discover New Classes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {suggestedClasses.length === 0 ? (
            <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
              No new classes to discover right now.
            </div>
          ) : (
            suggestedClasses.map((cls) => (
              <div
                key={cls._id}
                className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
              >
                <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight line-clamp-2">
                  {cls.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 flex-1">
                  {cls.description}
                </p>
                <button
                  onClick={() => onEnroll(cls._id)}
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-lg sm:rounded-xl border border-emerald-500/20 transition-all text-xs sm:text-sm"
                >
                  Join Class
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function LiveSessionsTab({ sessions, onJoinSession }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
            No live or upcoming sessions at the moment.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => onJoinSession(session)}
              className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex-shrink-0 ${
                    session.status === "live"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {session.status}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>0 listening</span>
                </div>
              </div>
              <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                {session.title}
              </h3>
              <p className="text-gray-400 text-xs flex-1">
                {new Date(session.startTime).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function MyClassesTab({ joinedClasses }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {joinedClasses.length === 0 ? (
          <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-400 bg-white/5 text-sm">
            You haven&apos;t joined any classes yet. Explore suggestions in the
            Discover tab!
          </div>
        ) : (
          joinedClasses.map((cls) => (
            <div
              key={cls._id}
              className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
            >
              <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                {cls.name}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 flex-1">
                {cls.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Joined</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DiscoverTab({ suggestedClasses, onEnroll }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {suggestedClasses.length === 0 ? (
          <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
            No new classes to discover right now.
          </div>
        ) : (
          suggestedClasses.map((cls) => (
            <div
              key={cls._id}
              className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
            >
              <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight line-clamp-2">
                {cls.name}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 flex-1">
                {cls.description}
              </p>
              <button
                onClick={() => onEnroll(cls._id)}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-lg sm:rounded-xl border border-emerald-500/20 transition-all text-xs sm:text-sm"
              >
                Join Class
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RecordingsTab({ recordings }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {recordings && recordings.length === 0 ? (
          <div className="col-span-full p-6 sm:p-10 border border-dashed border-white/10 rounded-xl sm:rounded-2xl text-center text-gray-500 text-sm">
            No recordings available yet.
          </div>
        ) : (
          recordings?.map((recording) => (
            <div
              key={recording._id}
              className="p-4 sm:p-6 bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
            >
              <h3 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-widest line-clamp-2">
                {recording.title}
              </h3>
              <p className="text-gray-400 text-xs mb-4 flex-1">
                {new Date(recording.startTime).toLocaleDateString()}
              </p>
              <a
                href={recording.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-lg sm:rounded-xl border border-emerald-500/20 transition-all text-xs sm:text-sm"
              >
                Play Recording
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
