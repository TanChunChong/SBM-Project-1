// Import Firebase functions
import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, setDoc, getDocs, query, collection, where } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// Function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate password strength and provide specific feedback
function validatePassword(password) {
    const errors = [];
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character.');
    }
    return errors;
}

// Function to check if the username already exists in Firestore
async function isUsernameTaken(username) {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

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

    // Validate email format
    if (!validateEmail(email)) {
        alert('Invalid email format!');
        console.log("Invalid email format.");
        return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        alert(passwordErrors.join('\n'));
        console.log(passwordErrors.join('\n'));
        return;
    }

    console.log("Passwords match and validations passed. Checking username availability...");

    // Check if the username is already taken
    if (await isUsernameTaken(username)) {
        alert('Username is already taken. Please choose a different username.');
        console.log("Username is already taken.");
        return;
    }

    console.log("Username is available. Proceeding with sign-up...");

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
            confirmPassword: confirmPassword,
            imagepath: 'https://firebasestorage.googleapis.com/v0/b/sbm-the-project.appspot.com/o/avatar%2Fbear.png?alt=media&token=1c3c99e6-1351-4ad1-96ca-de40f3dee657'
        });

        alert('User signed up successfully!');
        console.log("User signed up successfully!");

        // Redirect to login page
        window.location.href = 'index.html';

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
        console.log("Error: " + errorMessage);
    }
});
