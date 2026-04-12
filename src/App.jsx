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
    <div className={`min-h-screen p-4 md:p-8 transition-all duration-500 ${
      isDanger ? "bg-red-700" : "bg-purple-600"
    }`}>

      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-6">
        🚨 Hospitality Crisis System
      </h1>

      {/* 🚨 FULL SCREEN ALERT */}
      {isDanger && (
        <div className="fixed inset-0 bg-red-600 opacity-80 animate-pulse z-10 flex items-center justify-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold">
            🚨 EMERGENCY 🚨
          </h2>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 mt-10 relative z-20">
        <SOSButton />
        <SafeButton />
      </div>

      <Dashboard />
    </div>
  );
}

export default App;