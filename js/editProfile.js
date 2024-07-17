// Import Firebase functions
import { auth, db, storage } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, updatePassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";

// Function to fetch and display user data
async function displayUserData(user) {
    if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            document.querySelector('input[placeholder="Username"]').value = userData.username;
            document.querySelector('input[placeholder="Email"]').value = userData.email;

            // Get the image path and display the profile picture
            const imagePath = userData.imagepath;
            if (imagePath) {
                const imageRef = ref(storage, imagePath);
                getDownloadURL(imageRef).then((url) => {
                    document.querySelector('.profile-icon').src = url;
                }).catch((error) => {
                    console.error("Error fetching the profile image URL: ", error);
                });
            }
        } else {
            console.log("No such document!");
        }
    } else {
        console.log("No user is signed in.");
    }
}

// Function to update user data
async function updateUserProfile(event) {
    event.preventDefault();

    const user = auth.currentUser;

    if (user) {
        const username = document.querySelector('input[placeholder="Username"]').value;
        const email = document.querySelector('input[placeholder="Email"]').value;
        const newPassword = document.querySelector('input[placeholder="New Password"]').value;
        const confirmNewPassword = document.querySelector('input[placeholder="Confirm New Password"]').value;
        const oldPassword = document.querySelector('input[placeholder="Old Password"]').value;

        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match!');
            return;
        }

        try {
            // Update user password if new password is provided
            if (newPassword && oldPassword) {
                await signInWithEmailAndPassword(auth, user.email, oldPassword);
                await updatePassword(user, newPassword);
            }

            // Update user profile in Firestore
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                username: username,
                email: email
            });

            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert('Error updating profile: ' + error.message);
        }
    } else {
        console.log("No user is signed in.");
    }
}

// Check authentication state and display user data
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserData(user);
    } else {
        console.log("User is not signed in.");
    }
});

// Event listener for form submission
document.querySelector('.edit-profile-form').addEventListener('submit', updateUserProfile);
