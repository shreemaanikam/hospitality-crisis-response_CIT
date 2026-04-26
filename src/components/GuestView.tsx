import { useState } from 'react'
import { useCrisisStore } from '../hooks/useCrisisStore'

const QUICK_ACTIONS = [
  { id: 'fire',     icon: '🔥', label: 'Fire / Smoke',     response: 'Fire/smoke reported. Evacuating your floor. Proceed to Stairwell B immediately. Do NOT use elevators.' },
  { id: 'medical',  icon: '🏥', label: 'Medical Help',      response: 'Medical emergency noted. Trained first-aider dispatched. ETA: 2 minutes. Stay still and keep the line open.' },
  { id: 'security', icon: '🔒', label: 'Security',          response: 'Security alert received. Officer dispatched to your location immediately. Lock your door.' },
  { id: 'evac',     icon: '🚪', label: 'Evacuation Route',  response: 'Your route: Exit Room 204 → Turn LEFT → Stairwell B → Ground floor → East Lawn assembly point.' },
]

interface ChatMsg { role: 'ai' | 'guest'; text: string }

export function GuestView() {
  const { addIncident, addCommsMessage, setRoomStatus } = useCrisisStore()
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'ai', text: 'Hello! I\'m your emergency assistant. Stay calm. Tap SOS or describe your situation below.' },
  ])
  const [input, setInput] = useState('')
  const [statusMsg, setStatusMsg] = useState('You are safe. Staff are monitoring all areas.')
  const [isCrisis, setIsCrisis] = useState(false)

  function appendMsg(role: 'ai' | 'guest', text: string) {
    setChatMsgs(prev => [...prev, { role, text }])
  }

  function triggerSOS() {
    if (navigator.vibrate) navigator.vibrate([400, 200, 400])
    setIsCrisis(true)
    setStatusMsg('SOS sent! Staff are responding. Help is on the way.')
    setRoomStatus('204', 'danger')
    addIncident('SOS', 'SOS: Guest Emergency', 'Room 204', 'critical', 'Guest pressed SOS button. Location confirmed via room sensor.')
    addCommsMessage('guest', 'Guest · Room 204', 'EMERGENCY — SOS pressed from Room 204. Please help!')
    appendMsg('ai', 'SOS received and confirmed! Staff dispatched to Room 204. Stay calm. If there is smoke, stay low and signal from your window. Help arrives in ~90 seconds.')
    setTimeout(() => addCommsMessage('staff', 'Arjun M. (Security)', 'En route to Room 204. ETA 90 seconds.'), 1500)
  }

  function handleQuickAction(action: typeof QUICK_ACTIONS[0]) {
    appendMsg('ai', action.response)
    if (action.id !== 'evac') {
      const types: Record<string, Parameters<typeof addIncident>[0]> = {
        fire: 'Fire', medical: 'Medical', security: 'Security',
      }
      addIncident(types[action.id] || 'SOS', `Guest Report: ${action.label}`, 'Room 204', action.id === 'fire' ? 'critical' : 'high')
      addCommsMessage('guest', 'Guest · Room 204', `Reported via app: ${action.label}`)
    }
  }

  function handleChat() {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    appendMsg('guest', msg)
    addCommsMessage('guest', 'Guest · Room 204', msg)

    const lower = msg.toLowerCase()
    let reply = 'Message noted and staff alerted. Please stay calm.'
    if (lower.includes('smoke') || lower.includes('fire'))
      reply = 'Do NOT open the door if it feels warm. Seal the gap with a towel. Move to your window and signal for help. Staff are coming.'
    else if (lower.includes('hurt') || lower.includes('injur') || lower.includes('pain'))
      reply = 'Medical assistance dispatched. Keep still. First-aider arrives in 2 minutes.'
    else if (lower.includes('exit') || lower.includes('escape') || lower.includes('where'))
      reply = 'Nearest exit: LEFT from Room 204 → Stairwell B (20m) → Ground floor → East Lawn assembly point.'
    else if (lower.includes('safe') || lower.includes('ok'))
      reply = 'Glad you are safe. Monitoring your floor. Staff will check in shortly.'

    setTimeout(() => {
      appendMsg('ai', reply)
      addCommsMessage('ai', 'Cortex AI', reply)
    }, 600)
  }

  return (
    <div className="guest-view">
      {/* Header */}
      <div className="guest-header">
        <div className="guest-hotel-name">Grand Meridian Hotel</div>
        <div className="guest-chips">
          <span className="loc-chip">Room 204</span>
          <span className="loc-chip connected">Connected</span>
        </div>
      </div>

      <div className="guest-body">
        {/* Status bar */}
        <div className={`guest-status-bar ${isCrisis ? 'danger' : 'safe'}`}>
          <span>{isCrisis ? '🚨' : '✔'}</span>
          <span>{statusMsg}</span>
        </div>

        {/* SOS Ring */}
        <button className={`sos-ring ${isCrisis ? 'pulsing' : ''}`} onClick={triggerSOS}>
          <span className="sos-ring-label">SOS</span>
          <span className="sos-ring-sub">Press in emergency</span>
        </button>

        {/* Quick Actions */}
        <div className="quick-actions">
          {QUICK_ACTIONS.map(a => (
            <button key={a.id} className="quick-action-btn" onClick={() => handleQuickAction(a)}>
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
            </button>
          ))}
        </div>

        {/* AI Chat */}
        <div className="guest-chat">
          <div className="chat-label">AI Crisis Assistant</div>
          <div className="chat-messages">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Describe your emergency..."
              className="chat-input"
            />
            <button className="chat-send-btn" onClick={handleChat}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
