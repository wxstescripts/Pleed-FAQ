"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Save, Power, Loader2, Check } from "lucide-react";
import { getSecurityConfig, saveSecurityConfig, type SecurityConfig, type SecurityPunishment } from "@/lib/api";

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState<SecurityConfig>({
    enabled: 0,
    punishment: "ban",
    ban_threshold: 3,
    kick_threshold: 5,
    channel_delete_threshold: 2,
    role_delete_threshold: 2
  });

  useEffect(() => {
    async function fetchSecurity() {
      try {
        const data = await getSecurityConfig();
        setConfig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSecurity();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveSecurityConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  const antiNukeEnabled = config.enabled === 1;

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
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-colors w-fit shadow-lg ${saved ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
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
          onClick={() => setConfig({...config, enabled: antiNukeEnabled ? 0 : 1})}
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
              <span className="text-2xl font-bold text-gray-300">{config.ban_threshold}</span>
            </div>
            <input type="range" min="1" max="20" value={config.ban_threshold} onChange={(e) => setConfig({...config, ban_threshold: parseInt(e.target.value)})} className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Kick Rate Limit</label>
                <span className="text-xs text-gray-400">Max kicks allowed per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">{config.kick_threshold}</span>
            </div>
            <input type="range" min="1" max="20" value={config.kick_threshold} onChange={(e) => setConfig({...config, kick_threshold: parseInt(e.target.value)})} className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Channel Deletions</label>
                <span className="text-xs text-gray-400">Max deletions allowed per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">{config.channel_delete_threshold}</span>
            </div>
            <input type="range" min="1" max="10" value={config.channel_delete_threshold} onChange={(e) => setConfig({...config, channel_delete_threshold: parseInt(e.target.value)})} className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* Card 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="font-semibold text-white block">Role Deletions</label>
                <span className="text-xs text-gray-400">Max role deletions per minute.</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">{config.role_delete_threshold}</span>
            </div>
            <input type="range" min="1" max="10" value={config.role_delete_threshold} onChange={(e) => setConfig({...config, role_delete_threshold: parseInt(e.target.value)})} className="w-full accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
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
            <select 
              value={config.punishment}
              onChange={(e) => setConfig({...config, punishment: e.target.value as SecurityPunishment})}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="ban">Ban the rogue admin</option>
              <option value="kick">Kick the rogue admin</option>
              <option value="quarantine">Remove all roles (Quarantine)</option>
              <option value="alert">Just send an alert (Log only)</option>
            </select>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
