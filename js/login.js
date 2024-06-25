// Import Firebase functions
import { auth, db } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// Add event listener for form submission
document.querySelector('.login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.querySelector('input[placeholder="Email"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;

    try {
        // Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User logged in. Checking Firestore for user details...");

        // Check if the user exists in Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User details found in Firestore. Redirecting to home...");
            // Store the username in localStorage
            localStorage.setItem('username', userData.username);
            // Redirect to home.html
            window.location.href = 'home.html';
        } else {
            alert('Cannot retrieve user records');
            console.log("No such document in Firestore.");
        }
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
        console.log("Error: " + errorMessage);
    }
});
