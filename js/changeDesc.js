import { db } from './firebaseConfig.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const profilePicElement = document.getElementById('profile-pic');
    const descriptionElement = document.getElementById('description');

    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            profilePicElement.src = userData.imagepath || "../resources/bear.png";
            descriptionElement.value = userData.description || "";
        } else {
            console.log('No such document in Firestore.');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    const updateButton = document.querySelector('.update-button');
    updateButton.addEventListener('click', async () => {
        const description = descriptionElement.value;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                description: description
            });
            localStorage.setItem('description', description); // Update localStorage with the new description
            alert('Description updated successfully!');
            // Redirect to userprofile.html
            window.location.href = 'userprofile.html';
        } catch (error) {
            console.error('Error updating description:', error);
            alert('Failed to update description. Please try again.');
        }
    });
});
