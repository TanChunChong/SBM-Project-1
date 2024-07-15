import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, addDoc, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const inProgressButton = document.getElementById('inProgressButton');
const leaderboardButton = document.getElementById('leaderboardButton');
const personaliseButton = document.getElementById('personaliseButton');

inProgressButton.addEventListener('click', () => {
    window.location.href = 'studyMaterials.html';
});

leaderboardButton.addEventListener('click', () => {
    window.location.href = 'leaderboard1.html';
});

personaliseButton.addEventListener('click', () => {
    window.location.href = 'subjectSettings.html';
}); 

let email;

document.addEventListener('DOMContentLoaded', async function () {
    email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.greeting').textContent = "Hi, " + username;
    } else {
        console.log("Username not found in localStorage.");
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.querySelector('.greeting').textContent = "Hi, " + userData.username;
                } else {
                    console.log("No such document!");
                }
            } else {
                console.log("No user is signed in.");
            }
        });
    }

    // Fetching module names from Firestore
    console.log("Fetching modules...");
    const modulesRef = collection(db, 'module');
    const modulesSnapshot = await getDocs(modulesRef);
    const moduleDropdown = document.getElementById('courses');

    modulesSnapshot.forEach((doc) => {
        const moduleName = doc.data().moduleName;
        const option = document.createElement('option');
        option.value = moduleName;
        option.textContent = moduleName;
        moduleDropdown.appendChild(option);
    });

    // Form submission handling
    const form = document.querySelector('.form-container');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedModule = moduleDropdown.value;
        if (selectedModule) {
            try {
                // Query to get the module document based on moduleName
                const q = query(modulesRef, where("moduleName", "==", selectedModule));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const moduleDoc = querySnapshot.docs[0];
                    const moduleID = moduleDoc.data().moduleID;
                    
                    // Create a new document in userModules collection with the moduleID
                    await addDoc(collection(db, 'userModules'), {
                        email: email, // Assuming email is stored in localStorage
                        moduleID: moduleID,
                        score: 0
                    });

                    alert('Document successfully created!');
                } else {
                    alert('Module not found.');
                }
            } catch (error) {
                console.error('Error creating document: ', error);
                alert('Error creating document.');
            }
        } else {
            alert('Please select a course.');
        }
    });
});
