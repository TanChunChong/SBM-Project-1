import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";


const inProgressButton = document.getElementById('inProgressButton');

inProgressButton.addEventListener('click', () => {
    window.location.href = 'studyMaterials.html';
});

const leaderboardButton = document.getElementById('leaderboardButton');

leaderboardButton.addEventListener('click', () => {
    window.location.href = 'leaderboard1.html';
});

const personaliseButton = document.getElementById('personaliseButton');

personaliseButton.addEventListener('click', () => {
    window.location.href = 'subjectSettings.html';
}); 

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve and display the username
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.greeting').textContent = "Hi, " + username;
    } else {
        console.log("Username not found in localStorage.");
        // Fetch username from Firestore if not found in localStorage
        auth.onAuthStateChanged((user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        document.querySelector('.greeting').textContent = "Hi, " + userData.username;
                    } else {
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
            } else {
                console.log("No user is signed in.");
            }
        });
    } 




    // Truncate the text
    MyModules();


});