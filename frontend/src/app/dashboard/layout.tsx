'use client'

import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Radio, BarChart2, Users, FileText, LogOut, Lock } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, freeAccess: true },
  { href: '/dashboard/live', label: 'Ao Vivo', icon: Radio, freeAccess: true },
  { href: '/dashboard/trades', label: 'Operações', icon: BarChart2, freeAccess: false },
  { href: '/dashboard/accounts', label: 'Contas MT5', icon: Users, freeAccess: false },
  { href: '/dashboard/logs', label: 'Logs', icon: FileText, freeAccess: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasActivePlan } = useAuthStore()
  const active = hasActivePlan()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col py-8 px-4 shrink-0" style={{ background: 'rgba(255,255,255,0.02)' }}>

        {/* Logo */}
        <div className="px-3 mb-10">
          <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">projeKt</p>
          <h1 style={{ fontFamily: "'Montreal Bold', sans-serif" }} className="text-xl text-white">Rage</h1>
        </div>

        {/* Status plano */}
        <div className="px-3 mb-6">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${
            active
              ? 'border-white/20 text-white/60'
              : 'border-white/10 text-gray-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/60' : 'bg-gray-700'}`} />
            {active ? (user?.plan?.toUpperCase() ?? 'ATIVO') : 'SEM PLANO'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(item => {
            const locked = !active && !item.freeAccess
            const isCurrent = pathname === item.href

            if (locked) {
              return (
                <div key={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 cursor-not-allowed select-none">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm flex-1">{item.label}</span>
                  <Lock className="w-3 h-3" />
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isCurrent
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                  {item.href === '/dashboard/live' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-xs text-white truncate">{user?.name ?? 'Usuário'}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email ?? ''}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-white hover:bg-white/5 transition w-full">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
