// document.addEventListener('DOMContentLoaded', function () {
//     const username = localStorage.getItem('username');
//     if (username) {
//         document.querySelector('.username').textContent = username;
//     } else {
//         console.log("Username not found in localStorage.");
//     }
// });

// home.js

import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const profilePicElement = document.querySelector('.topIconsRight .pfp');
    const usernameElement = document.querySelector('.username');

    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            profilePicElement.src = userData.imagepath || "../resources/defaultProfile.png";
            usernameElement.textContent = userData.username || "Username";
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});
