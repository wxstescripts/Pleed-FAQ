"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, ShieldAlert, Link as LinkIcon, MessageSquareWarning, ArrowUpAZ } from "lucide-react";
import { getAutomodConfig, saveAutomodConfig, type AutomodConfig, type AutomodPunishment } from "@/lib/api";

export default function AutoModPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AutomodConfig>({
    anti_links: 0, anti_spam: 0, anti_caps: 0, anti_invites: 0,
    anti_mentions: 0, bad_words_enabled: 0, punishment: "delete", timeout_minutes: 10
  });

  useEffect(() => {
    getAutomodConfig()
      .then(data => { setConfig(data); setLoading(false); })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAutomodConfig(config);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Auto-Moderation</h1>
          <p className="text-gray-400">Automatically filter out spam, bad words, and malicious links.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module Toggles */}
        {[
          { key: "anti_spam", label: "Anti-Spam Filter", desc: "Prevents users from sending messages too fast.", icon: <MessageSquareWarning className="w-5 h-5 text-yellow-400" /> },
          { key: "anti_links", label: "Anti-Links", desc: "Deletes unapproved URLs and website links.", icon: <LinkIcon className="w-5 h-5 text-blue-400" /> },
          { key: "anti_invites", label: "Anti-Discord Invites", desc: "Deletes links to other Discord servers.", icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
          { key: "anti_caps", label: "Anti-Caps", desc: "Deletes messages with excessive capital letters.", icon: <ArrowUpAZ className="w-5 h-5 text-purple-400" /> },
          { key: "bad_words_enabled", label: "Bad Words Filter", desc: "Automatically censors blacklisted words.", icon: <ShieldAlert className="w-5 h-5 text-orange-400" /> }
        ].map(mod => (
          <div key={mod.key} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="mt-1">{mod.icon}</div>
              <div>
                <h3 className="font-bold text-white">{mod.label}</h3>
                <p className="text-xs text-gray-400">{mod.desc}</p>
              </div>
            </div>
            <button 
              onClick={() => setConfig({...config, [mod.key]: config[mod.key as keyof typeof config] === 1 ? 0 : 1})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config[mod.key as keyof typeof config] === 1 ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config[mod.key as keyof typeof config] === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Punishment Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Action</label>
            <select value={config.punishment} onChange={(e) => setConfig({...config, punishment: e.target.value as AutomodPunishment})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white">
              <option value="delete">Delete Message Only</option>
              <option value="timeout">Timeout User</option>
              <option value="kick">Kick User</option>
              <option value="ban">Ban User</option>
            </select>
          </div>
          {config.punishment === "timeout" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout Duration (Minutes)</label>
              <input type="number" value={config.timeout_minutes} onChange={(e) => setConfig({...config, timeout_minutes: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
