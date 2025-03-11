// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDg89W05qZn0Fh5xSnwiSWzowineLPY1eo",
    authDomain: "nucat-efed0.firebaseapp.com",
    projectId: "nucat-efed0",
    storageBucket: "nucat-efed0.firebasestorage.app",
    messagingSenderId: "326854268866",
    appId: "1:326854268866:web:9e1d9c872faf26117c285b",
    measurementId: "G-8MP0SZV3YN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, GoogleAuthProvider, signInWithPopup, db, collection, addDoc, doc, setDoc, getDoc, getDocs };