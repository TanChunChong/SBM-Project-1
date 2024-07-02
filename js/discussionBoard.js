import { db, storage } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const postForm = document.getElementById('create-post-form');
    const postButton = document.querySelector('.post-button');
    const addImageBtn = document.getElementById('add-image');
    const addFileBtn = document.getElementById('add-file');
    const postImageInput = document.getElementById('post-image');
    const postFileInput = document.getElementById('post-file');
    const detailsList = document.getElementById('details-list');

    // Variables to store selected files
    let imageFile = null;
    let file = null;

    // Event listener to trigger image input click
    addImageBtn.addEventListener('click', () => postImageInput.click());
    
    // Event listener to trigger file input click
    addFileBtn.addEventListener('click', () => postFileInput.click());

    // Event listener for image file input change
    postImageInput.addEventListener('change', (event) => {
        imageFile = event.target.files[0];
        if (imageFile) {
            // Create a URL for the selected image
            const imageUrl = URL.createObjectURL(imageFile);
            // Create a list item to display the selected image
            const imageItem = document.createElement('li');
            imageItem.innerHTML = `<a href="${imageUrl}" download="${imageFile.name}">${imageFile.name}</a>`;
            detailsList.appendChild(imageItem);
        }
    });

    // Event listener for file input change
    postFileInput.addEventListener('change', (event) => {
        file = event.target.files[0];
        if (file) {
            // Create a URL for the selected file
            const fileUrl = URL.createObjectURL(file);
            // Create a list item to display the selected file
            const fileItem = document.createElement('li');
            fileItem.innerHTML = `<a href="${fileUrl}" download="${file.name}">${file.name}</a>`;
            detailsList.appendChild(fileItem);
        }
    });

    // Event listener for form submission
    postButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Retrieve form values
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        // Check if user information is available
        if (!userId || !username) {
            alert('User information not found. Please log in again.');
            return;
        }

        let imagePath = ''; // Variable to store the image path
        let filePath = '';  // Variable to store the file path

        try {
            // Upload image to Firebase Storage if selected
            if (imageFile) {
                const imageRef = ref(storage, `postImages/${userId}/${imageFile.name}`);
                const imageSnapshot = await uploadBytes(imageRef, imageFile);
                imagePath = await getDownloadURL(imageSnapshot.ref); // Get the download URL for the image
            }

            // Upload file to Firebase Storage if selected
            if (file) {
                const fileRef = ref(storage, `postFiles/${userId}/${file.name}`);
                const fileSnapshot = await uploadBytes(fileRef, file);
                filePath = await getDownloadURL(fileSnapshot.ref); // Get the download URL for the file
            }

            // Add post data to Firestore
            const docRef = await addDoc(collection(db, "posts"), {
                title,
                content,
                imageUrl: imagePath,
                fileUrl: filePath,
                userId,
                username,
                createdAt: new Date() // Store the creation date
            });

            alert('Post created successfully!'); // Alert user of successful post creation
            window.location.href = 'viewPosts.html'; // Redirect to view posts page
        } catch (error) {
            console.error('Error creating post: ', error); // Log any errors
            alert('Error creating post. Please try again.'); // Alert user of any errors
        }
    });
});
