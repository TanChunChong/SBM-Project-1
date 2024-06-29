window.addEventListener('DOMContentLoaded', function () {
    const icons = document.querySelectorAll('.savedPosts-like-icon, .vertical-saved-icon');

    icons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            toggleFillColor(icon);
        });
    });
});

function toggleFillColor(icon) {
    // Get the computed style of the icon
    const computedStyle = window.getComputedStyle(icon);

    // Check if the fill color is lightblue
    if (computedStyle.fill === 'lightblue' || computedStyle.fill === 'rgb(173, 216, 230)') {
        icon.style.fill = '#fff';
    } else {
        icon.style.fill = 'lightblue';
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