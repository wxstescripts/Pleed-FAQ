"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Save, Power } from "lucide-react";

export default function SecurityPage() {
  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="space-y-8 max-w-5xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security & Anti-Nuke</h1>
          <p className="text-gray-400">Configure raid protection and lockdown settings for your server.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 w-fit">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Master Toggle */}
      <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl mt-1 transition-colors ${antiNukeEnabled ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Master Anti-Nuke Module</h3>
            <p className="text-gray-400 text-sm max-w-xl">
              When enabled, Pleed will actively monitor audit logs and instantly punish any admin or bot that triggers the thresholds below.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setAntiNukeEnabled(!antiNukeEnabled)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${antiNukeEnabled ? 'bg-red-500' : 'bg-gray-600'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${antiNukeEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Thresholds Grid */}
      <div className={`transition-opacity duration-300 ${antiNukeEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Trigger Thresholds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Ban Rate Limit</label>
                <span className="text-xs text-gray-400">Max bans allowed per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">3</span>
            </div>
            <input type="range" min="1" max="20" defaultValue="3" className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict (1)</span>
              <span>Lenient (20)</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Kick Rate Limit</label>
                <span className="text-xs text-gray-400">Max kicks allowed per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">5</span>
            </div>
            <input type="range" min="1" max="20" defaultValue="5" className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict (1)</span>
              <span>Lenient (20)</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Channel Deletions</label>
                <span className="text-xs text-gray-400">Max deletions allowed per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">2</span>
            </div>
            <input type="range" min="1" max="10" defaultValue="2" className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict (1)</span>
              <span>Lenient (10)</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Role Deletions</label>
                <span className="text-xs text-gray-400">Max role deletions per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">3</span>
            </div>
            <input type="range" min="1" max="10" defaultValue="3" className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict (1)</span>
              <span>Lenient (10)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Punishment Settings */}
      <div className={`bg-white/5 border border-white/10 rounded-xl p-6 transition-opacity duration-300 ${antiNukeEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Action & Punishment
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">If threshold is triggered, Pleed will:</label>
            <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
              <option value="ban">Ban the rogue admin</option>
              <option value="kick">Kick the rogue admin</option>
              <option value="quarantine">Remove all roles (Quarantine)</option>
              <option value="alert">Just send an alert (Log only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Lockdown Level:</label>
            <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3">
              <Power className="w-5 h-5 text-red-500" />
              <select className="bg-transparent text-white w-full focus:outline-none appearance-none">
                <option value="high">Lock all channels instantly</option>
                <option value="medium">Lock community channels only</option>
                <option value="none">Do not lock channels</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
