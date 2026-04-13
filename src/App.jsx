import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import SOSButton from "./SOSButton";
import SafeButton from "./SafeButton";
import Dashboard from "./Dashboard";

function App() {
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      const dangerExists = data.some(room => room.status === "danger");
      setIsDanger(dangerExists);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDanger ? "bg-red-700" : "bg-purple-700"
      }`}
    >
      {/* 🚨 FULL SCREEN ALERT */}
      {isDanger && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-80 animate-pulse z-50 flex items-center justify-center">
          <h2 className="text-white text-4xl md:text-6xl font-extrabold text-center">
            🚨 EMERGENCY 🚨
          </h2>
        </div>
      )}

      {/* 🧭 HEADER */}
      <div className="p-4 md:p-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white">
          🚨 Hospitality Crisis System
        </h1>
      </div>

      {/* 🔘 BUTTONS */}
      <div className="flex flex-col items-center gap-6 mt-6 relative z-10">
        <SOSButton />
        <SafeButton />
      </div>

      {/* 📊 DASHBOARD */}
      <div className="mt-8 relative z-10">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;