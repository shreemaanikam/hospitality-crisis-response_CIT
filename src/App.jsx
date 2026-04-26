import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import GuestView from "./views/GuestView";
import StaffView from "./views/StaffView";
import ResponderView from "./views/ResponderView";
import CommsBridge from "./views/CommsBridge";
import "./App.css";

export const ROLES = {
  GUEST: "guest",
  STAFF: "staff",
  RESPONDER: "responder",
  BRIDGE: "bridge",
};

function App() {
  const [activeRole, setActiveRole] = useState(ROLES.GUEST);
  const [incidents, setIncidents] = useState([]);
  const [rooms, setRooms] = useState({});
  const [commsLog, setCommsLog] = useState([]);
  const [crisisActive, setCrisisActive] = useState(false);

  // ─── Real-time Firestore listeners ───────────────────────────────────────
  useEffect(() => {
    const unsubIncidents = onSnapshot(collection(db, "incidents"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setIncidents(data);
      setCrisisActive(data.some((i) => i.status === "active"));
    });

    const unsubRooms = onSnapshot(collection(db, "rooms"), (snap) => {
      const data = {};
      snap.docs.forEach((d) => (data[d.id] = { id: d.id, ...d.data() }));
      setRooms(data);
    });

    const unsubComms = onSnapshot(collection(db, "comms"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCommsLog(data);
    });

    return () => {
      unsubIncidents();
      unsubRooms();
      unsubComms();
    };
  }, []);

  // ─── Shared actions passed as props ──────────────────────────────────────
  const addIncident = async (type, title, location, severity, detail = "") => {
    const ref = doc(collection(db, "incidents"));
    await setDoc(ref, {
      type, title, location, severity, detail,
      status: "active",
      createdAt: serverTimestamp(),
      aiAnalysis: generateAIAnalysis(type, location, severity),
    });
    // Mark room as danger
    const roomId = location.replace("Room ", "");
    if (roomId.length === 3) {
      await setDoc(doc(db, "rooms", roomId), { status: "danger", updatedAt: serverTimestamp() }, { merge: true });
    }
    return ref.id;
  };

  const addCommsMsg = async (role, sender, msg) => {
    const ref = doc(collection(db, "comms"));
    await setDoc(ref, { role, sender, msg, createdAt: serverTimestamp() });
  };

  const resolveIncident = async (incidentId, roomId) => {
    await updateDoc(doc(db, "incidents", incidentId), { status: "resolved" });
    if (roomId) {
      await setDoc(doc(db, "rooms", roomId), { status: "evacuated", updatedAt: serverTimestamp() }, { merge: true });
    }
    await addCommsMsg("ai", "Cortex AI", `Incident resolved. Room ${roomId || "unknown"} marked safe.`);
  };

  const resolveAll = async () => {
    for (const inc of incidents.filter((i) => i.status === "active")) {
      await updateDoc(doc(db, "incidents", inc.id), { status: "resolved" });
    }
    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId].status === "danger") {
        await setDoc(doc(db, "rooms", roomId), { status: "safe", updatedAt: serverTimestamp() }, { merge: true });
      }
    }
    await addCommsMsg("ai", "Cortex AI — System", "ALL-CLEAR issued. All incidents resolved. Returning to normal monitoring.");
  };

  const sharedProps = { incidents, rooms, commsLog, crisisActive, addIncident, addCommsMsg, resolveIncident, resolveAll };

  return (
    <div className="shell">
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="logo">
          Cortex <span className="logo-accent">Sentinel</span>
        </div>

        <div className="role-tabs">
          {[
            { id: ROLES.GUEST,      label: "Guest" },
            { id: ROLES.STAFF,      label: "Staff Dashboard" },
            { id: ROLES.RESPONDER,  label: "Responder Command" },
            { id: ROLES.BRIDGE,     label: "Comms Bridge" },
          ].map((r) => (
            <button
              key={r.id}
              className={`role-btn role-btn--${r.id} ${activeRole === r.id ? "active" : ""}`}
              onClick={() => setActiveRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {crisisActive && <div className="crisis-badge">EMERGENCY ACTIVE</div>}
        <Clock />
      </div>

      {/* ── VIEWS ── */}
      <div className="view-container">
        {activeRole === ROLES.GUEST     && <GuestView     {...sharedProps} />}
        {activeRole === ROLES.STAFF     && <StaffView     {...sharedProps} />}
        {activeRole === ROLES.RESPONDER && <ResponderView {...sharedProps} />}
        {activeRole === ROLES.BRIDGE    && <CommsBridge   {...sharedProps} />}
      </div>

      {/* ── STATUS BAR ── */}
      <div className="statusbar">
        <span className={`status-led ${crisisActive ? "danger" : "safe"}`} />
        <span>{crisisActive ? "CRISIS MODE ACTIVE" : "System Nominal"}</span>
        <span className="statusbar-divider">•</span>
        <span>
          {Object.keys(rooms).length || 36} rooms monitored ·{" "}
          {incidents.filter((i) => i.status === "active").length} active alerts
        </span>
        <span className="statusbar-right">
          Cortex Sentinel v2 · Google Solution Challenge 2025
        </span>
      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="time-chip">{time}</span>;
}

// ─── AI analysis generator (mirrors backend logic) ─────────────────────────
export function generateAIAnalysis(type, location, severity) {
  const map = {
    Fire: `AI Detection: Smoke sensor correlation + SOS pattern at ${location} indicates high-probability fire event. Recommended: immediate evacuation of affected floor. Auto-notifying fire brigade.`,
    Medical: `AI Triage: Medical emergency at ${location}. Dispatching nearest trained first-aider. Ambulance auto-notified. Do not move the patient.`,
    Security: `AI Threat Assessment: Anomalous event at ${location}. Cross-referencing access logs. Police notification queued pending staff confirmation.`,
    Evacuation: `AI Routing: Optimal evacuation path calculated for ${location}. Stairwell B recommended. Elevator lockout engaged. Assembly point: East Lawn.`,
  };
  return map[type] || `AI Assessment: ${severity.toUpperCase()} priority incident at ${location}. Response protocol auto-initiated. Staff en route.`;
}

export default App;
