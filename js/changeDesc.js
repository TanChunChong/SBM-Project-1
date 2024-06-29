// Import Firebase functions
import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const profilePicElement = document.getElementById('profile-pic');
    const descriptionElement = document.getElementById('description');

    let userRef;

    try {
        // Fetch user data from Firestore
        userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            profilePicElement.src = userData.imagepath || "../resources/defaultProfile.png";
            descriptionElement.value = userData.description || "";
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    document.querySelector('.update-button').addEventListener('click', async () => {
        const description = descriptionElement.value;

        try {
            await updateDoc(userRef, { description });
            alert('Profile updated successfully!');
            // Redirect to index.html
            window.location.href = 'userProfile.html';
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
});
