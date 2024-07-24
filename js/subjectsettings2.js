import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, addDoc, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";


let email;

document.addEventListener('DOMContentLoaded', async function () {
    email = localStorage.getItem('email');
    
    // Fetching module names from Firestore
    console.log("Fetching modules...");
    const modulesRef = collection(db, 'module');
    const modulesSnapshot = await getDocs(modulesRef);
    const moduleDropdown = document.getElementById('courses');
    const moduleImage = document.getElementById('moduleImage');

    modulesSnapshot.forEach((doc) => {
        const moduleName = doc.data().moduleName;
        const option = document.createElement('option');
        option.value = moduleName;
        option.textContent = moduleName;
        option.dataset.imgPath = doc.data().moduleImgPath;
        moduleDropdown.appendChild(option);
    });

    // Event listener for dropdown change
    moduleDropdown.addEventListener('change', function () {
        const selectedOption = moduleDropdown.options[moduleDropdown.selectedIndex];
        const imgPath = selectedOption.dataset.imgPath;
        if (imgPath) {
            moduleImage.src = imgPath;
            moduleImage.style.display = 'block';
        } else {
            moduleImage.style.display = 'none';
            
        }
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

                    // Check if a document with the same email and moduleID already exists
                    const userModulesRef = collection(db, 'userModules');
                    const existingDocQuery = query(userModulesRef, where("email", "==", email), where("moduleID", "==", moduleID));
                    const existingDocSnapshot = await getDocs(existingDocQuery);
                    
                    if (existingDocSnapshot.empty) {
                        // Create a new document in userModules collection with the moduleID
                        await addDoc(collection(db, 'userModules'), {
                            email: email, // Assuming email is stored in localStorage
                            moduleID: moduleID,
                            score: 0
                        });

                        alert('Document successfully created!');
                    } else {
                        alert('This module is already assigned to your email.');
                    }
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
document.getElementById('backArrow').addEventListener('click', function() {
    history.back();
});

