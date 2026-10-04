"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LayoutDashboard, Shield, Users, Terminal, Settings, LogOut, Search, Bell, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading session...</div>;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mb-8 shadow-[0_0_30px_rgba(79,70,229,0.5)]">P</div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Pleed</h1>
        <p className="text-gray-400 mb-8 max-w-md text-center">Login with your Discord account to manage your servers, security, and join gates.</p>
        <button onClick={() => signIn("discord")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20">
          Login with Discord
        </button>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            P
          </div>
          <span className="text-xl font-bold tracking-wide">Pleed</span>
        </Link>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</p>
        <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-white/5 text-white rounded-lg transition-colors">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          Overview
        </Link>
        <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard/security" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Shield className="w-5 h-5 text-red-400" />
          Security & Anti-Nuke
        </Link>
        <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard/joingates" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Users className="w-5 h-5 text-blue-400" />
          Join Gates
        </Link>
        <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard/commands" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Custom Commands
        </Link>
        <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={() => signOut()} className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] hidden md:flex flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 md:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 lg:w-96">
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search settings..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-gray-400 hover:text-white relative hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 overflow-hidden flex items-center justify-center font-bold text-sm sm:text-base">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (session.user?.name || "U").charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
