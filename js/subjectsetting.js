import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";


console.log("hello");

let email;

document.addEventListener('DOMContentLoaded', function () {
    email = localStorage.getItem('email');
    subjectSettings();
    console.log("hello");
    
});


async function subjectSettings() {
    const subjectsContainer = document.querySelector('.subjects');
    const loadingSpinner = document.querySelector('.loader');
    
    try {
        
        const userModulesSnapshot = await getDocs(collection(db, 'userModules'));
        const userModules = [];
        loadingSpinner.style.visibility = 'visible'; // Show the spinner
        userModulesSnapshot.forEach(doc => {
            if (email === doc.data().email) {
                userModules.push(doc.data());
            }
        });
        console.log("not working");
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
    finally {
        loadingSpinner.remove(); // Hide the spinner
    }
}

