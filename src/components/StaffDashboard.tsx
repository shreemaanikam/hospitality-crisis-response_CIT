import { useCrisisStore } from '../hooks/useCrisisStore'
import { IncidentDetail } from './IncidentDetail'
import type { Incident } from '../types'

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#2563eb',
  low: '#059669',
}

export function StaffDashboard() {
  const { incidents, staff, selectedIncidentId, selectIncident } = useCrisisStore()
  const activeAlerts = incidents.filter(i => i.status === 'active').length
  const responding = staff.filter(s => s.status === 'responding').length

  return (
    <div className="staff-view">
      {/* Metric Strip */}
      <div className="metric-strip">
        {[
          { label: 'Active Alerts',   value: activeAlerts,                           color: '#dc2626' },
          { label: 'Affected Rooms',  value: activeAlerts * 2,                       color: '#d97706' },
          { label: 'Guests at Risk',  value: activeAlerts * 3,                       color: '#d97706' },
          { label: 'Staff Responding',value: responding,                             color: '#059669' },
          { label: 'Services ETA',    value: activeAlerts > 0 ? '4 min' : '—',      color: '#2563eb' },
        ].map(m => (
          <div key={m.label} className="metric-tile">
            <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="staff-columns">
        {/* Left: incidents + staff list */}
        <div className="staff-left-col">
          <div className="col-section-title">Live Incidents</div>
          <div className="incident-list">
            {incidents.length === 0 && (
              <div className="empty-state">No incidents reported</div>
            )}
            {incidents.slice(0, 10).map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                selected={selectedIncidentId === inc.id}
                onClick={() => selectIncident(inc.id)}
              />
            ))}
          </div>

          <div className="col-section-title" style={{ marginTop: 4 }}>On-Duty Staff</div>
          <div className="staff-list">
            {staff.map(s => (
              <div key={s.id} className="staff-row">
                <div className="staff-avatar" style={{ background: s.color + '22', color: s.color }}>{s.initials}</div>
                <div className="staff-info">
                  <div className="staff-name">{s.name}</div>
                  <div className="staff-detail">{s.role} · {s.location}</div>
                </div>
                <div
                  className="staff-badge"
                  style={{
                    background: s.status === 'responding' ? 'rgba(220,38,38,.1)' : s.status === 'active' ? 'rgba(5,150,105,.1)' : 'rgba(37,99,235,.1)',
                    color: s.status === 'responding' ? '#dc2626' : s.status === 'active' ? '#059669' : '#2563eb',
                  }}
                >{s.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: incident detail */}
        <div className="staff-right-col">
          {selectedIncidentId
            ? <IncidentDetail incidentId={selectedIncidentId} />
            : <div className="empty-state" style={{ marginTop: 60 }}>Select an incident to view details and take action</div>
          }
        </div>
      </div>
    </div>
  )
}

function IncidentCard({ incident, selected, onClick }: { incident: Incident; selected: boolean; onClick: () => void }) {
  return (
    <div
      className={`incident-card ${selected ? 'selected' : ''}`}
      style={{ borderLeftColor: SEVERITY_COLOR[incident.severity] }}
      onClick={onClick}
    >
      <div className="inc-card-header">
        <span className="inc-card-title">{incident.title}</span>
        <span className="inc-card-time">{incident.time}</span>
      </div>
      <div className="inc-card-loc">{incident.location}</div>
      <span
        className="severity-badge"
        style={{ background: SEVERITY_COLOR[incident.severity] + '18', color: SEVERITY_COLOR[incident.severity] }}
      >{incident.severity.toUpperCase()} · {incident.status}</span>
    </div>
  )
}
