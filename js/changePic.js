import { db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const profilePicContainer = document.getElementById('current-profile-pic');
    const imageGrid = document.getElementById('image-grid');
    const usernameElement = document.getElementById('username');

    if (!profilePicContainer || !imageGrid || !usernameElement) {
        console.error('Required DOM elements not found.');
        return;
    }

    try {
        // Fetch profile pictures from 'avatar' collection
        const querySnapshot = await getDocs(collection(db, 'avatar'));
        querySnapshot.forEach((doc) => {
            const imagePath = doc.data().imagepath; // Corrected field name
            console.log(`Image path: ${imagePath}`); // Debug log
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = "Profile Picture";
            imgElement.classList.add('profile-pic');
            imgElement.addEventListener('click', () => {
                // Update selected profile picture in Firestore
                updateProfilePicture(userId, imagePath);
                // Update profile picture in the DOM
                profilePicContainer.src = imagePath;
            });
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.appendChild(imgElement);
            imageGrid.appendChild(gridItem);
        });

        // Fetch current profile picture and username
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            profilePicContainer.src = userData.imagepath || "../resources/defaultProfile.png";
            usernameElement.textContent = userData.username || "No username provided.";
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
});

async function updateProfilePicture(userId, imagePath) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            imagepath: imagePath
        });
        localStorage.setItem('imagepath', imagePath); // Update localStorage with the new image path
        // Removed alert
    } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Failed to update profile picture. Please try again.');
    }
}
