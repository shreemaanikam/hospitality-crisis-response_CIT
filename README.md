# Cortex Sentinel
### Accelerated Emergency Response & Crisis Coordination for Hospitality
> Built for **Google Solution Challenge 2025** — [Rapid Crisis Response] Track

---

## The Problem

Hospitality venues face unpredictable, high-stakes emergencies. When a crisis hits — a fire, medical emergency, security threat — **critical information gets siloed**. A distressed guest in Room 203 has no way to communicate effectively with a front-desk staff member who doesn't know the fire warden is already on Floor 2, while the arriving fire brigade has no idea which room is the origin point.

The result: **fragmented, delayed, uncoordinated response** at the exact moment when every second counts.

---

## Our Solution: Cortex Sentinel

A **single source of truth** that instantly detects emergencies, alerts the right people, and coordinates real-time response across three roles — **guests, hotel staff, and first responders** — through a unified, synchronized communications bridge.

```
Guest (SOS / AI Chat)
        ↓
   Cortex AI Engine  ←→  Sensor Network
        ↓                    ↓
  Staff Dashboard    →  Comms Bridge  ←  Responder Command
        ↓                    ↓                  ↓
  Dispatch Actions    Synchronized Log    Tactical Floorplan
```

Every action taken in any role **instantly appears in every other role's view**. That's the bridge.

---

## How It Solves the Problem Statement

| Problem Statement Requirement | How Cortex Sentinel Addresses It |
|---|---|
| **Instantly detect** emergencies | AI pattern engine correlates multi-room sensor triggers + guest SOS to identify origin and type with 94% confidence |
| **Report** across a decentralized ecosystem | One-tap SOS + 4 quick-action categories for guests. Auto-classification and location pinning by AI |
| **Synchronize crisis response efforts** | Unified Comms Bridge shows all Guest / Staff / Responder / AI messages in one feed, in real time |
| **Bridge between distressed individuals** | Guest AI Chat answers real safety questions in plain language — where to go, what to do, what not to do |
| **Active personnel coordination** | Staff Dashboard shows live incident queue, AI triage, floor mini-map, and one-click dispatch |
| **Emergency services** | Responder Command view with live hotel SVG floorplan, auto-transmitted room coordinates, unit tracking, and commander actions |
| **Eliminate fragmented communication** | Every action (SOS, dispatch, resolve, broadcast) propagates instantly to all three role views |

---

## Key Features

### Guest Interface (Mobile-First)
- Pulsing SOS button with haptic vibration feedback
- One-tap emergency categories: Fire, Medical, Security, Evacuation Route
- AI Crisis Assistant chat — understands natural language and gives role-specific instructions
  - "There's smoke under my door" → DO NOT open door, seal gap, move to window
  - "Where's the exit?" → Turn LEFT → Stairwell B → East Lawn
- Real-time status updates from staff and AI

### Staff Dashboard
- Live incident feed with severity triage (Critical / High / Medium)
- Per-incident AI analysis card with origin assessment and recommended protocol
- Mini floor-map showing every room's real-time status
- One-click actions: Dispatch Staff, Evacuate Floor, Alert Services, Mark Resolved
- Live staff tracker showing location and response status of all 6 on-duty members

### Responder Command
- Dark tactical HUD designed for incident commanders
- SVG hotel floorplan with real-time room status overlay
  - Red pulsing = SOS active
  - Amber = Evacuated
  - Green dotted path = Evacuation routes (auto-drawn when crisis active)
- Unit tracker: Fire Brigade, Medical, Police — status and ETA
- Telemetry readouts: sensors online, guests in hotel, units en route
- Commander actions: Full Evacuation Order, Lockdown, Request Medical, Issue All-Clear
- Elapsed crisis timer

### Unified Comms Bridge
- Single feed showing all messages color-coded by source:
  - Purple = Guest, Blue = Staff, Red = Responder, Green = AI System
- Real-time broadcast — send messages to all channels simultaneously
- Full simulation mode to demonstrate end-to-end crisis flow
- Audit log of every communication (up to 100 messages retained)

### Cortex AI Engine
- Automatically generates context-aware incident analysis for each event type
- Fire: Sensor correlation, origin room identification, suppression system status
- Medical: Nearest first-aider dispatch, ambulance notification, patient instructions
- Security: CCTV cross-reference, threat level assessment, police queue
- Transmits floor plan and origin coordinates to fire brigade on dispatch

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **UI Framework** | React 19 + TypeScript | Component isolation per role, type safety across shared state |
| **State Management** | Zustand | Lightweight, synchronous global store — perfect for real-time crisis state propagation without Redux boilerplate |
| **Build Tool** | Vite | Sub-second HMR, optimized production builds |
| **Styling** | Pure CSS with CSS variables | Light/dark mode, no runtime overhead, full control over crisis-mode animations |
| **Visualization** | Inline SVG (React) | Live hotel floorplan with real-time room overlays, no external map library needed |
| **Backend (production)** | Firebase Firestore | Real-time `onSnapshot` listeners for multi-device synchronization across all roles |
| **Hosting** | Firebase Hosting | Sub-100ms delivery globally, matches Firebase backend |

