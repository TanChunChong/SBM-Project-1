import { db, storage } from './firebaseConfig.js'; // Ensure storage is imported
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        return;
    }

    const profilePicContainer = document.querySelector('.profile-pic-container img');
    const imageGrid = document.getElementById('image-grid');
    const storageRef = ref(storage, 'avatar');

    try {
        // List all files in the 'avatar' folder in Firebase Storage
        const listResult = await listAll(storageRef);
        listResult.items.forEach(async (itemRef) => {
            const imagePath = await getDownloadURL(itemRef);
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
