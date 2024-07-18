import { db } from './firebaseConfig.js';
import { collection, doc, getDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

let email;

document.addEventListener('DOMContentLoaded', async function () {
    email = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');
    console.log(`User ID from localStorage: ${userId}`);

    if (!userId) {
        console.log('User ID not found in localStorage.');
        return;
    }

    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.username').textContent = username;
    } else {
        console.log("Username not found in localStorage.");
    }

    try {
        const userRef = doc(db, 'users', userId);
        console.log(`Firestore document reference: ${userRef.path}`);

        const userDoc = await getDoc(userRef);
        console.log(`User document exists: ${userDoc.exists()}`);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data fetched from Firestore:', userData);

            const profilePicElement = document.getElementById('profile-pic');
            profilePicElement.src = userData.imagepath || "../resources/bear.png";

            console.log(`Profile picture path: ${profilePicElement.src}`);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    myModules();
});

async function myModules() {
    const subjectsContainer = document.querySelector('.subjectRow');

    try {
        const userModulesSnapshot = await getDocs(collection(db, 'userModules'));
        const userModules = [];
        userModulesSnapshot.forEach(doc => {
            if (email === doc.data().email) {
                userModules.push(doc.data());
            }
        });

        if (userModules.length === 0) {
            const button = document.createElement('button');
            button.classList.add('start');
            button.id = 'start';
            button.textContent = 'Get Started';
            subjectsContainer.appendChild(button);
            button.addEventListener('click', () => {
                window.location.href = 'subjectSettings.html';
            });
        } else if (userModules.length > 0) {
            const modulesQuery = query(collection(db, 'module'), orderBy('moduleName'));
            const modulesSnapshot = await getDocs(modulesQuery);
            const modules = [];

            modulesSnapshot.forEach((moduleDoc) => {
                const data = moduleDoc.data();
                const userModule = userModules.find(um => um.moduleID === data.moduleID);
                if (userModule) {
                    modules.push(data);
                }
            });

            modules.forEach((data) => {
                const moduleElement = document.createElement('a');
                moduleElement.href = "studyMaterials.html";
                moduleElement.classList.add('subjectContainer');

                const imgElement = document.createElement('img');
                imgElement.classList.add('subjectIcon');
                imgElement.src = data.moduleImgPath;

                moduleElement.appendChild(imgElement);
                subjectsContainer.appendChild(moduleElement);
            });
        }
    } catch (error) {
        console.error('Error fetching documents: ', error);
    }
}
