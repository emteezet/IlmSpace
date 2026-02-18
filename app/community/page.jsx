"use client";

import { Users, MessageCircle, Heart } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-emerald-500" />
          Community
        </h1>
        <p className="text-gray-400">
          Connect with students and teachers from around the world
        </p>
      </div>

      {/* Coming Soon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-[#111] border border-white/5 rounded-2xl text-center">
          <MessageCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Discussion Forums</h3>
          <p className="text-gray-400 text-sm">
            Share questions and insights with the community
          </p>
        </div>

        <div className="p-8 bg-[#111] border border-white/5 rounded-2xl text-center">
          <Heart className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">User Profiles</h3>
          <p className="text-gray-400 text-sm">
            Discover talented teachers and dedicated students
          </p>
        </div>

        <div className="p-8 bg-[#111] border border-white/5 rounded-2xl text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Study Groups</h3>
          <p className="text-gray-400 text-sm">
            Create or join study groups with peers
          </p>
        </div>
      </div>

      {/* Featured Teachers */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Teachers</h2>
        <div className="p-8 bg-[#111] border border-white/5 rounded-2xl text-center">
          <p className="text-gray-400">Community features coming soon</p>
        </div>
      </div>
    </div>
  );
}
