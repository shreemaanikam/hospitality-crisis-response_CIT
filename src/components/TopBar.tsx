import { useCrisisStore } from '../hooks/useCrisisStore'
import type { Role } from '../types'

interface Props {
  activeRole: Role
  onRoleSwitch: (role: Role) => void
}

const ROLES: { id: Role; label: string; color: string }[] = [
  { id: 'guest',     label: 'Guest',             color: '#7c3aed' },
  { id: 'staff',     label: 'Staff Dashboard',   color: '#2563eb' },
  { id: 'responder', label: 'Responder Command', color: '#dc2626' },
  { id: 'bridge',    label: 'Comms Bridge',      color: '#059669' },
]

export function TopBar({ activeRole, onRoleSwitch }: Props) {
  const { crisisActive } = useCrisisStore()

  return (
    <header className="topbar">
      <div className="logo">
        Cortex <span style={{ color: '#dc2626' }}>Sentinel</span>
      </div>

      <nav className="role-nav">
        {ROLES.map(r => (
          <button
            key={r.id}
            className={`role-btn ${activeRole === r.id ? 'active' : ''}`}
            style={activeRole === r.id ? { background: r.color, borderColor: r.color } : {}}
            onClick={() => onRoleSwitch(r.id)}
          >
            {r.label}
          </button>
        ))}
      </nav>

      {crisisActive && (
        <div className="crisis-badge">EMERGENCY ACTIVE</div>
      )}

      <Clock />
    </header>
  )
}

function Clock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="time-chip">{time}</span>
}

// React imports needed
import { useState, useEffect } from 'react'
