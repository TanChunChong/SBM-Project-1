import { auth, db } from './firebaseConfig.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.edit-profile-form');
    const emailInput = document.getElementById('email');
    const cancelButton = document.getElementById('cancel-btn');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            // Query the users collection to find a matching email
            const q = query(collection(db, 'users'), where('email', '==', emailInput.value));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert('No user found with this email!');
                return;
            }

            // Send a password reset email
            await sendPasswordResetEmail(auth, emailInput.value);
            alert('Password reset email sent! Please check your email to reset your password.');

            // Redirect to login page or any other page as required
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error sending password reset email:', error);
            alert('Failed to send password reset email. Please try again.');
        }
    });

    cancelButton.addEventListener('click', function () {
        emailInput.value = '';
    });
});
