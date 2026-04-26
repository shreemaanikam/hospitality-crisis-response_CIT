import { useCrisisStore } from '../hooks/useCrisisStore'

export function StatusBar() {
  const { crisisActive, incidents, staff } = useCrisisStore()
  const activeAlerts = incidents.filter(i => i.status === 'active').length
  const responding = staff.filter(s => s.status === 'responding').length

  return (
    <footer className="statusbar">
      <span className="status-indicator">
        <span
          className="status-led"
          style={{ background: crisisActive ? '#dc2626' : '#059669' }}
        />
        {crisisActive ? 'Crisis Mode Active' : 'System Nominal'}
      </span>
      <span className="statusbar-divider">•</span>
      <span>
        36 rooms monitored · {activeAlerts} active alert{activeAlerts !== 1 ? 's' : ''} · {responding} staff responding
      </span>
      <span className="statusbar-right">
        Cortex Sentinel v2 · Google Solution Challenge 2025
      </span>
    </footer>
  )
}
