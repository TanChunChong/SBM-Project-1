import { auth, db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.greeting').textContent = "Hi, " + username;
    } else {
        console.log("Username not found in localStorage.");
    }

    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', toggleSearchBox);

    const icons = document.querySelectorAll('.feather-bookmark, .posts-like-icon');
    icons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            toggleFillColor(icon);
        });
    });

    truncateText();
});

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

function toggleFillColor(icon) {
    icon.style.fill = (icon.style.fill === 'lightblue') ? '#fff' : 'lightblue';
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
            readMore.addEventListener('click', function() {
                description.textContent = words.join(' ');
                description.appendChild(readMoreLess);
            });

            const readMoreLess = document.createElement('span');
            readMoreLess.textContent = ' show less';
            readMoreLess.classList.add('read-more');
            readMoreLess.addEventListener('click', function() {
                description.textContent = truncatedText;
                description.appendChild(readMore);
            });

            description.textContent = truncatedText;
            description.appendChild(readMore);
        }
    });
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