import { db } from './firebaseConfig.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const updateButton = document.querySelector('.update-button');
    updateButton.addEventListener('click', async () => {
        const description = document.getElementById('description').value;
        const userId = localStorage.getItem('userId'); // Retrieve the user ID from localStorage

        if (!userId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                await updateDoc(userRef, {
                    description: description
                });
                localStorage.setItem('description', description); // Update localStorage with the new description
                alert('Description updated successfully!');
            } else {
                console.log('No such document in Firestore.');
            }
        } catch (error) {
            console.error('Error updating description:', error);
            alert('Failed to update description. Please try again.');
        }
    });
});
