import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function SafeButton() {

  const markSafe = async () => {
    const roomId = "101";

    await updateDoc(doc(db, "rooms", roomId), {
      status: "safe",
      updatedAt: new Date()
    });

    alert("✅ You are SAFE");
  };

  return (
    <button
      onClick={markSafe}
      className="bg-green-600 text-white px-12 py-5 rounded-xl text-xl font-semibold shadow-xl hover:scale-105"
    >
      ✅ I AM SAFE
    </button>
  );
}