import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRooms(roomData);

      // 🔔 AUTO SOUND WHEN DANGER
      const hasDanger = roomData.some(r => r.status === "danger");

      if (hasDanger && !audioRef.current) {
        audioRef.current = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        audioRef.current.loop = true;
        audioRef.current.play();
      }

      if (!hasDanger && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 mt-6">
      <h2 className="text-2xl md:text-3xl text-white text-center mb-4">
        🏨 Staff Dashboard
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`p-4 rounded-xl text-white text-center transition ${
              room.status === "danger"
                ? "bg-red-600 animate-pulse border-4 border-white"
                : "bg-green-500"
            }`}
          >
            <h3 className="text-lg font-bold">Room {room.id}</h3>

            <p className="mt-2 text-lg">
              {room.status === "danger" ? "🚨 DANGER" : "✅ SAFE"}
            </p>

            <p className="text-sm mt-2">
              {room.updatedAt?.toDate
                ? room.updatedAt.toDate().toLocaleTimeString()
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}