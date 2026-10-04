"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Terminal, Filter } from "lucide-react";
import commandsData from "@/data/commands.json";

export default function CommandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique categories and sort them
  const categories = useMemo(() => {
    const cats = Array.from(new Set(commandsData.map((cmd) => cmd.category)));
    return ["All", ...cats.sort()];
  }, []);

  // Filter commands based on search and category
  const filteredCommands = useMemo(() => {
    return commandsData.filter((cmd) => {
      const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || cmd.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
            >
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Library</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg md:text-xl"
            >
              Explore all {commandsData.length} commands available in Pleed. Use the search bar or filter by category to find exactly what you need.
            </motion.p>
          </div>

          {/* Controls: Search & Filter */}
          <div className="max-w-5xl mx-auto mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-lg shadow-xl shadow-black/20"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Commands Grid */}
          <div className="max-w-6xl mx-auto">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No commands found matching "{searchQuery}"</p>
              </div>
            ) : (
              <motion.div 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {filteredCommands.map((cmd, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={`${cmd.name}-${idx}`}
                      className="bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl p-5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          <span className="text-indigo-400 font-mono select-none">!</span>
                          {cmd.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-white/5 text-gray-400 rounded-md">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {cmd.description !== "No description provided." 
                          ? cmd.description 
                          : "This command currently lacks a description."}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
