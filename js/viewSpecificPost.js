import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (postId) {
        loadPostDetails(postId);
        loadComments(postId);
    }

    const commentInput = document.querySelector('.comment-input');
    const sendIcon = document.querySelector('.send-icon');

    sendIcon.addEventListener('click', sendComment);

    async function sendComment() {
        const comment = commentInput.value.trim();
        if (comment !== '') {
            const username = localStorage.getItem('username'); // Get username from local storage
            const userId = localStorage.getItem('userId'); // Get userID from local storage

            if (!username || !userId) {
                console.error('No username or userID found in local storage');
                return;
            }

            try {
                const newComment = {
                    comment: comment,
                    likes: "0",
                    postsID: postId,
                    username: username,
                    userId: userId, // Add userId to the comment
                    commentID: ""
                };

                const docRef = await addDoc(collection(db, 'comments'), newComment);
                newComment.commentID = docRef.id; // Assign the document ID as commentID
                await updateDoc(docRef, { commentID: docRef.id });

                console.log('Comment added:', newComment);

                const newCommentCount = await updateCommentCount(postId);

                commentInput.value = '';
                await loadComments(postId); // Reload comments after adding new one

                document.querySelector('.comments').textContent = `${newCommentCount} comments`;

            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    }

    async function updateCommentCount(postId) {
        try {
            const commentsQuery = query(collection(db, 'comments'), where('postsID', '==', postId));
            const querySnapshot = await getDocs(commentsQuery);
            const commentCount = querySnapshot.size;

            const postsQuery = query(collection(db, 'posts'), where('postsID', '==', parseInt(postId)));
            const querySnapshotPosts = await getDocs(postsQuery);

            if (!querySnapshotPosts.empty) {
                const postDoc = querySnapshotPosts.docs[0];
                const postDocRef = doc(db, 'posts', postDoc.id);

                await updateDoc(postDocRef, { commentCount: commentCount });

                console.log('Comment count updated successfully in post');
            } else {
                console.error('No post found with postsID:', postId);
            }

            return commentCount;

        } catch (error) {
            console.error('Error updating comment count:', error);
        }
    }
});

async function loadPostDetails(postId) {
    try {
        const postsQuery = query(collection(db, 'posts'), where('postsID', '==', parseInt(postId)));
        const querySnapshot = await getDocs(postsQuery);

        if (!querySnapshot.empty) {
            const postDoc = querySnapshot.docs[0];
            const post = postDoc.data();
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
            comment.id = commentDoc.id; // Add the document ID to the comment object
            const user = await loadUserDetailsByUsername(comment.username);
            displayComment(comment, user);
        }

        const commentCount = querySnapshot.size;
        document.querySelector('.replies-text').textContent = `Replies (${commentCount})`;

        await updateCommentCountInPost(postId, commentCount);
        attachLikeEventListeners(); // Attach event listeners to like buttons

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

            await updateDoc(postDocRef, { commentCount: commentCount });

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

    postContainer.innerHTML = `
        <div class="profile-image" style="background-image: url('${userAvatar}');"></div>
        <div class="posts-text-container">
            <div class="main-title-and-username">
                <p class="mainPosts-title">${post.title}</p>
                <p class="mainPosts-username">${post.username}</p>
            </div>
            <p class="posts-text-description">${post.description}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Description of image" class="sampleImage">` : ''}
            ${post.fileUrl ? `<a href="#" class="download-file" data-url="${post.fileUrl}" data-filename="${fileName}">${fileName}</a>` : ''}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon" data-saved="false" data-post-id="${postDocId}">
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

    const bookmarkIcon = postContainer.querySelector('.feather-bookmark');
    
    bookmarkIcon.addEventListener('click', async () => {
        const isSaved = bookmarkIcon.getAttribute('data-saved') === 'true';
        const username = localStorage.getItem('username');
        
        if (!username) {
            console.error('Username is not available in localStorage');
            return;
        }

        if (isSaved) {
            // Unsave the post
            const savesQuery = query(
                collection(db, 'saves'),
                where('userWhoSavedPost', '==', username),
                where('postsID', '==', post.postsID)
            );
            const querySnapshot = await getDocs(savesQuery);
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
                bookmarkIcon.setAttribute('data-saved', 'false');
                bookmarkIcon.classList.remove('saved');
            });
        } else {
            // Save the post
            const saveData = {
                commentCount: post.commentCount,
                createdAt: post.createdAt,
                description: post.description,
                fileUrl: post.fileUrl,
                imageUrl: post.imageUrl,
                likes: post.likes,
                postsID: post.postsID,
                title: post.title,
                topicID: post.topicID,
                userID: post.userId,
                userWhoSavedPost: username,
                username: post.username,
            };
            await addDoc(collection(db, 'saves'), saveData);
            bookmarkIcon.setAttribute('data-saved', 'true');
            bookmarkIcon.classList.add('saved');
        }
    });

    // Check if the post is already saved for the user
    checkIfPostIsSaved(post.postsID);
}

async function checkIfPostIsSaved(postId) {
    const username = localStorage.getItem('username');
    if (!username) {
        console.error('Username is not available in localStorage');
        return;
    }

    const savesQuery = query(collection(db, 'saves'), where('userWhoSavedPost', '==', username), where('postsID', '==', postId));
    const querySnapshot = await getDocs(savesQuery);

    if (!querySnapshot.empty) {
        const bookmarkIcon = document.querySelector('.feather-bookmark');
        bookmarkIcon.setAttribute('data-saved', 'true');
        bookmarkIcon.classList.add('saved');
    }
}

async function updateLikesCount(postDocId, newLikesCount) {
    try {
        const postRef = doc(db, 'posts', postDocId);
        await updateDoc(postRef, { likes: newLikesCount });
        console.log('Likes count updated successfully');
    } catch (error) {
        console.error('Error updating likes count:', error);
    }
}

async function updateCommentLikes(commentId, newLikesCount) {
    try {
        if (!commentId) {
            throw new Error('Comment ID is null or undefined');
        }
        const commentRef = doc(db, 'comments', commentId);
        await updateDoc(commentRef, { likes: newLikesCount.toString() });
        console.log(`Comment likes count updated successfully for comment ID: ${commentId}`);
    } catch (error) {
        console.error('Error updating comment likes count:', error);
    }
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
                <p class="posts-text-description">${comment.comment}</p>
            </div>
            <div class="likes-section">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up savedPosts-like-icon" data-comment-id="${comment.commentID}">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <p class="votes">${comment.likes} votes</p>
            </div>
        </div>
    `;

    commentsContainer.innerHTML += commentHTML;
}

function attachLikeEventListeners() {
    const likeIcons = document.querySelectorAll('.feather-thumbs-up');

    likeIcons.forEach(likeIcon => {
        const commentId = likeIcon.getAttribute('data-comment-id');
        if (!commentId) {
            console.error('No comment ID found for like icon', likeIcon);
            return;
        }
        const likesCountElement = likeIcon.nextElementSibling;

        likeIcon.addEventListener('click', async () => {
            likeIcon.classList.toggle('liked');
            let likesCount = parseInt(likesCountElement.textContent);
            if (likeIcon.classList.contains('liked')) {
                likeIcon.style.stroke = 'blue';
                likeIcon.style.fill = 'blue';
                likesCount += 1;
            } else {
                likeIcon.style.stroke = '';
                likeIcon.style.fill = '';
                likesCount -= 1;
            }
            likesCountElement.textContent = `${likesCount} votes`;
            await updateCommentLikes(commentId, likesCount);
        });
    });
}
