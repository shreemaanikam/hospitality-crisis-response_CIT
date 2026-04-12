import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbmaXnAMd4pFjMdSlNofKcWwAc6piJ1Is",
  authDomain: "crisis-app-81aec.firebaseapp.com",
  projectId: "crisis-app-81aec",
  storageBucket: "crisis-app-81aec.firebasestorage.app",
  messagingSenderId: "573226883935",
  appId: "1:573226883935:web:63b08ba3c4363226b934ea",
  measurementId: "G-DBERT3QBMK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);