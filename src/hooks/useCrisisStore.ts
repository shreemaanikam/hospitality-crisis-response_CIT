import { create } from 'zustand'
import type {
  CrisisState, Incident, Room, StaffMember, ResponderUnit, CommsMessage,
  IncidentType, Severity, RoomStatus, StaffStatus, UnitStatus, SenderRole
} from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────
let _msgId = 1
let _incId = 1

function now(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function aiAnalysis(type: IncidentType, location: string, severity: Severity): string {
  const map: Partial<Record<IncidentType, string>> = {
    Fire:      `AI Detection: Smoke sensor correlation + SOS pattern confirms probable fire at ${location}. Confidence: 94%. Auto-notifying fire brigade. Nearest exit: Stairwell B.`,
    Medical:   `AI Triage: Medical emergency at ${location}. Dispatching nearest trained first-aider. Ambulance auto-notified. Do not move patient if fall-related.`,
    Security:  `AI Threat Assessment: Anomalous access detected at ${location}. Cross-referencing CCTV. Police notification queued pending staff confirmation.`,
    Evacuation:`AI Routing: Optimal evacuation path computed. Stairwells B & C clear. Elevator lockout engaged. Assembly point: East Lawn.`,
    SOS:       `AI: SOS received from ${location}. Location pinned. Staff dispatched. Guest instructed to stay low and signal from window if smoke present.`,
  }
  return map[type] ?? `AI: ${severity.toUpperCase()} incident at ${location}. Auto-response protocol initiated.`
}

// ── initial data ──────────────────────────────────────────────────────────────
function buildRooms(): Record<string, Room> {
  const rooms: Record<string, Room> = {}
  const emptyRooms = new Set(['103', '207', '305', '108', '204'])
  ;[3, 2, 1].forEach(floor => {
    for (let n = 1; n <= 8; n++) {
      const id = `${floor}0${n}`
      rooms[id] = { id, floor, status: 'safe', occupancy: emptyRooms.has(id) ? 'empty' : 'occupied' }
    }
  })
  return rooms
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 1, name: 'Arjun M.',  role: 'Security Chief',  location: 'Lobby',     status: 'active',   color: '#3B8BD4', initials: 'AM' },
  { id: 2, name: 'Priya S.',  role: 'Housekeeping',    location: 'Floor 2',   status: 'active',   color: '#1D9E75', initials: 'PS' },
  { id: 3, name: 'Rajan K.',  role: 'Maintenance',     location: 'Basement',  status: 'standby',  color: '#BA7517', initials: 'RK' },
  { id: 4, name: 'Meera T.',  role: 'Front Desk',      location: 'Lobby',     status: 'active',   color: '#D4537E', initials: 'MT' },
  { id: 5, name: 'Suresh L.', role: 'Fire Warden',     location: 'Floor 1',   status: 'standby',  color: '#E24B4A', initials: 'SL' },
  { id: 6, name: 'Anitha R.', role: 'Hotel Manager',   location: 'Office',    status: 'active',   color: '#7F77DD', initials: 'AR' },
]

const INITIAL_UNITS: ResponderUnit[] = [
  { id: 1, name: 'Fire Unit Alpha', type: 'fire',    status: 'standby',  eta: '4 min',  color: '#ef4444' },
  { id: 2, name: 'Medical Team 1',  type: 'medical', status: 'standby',  eta: '7 min',  color: '#3b82f6' },
  { id: 3, name: 'Police Unit 2',   type: 'police',  status: 'notified', eta: '8 min',  color: '#8b5cf6' },
]

