import { useCrisisStore } from '../hooks/useCrisisStore'

interface Props { incidentId: number }

export function IncidentDetail({ incidentId }: Props) {
  const {
    incidents, rooms, commsLog,
    resolveIncident, addCommsMessage,
    setStaffStatus, setRoomStatus,
  } = useCrisisStore()

  const inc = incidents.find(i => i.id === incidentId)
  if (!inc) return null
  const incident = inc

  const floor = incident.location.match(/\d/)?.[0] || '2'
  const floorRooms = Object.values(rooms).filter(r => r.floor === parseInt(floor))
  const recentComms = commsLog.slice(0, 8)

  function handleAction(action: string) {
    const messages: Record<string, string> = {
      dispatch:  `Staff dispatched to ${incident.location}. Arjun M. and Suresh L. responding.`,
      evacuate:  `Floor ${floor} evacuation initiated. All guests notified via in-room system.`,
      services:  'Emergency services auto-dialled. Fire Brigade ETA: 4 min. Ambulance ETA: 7 min.',
      resolve:   `Incident at ${incident.location} resolved. Area cleared and secured.`,
    }
    addCommsMessage('staff', 'Staff Officer', messages[action] ?? 'Action taken.')
    if (action === 'dispatch') {
      setStaffStatus(1, 'responding', incident.location)
      setStaffStatus(5, 'responding', incident.location)
    }
    if (action === 'evacuate') {
      floorRooms.forEach(r => { if (r.status === 'danger') setRoomStatus(r.id, 'evacuated') })
    }
    if (action === 'resolve') {
      resolveIncident(incidentId)
    }
  }

  const statusColor: Record<string, string> = { active: '#dc2626', responding: '#d97706', resolved: '#059669' }
  const sevColor: Record<string, string> = { critical: '#dc2626', high: '#d97706', medium: '#2563eb' }

  return (
    <div className="incident-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">{inc.title}</div>
        <div className="detail-meta">
          <span>{inc.time}</span>
          <span>{inc.location}</span>
          <span className="severity-badge" style={{ background: sevColor[inc.severity] + '18', color: sevColor[inc.severity] }}>{inc.severity.toUpperCase()}</span>
          <span className="severity-badge" style={{ background: statusColor[inc.status] + '18', color: statusColor[inc.status] }}>{inc.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Mini floor map */}
      <div className="detail-section-title">Floor {floor} Room Status</div>
      <div className="mini-floor-map">
        {floorRooms.map(r => (
          <div
            key={r.id}
            className={`mini-room ${r.status}`}
          >{r.id}</div>
        ))}
      </div>

      {/* AI Analysis */}
      <div className="ai-analysis-box">
        <div className="ai-analysis-title">✦ Cortex AI Analysis</div>
        <div className="ai-analysis-body">{inc.aiAnalysis}</div>
      </div>

      {/* Comms log */}
      <div className="detail-section-title">Recent Communications</div>
      <div className="comms-log">
        {recentComms.map(m => (
          <div key={m.id} className="comms-entry">
            <span
              className="comms-dot"
              style={{ background: m.role === 'guest' ? '#7c3aed' : m.role === 'responder' ? '#dc2626' : m.role === 'ai' ? '#059669' : '#2563eb' }}
            />
            <span className="comms-text"><strong>{m.sender}</strong>: {m.message}</span>
            <span className="comms-time">{m.time}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="action-row">
        <button className="action-btn primary" onClick={() => handleAction('dispatch')}>Dispatch Staff</button>
        <button className="action-btn danger"  onClick={() => handleAction('evacuate')}>Evacuate Floor</button>
        <button className="action-btn neutral" onClick={() => handleAction('services')}>Alert Services</button>
        <button className="action-btn safe"    onClick={() => handleAction('resolve')}>Mark Resolved</button>
      </div>
    </div>
  )
}
