import { db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        return;
    }

    const profilePicContainer = document.querySelector('.profile-pic-container img');
    const imageGrid = document.getElementById('image-grid');

    try {
        const querySnapshot = await getDocs(collection(db, 'avatar'));
        querySnapshot.forEach((doc) => {
            const imagePath = doc.data().imagepath;
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = "Profile Picture";
            imgElement.classList.add('profile-pic');
            imgElement.addEventListener('click', () => {
                updateProfilePicture(userId, imagePath);
                profilePicContainer.src = imagePath;
            });
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.appendChild(imgElement);
            imageGrid.appendChild(gridItem);
        });

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
        localStorage.setItem('imagepath', imagePath);
    } catch (error) {
        alert('Failed to update profile picture. Please try again.');
    }
}
