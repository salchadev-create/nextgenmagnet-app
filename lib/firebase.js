// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);