import Link from "next/link";
import { LayoutDashboard, Shield, Users, Terminal, Settings, LogOut, Search, Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              P
            </div>
            <span className="text-xl font-bold tracking-wide">Pleed</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</p>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-white/5 text-white rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            Overview
          </Link>
          <Link href="/dashboard/security" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Shield className="w-5 h-5 text-red-400" />
            Security & Anti-Nuke
          </Link>
          <Link href="/dashboard/joingates" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-blue-400" />
            Join Gates
          </Link>
          <Link href="/dashboard/commands" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Custom Commands
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        {/* Topbar */}
        <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-96">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search settings..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Heckz</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                H
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
