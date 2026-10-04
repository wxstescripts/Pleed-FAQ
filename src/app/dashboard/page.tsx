"use client";

import { useState, useEffect } from "react";
import { Server, Users, Activity, ShieldAlert, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetching from the temporary localtunnel API backend
        const statsRes = await fetch("https://solid-walls-relate.loca.lt/api/stats", {
          headers: { "Bypass-Tunnel-Reminder": "true" }
        });
        const statsData = await statsRes.json();
        
        const serversRes = await fetch("https://solid-walls-relate.loca.lt/api/servers", {
          headers: { "Bypass-Tunnel-Reminder": "true" }
        });
        const serversData = await serversRes.json();

        setStats(statsData);
        setServers(serversData);
      } catch (error) {
        console.error("Failed to fetch Pleed API:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    { label: "Active Servers", value: stats?.servers || 0, change: "Live from pleed.db", icon: <Server className="w-5 h-5 text-purple-400" /> },
    { label: "Messages Processed", value: stats?.messages_today?.toLocaleString() || 0, change: "Today", icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { label: "Total Members", value: "Loading...", change: "Across all guilds", icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: "Actions Taken", value: stats?.actions_taken?.toLocaleString() || 0, change: "Bans, Kicks, Mutes", icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
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
        <p className="text-gray-400">Live data pulled directly from the Pleed API.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
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
            
            {servers.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                No servers found in the database. Ensure Pleed is running and invited!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server, i) => (
                  <div key={i} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {server.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">Server {server.id}</h3>
                        <p className="text-xs text-gray-400">{server.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{server.members} Members</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Add Server Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer border-dashed min-h-[140px]">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 text-gray-400 group-hover:text-white transition-colors">
                    <span className="text-2xl">+</span>
                  </div>
                  <h3 className="font-medium text-white mb-1">Add to another server</h3>
                  <p className="text-xs text-gray-500">Invite Pleed to a new community</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
