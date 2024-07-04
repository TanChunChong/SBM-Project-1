document.addEventListener('DOMContentLoaded', function () {
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    const likeIcons = document.querySelectorAll('.posts-like-icon');
    const savedIcons = document.querySelectorAll('.vertical-saved-icon');

    likeIcons.forEach(function (icon) {
        icon.addEventListener('click', function () {
            toggleFillColor(icon);
        });
    });

    savedIcons.forEach(function (icon) {
        icon.addEventListener('click', function () {
            toggleFillColor(icon);
        });
    });

    truncateText();
    displayTopicTitle();
    updateCreatePostLink(); // Call the function to update the create post link
});

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.viewPost-coloured-layer');
    const postsContainer = document.querySelector('.viewPosts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

function toggleFillColor(icon) {
    if (icon.style.fill === 'lightblue') {
        icon.style.fill = '#fff';
    } else {
        icon.style.fill = 'lightblue';
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

function displayTopicTitle() {
    const urlParams = new URLSearchParams(window.location.search);
    let topicID = urlParams.get('topicID');
    if (!topicID) {
        // Retrieve topic ID from localStorage if not found in URL parameters
        topicID = localStorage.getItem('currentTopicID');
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

// Replace this with actual server-side handling logic
const downloadFile = async () => {
    try {
        // Simulating server-side storage logic
        const fileData = "Sample file content"; // What is inside the text file
        const blob = new Blob([fileData], { type: 'application/octet-stream' });

        // Create a link element to trigger download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sample.txt'; // Replace with actual file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

// Event for clicking on download-file class
document.addEventListener('DOMContentLoaded', function () {
    const downloadLinks = document.querySelectorAll('.download-file');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            downloadFile();
        });
    });
});
