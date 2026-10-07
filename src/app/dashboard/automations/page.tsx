"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Bot, Plus, Trash2 } from "lucide-react";
import { createAutomation, deleteAutomation, getAutomations, type Automation } from "@/lib/api";

export default function AutomationsPage() {
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [newAuto, setNewAuto] = useState({ name: "", trigger: "", payload: "", match_type: "contains" });

  const fetchAutomations = async () => {
    try {
      const data = await getAutomations();
      setAutomations(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleAdd = async () => {
    if (!newAuto.trigger || !newAuto.payload) return;
    try {
      await createAutomation(newAuto);
    } catch (err) {
      console.error(err);
      return;
    }
    setNewAuto({ name: "", trigger: "", payload: "", match_type: "contains" });
    fetchAutomations();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAutomation(id);
    } catch (err) {
      console.error(err);
      return;
    }
    fetchAutomations();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Auto-Responders</h1>
        <p className="text-gray-400">Make Pleed automatically reply when specific keywords are typed.</p>
      </div>

      {/* Add New */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400" /> Create Responder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input 
            type="text" placeholder="Trigger Word (e.g. hello)" value={newAuto.trigger} 
            onChange={(e) => setNewAuto({...newAuto, trigger: e.target.value})}
            className="sm:col-span-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white" 
          />
          <input 
            type="text" placeholder="Bot Reply (e.g. Hi there!)" value={newAuto.payload} 
            onChange={(e) => setNewAuto({...newAuto, payload: e.target.value})}
            className="sm:col-span-2 bg-black border border-white/10 rounded-lg px-4 py-2 text-white" 
          />
          <button onClick={handleAdd} className="sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg py-2 flex items-center justify-center gap-2">
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {automations.map((auto) => (
          <div key={auto.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <Bot className="w-8 h-8 text-indigo-500 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">When someone says: <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{auto.trigger}</span></p>
                <p className="text-indigo-300 mt-1 text-sm">Pleed replies: "{auto.payload}"</p>
              </div>
            </div>
            <button onClick={() => handleDelete(auto.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {automations.length === 0 && (
          <div className="text-center py-10 text-gray-500">No auto-responders created yet.</div>
        )}
      </div>
    </motion.div>
  );
}
