import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "login-neocart.firebaseapp.com",
    projectId: "login-neocart",
    storageBucket: "login-neocart.firebasestorage.app",
    messagingSenderId: "120355727397",
    appId: "1:120355727397:web:96aef73c71898123a737cc"
};
let app;
let auth = null;
let provider = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
} catch (error) {
    console.error("Firebase initialization failed:", error.message);
}


export { auth, provider }
