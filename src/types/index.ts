// Role types
export type Role = 'guest' | 'staff' | 'responder' | 'bridge'

// Incident severity and status
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type IncidentStatus = 'active' | 'responding' | 'resolved'
export type IncidentType = 'Fire' | 'Medical' | 'Security' | 'Evacuation' | 'Hazard' | 'Power' | 'SOS'

// Room status
export type RoomStatus = 'safe' | 'danger' | 'evacuated' | 'empty'

// Staff status
export type StaffStatus = 'active' | 'responding' | 'standby' | 'off-duty'

// Responder unit status
export type UnitStatus = 'standby' | 'en-route' | 'on-scene' | 'notified'

// Comms message sender role
export type SenderRole = 'guest' | 'staff' | 'responder' | 'ai' | 'system'

// ---- Entities ----

export interface Incident {
  id: number
  type: IncidentType
  title: string
  location: string
  severity: Severity
  status: IncidentStatus
  detail: string
  time: string
  timestamp: number
  aiAnalysis: string
  affectedRooms?: string[]
}

export interface Room {
  id: string
  floor: number
  status: RoomStatus
  occupancy: 'occupied' | 'empty'
  lastUpdate?: string
}

export interface StaffMember {
  id: number
  name: string
  role: string
  location: string
  status: StaffStatus
  color: string
  initials: string
}

export interface ResponderUnit {
  id: number
  name: string
  type: 'fire' | 'medical' | 'police'
  status: UnitStatus
  eta: string
  color: string
}

export interface CommsMessage {
  id: number
  role: SenderRole
  sender: string
  message: string
  time: string
  timestamp: number
}

export interface CrisisState {
  // Data
  incidents: Incident[]
  rooms: Record<string, Room>
  staff: StaffMember[]
  responderUnits: ResponderUnit[]
  commsLog: CommsMessage[]

  // Status
  crisisActive: boolean
  selectedIncidentId: number | null

  // Actions
  addIncident: (type: IncidentType, title: string, location: string, severity: Severity, detail?: string) => void
  addCommsMessage: (role: SenderRole, sender: string, message: string) => void
  setRoomStatus: (roomId: string, status: RoomStatus) => void
  setStaffStatus: (staffId: number, status: StaffStatus, location?: string) => void
  setUnitStatus: (unitId: number, status: UnitStatus, eta?: string) => void
  resolveIncident: (incidentId: number) => void
  selectIncident: (id: number | null) => void
  simulateCrisis: () => void
  resolveAll: () => void
}
