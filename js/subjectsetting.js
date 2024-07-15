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
    subjectSettings();
    console.log(email);
});

async function subjectSettings() {
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

