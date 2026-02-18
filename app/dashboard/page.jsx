'use client';

export const dynamic = 'force-dynamic'; // Disable static generation for protected routes

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, BookOpen, School as SchoolIcon, Mic2, Users, Star, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';

import CreateSchoolModal from '@/components/CreateSchoolModal';
import CreateClassModal from '@/components/CreateClassModal';
import CreateSessionModal from '@/components/CreateSessionModal';

// Dynamically import LiveSpace to avoid SSR issues with Agora SDK
const LiveSpace = dynamicImport(() => import('@/components/LiveSpace'), { ssr: false });

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [suggestedClasses, setSuggestedClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [fetching, setFetching] = useState(true);
    const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // Tab state for student dashboard

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (user) fetchDashboardData();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, selectedCategory, user]);

    const fetchDashboardData = async () => {
        setFetching(true);
        if (user?.role === 'teacher') {
            await Promise.all([fetchSchools(), fetchClasses(), fetchSessions()]);
        } else {
            await Promise.all([fetchJoinedClasses(), fetchSuggestedClasses(), fetchSessions(), fetchRecordings()]);
        }
        setFetching(false);
    };

    const fetchSchools = async () => {
        const res = await fetch('/api/schools', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) setSchools(data.schools);
    };

    const fetchClasses = async () => {
        const res = await fetch(`/api/classes?search=${searchTerm}&category=${selectedCategory}`);
        const data = await res.json();
        if (data.success) setClasses(data.classes);
    };

    const fetchJoinedClasses = async () => {
        const res = await fetch(`/api/classes?studentId=${user?.id}&joined=true&category=${selectedCategory}`);
        const data = await res.json();
        if (data.success) setClasses(data.classes);
    };

    const fetchSuggestedClasses = async () => {
        const res = await fetch(`/api/classes?studentId=${user?.id}&joined=false&search=${searchTerm}&category=${selectedCategory}`);
        const data = await res.json();
        if (data.success) setSuggestedClasses(data.classes);
    };

    const [recordings, setRecordings] = useState([]);
    const fetchRecordings = async () => {
        const url = user?.role === 'student'
            ? `/api/sessions?status=ended&studentId=${user?.id}`
            : '/api/sessions?status=ended';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            setRecordings(data.sessions.filter(s => s.recordingUrl));
        }
    };

    const fetchSessions = async () => {
        const url = user?.role === 'student'
            ? `/api/sessions?status=live&studentId=${user?.id}`
            : '/api/sessions?status=live';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setSessions(data.sessions);
    };

    const handleEnroll = async (classId) => {
        const res = await fetch(`/api/classes/${classId}/enroll`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
            fetchDashboardData();
        }
    };

    if (loading || fetching) return <div className="p-10 text-center">Loading dashboard...</div>;
    if (!user) return <div className="p-10 text-center">Please log in to view your dashboard.</div>;

    return (
        <div className="space-y-8">
            {activeSession && (
                <LiveSpace
                    session={activeSession}
                    user={user}
                    onLeave={() => setActiveSession(null)}
                />
            )}

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#111] via-[#050505] to-[#000] border border-white/5 p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 blur-[100px] -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-6 flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            Welcome back, {user.name}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white mb-2 italic">
                            Elevate your <br /><span className="text-emerald-500 not-italic">Knowledge</span>
                        </h1>
                        <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
                            Experience the future of Islamic learning. Join live audio sessions with world-class teachers.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[340px]">
                        <div className="p-1 glass rounded-3xl shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                            <div className="flex items-center gap-3 px-5 py-4">
                                <Search className="w-6 h-6 text-emerald-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search classes or topics..."
                                    className="bg-transparent border-none outline-none text-white placeholder-gray-500 flex-1 text-lg font-bold"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {user.role === 'teacher' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsSchoolModalOpen(true)}
                                        className="px-4 py-4 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
                                    >
                                        New School
                                    </button>
                                    <button
                                        onClick={() => setIsClassModalOpen(true)}
                                        className="px-4 py-4 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
                                    >
                                        New Class
                                    </button>
                                    <button
                                        onClick={() => setIsSessionModalOpen(true)}
                                        className="col-span-2 px-6 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Schedule Live Space
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black transition-all shadow-2xl shadow-emerald-500/40">
                                        Explore All
                                    </button>
                                    <button className="px-6 py-5 glass hover:bg-white/10 text-white rounded-2xl transition-all">
                                        <Filter className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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


            {/* Category Filter Pills */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                {['', 'Quran', 'Arabic', 'Fiqh', 'History', 'General'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-8 py-3 rounded-2xl font-black transition-all border whitespace-nowrap tracking-tight ${selectedCategory === cat
                            ? 'bg-white text-black border-white shadow-2xl scale-105'
                            : 'glass text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {cat || 'ALL CONTENT'}
                    </button>
                ))}
            </div>

            {/* Tab Navigation for Students */}
            {user.role === 'student' && (
                <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                            activeTab === 'overview'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                            activeTab === 'live'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <Mic2 className="w-4 h-4" />
                        Live Spaces
                    </button>
                    <button
                        onClick={() => setActiveTab('myClasses')}
                        className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                            activeTab === 'myClasses'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        My Classes
                    </button>
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                            activeTab === 'discover'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        Discover
                    </button>
                    <button
                        onClick={() => setActiveTab('recordings')}
                        className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                            activeTab === 'recordings'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Recordings
                    </button>
                </div>
            )}

            {user.role === 'teacher' ? (
                <TeacherDashboard
                    schools={schools}
                    classes={classes}
                    sessions={sessions}
                    onJoinSession={setActiveSession}
                />
            ) : (
                <StudentDashboard
                    joinedClasses={classes}
                    suggestedClasses={suggestedClasses}
                    sessions={sessions}
                    recordings={recordings}
                    onJoinSession={setActiveSession}
                    onEnroll={handleEnroll}
                />
            )}
        </div>
    );
}

