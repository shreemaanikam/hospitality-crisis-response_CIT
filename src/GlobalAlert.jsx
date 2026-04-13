import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function GlobalAlert() {

  const triggerAlert = async () => {
    try {
      const snapshot = await getDocs(collection(db, "rooms"));

      const updates = snapshot.docs.map((d) =>
        updateDoc(doc(db, "rooms", d.id), {
          status: "danger",
          updatedAt: new Date()
        })
      );

      await Promise.all(updates);

      alert("🚨 GLOBAL ALERT TRIGGERED!");
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={triggerAlert}
        className="bg-yellow-500 text-black px-10 py-4 rounded-xl text-xl font-bold shadow-lg hover:scale-110 transition"
      >
        ⚠️ GLOBAL ALERT
      </button>
    </div>
  );
}