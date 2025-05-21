// src/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // You can uncomment this if you need Analytics
import { getFirestore } from "firebase/firestore"; // <-- Import Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYzB-2y2zPC5TVhTCad-xDp1Bs4Uwhwrk",
  authDomain: "stats-collector-app.firebaseapp.com",
  projectId: "stats-collector-app",
  storageBucket: "stats-collector-app.firebasestorage.app",
  messagingSenderId: "897168824540",
  appId: "1:897168824540:web:14389b53c0efc5e2c0bc19",
  measurementId: "G-0Q0SDDPZTL" // Keep this if you kept getAnalytics, optional otherwise
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig); // <-- Export the app instance
// export const analytics = getAnalytics(app); // You can uncomment this if you need Analytics
export const db = getFirestore(app); // <-- Initialize and export Firestore

// TODO: Add SDKs for other Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Example:
// import { getAuth } from "firebase/auth";
// export const auth = getAuth(app);