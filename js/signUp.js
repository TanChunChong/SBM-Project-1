// Import Firebase functions
import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// Add event listener for form submission
document.querySelector('.sign-up-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.querySelector('input[placeholder="Username"]').value;
    const email = document.querySelector('input[placeholder="Email"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm Password"]').value;

    console.log("Form submitted. Checking passwords...");

    // Password confirmation check
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        console.log("Passwords do not match.");
        return;
    }

    console.log("Passwords match. Proceeding with sign-up...");

    try {
        // Firebase authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User created. Saving additional info in Firestore...");

        // Save additional user info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            password: password, // Only for demonstration. Use hashed passwords in production.
            confirmPassword: confirmPassword
        });

        alert('User signed up successfully!');
        console.log("User signed up successfully!");

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
        console.log("Error: " + errorMessage);
    }
});
