import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    loadSavedPosts();
});

async function loadSavedPosts() {
    const username = localStorage.getItem('username');
    if (!username) {
        console.error('Username is not available in localStorage');
        return;
    }

    const savesQuery = query(collection(db, 'saves'), where('userWhoSavedPost', '==', username));
    const savedPostsSnapshot = await getDocs(savesQuery);
    
    const savedPostsContainer = document.querySelector('.savedPosts-container');
    savedPostsContainer.innerHTML = ''; // Clear any existing content

    for (const docSnap of savedPostsSnapshot.docs) {
        const post = docSnap.data();
        const userDocRef = doc(db, 'users', post.userID);
        const userDoc = await getDoc(userDocRef);

        let userAvatar = '../resources/default-avatar.png'; // Default avatar
        if (userDoc.exists()) {
            const userData = userDoc.data();
            userAvatar = userData.imagepath || userAvatar; // User's profile image path
        }

        let fileName = "";
        if (post.fileUrl) {
            const url = new URL(post.fileUrl);
            fileName = decodeURIComponent(url.pathname.split('/').pop().split('%2F').pop());
        }

        const savedClass = post.saved ? 'saved' : '';
        const likedClass = post.likedByUser ? 'liked' : '';

        const postBox = document.createElement('div');
        postBox.classList.add('posts-rectangular-box');
        postBox.dataset.postId = docSnap.id;

        postBox.innerHTML = `
            <a href="viewSpecificPost.html?postId=${post.postsID}" class="post-link">
                <div class="profile-image" style="background-image: url(${userAvatar});"></div>
                <div class="posts-text-container">
                    <div class="title-and-username">
                        <p class="posts-title">${post.title}</p>
                        <p class="posts-username">${post.username}</p>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="blue" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon ${savedClass}" data-saved="true" data-post-id="${docSnap.id}">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <p class="posts-text-description">${post.description}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="posts-image">` : ''}
                ${post.fileUrl ? `<a href="#" class="download-file" data-url="${post.fileUrl}" data-filename="${fileName}">${fileName}</a>` : ''}
            </a>
        `;
        savedPostsContainer.appendChild(postBox);

        // Set the background image separately
        const profileImage = postBox.querySelector('.profile-image');
        profileImage.style.backgroundImage = `url(${userAvatar})`;
    }

    // Add event listeners for save icons
    const icons = document.querySelectorAll('.vertical-saved-icon');
    icons.forEach(function(icon) {
        icon.addEventListener('click', function(event) {
            event.preventDefault();
            handleIconClick(icon);
        });
    });

    // Add event listeners for download links
    const downloadLinks = document.querySelectorAll('.download-file');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const url = link.getAttribute('data-url');
            const fileName = link.getAttribute('data-filename');
            downloadFile(url, fileName);
        });
    });
}

// Function to handle the icon click and unsave posts
async function handleIconClick(icon) {
    const isSaved = icon.classList.contains('vertical-saved-icon');

    if (isSaved) {
        const postId = icon.getAttribute('data-post-id');
        // Remove the post from the saves collection
        await deleteDoc(doc(db, 'saves', postId));
        // Remove the post from the UI
        const postBox = icon.closest('.posts-rectangular-box');
        postBox.remove();
    }
}

// Function to download the file directly
const downloadFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};