function TeacherDashboard({ schools, classes, sessions, onJoinSession }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <SchoolIcon className="w-6 h-6 text-gold-500" />
                    Your Schools
                </h2>
                {schools.length === 0 ? (
                    <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500">
                        You haven&apos;t created any schools yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {schools.map((school) => (
                            <div key={school._id} className="p-4 bg-[#111] border border-white/5 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">{school.name}</h3>
                                    <p className="text-sm text-gray-400">{school.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    Upcoming Sessions
                </h2>
                {sessions.length === 0 ? (
                    <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500">
                        No upcoming sessions scheduled.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session._id}
                                onClick={() => onJoinSession(session)}
                                className="p-4 bg-[#111] border border-white/5 rounded-xl group hover:border-emerald-500/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold group-hover:text-emerald-500 transition-colors uppercase text-xs tracking-widest">{session.status}</h3>
                                    <span className="text-xs text-gray-500">{new Date(session.startTime).toLocaleString()}</span>
                                </div>
                                <h4 className="text-lg font-semibold">{session.title}</h4>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function StudentDashboard({ joinedClasses, suggestedClasses, sessions, recordings, onJoinSession, onEnroll }) {
    return (
        <div className="space-y-12">
            {/* Live Sessions Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mic2 className="w-6 h-6 text-emerald-500" />
                    Live & Upcoming Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.length === 0 ? (
                        <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500">
                            No live or upcoming sessions at the moment.
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session._id}
                                onClick={() => onJoinSession(session)}
                                className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${session.status === 'live' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                        {session.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <Users className="w-4 h-4" />
                                        <span>0 listening</span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors">{session.title}</h3>
                                <p className="text-gray-400 text-xs mb-4">{new Date(session.startTime).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Past Recordings Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="w-6 h-6 text-gold-500" />
                    Past Sessions & Recordings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recordings && recordings.length === 0 ? (
                        <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500">
                            No recordings available yet.
                        </div>
                    ) : (
                        recordings?.map((recording) => (
                            <div key={recording._id} className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">{recording.title}</h3>
                                <p className="text-gray-400 text-xs mb-4">{new Date(recording.startTime).toLocaleDateString()}</p>
                                <a
                                    href={recording.recordingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-xl border border-emerald-500/20 transition-all"
                                >
                                    Play Recording
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* My Classes Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-gold-500" />
                    My Enrolled Classes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedClasses.length === 0 ? (
                        <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-400 bg-white/5">
                            You haven&apos;t joined any classes yet. Explore suggestions below!
                        </div>
                    ) : (
                        joinedClasses.map((cls) => (
                            <div key={cls._id} className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors">{cls.name}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{cls.description}</p>
                                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                                    <Users className="w-4 h-4" />
                                    <span>Joined</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Discovery Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="w-6 h-6 text-emerald-500" />
                    Discover New Classes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedClasses.length === 0 ? (
                        <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500">
                            No new classes to discover right now.
                        </div>
                    ) : (
                        suggestedClasses.map((cls) => (
                            <div key={cls._id} className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{cls.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{cls.description}</p>
                                <button
                                    onClick={() => onEnroll(cls._id)}
                                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-bold rounded-xl border border-emerald-500/20 transition-all"
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
