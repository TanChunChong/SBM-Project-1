document.addEventListener('DOMContentLoaded', function () {
    const postBox = document.querySelector('.mainPosts-rectangular-box');
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));

    if (selectedPost) {
        const fileName = selectedPost.fileUrl ? new URL(selectedPost.fileUrl).pathname.split('/').pop().split('%2F').pop() : '';

        postBox.innerHTML = `
            <div class="profile-image"></div>
            <div class="posts-text-container">
                <div class="main-title-and-username">
                    <p class="mainPosts-title">${selectedPost.title}</p>
                    <p class="mainPosts-username">${selectedPost.username}</p>
                </div>
                <p class="posts-text-description">${selectedPost.description}</p>
                ${selectedPost.imageUrl ? `<img src="${selectedPost.imageUrl}" alt="Description of image" class="sampleImage">` : ''}
                ${selectedPost.fileUrl ? `<a href="${selectedPost.fileUrl}" class="download-file">${decodeURIComponent(fileName)}</a>` : ''}
                <p class="votes">${selectedPost.likes} votes</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark vertical-saved-icon">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up savedPosts-like-icon">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <p class="votes">${selectedPost.likes} votes</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square posts-comment-icon">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p class="comments">${selectedPost.commentCount} comments</p>
            </div>
        `;
    } else {
        console.error('No post data found');
    }

    const commentInput = document.querySelector('.comment-input');
    const sendIcon = document.querySelector('.send-icon');

    // Function to handle sending the comment
    function sendComment() {
        const comment = commentInput.value.trim();
        if (comment !== '') {
            // Your logic to handle sending the comment
            console.log('Comment sent:', comment);
            commentInput.value = ''; // Clear input after sending
        }
    }

    // Event listener for click on the send icon
    sendIcon.addEventListener('click', sendComment);
});
