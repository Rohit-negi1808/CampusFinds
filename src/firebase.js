// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrKNgYraXlFhFBubRKlwVqoacK71E2YxM",
  authDomain: "campusfinds-a4777.firebaseapp.com",
  projectId: "campusfinds-a4777",
  storageBucket: "campusfinds-a4777.firebasestorage.app",
  messagingSenderId: "716209859637",
  appId: "1:716209859637:web:559ea41f121cde3b3f957c",
  measurementId: "G-MSBRZ7NKTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
