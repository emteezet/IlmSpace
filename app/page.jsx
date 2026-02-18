import { Mic2, Users, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <section className="relative h-[300px] rounded-3xl overflow-hidden flex items-center px-10">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-gold-500/20 z-0"></div>
                <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-[2px] z-1"></div>

                <div className="relative z-10 max-w-2xl space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Learn Deen, <span className="text-gold-500">Together.</span>
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Join live audio classes, connect with authentic teachers, and grow in your knowledge from anywhere in the world.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/register?role=student" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all inline-block">
                            Discover Classes
                        </Link>
                        <Link href="/register?role=teacher" className="px-6 py-3 border border-white/10 hover:bg-white/5 font-semibold rounded-xl transition-all inline-block">
                            Join as Teacher
                        </Link>
                    </div>
                </div>
            </section>

            {/* Suggested Spaces */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Mic2 className="w-6 h-6 text-emerald-500" />
                        Live Spaces
                    </h2>
                    <button className="text-emerald-500 text-sm font-medium hover:underline">View All</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 uppercase tracking-wider">
                                    Live
                                </span>
                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                    <Users className="w-4 h-4" />
                                    <span>1.2k listening</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors">Understanding Tajweed: Module 1</h3>
                            <p className="text-gray-400 text-sm mb-6 line-clamp-2">A foundational course on Quranic recitation with Ustadh Ammar from Lagos, Nigeria.</p>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                                    <Star className="w-5 h-5 text-gold-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Ustadh Ammar</p>
                                    <p className="text-xs text-gray-500">Ibadan Academy</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
