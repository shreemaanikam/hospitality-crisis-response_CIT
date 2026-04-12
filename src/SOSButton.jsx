import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SOSButton() {

  const sendSOS = async () => {
    const roomId = "101";

    try {
      // 🔥 Firestore update
      await setDoc(doc(db, "rooms", roomId), {
        status: "danger",
        updatedAt: new Date()
      });

      // 🔔 SOUND (loop)
      const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
      audio.loop = true;
      audio.volume = 1;
      audio.play();

      // 📳 VIBRATION (mobile)
      if (navigator.vibrate) {
        navigator.vibrate([500, 300, 500, 300, 1000]);
      }

      alert("🚨 SOS Sent!");

    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <button
      onClick={sendSOS}
      className="bg-red-600 text-white px-14 py-7 rounded-full text-3xl font-bold shadow-2xl animate-pulse hover:scale-110 transition"
    >
      🚨 SOS ALERT
    </button>
  );
}