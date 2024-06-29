import { db, auth } from './firebaseConfig.js';
import { doc, setDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Function to set rating
function setRating(rating) {
    console.log("Clicked rating:", rating); // Check if this log appears
    document.getElementById('rating').value = rating;
    // Remove color classes from all circles
    var circles = document.getElementsByClassName('circle');
    for (var i = 0; i < circles.length; i++) {
        circles[i].classList.remove('bad', 'ok', 'good');
    }
    // Add color class to the clicked circle
    document.getElementById(rating.toLowerCase()).classList.add(rating.toLowerCase());
}

// Attach setRating to the global window object
window.setRating = setRating;

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    const ratingInput = document.getElementById('rating');
    const reasonInput = document.getElementById('reason');
    const contactInput = document.getElementById('contact');

    // Check for authenticated user
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            const userEmail = user.email;
            const userName = localStorage.getItem('username'); // Assuming username is stored in localStorage on login

            feedbackForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const rating = ratingInput.value;
                const reason = reasonInput.value;
                const contact = contactInput.checked;

                try {
                    // Create a new feedback document with auto-generated ID
                    await addDoc(collection(db, 'feedback'), {
                        username: userName,
                        email: userEmail,
                        rating: rating,
                        reason: reason,
                        contact: contact,
                        userId: userId
                    });

                    alert('Feedback submitted successfully!');

                    // Clear the form
                    feedbackForm.reset();
                    // Clear the selected rating color
                    var circles = document.getElementsByClassName('circle');
                    for (var i = 0; i < circles.length; i++) {
                        circles[i].classList.remove('bad', 'ok', 'good');
                    }
                    document.getElementById('rating').value = ""; // Clear hidden rating field

                } catch (error) {
                    console.error('Error submitting feedback:', error);
                    alert('Failed to submit feedback. Please try again.');
                }
            });
        } else {
            console.log('No user is signed in.');
        }
    });
});
