// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Firebase sadece client-side'da initialize edilir
if (typeof window !== 'undefined') {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB-IpjNzqGhss_j5uT-r1q_DTgAcXqlUHg",
    authDomain: "nextgenmagnet.firebaseapp.com",
    projectId: "nextgenmagnet",
    storageBucket: "nextgenmagnet.firebasestorage.app",
    messagingSenderId: "504037203964",
    appId: "1:504037203964:web:5d4e25529b9b72cc31dc79",
    measurementId: "G-EJN5S065M4"
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, app };