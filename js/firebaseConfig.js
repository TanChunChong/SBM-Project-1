// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAx-GnA2jrSy99wRYG1wnFDqx8jiTUHBKI",
    authDomain: "sbm-the-project.firebaseapp.com",
    projectId: "sbm-the-project",
    storageBucket: "sbm-the-project.appspot.com",
    messagingSenderId: "558795325560",
    appId: "1:558795325560:web:c5fd91c384c2d02215ad8d",
    measurementId: "G-7N8WKJQ7DF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
