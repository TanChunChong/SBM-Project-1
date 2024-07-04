import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

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

    // Truncate the text
    truncateText();

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
                postBox.setAttribute('data-doc-id', doc.id);

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
                    <p class="posts-text-description">${post.description}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="posts-image">` : ''}
                    ${post.fileUrl ? `<a href="${post.fileUrl}" class="download-file">${fileName}</a>` : ''}
                    <div class="post-actions">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up posts-like-icon" data-liked="false">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        <p class="votes">${post.likes} likes</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square posts-comment-icon">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p class="comments">${post.commentCount} comments</p>
                    </div>
                `;
                postsContainer.appendChild(postBox);

                // Add click event listener to the post box
                postBox.addEventListener('click', () => {
                    localStorage.setItem('selectedPost', JSON.stringify(post));
                    window.location.href = 'viewSpecificPost.html';
                });

                // Add event listener to the like button
                const likeButton = postBox.querySelector('.posts-like-icon');
                likeButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent the click event from propagating to the post box
                    toggleLike(postBox, likeButton);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching posts: ', error);
        });
}

async function toggleLike(postBox, likeButton) {
    const docId = postBox.getAttribute('data-doc-id');
    const likesCountElement = postBox.querySelector('.votes');
    let currentLikes = parseInt(likesCountElement.textContent);

    // Check if the post is liked or not
    const isLiked = likeButton.getAttribute('data-liked') === 'true';

    try {
        const postRef = doc(db, 'posts', docId);
        if (isLiked) {
            // Unlike the post
            await updateDoc(postRef, {
                likes: increment(-1)
            });
            currentLikes -= 1;
            likeButton.style.fill = '#fff'; // Change to default color
            likeButton.setAttribute('data-liked', 'false');
        } else {
            // Like the post
            await updateDoc(postRef, {
                likes: increment(1)
            });
            currentLikes += 1;
            likeButton.style.fill = 'lightblue'; // Change to liked color
            likeButton.setAttribute('data-liked', 'true');
        }
        likesCountElement.textContent = `${currentLikes} likes`;
    } catch (error) {
        console.error('Error updating likes:', error);
    }
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

const searchCloseIcon = document.querySelector('.search-close-icon');
searchCloseIcon.addEventListener('click', toggleSearchBox);

function toggleFillColor(icon) {
    icon.style.fill = (icon.style.fill === 'lightblue') ? '#fff' : 'lightblue';
}
