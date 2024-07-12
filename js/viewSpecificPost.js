import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (postId) {
        loadPostDetails(postId);
        loadComments(postId);
    }

    const commentInput = document.querySelector('.comment-input');
    const sendIcon = document.querySelector('.send-icon');

    // Function to handle sending the comment
    async function sendComment() {
        const comment = commentInput.value.trim();
        if (comment !== '') {
            const username = localStorage.getItem('username'); // Get username from local storage

            if (!username) {
                console.error('No username found in local storage');
                return;
            }

            try {
                // Add the comment to Firestore
                const newComment = {
                    comment: comment,
                    likes: "0",
                    postsID: postId,
                    username: username
                };

                await addDoc(collection(db, 'comments'), newComment);
                console.log('Comment added:', newComment);

                // Update comment count in posts collection
                await updateCommentCount(postId);

                // Clear input after sending
                commentInput.value = '';
                loadComments(postId); // Reload comments after adding new one
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    }

    // Function to update comment count in posts collection
    async function updateCommentCount(postId) {
        try {
            const commentsQuery = query(collection(db, 'comments'), where('postsID', '==', postId));
            const querySnapshot = await getDocs(commentsQuery);
            const commentCount = querySnapshot.size;

            const postDocRef = doc(db, 'posts', postId);
            await updateDoc(postDocRef, {
                commentCount: commentCount
            });
            console.log('Comment count updated successfully');
        } catch (error) {
            console.error('Error updating comment count:', error);
        }
    }

    // Event listener for click on the send icon
    sendIcon.addEventListener('click', sendComment);
});

async function loadPostDetails(postId) {
    try {
        console.log("Fetching post with postsID:", postId); // Debugging statement
        const postsQuery = query(collection(db, 'posts'), where('postsID', '==', parseInt(postId)));
        const querySnapshot = await getDocs(postsQuery);

        if (!querySnapshot.empty) {
            const postDoc = querySnapshot.docs[0];
            const post = postDoc.data();
            console.log("Post data retrieved:", post); // Debugging statement
            const user = await loadUserDetails(post.userId); // Fetch user details by userId
            displayPost(post, user, postDoc.id);
        } else {
            console.error('No such post!');
        }
    } catch (error) {
        console.error('Error getting post:', error);
    }
}

async function loadUserDetails(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data retrieved:", userData); // Debugging statement
            return userData;
        } else {
            console.error('No such user!');
            return null;
        }
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

