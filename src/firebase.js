import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBJr0TmUn3oFvG9dV-eW-WPV9FCquHELjU",
  authDomain: "taskmanagement-792d6.firebaseapp.com",
  projectId: "taskmanagement-792d6",
  storageBucket: "taskmanagement-792d6.firebasestorage.app",
  messagingSenderId: "778942239972",
  appId: "1:778942239972:web:dbd3c3f65917c76afe08f1",
  measurementId: "G-7EJMLMS8TY",
  databaseURL: "https://taskmanagement-792d6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence); // ✅ Persist login across sessions

const db = getDatabase(app);

export { auth, db };
