// changePic.js

import { db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const profilePicContainer = document.querySelector('.profile-pic-container img');
    const imageGrid = document.getElementById('image-grid');

    try {
        // Fetch profile pictures
        const querySnapshot = await getDocs(collection(db, 'avatar'));
        querySnapshot.forEach((doc) => {
            const imagePath = doc.data().imagepath; // Make sure 'imagepath' is correct
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

        // Fetch current profile picture
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            profilePicContainer.src = userData.imagepath || "../resources/bear.png";
            document.querySelector('.username').textContent = userData.username || "Username";
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
    } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Failed to update profile picture. Please try again.');
    }
}
