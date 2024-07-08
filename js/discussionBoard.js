import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve and display the username
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.greeting').textContent = "Hi, " + username;
    } else {
        console.log("Username not found in localStorage.");
        // Fetch username from Firestore if not found in localStorage
        auth.onAuthStateChanged((user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        document.querySelector('.greeting').textContent = "Hi, " + userData.username;
                    } else {
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
            } else {
                console.log("No user is signed in.");
            }
        });
    }

    // Adjust the height of the coloured layer
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    // Add event listener for the search icon
    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', toggleSearchBox);

    // Load topics and inject them into the DOM
    loadTopics();

    // Load posts and inject them into the DOM
    loadPosts();
});

function loadTopics() {
    const topicsContainer = document.querySelector('.topics-container');
    getDocs(collection(db, 'topics'))
        .then(topicsSnapshot => {
            topicsSnapshot.forEach(doc => {
                const topic = doc.data();
                const topicBox = document.createElement('a');
                topicBox.href = `viewPosts.html?topicID=${topic.topicname}`;
                topicBox.classList.add('topics-box');
                topicBox.innerHTML = `
                    <p class="topics-text">${topic.topicname}</p>
                    <p class="topics-posts-count">${topic.postsnumber} posts</p>
                `;
                topicsContainer.appendChild(topicBox);
            });
        })
        .catch(error => {
            console.error('Error fetching topics: ', error);
        });
}

function loadPosts() {
    const postsContainer = document.querySelector('.posts-container');
    getDocs(collection(db, 'posts'))
        .then(postsSnapshot => {
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                const postBox = document.createElement('div');
                postBox.classList.add('posts-rectangular-box');
                postBox.dataset.postId = doc.id; // Store the post ID in a data attribute

                // Extract and decode the file name
                let fileName = "";
                if (post.fileUrl) {
                    const url = new URL(post.fileUrl);
                    fileName = decodeURIComponent(url.pathname.split('/').pop().split('%2F').pop());
                }

                postBox.innerHTML = `
                    <div class="profile-image"></div>
                    <div class="posts-text-container">
                        <div class="title-and-username">
                            <p class="posts-title">${post.title}</p>
                            <p class="posts-username">${post.username}</p>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p class="posts-text-description">${post.description}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="posts-image">` : ''}
                    ${post.fileUrl ? `<a href="${post.fileUrl}" class="download-file">${fileName}</a>` : ''}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up posts-like-icon ${post.likedByUser ? 'liked' : ''}">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <p class="votes">${post.likes} votes</p>
                    <a href="viewSpecificPost.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square posts-comment-icon">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </a>
                    <p class="comments">${post.commentCount} comments</p>
                `;
                postsContainer.appendChild(postBox);
            });

            // Add event listener for like icons using event delegation
            postsContainer.addEventListener('click', function (event) {
                if (event.target.closest('.posts-like-icon')) {
                    const icon = event.target.closest('.posts-like-icon');
                    const postId = icon.closest('.posts-rectangular-box').dataset.postId;
                    toggleLike(icon, postId);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching posts: ', error);
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

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.coloured-layer');
    const postsContainer = document.querySelector('.posts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

function toggleSearchBox() {
    const greeting = document.querySelector('.greeting');
    const findTopics = document.querySelector('.find-topics');
    const searchIcon = document.querySelector('.search-icon');
    const searchBox = document.querySelector('.search-box');
    const searchCloseIcon = document.querySelector('.search-close-icon');

    if (searchBox.style.display === 'none') {
        // Show search elements
        greeting.style.display = 'none';
        findTopics.style.display = 'none';
        searchIcon.style.display = 'none';
        searchBox.style.display = 'block';
        searchCloseIcon.style.display = 'block';
    } else {
        // Hide search elements
        greeting.style.display = 'block';
        findTopics.style.display = 'block';
        searchIcon.style.display = 'block';
        searchBox.style.display = 'none';
        searchCloseIcon.style.display = 'none';
    }
}

const searchCloseIcon = document.querySelector('.search-close-icon');
searchCloseIcon.addEventListener('click', toggleSearchBox);

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
