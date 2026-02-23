'use client'

import { useAuthStore } from '@/store/authStore'
import DashboardFreePage from './dashboard-free'
import DashboardActivePage from './dashboard-active'

export default function DashboardPage() {
  const { hasActivePlan } = useAuthStore()

  if (!hasActivePlan()) {
    return <DashboardFreePage />
  }

  return <DashboardActivePage />
}
