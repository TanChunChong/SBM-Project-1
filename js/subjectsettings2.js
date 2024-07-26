import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

let email;

document.addEventListener('DOMContentLoaded', async function () {
    email = localStorage.getItem('email');
    
    // Placeholder image
    const placeholderImage = '../resources/book.png'; // Path to your placeholder image
    const moduleImage = document.getElementById('moduleImage');
    moduleImage.src = placeholderImage;
    moduleImage.style.display = 'block';

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
        option.dataset.imgPath = doc.data().moduleImgPath;
        moduleDropdown.appendChild(option);
    });

    // Event listener for dropdown change
    moduleDropdown.addEventListener('change', function () {
        const selectedOption = moduleDropdown.options[moduleDropdown.selectedIndex];
        const imgPath = selectedOption.dataset.imgPath;

        if (imgPath) {
            moduleImage.src = imgPath;
            moduleImage.onerror = function() {
                moduleImage.src = placeholderImage;
            };
            moduleImage.style.display = 'block';
        } else {
            moduleImage.src = placeholderImage;
            moduleImage.style.display = 'block';
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

                        setModalMessage("Your module has been added.");
                        openModal();
                    } else {
                        setModalMessage("This module is already assigned to your email.");
                        openModal();
                    }
                } else {
                    setModalMessage("Module not found.");
                    openModal();
                }
            } catch (error) {
                console.error('Error creating document: ', error);
                setModalMessage('Error creating document.');
                openModal();
            }
        } else {
            setModalMessage('Please select a module you would like to take.');
            openModal();
        }
    });
});

// Function to open the modal
function openModal() {
    const modal = document.getElementById("incorrectModal");
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("incorrectModal");
    modal.style.display = "none";
}

// Function to set the modal message
function setModalMessage(message) {
    const modalMessageElement = document.querySelector('.ModalBody');
    modalMessageElement.innerHTML = message; // Use innerHTML to support line breaks
}

// Event listener for the "Continue" button
const continueButton = document.querySelector('.desc');
continueButton.addEventListener('click', closeModal);

// Event listener for clicks outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById("incorrectModal");
    if (event.target == modal) {
        closeModal();
    }
});

// Back button event listener
document.getElementById('backArrow').addEventListener('click', function() {
    history.back();
});
