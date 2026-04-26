import { useCrisisStore } from '../hooks/useCrisisStore'

const FLOOR_CONFIGS = [
  { floor: 3, y: 30,  rooms: ['301','302','303','304','305','306','307','308'] },
  { floor: 2, y: 155, rooms: ['201','202','203','204','205','206','207','208'] },
  { floor: 1, y: 280, rooms: ['101','102','103','104','105','106','107','108'] },
]

function roomFill(status: string, occupancy: string): string {
  if (status === 'danger')    return 'rgba(220,38,38,.3)'
  if (status === 'evacuated') return 'rgba(217,119,6,.2)'
  if (occupancy === 'empty')  return 'rgba(255,255,255,.03)'
  return 'rgba(37,99,235,.12)'
}
function roomStroke(status: string, occupancy: string): string {
  if (status === 'danger')    return '#dc2626'
  if (status === 'evacuated') return '#d97706'
  if (occupancy === 'empty')  return 'rgba(255,255,255,.1)'
  return 'rgba(37,99,235,.35)'
}

export function ResponderCommand() {
  const { incidents, rooms, responderUnits, addCommsMessage, setRoomStatus, setUnitStatus, resolveAll } = useCrisisStore()
  const activeIncs = incidents.filter(i => i.status === 'active')

  function handleAction(action: string) {
    const msgs: Record<string, string> = {
      evacuate: 'FULL EVACUATION ORDER issued. All guests proceed to nearest exit immediately.',
      lockdown:  'Perimeter lockdown engaged. All entry/exit points secured by security.',
      medical:   'Additional medical units requested. 2 ambulances re-dispatched.',
      allclear:  'ALL-CLEAR issued by Incident Commander. Incident resolved.',
    }
    addCommsMessage('responder', 'Incident Commander', msgs[action])
    if (action === 'evacuate') {
      Object.values(rooms).forEach(r => { if (r.status === 'danger') setRoomStatus(r.id, 'evacuated') })
    }
    if (action === 'medical') setUnitStatus(2, 'en-route', '3 min')
    if (action === 'allclear') resolveAll()
  }

  return (
    <div className="responder-view">
      {/* Tactical header */}
      <div className="responder-header">
        <span className="resp-indicator" />
        <span className="resp-title">Incident Command — Grand Meridian Hotel</span>
        <ElapsedTimer />
      </div>

      <div className="responder-body">
        {/* SVG Floorplan */}
        <div className="floorplan-area">
          <svg viewBox="0 0 440 380" className="floorplan-svg">
            <defs>
              <marker id="evac-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
              </marker>
            </defs>

            {/* Building */}
            <rect width="440" height="380" fill="#0a0f1e"/>
            <rect x="15" y="15" width="410" height="355" rx="8" fill="#0e1528" stroke="#1e2d4a" strokeWidth="1"/>

            {/* Floor dividers */}
            <line x1="15" y1="140" x2="425" y2="140" stroke="#1e2d4a" strokeWidth="0.5"/>
            <line x1="15" y1="265" x2="425" y2="265" stroke="#1e2d4a" strokeWidth="0.5"/>

            {/* Floor labels */}
            {[{label:'FLOOR 3',y:85},{label:'FLOOR 2',y:205},{label:'FLOOR 1',y:318}].map(f => (
              <text key={f.label} x="28" y={f.y} fill="rgba(255,255,255,.18)" fontSize="9" fontFamily="sans-serif">{f.label}</text>
            ))}

            {/* Rooms */}
            {FLOOR_CONFIGS.map(fc => fc.rooms.map((roomId, i) => {
              const r = rooms[roomId]
              if (!r) return null
              const x = 28 + i * 49
              const y = fc.y
              const fill = roomFill(r.status, r.occupancy)
              const stroke = roomStroke(r.status, r.occupancy)
              return (
                <g key={roomId} onClick={() => r.status === 'danger' && setRoomStatus(roomId, 'evacuated')}
                   style={{ cursor: r.status === 'danger' ? 'pointer' : 'default' }}>
                  <rect x={x} y={y} width="43" height="40" rx="4" fill={fill} stroke={stroke} strokeWidth={r.status === 'danger' ? 1.2 : 0.5}/>
                  {r.status === 'danger' && <circle cx={x+35} cy={y+7} r="4" fill="#dc2626"/>}
                  <text x={x+21} y={y+18} fill="rgba(255,255,255,.55)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">{roomId}</text>
                  <text x={x+21} y={y+31} fill={r.status==='danger'?'#fca5a5':r.status==='evacuated'?'#fcd34d':'rgba(255,255,255,.25)'}
                        fontSize="7" textAnchor="middle" fontFamily="sans-serif">
                    {r.status === 'danger' ? 'SOS' : r.status === 'evacuated' ? 'EVAC' : r.occupancy === 'empty' ? 'vacant' : 'safe'}
                  </text>
                </g>
              )
            }))}

            {/* Evacuation routes */}
            {activeIncs.length > 0 && <>
              <path d="M 28 345 L 28 370 L 15 370" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#evac-arrow)" opacity=".8"/>
              <path d="M 410 345 L 410 370 L 425 370" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#evac-arrow)" opacity=".8"/>
            </>}

            {/* Exit markers */}
            {[{x:15,cx:28},{x:395,cx:410}].map((e,i) => (
              <g key={i}>
                <rect x={e.x} y={350} width="26" height="16" rx="3" fill="rgba(5,150,105,.2)" stroke="#059669" strokeWidth="0.5"/>
                <text x={e.cx} y={361} fill="#059669" fontSize="6" textAnchor="middle" fontFamily="sans-serif">EXIT</text>
              </g>
            ))}

            {/* Scan line animation */}
            <line x1="15" y1="15" x2="425" y2="15" stroke="rgba(5,150,105,.35)" strokeWidth="0.8">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="0 370" dur="4s" repeatCount="indefinite"/>
            </line>
          </svg>
        </div>

        {/* Sidebar */}
        <div className="responder-sidebar">
          <div className="rsp-section">
            <div className="rsp-label">Active Alerts</div>
            {activeIncs.length === 0
              ? <div className="rsp-alert info">No active incidents</div>
              : activeIncs.map(inc => (
                  <div key={inc.id} className="rsp-alert danger">
                    <strong>{inc.title}</strong><br/>
                    <span className="rsp-alert-sub">{inc.location} · {inc.time}</span>
                  </div>
                ))
            }
          </div>

          <div className="rsp-section">
            <div className="rsp-label">Response Units</div>
            {responderUnits.map(u => (
              <div key={u.id} className="unit-row">
                <span className="unit-dot" style={{ background: u.color }}/>
                <div className="unit-info">
                  <div>{u.name}</div>
                  <div className="unit-detail">{u.status} · {u.eta}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rsp-section">
            <div className="rsp-label">Telemetry</div>
            <div className="telemetry-grid">
              {[
                { val: '98%',  label: 'Sensors', color: '#6ee7b7' },
                { val: activeIncs.length.toString(), label: 'Alerts', color: '#fca5a5' },
                { val: '142',  label: 'Guests',  color: '#93c5fd' },
                { val: responderUnits.filter(u=>u.status==='en-route').length.toString(), label: 'En Route', color: '#fcd34d' },
              ].map(t => (
                <div key={t.label} className="tele-card">
                  <div className="tele-val" style={{ color: t.color }}>{t.val}</div>
                  <div className="tele-label">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rsp-section">
            <div className="rsp-label">Commander Actions</div>
            {[
              { id: 'evacuate', label: 'Full Evacuation Order', color: 'danger' },
              { id: 'lockdown', label: 'Lockdown Perimeter',    color: 'warn'   },
              { id: 'medical',  label: 'Request Medical Units', color: 'info'   },
              { id: 'allclear', label: 'Issue All-Clear',       color: 'safe'   },
            ].map(a => (
              <button key={a.id} className={`rsp-action-btn ${a.color}`} onClick={() => handleAction(a.id)}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ElapsedTimer() {
  const { crisisActive } = useCrisisStore()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!crisisActive) { setElapsed(0); return }
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [crisisActive])

  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return (
    <span className="elapsed-timer">
      {crisisActive ? `${m}:${s < 10 ? '0' : ''}${s} elapsed` : 'Monitoring'}
    </span>
  )
}

import { useState, useEffect } from 'react'
