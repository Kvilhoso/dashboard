'use client'

import { LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

export default function DashboardHeader() {
  const { user, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="border-b border-bg-border bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="font-display font-bold text-ink-primary">ProjektRage</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-mono text-ink-primary">{user.name}</p>
              <p className="text-xs font-mono text-ink-muted">{user.email}</p>
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-bg-card rounded-lg transition flex sm:hidden"
            >
              <Menu className="w-5 h-5 text-ink-secondary" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 bg-bg-card border border-bg-border rounded-lg shadow-xl sm:hidden">
                <button
                  onClick={() => {
                    logout()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-mono text-ink-muted hover:text-bear hover:bg-bear/10 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => logout()}
            className="hidden sm:flex items-center gap-2 px-3 py-2 font-mono text-sm text-ink-muted hover:text-bear hover:bg-bear/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
