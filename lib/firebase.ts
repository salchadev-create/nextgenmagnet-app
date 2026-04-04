// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { envConfig } from "./envConfig";

const firebaseConfig = envConfig.firebaseConfig;

// Singleton: birden fazla kez initialize etme
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

if (typeof window !== 'undefined') {
  _app = getFirebaseApp();
  _auth = getAuth(_app);
  _db = getFirestore(_app, envConfig.databaseName);
}

// Server-side için de güvenli erişim fonksiyonları
export function getDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    _db = getFirestore(app, envConfig.databaseName);
  }
  return _db;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
  }
  return _auth;
}

export const app = _app;
export const auth = _auth;
export const db = _db;