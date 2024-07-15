import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', function () {
    email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.greeting').textContent = "Hi, " + username;
    } else {
        console.log("Username not found in localStorage.");
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

    subjectSettings();
});

async function subjectSettings() {
    const subjectsContainer = document.querySelector('.subjects');
    subjectsContainer.innerHTML = ''; // Clear any existing content
    try {
        const userModulesSnapshot = await getDocs(collection(db, 'userModules'));
        const userModules = [];

        userModulesSnapshot.forEach(doc => {
            if (email === doc.data().email) {
                userModules.push(doc.data());
            }
        });

        if (userModules.length > 0) {
            const modulesSnapshot = await getDocs(collection(db, 'module'));
            modulesSnapshot.forEach((moduleDoc) => {
                const data = moduleDoc.data();
                const userModule = userModules.find(um => um.moduleID === data.moduleID);
                if (userModule) {
                    const moduleDiv = document.createElement('div');
                    moduleDiv.classList.add('subject');

                    const imgElement = document.createElement('img');
                    imgElement.classList.add('icon');
                    imgElement.src = data.moduleImgPath;
                    imgElement.alt = `Image for ${data.moduleName}`;

                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('details');

                    const nameElement = document.createElement('h2');
                    nameElement.textContent = data.moduleName;

                    const descriptionElement = document.createElement('p');
                    descriptionElement.innerHTML = `Module Code: ${data.moduleID}`; 

                    infoDiv.appendChild(nameElement);
                    infoDiv.appendChild(descriptionElement);
                    moduleDiv.appendChild(imgElement);
                    moduleDiv.appendChild(infoDiv);
                    subjectsContainer.appendChild(moduleDiv);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching documents: ', error);
    }
}

document.addEventListener('DOMContentLoaded', subjectSettings);
