import { useState, useEffect } from 'react'
import { GuestView } from './components/GuestView'
import { StaffDashboard } from './components/StaffDashboard'
import { ResponderCommand } from './components/ResponderCommand'
import { CommsBridge } from './components/CommsBridge'
import { TopBar } from './components/TopBar'
import { StatusBar } from './components/StatusBar'
import { useCrisisStore } from './hooks/useCrisisStore'
import type { Role } from './types'
import './styles/globals.css'

export default function App() {
  const [activeRole, setActiveRole] = useState<Role>('guest')
  const { crisisActive, incidents } = useCrisisStore()

  // Vibrate on new critical incident (mobile)
  useEffect(() => {
    const critical = incidents.filter(i => i.severity === 'critical' && i.status === 'active')
    if (critical.length > 0 && navigator.vibrate) {
      navigator.vibrate([400, 200, 400])
    }
  }, [incidents])

  return (
    <div className={`app-shell ${crisisActive ? 'crisis-mode' : ''}`}>
      <TopBar activeRole={activeRole} onRoleSwitch={setActiveRole} />
      <main className="app-body">
        {activeRole === 'guest' && <GuestView />}
        {activeRole === 'staff' && <StaffDashboard />}
        {activeRole === 'responder' && <ResponderCommand />}
        {activeRole === 'bridge' && <CommsBridge />}
      </main>
      <StatusBar />
    </div>
  )
}
