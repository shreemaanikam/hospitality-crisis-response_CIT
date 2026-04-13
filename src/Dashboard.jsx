import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const audioRef = useRef(null);

  // 🏢 Floor structure (you can expand later)
  const floors = [
    ["101", "102", "103", "104"],
    ["105", "106", "107", "108"]
  ];

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

      {/* 🏢 FLOOR MAP */}
      <div className="flex flex-col gap-6">

        {floors.map((floor, floorIndex) => (
          <div key={floorIndex}>

            <h3 className="text-white text-xl mb-2">
              🏢 Floor {floorIndex + 1}
            </h3>

            <div className="bg-gray-800 p-3 rounded-xl">
              <div className="grid grid-cols-4 gap-4">

                {floor.map((roomId) => {
                  const room = rooms.find(r => r.id === roomId);

                  return (
                    <div
                      key={roomId}
                      className={`p-5 rounded-xl text-white text-center shadow-lg transition ${
                        room?.status === "danger"
                          ? "bg-red-600 animate-pulse border-4 border-white"
                          : "bg-green-500"
                      }`}
                    >
                      <h3 className="text-lg font-bold">Room {roomId}</h3>

                      <p className="mt-2 text-xl">
                        {room?.status === "danger" ? "🚨" : "✅"}
                      </p>

                      <p className="text-xs mt-2">
                        {room?.updatedAt?.toDate
                          ? room.updatedAt.toDate().toLocaleTimeString()
                          : ""}
                      </p>
                    </div>
                  );
                })}

              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}