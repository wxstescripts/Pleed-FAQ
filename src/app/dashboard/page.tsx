"use client";

import { Server, Users, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const stats = [
    { label: "Total Members", value: "14,291", change: "+124 this week", icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: "Messages Today", value: "8,342", change: "+12% from yesterday", icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { label: "Actions Taken", value: "312", change: "4 bans, 12 kicks", icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
    { label: "Active Channels", value: "42", change: "2 new voice channels", icon: <Server className="w-5 h-5 text-purple-400" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">Select a server to manage or view global statistics.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-400">{stat.label}</p>
              <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Servers List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Your Servers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example Server Card 1 */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                P
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">Pleed Support</h3>
                <p className="text-xs text-gray-400">Owner</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">12,400 Members</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>

          {/* Example Server Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                G
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-gray-300 transition-colors">Gaming Lounge</h3>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">1,891 Members</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
          
          {/* Example Server Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer border-dashed">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <h3 className="font-medium text-white mb-1">Add to another server</h3>
            <p className="text-xs text-gray-500">Invite Pleed to a new community</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