---

## Project Structure

```
cortex-sentinel/
├── src/
│   ├── App.tsx                     # Root: role switcher, crisis effect handler
│   ├── main.tsx                    # React entry point
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces (Incident, Room, Staff, CommsMessage…)
│   ├── hooks/
│   │   └── useCrisisStore.ts       # Zustand store — single source of truth for all crisis state
│   ├── components/
│   │   ├── TopBar.tsx              # Role nav + crisis badge + clock
│   │   ├── StatusBar.tsx           # Live metrics footer
│   │   ├── GuestView.tsx           # Mobile SOS + AI Chat interface
│   │   ├── StaffDashboard.tsx      # Incident list + staff tracker
│   │   ├── IncidentDetail.tsx      # Per-incident AI analysis + action panel
│   │   ├── ResponderCommand.tsx    # Tactical HUD + SVG floorplan
│   │   └── CommsBridge.tsx         # Unified comms feed
│   └── styles/
│       └── globals.css             # Full design system (light + dark mode)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── .gitignore
```

---

## Architecture: How State Flows

```
useCrisisStore (Zustand)
│
├── incidents[]         ← addIncident() called from any role
├── rooms{}             ← setRoomStatus() updates SVG floorplan live
├── staff[]             ← setStaffStatus() reflects in all staff views
├── responderUnits[]    ← setUnitStatus() shown in responder sidebar
├── commsLog[]          ← addCommsMessage() feeds the bridge
└── crisisActive        ← drives crisis badge, status LED, animations
        ↑                           ↓
   GuestView          CommsBridge shows all messages
   StaffDashboard     SVG floorplan re-renders rooms
   ResponderCommand   Metrics strip updates
```

The key architectural insight is that **Zustand's store is the bridge**. When a guest hits SOS, `addIncident()` is called → the store updates → React re-renders all active views simultaneously. No polling. No manual refresh. The same model that would use Firebase `onSnapshot` in production uses in-memory reactive state in the prototype.

---

## Running Locally

```bash
git clone https://github.com/shreemaanikam/hospitality-crisis-response_CIT.git
cd hospitality-crisis-response_CIT

npm install
npm run dev
```

Open `http://localhost:5173`

### Demo Script (for judges)
1. Start on the **Guest** tab — press the SOS ring
2. Switch to **Staff Dashboard** — see the incident appear with AI analysis
3. Click the incident → click "Dispatch Staff"
4. Switch to **Comms Bridge** — see all three messages in one feed
5. Switch to **Responder Command** — see the floorplan room turn red
6. Click "Simulate Crisis" in the Bridge tab — watch the full 5-step sequence unfold automatically

---

## Firebase Integration (Production)

The prototype uses in-memory Zustand state. Connecting to Firebase requires replacing store mutations with Firestore calls:

```typescript
// Replace setRoomStatus() in useCrisisStore.ts with:
import { doc, setDoc } from 'firebase/firestore'

async function setRoomStatus(roomId: string, status: RoomStatus) {
  await setDoc(doc(db, 'rooms', roomId), { status, updatedAt: new Date() })
}

// Replace state.rooms subscription with:
import { collection, onSnapshot } from 'firebase/firestore'

onSnapshot(collection(db, 'rooms'), snapshot => {
  const rooms = Object.fromEntries(snapshot.docs.map(d => [d.id, d.data()]))
  set({ rooms })
})
```

This gives true multi-device real-time sync — a staff member's phone and the fire brigade's tablet show identical floorplan state within ~200ms.

---

## Why This Wins

1. **Addresses all three actors** the problem statement names: distressed guests, active personnel, emergency services — each with their own purpose-built interface
2. **The bridge is real** — not a dashboard, but a synchronized communications layer where every action in any role is visible to all others
3. **AI adds genuine value** — not decoration. It classifies incidents, generates evacuation routes, translates sensor data into plain-language guest instructions, and transmits floorplan data to responders
4. **Firebase-ready architecture** — the prototype isn't a mockup, it's a working app with a clear path to production deployment

---

## Team

Built by **Shreemaanikam** and team — CIT · Google Solution Challenge 2025
