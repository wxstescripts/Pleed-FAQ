"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen flex flex-col justify-center">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 blur-[120px] transform-gpu will-change-transform" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-purple-300 bg-purple-900/30 border border-purple-500/30 mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2 text-purple-400" />
            <span className="tracking-wide">Introducing Pleed 2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Ultimate <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Discord Management
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Protect, automate, and scale your Discord community with industry-leading moderation, join gates, and a powerful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/invite"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]"
            >
              Add to Discord
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-sm"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-10 text-left"
        >
          <div className="flex flex-col items-center md:items-start">
            <div className="p-3 bg-purple-500/10 rounded-xl mb-4 border border-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Advanced Security</h3>
            <p className="text-gray-400 text-sm">Anti-nuke protection and custom join gates to keep out the bots.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="p-3 bg-indigo-500/10 rounded-xl mb-4 border border-indigo-500/20">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Written in Python and SQLite, Pleed runs without missing a heartbeat.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl mb-4 border border-blue-500/20">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Web Dashboard</h3>
            <p className="text-gray-400 text-sm">Manage everything directly from an intuitive online dashboard.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
