import { auth, db, storage } from './firebaseConfig.js';
import { collection, doc, setDoc, getDocs, updateDoc, increment, runTransaction } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
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
        const description = document.getElementById('post-content').value;
        const user = auth.currentUser;

        if (!user) {
            alert('User not authenticated. Please log in again.');
            return;
        }

        // Fetch the username from localStorage
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Username not found. Please log in again.');
            return;
        }

        // Extract topicID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const topicID = urlParams.get('topicID');
        if (!topicID) {
            alert('Topic ID not found. Please go back and select a topic.');
            return;
        }

        console.log("User ID:", user.uid);  // Log the user ID
        console.log("Topic ID:", topicID);  // Log the topic ID

        let imagePath = '';
        let filePath = '';

        try {
            // Upload image if selected
            if (imageFile) {
                const imageRef = ref(storage, `postImages/${user.uid}/${imageFile.name}`);
                console.log("Uploading image:", imageFile.name);
                const imageSnapshot = await uploadBytes(imageRef, imageFile);
                imagePath = await getDownloadURL(imageSnapshot.ref);
                console.log("Image uploaded to:", imagePath);
            }

            // Upload file if selected
            if (file) {
                const fileRef = ref(storage, `postFiles/${user.uid}/${file.name}`);
                console.log("Uploading file:", file.name);
                const fileSnapshot = await uploadBytes(fileRef, file);
                filePath = await getDownloadURL(fileSnapshot.ref);
                console.log("File uploaded to:", filePath);
            }

            const createdAt = new Date().toISOString(); // Get the current date and time as ISO string

            // Increment the postsID counter and get the new ID
            const newPostID = await runTransaction(db, async (transaction) => {
                const counterDocRef = doc(db, 'counters', 'postsCounter');
                const counterDoc = await transaction.get(counterDocRef);

                if (!counterDoc.exists()) {
                    throw "Counter document does not exist!";
                }

                const currentPostID = counterDoc.data().currentPostID;
                const newPostID = currentPostID + 1;
                transaction.update(counterDocRef, { currentPostID: newPostID });

                return newPostID;
            });

            const customID = `${createdAt}_${title}_${username}`; // Create custom ID
            const postDocRef = doc(db, "posts", customID); // Reference to the document with custom ID

            await setDoc(postDocRef, {
                title,
                description,
                imageUrl: imagePath,
                fileUrl: filePath,
                userId: user.uid,
                username: username,
                topicID: topicID,
                createdAt: createdAt,
                likes: 0,
                commentCount: 0,
                postsID: newPostID // Assign the new postsID
            });

            console.log("Document added with custom ID:", customID);

            // Fetch the topic document and update the postsnumber field
            const topicQuerySnapshot = await getDocs(collection(db, 'topics'));
            let topicFound = false;
            topicQuerySnapshot.forEach(async (topicDoc) => {
                const topicData = topicDoc.data();
                if (topicData.topicname === topicID) {
                    const topicRef = doc(db, 'topics', topicDoc.id);
                    console.log(`Updating topic: ${topicDoc.id}`);
                    await updateDoc(topicRef, {
                        postsnumber: increment(1)
                    });
                    topicFound = true;
                }
            });

            if (!topicFound) {
                console.log(`No topic found for topicID: ${topicID}`);
            }

            alert('Post created successfully!');
            window.location.href = `viewPosts.html?topicID=${encodeURIComponent(topicID)}`;
        } catch (error) {
            console.error('Error creating post: ', error);
            alert('Error creating post. Please try again.');
        }
    });
});
