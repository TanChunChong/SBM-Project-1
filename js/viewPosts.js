import { db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc, query } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    truncateText();
    displayTopicTitle();
    updateCreatePostLink();
    loadPosts();

    const searchInput = document.querySelector('.viewPost-search-box');
    searchInput.addEventListener('input', filterPostsByTitle);
});

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.viewPost-coloured-layer');
    const postsContainer = document.querySelector('.viewPosts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

function truncateText() {
    const descriptions = document.querySelectorAll('.posts-text-description');
    descriptions.forEach(description => {
        const words = description.textContent.split(' ');
        if (words.length > 60) {
            const truncatedText = words.slice(0, 60).join(' ') + '... ';
            const readMore = document.createElement('span');
            readMore.textContent = 'read more';
            readMore.classList.add('read-more');
            readMore.addEventListener('click', function () {
                description.textContent = words.join(' ');
                description.appendChild(readMoreLess);
            });

            const readMoreLess = document.createElement('span');
            readMoreLess.textContent = ' show less';
            readMoreLess.classList.add('read-more');
            readMoreLess.addEventListener('click', function () {
                description.textContent = truncatedText;
                description.appendChild(readMore);
            });

            description.textContent = truncatedText;
            description.appendChild(readMore);
        }
    });
}

function displayTopicTitle() {
    const urlParams = new URLSearchParams(window.location.search);
    let topicID = urlParams.get('topicID');
    if (!topicID) {
        // Retrieve topic ID from localStorage if not found in URL parameters
        topicID = localStorage.getItem('currentTopicID');
    } else {
        // Store topic ID in localStorage
        localStorage.setItem('currentTopicID', topicID);
    }
    const topicTitleElement = document.querySelector('.topic-title');
    if (topicID) {
        topicTitleElement.textContent = topicID;
    }
}

function updateCreatePostLink() {
    const urlParams = new URLSearchParams(window.location.search);
    let topicID = urlParams.get('topicID');
    if (!topicID) {
        // Retrieve topic ID from localStorage if not found in URL parameters
        topicID = localStorage.getItem('currentTopicID');
    }
    const createPostLink = document.querySelector('.create-post-link');

    if (topicID && createPostLink) {
        createPostLink.href = `createPost.html?topicID=${encodeURIComponent(topicID)}`;
    }
}

function loadPosts() {
    const postsContainer = document.querySelector('.viewPosts-container');
    const urlParams = new URLSearchParams(window.location.search);
    const topicID = urlParams.get('topicID');

    if (!topicID) {
        console.error('No topicID specified in the URL.');
        return;
    }

    const postsQuery = query(
        collection(db, 'posts')
    );

    getDocs(postsQuery)
        .then(postsSnapshot => {
            const userPromises = {};
            const filteredPosts = [];

            postsSnapshot.forEach(postDoc => {
                const post = postDoc.data();
                if (post.topicID === topicID) {
                    filteredPosts.push(post);
                    if (!userPromises[post.username]) {
                        const userDocRef = doc(db, 'users', post.userId);
                        userPromises[post.username] = getDoc(userDocRef);
                    }
                }
            });

            Promise.all(Object.values(userPromises)).then(userSnapshots => {
                const usersData = {};
                userSnapshots.forEach(userDoc => {
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        usersData[userData.username] = userData;
                    }
                });

                postsContainer.innerHTML = ''; // Clear existing posts before appending

                filteredPosts.forEach(post => {
                    const postBox = document.createElement('div');
                    postBox.classList.add('posts-rectangular-box');
                    postBox.dataset.postId = post.id;

                    let fileName = "";
                    if (post.fileUrl) {
                        const url = new URL(post.fileUrl);
                        fileName = decodeURIComponent(url.pathname.split('/').pop().split('%2F').pop());
                    }

                    const user = usersData[post.username];
                    const userAvatar = user ? user.imagepath : '../resources/default-avatar.png';

                    postBox.innerHTML = `
                        <div class="profile-image" style="background-image: url(${userAvatar});"></div>
                        <div class="posts-text-container">
                            <div class="title-and-username">
                                <p class="posts-title">${post.title}</p>
                                <p class="posts-username">${post.username}</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon" data-saved="false">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p class="posts-text-description">${post.description}</p>
                        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="posts-image">` : ''}
                        ${post.fileUrl ? `<a href="${post.fileUrl}" class="download-file" data-url="${post.fileUrl}" data-filename="${fileName}">${fileName}</a>` : ''}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up posts-like-icon ${post.likedByUser ? 'liked' : ''}">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        <p class="votes">${post.likes} votes</p>
                        <a href="viewSpecificPost.html?postId=${post.postsID}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square posts-comment-icon">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </a>
                        <p class="comments">${post.commentCount} comments</p>
                    `;
                    postsContainer.appendChild(postBox);
                });

                postsContainer.addEventListener('click', function (event) {
                    if (event.target.closest('.posts-like-icon')) {
                        const icon = event.target.closest('.posts-like-icon');
                        const postId = icon.closest('.posts-rectangular-box').dataset.postId;
                        toggleLike(icon, postId);
                    }

                    if (event.target.closest('.vertical-saved-icon')) {
                        const icon = event.target.closest('.vertical-saved-icon');
                        const postId = icon.closest('.posts-rectangular-box').dataset.postId;
                        toggleSaved(icon, postId);
                    }

                    if (event.target.closest('.download-file')) {
                        event.preventDefault();
                        const link = event.target.closest('.download-file');
                        const url = link.getAttribute('data-url');
                        const fileName = link.getAttribute('data-filename');
                        console.log(`Downloading file from: ${url} with filename: ${fileName}`); // Debugging line
                        fetchAndDownloadFile(url, fileName);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching posts: ', error);
        });
}

function filterPostsByTitle() {
    const searchInput = document.querySelector('.viewPost-search-box');
    const query = searchInput.value.toLowerCase();
    const postsContainer = document.querySelector('.viewPosts-container');
    const postBoxes = postsContainer.querySelectorAll('.posts-rectangular-box');

    postBoxes.forEach(postBox => {
        const titleElement = postBox.querySelector('.posts-title');
        if (titleElement.textContent.toLowerCase().includes(query)) {
            postBox.style.display = 'block';
        } else {
            postBox.style.display = 'none';
        }
    });
}

function toggleLike(icon, postId) {
    const postDocRef = doc(db, 'posts', postId);
    getDoc(postDocRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            const postData = docSnapshot.data();
            const currentLikes = postData.likes || 0;
            const newLikes = icon.classList.contains('liked') ? currentLikes - 1 : currentLikes + 1;

            updateDoc(postDocRef, { likes: newLikes })
                .then(() => {
                    icon.classList.toggle('liked');
                    const likesCountElement = icon.nextElementSibling;
                    likesCountElement.textContent = `${newLikes} votes`;
                })
                .catch(error => {
                    console.error('Error updating likes: ', error);
                });
        } else {
            console.error('No such post!');
        }
    }).catch(error => {
        console.error('Error getting post:', error);
    });
}

function toggleSaved(icon, postsId) {
    const postDocRef = doc(db, 'posts', postsId);
    getDoc(postDocRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            const isSaved = icon.getAttribute('data-saved') === 'true';
            updateDoc(postDocRef, { saved: !isSaved })
                .then(() => {
                    icon.setAttribute('data-saved', !isSaved);
                    icon.classList.toggle('saved', !isSaved);
                })
                .catch(error => {
                    console.error('Error updating saved status: ', error);
                });
        } else {
            console.error('No such post!');
        }
    }).catch(error => {
        console.error('Error getting post:', error);
    });
}

function fetchAndDownloadFile(url, fileName) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading file:', error));
}
