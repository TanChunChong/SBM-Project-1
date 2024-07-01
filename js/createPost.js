import { db, storage } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('create-post-form');
    const postButton = document.querySelector('.post-button');
    const addImageBtn = document.getElementById('add-image');
    const addFileBtn = document.getElementById('add-file');
    const postImageInput = document.getElementById('post-image');
    const postFileInput = document.getElementById('post-file');
    const detailsList = document.getElementById('details-list');

    let imageFile = null;
    let file = null;

    addImageBtn.addEventListener('click', () => postImageInput.click());
    addFileBtn.addEventListener('click', () => postFileInput.click());

    postImageInput.addEventListener('change', (event) => {
        imageFile = event.target.files[0];
        if (imageFile) {
            const imageUrl = URL.createObjectURL(imageFile);
            const imageItem = document.createElement('li');
            imageItem.innerHTML = `<a href="${imageUrl}" download="${imageFile.name}">${imageFile.name}</a>`;
            detailsList.appendChild(imageItem);
        }
    });

    postFileInput.addEventListener('change', (event) => {
        file = event.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const fileItem = document.createElement('li');
            fileItem.innerHTML = `<a href="${fileUrl}" download="${file.name}">${file.name}</a>`;
            detailsList.appendChild(fileItem);
        }
    });

    postButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if (!userId || !username) {
            alert('User information not found. Please log in again.');
            return;
        }

        let imagePath = '';
        let filePath = '';

        try {
            // Upload image if selected
            if (imageFile) {
                const imageRef = ref(storage, `postImages/${userId}/${imageFile.name}`);
                const imageSnapshot = await uploadBytes(imageRef, imageFile);
                imagePath = await getDownloadURL(imageSnapshot.ref);
            }

            // Upload file if selected
            if (file) {
                const fileRef = ref(storage, `postFiles/${userId}/${file.name}`);
                const fileSnapshot = await uploadBytes(fileRef, file);
                filePath = await getDownloadURL(fileSnapshot.ref);
            }

            const docRef = await addDoc(collection(db, "posts"), {
                title,
                content,
                imageUrl: imagePath,
                fileUrl: filePath,
                userId,
                username,
                createdAt: new Date()
            });

            alert('Post created successfully!');
            window.location.href = 'viewPosts.html';
        } catch (error) {
            console.error('Error creating post: ', error);
            alert('Error creating post. Please try again.');
        }
    });
});
