"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Settings2, Hash, Megaphone } from "lucide-react";
import { getSettings, saveSettings, type GuildSettings } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<GuildSettings>({ prefix: "!", welcome_channel: "" });

  useEffect(() => {
    getSettings()
      .then(data => { setConfig(data); setLoading(false); })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(config);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">General Settings</h1>
          <p className="text-gray-400">Manage basic bot configuration for your server.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-indigo-400" /> Command Prefix
          </h2>
          <p className="text-sm text-gray-400 mb-3">The symbol you type before commands (e.g., !help, ?help).</p>
          <input 
            type="text" 
            value={config.prefix} 
            onChange={(e) => setConfig({...config, prefix: e.target.value.substring(0, 3)})}
            className="w-24 bg-black border border-white/10 rounded-lg px-4 py-2 text-white text-center text-xl font-mono focus:outline-none focus:border-indigo-500" 
          />
        </div>

        <hr className="border-white/10" />

        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-emerald-400" /> Welcome Channel
          </h2>
          <p className="text-sm text-gray-400 mb-3">Discord Channel ID where Pleed should post welcome cards when new members join.</p>
          <input 
            type="text" 
            placeholder="e.g., 1234567890"
            value={config.welcome_channel || ""} 
            onChange={(e) => setConfig({...config, welcome_channel: e.target.value})}
            className="w-full max-w-md bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
          />
        </div>
      </div>
    </motion.div>
  );
}
