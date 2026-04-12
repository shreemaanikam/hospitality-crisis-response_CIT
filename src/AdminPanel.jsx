import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminPanel() {

  const checkStatus = async () => {
    const snapshot = await getDocs(collection(db, "rooms"));
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  };

  return (
    <div className="text-center mt-6">
      <button
        onClick={checkStatus}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        📊 Admin Check
      </button>
    </div>
  );
}