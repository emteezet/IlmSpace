"use client";

import { useAuth } from "@/context/AuthContext";
import { Settings, Bell, Lock, User, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-emerald-500" />
          Settings
        </h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="p-6 bg-[#111] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <User className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lgfont-bold">{user?.name}</h3>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 bg-[#111] border border-white/5 rounded-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-500" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">
                  Get updates about new classes
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="font-medium">Session Reminders</p>
                <p className="text-gray-400 text-sm">
                  Remind me before sessions start
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 bg-[#111] border border-white/5 rounded-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            Security
          </h3>
          <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all text-left">
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h3>
          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
