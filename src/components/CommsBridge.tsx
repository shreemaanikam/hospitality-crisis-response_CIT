import { useState } from 'react'
import { useCrisisStore } from '../hooks/useCrisisStore'
import type { SenderRole } from '../types'

const ROLE_STYLE: Record<SenderRole, { bg: string; color: string; border: string }> = {
  guest:    { bg: 'rgba(124,58,237,.08)',  color: '#7c3aed', border: 'rgba(124,58,237,.2)' },
  staff:    { bg: 'rgba(37,99,235,.06)',   color: '#2563eb', border: 'rgba(37,99,235,.15)' },
  responder:{ bg: 'rgba(220,38,38,.06)',   color: '#dc2626', border: 'rgba(220,38,38,.15)' },
  ai:       { bg: 'rgba(5,150,105,.06)',   color: '#059669', border: 'rgba(5,150,105,.15)' },
  system:   { bg: 'rgba(100,116,139,.06)', color: '#64748b', border: 'rgba(100,116,139,.15)' },
}

export function CommsBridge() {
  const { commsLog, addCommsMessage, simulateCrisis, resolveAll } = useCrisisStore()
  const [input, setInput]   = useState('')
  const [sender, setSender] = useState<SenderRole>('staff')

  function handleSend() {
    if (!input.trim()) return
    const names: Record<SenderRole, string> = {
      staff: 'Staff Officer', responder: 'Incident Commander', ai: 'Cortex AI',
      guest: 'Guest', system: 'System',
    }
    addCommsMessage(sender, names[sender], input.trim())
    setInput('')
  }

  return (
    <div className="bridge-view">
      {/* Header */}
      <div className="bridge-header">
        <span className="bridge-live-dot" />
        <span className="bridge-title">Unified Communications Bridge</span>
        <span className="bridge-sub">All channels synchronized in real time</span>
        <div className="bridge-actions">
          <button className="bridge-btn danger" onClick={simulateCrisis}>Simulate Crisis</button>
          <button className="bridge-btn safe"   onClick={resolveAll}>Resolve All</button>
        </div>
      </div>

      {/* Legend */}
      <div className="bridge-legend">
        {(Object.keys(ROLE_STYLE) as SenderRole[]).filter(r => r !== 'system').map(r => (
          <span key={r} className="legend-chip" style={{ color: ROLE_STYLE[r].color, background: ROLE_STYLE[r].bg, border: `0.5px solid ${ROLE_STYLE[r].border}` }}>
            {r.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div className="bridge-messages">
        {commsLog.length === 0 && (
          <div className="empty-state" style={{ margin: '40px auto' }}>No messages yet. Simulate a crisis or send a broadcast.</div>
        )}
        {commsLog.slice(0, 40).map(m => {
          const style = ROLE_STYLE[m.role] ?? ROLE_STYLE.system
          return (
            <div key={m.id} className="bridge-msg" style={{ background: style.bg, border: `0.5px solid ${style.border}` }}>
              <span className="bridge-role-chip" style={{ background: style.bg, color: style.color, border: `0.5px solid ${style.border}` }}>
                {m.role.toUpperCase()}
              </span>
              <span className="bridge-msg-body">
                <strong>{m.sender}: </strong>{m.message}
              </span>
              <span className="bridge-msg-time">{m.time}</span>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="bridge-input-row">
        <select value={sender} onChange={e => setSender(e.target.value as SenderRole)} className="bridge-select">
          <option value="staff">Staff</option>
          <option value="responder">Responder</option>
          <option value="ai">AI System</option>
        </select>
        <input
          className="bridge-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Broadcast message to all channels..."
        />
        <button className="bridge-send-btn" onClick={handleSend}>Broadcast</button>
      </div>
    </div>
  )
}
