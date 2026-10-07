"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Save, Loader2, Check, ShieldCheck, Mail, Clock } from "lucide-react";
import { getJoinGatesConfig, saveJoinGatesConfig, type JoinGatesConfig } from "@/lib/api";

export default function JoinGatesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState<JoinGatesConfig>({
    enabled: 0,
    verify_channel_id: "",
    verified_role_id: "",
    unverified_role_id: "",
    min_account_age_days: 0,
    auto_kick_minutes: 0,
    dm_on_join: 0,
    log_channel_id: "",
    bypass_role_id: ""
  });

  useEffect(() => {
    async function fetchJoinGates() {
      try {
        const data = await getJoinGatesConfig();
        setConfig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJoinGates();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveJoinGatesConfig(config);
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

  const enabled = config.enabled === 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="space-y-8 max-w-5xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Gates</h1>
          <p className="text-gray-400">Force new members to complete verification before accessing the server.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-colors w-fit shadow-lg ${saved ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Master Toggle */}
      <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl mt-1 transition-colors ${enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Enable Verification Gate</h3>
            <p className="text-gray-400 text-sm max-w-xl">
              When enabled, new users will be assigned the Unverified Role and must click a button in the Verify Channel to gain access.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setConfig({...config, enabled: enabled ? 0 : 1})}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className={`transition-opacity duration-300 space-y-8 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        
        {/* Verification Roles & Channels */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Roles & Channels
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Unverified Role ID</label>
              <input 
                type="text" 
                value={config.unverified_role_id}
                onChange={(e) => setConfig({...config, unverified_role_id: e.target.value})}
                placeholder="e.g., 9876543210"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Role given when a user joins.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Verified Role ID</label>
              <input 
                type="text" 
                value={config.verified_role_id}
                onChange={(e) => setConfig({...config, verified_role_id: e.target.value})}
                placeholder="e.g., 1234567890"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Role given after verification.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Verification Channel ID</label>
              <input 
                type="text" 
                value={config.verify_channel_id}
                onChange={(e) => setConfig({...config, verify_channel_id: e.target.value})}
                placeholder="e.g., 1122334455"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Log Channel ID</label>
              <input 
                type="text" 
                value={config.log_channel_id}
                onChange={(e) => setConfig({...config, log_channel_id: e.target.value})}
                placeholder="e.g., 5544332211"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        {/* Security Rules */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Security Rules
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5">
              <label className="block text-sm font-semibold text-white mb-1">Minimum Account Age</label>
              <p className="text-xs text-gray-400 mb-3">Accounts younger than this will be auto-kicked to prevent bot raids.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={config.min_account_age_days}
                  onChange={(e) => setConfig({...config, min_account_age_days: parseInt(e.target.value) || 0})}
                  className="w-20 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span className="text-gray-400 text-sm">Days old</span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-5">
              <label className="block text-sm font-semibold text-white mb-1">Auto-Kick Timeout</label>
              <p className="text-xs text-gray-400 mb-3">Kick users if they don't verify within this timeframe (0 to disable).</p>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={config.auto_kick_minutes}
                  onChange={(e) => setConfig({...config, auto_kick_minutes: parseInt(e.target.value) || 0})}
                  className="w-20 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span className="text-gray-400 text-sm">Minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mt-1">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">DM on Join</h3>
              <p className="text-gray-400 text-sm">
                Pleed will send a direct message to new users telling them to complete verification.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setConfig({...config, dm_on_join: config.dm_on_join === 1 ? 0 : 1})}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${config.dm_on_join === 1 ? 'bg-indigo-500' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${config.dm_on_join === 1 ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
