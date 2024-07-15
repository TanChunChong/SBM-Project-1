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

    MyModules();
});

async function MyModules() {
    const subjectsContainer = document.querySelector('.subjects');
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
                    imgElement.classList.add('subject-icon');
                    imgElement.src = data.moduleImgPath;
                    imgElement.alt = `Image for ${data.moduleName}`;

                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('subject-info');

                    const nameElement = document.createElement('h3');
                    nameElement.textContent = data.moduleName;

                    const descriptionElement = document.createElement('p');
                    descriptionElement.innerHTML = `You have completed <span class="completed">${userModule.score || 0}</span> questions`; // Use actual data

                    const circularProgressDiv = document.createElement('div');
                    circularProgressDiv.classList.add('circular-progress');
                    circularProgressDiv.setAttribute('data-points', userModule.score || 0);

                    const circleDiv = document.createElement('div');
                    circleDiv.classList.add('circle');
                    const scoreSpan = document.createElement('span');
                    scoreSpan.textContent = userModule.score || 0;
                    circleDiv.appendChild(scoreSpan);
                    circularProgressDiv.appendChild(circleDiv);

                    infoDiv.appendChild(nameElement);
                    infoDiv.appendChild(descriptionElement);
                    moduleDiv.appendChild(imgElement);
                    moduleDiv.appendChild(infoDiv);
                    moduleDiv.appendChild(circularProgressDiv);
                    subjectsContainer.appendChild(moduleDiv);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching documents: ', error);
    }
}

document.addEventListener('DOMContentLoaded', MyModules);
