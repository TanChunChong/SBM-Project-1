import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId');
    console.log(`User ID from localStorage: ${userId}`);

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    try {
        const userRef = doc(db, 'users', userId);
        console.log(`Firestore document reference: ${userRef.path}`);
        
        const userDoc = await getDoc(userRef);
        console.log(`User document exists: ${userDoc.exists()}`);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data fetched from Firestore:', userData);
            
            document.querySelector('.name').textContent = userData.username || "No username provided.";
            document.querySelector('.description').textContent = userData.description || "No description provided.";
            document.querySelector('.pfp').src = userData.imagepath || "../resources/bear.png";
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});