async function loadComments(postId) {
    try {
        const commentsQuery = query(collection(db, 'comments'), where('postsID', '==', postId));
        const querySnapshot = await getDocs(commentsQuery);
        const commentsContainer = document.querySelector('.replies-container');

        commentsContainer.innerHTML = ''; // Clear existing comments

        for (const commentDoc of querySnapshot.docs) {
            const comment = commentDoc.data();
            const user = await loadUserDetailsByUsername(comment.username);
            displayComment(comment, user);
        }

        // Update the replies count in the DOM
        const commentCount = querySnapshot.size;
        document.querySelector('.replies-text').textContent = `Replies (${commentCount})`;

        // Update the comment count in Firestore
        await updateCommentCountInPost(postId, commentCount);
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function updateCommentCountInPost(postId, commentCount) {
    try {
        const postsQuery = query(collection(db, 'posts'), where('postsID', '==', parseInt(postId)));
        const querySnapshot = await getDocs(postsQuery);

        if (!querySnapshot.empty) {
            const postDoc = querySnapshot.docs[0];
            const postDocRef = doc(db, 'posts', postDoc.id);

            await updateDoc(postDocRef, {
                commentCount: commentCount
            });

            console.log('Comment count updated successfully in post');
        } else {
            console.error('No post found with postsID:', postId);
        }
    } catch (error) {
        console.error('Error updating comment count in post:', error);
    }
}

async function loadUserDetailsByUsername(username) {
    try {
        const usersQuery = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        } else {
            console.error('No user found with username:', username);
            return null;
        }
    } catch (error) {
        console.error('Error getting user details by username:', error);
        return null;
    }
}

function displayPost(post, user, postDocId) {
    const postContainer = document.getElementById('post-container');
    const fileName = post.fileUrl ? decodeURIComponent(new URL(post.fileUrl).pathname.split('/').pop().split('%2F').pop()) : '';
    const userAvatar = user ? user.imagepath : '../resources/default-avatar.png';

    console.log("Displaying post with user avatar:", userAvatar); // Debugging statement

    postContainer.innerHTML = `
        <div class="profile-image" style="background-image: url('${userAvatar}');"></div>
        <div class="posts-text-container">
            <div class="main-title-and-username">
                <p class="mainPosts-title">${post.title}</p>
                <p class="mainPosts-username">${post.username}</p>
            </div>
            <p class="posts-text-description">${post.description}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="sampleImage">` : ''}
            ${post.fileUrl ? `<a href="${post.fileUrl}" class="download-file">${fileName}</a>` : ''}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <div class="likes-section">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up savedPosts-like-icon">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <p class="votes">${post.likes} votes</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square posts-comment-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p class="comments">${post.commentCount} comments</p>
    `;

    const likeIcon = postContainer.querySelector('.feather-thumbs-up');
    const likesCountElement = postContainer.querySelector('.votes');
    
    likeIcon.addEventListener('click', async () => {
        likeIcon.classList.toggle('liked');
        if (likeIcon.classList.contains('liked')) {
            likeIcon.style.stroke = 'blue';
            likeIcon.style.fill = 'blue';
            post.likes += 1;
        } else {
            likeIcon.style.stroke = '';
            likeIcon.style.fill = '';
            post.likes -= 1;
        }
        likesCountElement.textContent = `${post.likes} votes`;
        await updateLikesCount(postDocId, post.likes);
    });
}

function displayComment(comment, user) {
    const commentsContainer = document.querySelector('.replies-container');
    const userAvatar = user ? user.imagepath : '../resources/default-avatar.png';

    const commentHTML = `
        <div class="replies-rectangular-box">
            <div class="profile-image" style="background-image: url('${userAvatar}');"></div>
            <div class="replies-text-container">
                <div class="title-and-username">
                    <p class="replies-username">${comment.username}</p>
                </div>
            </div>
            <p class="posts-text-description">${comment.comment}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up savedPosts-like-icon">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <p class="votes">${comment.likes} votes</p>
        </div>
    `;

    commentsContainer.innerHTML += commentHTML;

    // Add like functionality to comments
    const likeIcon = commentsContainer.querySelector('.replies-rectangular-box:last-child .feather-thumbs-up');
    const likesCountElement = commentsContainer.querySelector('.replies-rectangular-box:last-child .votes');

    likeIcon.addEventListener('click', async () => {
        likeIcon.classList.toggle('liked');
        if (likeIcon.classList.contains('liked')) {
            likeIcon.style.stroke = 'blue';
            likeIcon.style.fill = 'blue';
            comment.likes = parseInt(comment.likes) + 1;
        } else {
            likeIcon.style.stroke = '';
            likeIcon.style.fill = '';
            comment.likes = parseInt(comment.likes) - 1;
        }
        likesCountElement.textContent = `${comment.likes} votes`;
        await updateCommentLikes(comment.id, comment.likes);
    });
}

async function updateLikesCount(postDocId, newLikesCount) {
    try {
        const postRef = doc(db, 'posts', postDocId);
        await updateDoc(postRef, {
            likes: newLikesCount
        });
        console.log('Likes count updated successfully');
    } catch (error) {
        console.error('Error updating likes count:', error);
    }
}

async function updateCommentLikes(commentId, newLikesCount) {
    try {
        const commentRef = doc(db, 'comments', commentId);
        await updateDoc(commentRef, {
            likes: newLikesCount.toString()
        });
        console.log('Comment likes count updated successfully');
    } catch (error) {
        console.error('Error updating comment likes count:', error);
    }
}
