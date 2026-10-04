"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Terminal, Workflow, Users, BarChart3, Settings } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Anti-Nuke & Security",
      description: "Instantly detect and block mass-banning, channel deletions, and unauthorized role changes.",
      icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
      color: "from-red-500/20 to-orange-500/5",
      border: "border-red-500/20"
    },
    {
      title: "Join Gates",
      description: "Force new members to verify through CAPTCHA or read rules before getting access to the server.",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      color: "from-blue-500/20 to-cyan-500/5",
      border: "border-blue-500/20"
    },
    {
      title: "Advanced Logging",
      description: "Keep a permanent, tamper-proof record of every deleted message, kick, ban, and voice channel join.",
      icon: <Terminal className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-500/20 to-green-500/5",
      border: "border-emerald-500/20"
    },
    {
      title: "Custom Commands",
      description: "Build your own commands, auto-responders, and welcome messages directly from the dashboard.",
      icon: <Settings className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-fuchsia-500/5",
      border: "border-purple-500/20"
    },
    {
      title: "Automated Moderation",
      description: "Automatically mute, kick, or ban users who spam, post bad links, or trigger forbidden keywords.",
      icon: <Workflow className="w-8 h-8 text-yellow-400" />,
      color: "from-yellow-500/20 to-amber-500/5",
      border: "border-yellow-500/20"
    },
    {
      title: "Server Analytics",
      description: "Track your server's growth, message activity, and voice hours with beautiful charts and stats.",
      icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
      color: "from-indigo-500/20 to-blue-500/5",
      border: "border-indigo-500/20"
    }
  ];

  return (
    <section id="features" className="py-24 bg-black relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Nothing you don't.
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Pleed was built from the ground up to handle massive servers without lagging, crashing, or charging you premium fees for basic features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`bg-gradient-to-br ${feature.color} border ${feature.border} rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <div className="mb-6 relative z-10">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
