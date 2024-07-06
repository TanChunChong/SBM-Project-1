document.addEventListener('DOMContentLoaded', function () {
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
