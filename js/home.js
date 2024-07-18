// Import Firebase functions
import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId');
    console.log(`User ID from localStorage: ${userId}`);

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    } 
  
    // Fetch the username from localStorage and update the DOM
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.username').textContent = username;
    } else {
        console.log("Username not found in localStorage.");
    }

    try {
        const userRef = doc(db, 'users', userId);
        console.log(`Firestore document reference: ${userRef.path}`);
        
        const userDoc = await getDoc(userRef);
        console.log(`User document exists: ${userDoc.exists()}`);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data fetched from Firestore:', userData);

            // Set the profile picture
            const profilePicElement = document.getElementById('profile-pic');
            profilePicElement.src = userData.imagepath || "../resources/bear.png";
            
            // Log the image path for debugging
            console.log(`Profile picture path: ${profilePicElement.src}`);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});