// ── store ─────────────────────────────────────────────────────────────────────
export const useCrisisStore = create<CrisisState>((set, get) => ({
  incidents: [],
  rooms: buildRooms(),
  staff: INITIAL_STAFF,
  responderUnits: INITIAL_UNITS,
  commsLog: [],
  crisisActive: false,
  selectedIncidentId: null,

  addIncident(type, title, location, severity, detail = '') {
    const incident: Incident = {
      id: _incId++,
      type, title, location, severity, detail,
      status: 'active',
      time: now(),
      timestamp: Date.now(),
      aiAnalysis: aiAnalysis(type, location, severity),
    }
    set(s => ({
      incidents: [incident, ...s.incidents],
      crisisActive: true,
    }))
    // Auto AI response in comms bridge
    setTimeout(() => {
      get().addCommsMessage('ai', 'Cortex AI', incident.aiAnalysis)
    }, 500)
  },

  addCommsMessage(role: SenderRole, sender: string, message: string) {
    const msg: CommsMessage = {
      id: _msgId++,
      role, sender, message,
      time: now(),
      timestamp: Date.now(),
    }
    set(s => ({ commsLog: [msg, ...s.commsLog].slice(0, 100) }))
  },

  setRoomStatus(roomId, status) {
    set(s => ({
      rooms: { ...s.rooms, [roomId]: { ...s.rooms[roomId], status, lastUpdate: now() } }
    }))
  },

  setStaffStatus(staffId, status, location) {
    set(s => ({
      staff: s.staff.map(m =>
        m.id === staffId ? { ...m, status, ...(location ? { location } : {}) } : m
      )
    }))
  },

  setUnitStatus(unitId, status, eta) {
    set(s => ({
      responderUnits: s.responderUnits.map(u =>
        u.id === unitId ? { ...u, status, ...(eta ? { eta } : {}) } : u
      )
    }))
  },

  resolveIncident(incidentId) {
    set(s => ({
      incidents: s.incidents.map(i => i.id === incidentId ? { ...i, status: 'resolved' } : i),
    }))
    const remaining = get().incidents.filter(i => i.status === 'active')
    set({ crisisActive: remaining.length > 0 })
  },

  selectIncident(id) {
    set({ selectedIncidentId: id })
  },

  simulateCrisis() {
    const { addIncident, addCommsMessage, setRoomStatus, setStaffStatus, setUnitStatus } = get()

    // Trigger rooms
    setRoomStatus('203', 'danger')
    setRoomStatus('205', 'danger')
    setRoomStatus('207', 'danger')

    addIncident(
      'Fire',
      'Fire Alarm — Floor 2 Smoke Sensors Triggered',
      'Floor 2 · Rooms 203, 205, 207',
      'critical',
      'Three simultaneous smoke detectors triggered. AI pattern: electrical fire origin Room 205. Suppression system armed.'
    )

    addCommsMessage('ai', 'Cortex AI — Auto Detection',
      'CRITICAL: Smoke sensors triggered in Rooms 203, 205, 207. Pattern: electrical fire, Room 205 origin. Auto-alerting fire brigade. Floor 2 evacuation protocol initiated.')

    setTimeout(() => addCommsMessage('guest', 'Guest · Room 203',
      'There is smoke coming under my door! What do I do?'), 800)

    setTimeout(() => addCommsMessage('ai', 'Cortex AI',
      'Room 203 guest: DO NOT open door. Seal gap with towel. Move to window and signal. Staff are 60 seconds away.'), 1600)

    setTimeout(() => addCommsMessage('staff', 'Suresh L. (Fire Warden)',
      'Floor 2 evacuation underway. Stairwells B and C confirmed clear. Fire brigade ETA 4 min.'), 2400)

    setTimeout(() => addCommsMessage('responder', 'Fire Unit Alpha',
      'En route. ETA 4 minutes. Requesting floor plan and fire origin coordinates.'), 3200)

    setTimeout(() => addCommsMessage('ai', 'Cortex AI',
      'Floor plan and room coordinates transmitted to Fire Unit Alpha. Sprinkler system armed at Room 205 zone.'), 3900)

    // Dispatch staff
    setStaffStatus(1, 'responding', 'Floor 2')
    setStaffStatus(5, 'responding', 'Floor 2')

    // Move responder unit
    setUnitStatus(1, 'en-route', '4 min')
  },

  resolveAll() {
    const { rooms, addCommsMessage } = get()
    const updatedRooms = Object.fromEntries(
      Object.entries(rooms).map(([id, r]) => [
        id,
        r.status === 'danger' ? { ...r, status: 'safe' as RoomStatus } : r,
      ])
    )
    set(s => ({
      rooms: updatedRooms,
      incidents: s.incidents.map(i => ({ ...i, status: 'resolved' })),
      staff: s.staff.map(m => ({ ...m, status: 'active' as StaffStatus })),
      responderUnits: s.responderUnits.map(u => ({ ...u, status: 'standby' as UnitStatus })),
      crisisActive: false,
    }))
    addCommsMessage('ai', 'Cortex Sentinel', 'ALL-CLEAR: All incidents resolved. Systems returning to normal monitoring.')
  },
}))
