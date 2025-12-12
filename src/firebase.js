
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyARsV7B9Xc-AJFfFMQ26Ull505wS5PLGpE",
    authDomain: "logicgatesimulator-871f7.firebaseapp.com",
    projectId: "logicgatesimulator-871f7",
    storageBucket: "logicgatesimulator-871f7.firebasestorage.app",
    messagingSenderId: "536463695394",
    appId: "1:536463695394:web:7e5a515dd73b0b5e6b747b",
    measurementId: "G-LY1TR1TTVW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);