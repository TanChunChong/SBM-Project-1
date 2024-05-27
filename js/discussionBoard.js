window.addEventListener('DOMContentLoaded', function () {
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', toggleSearchBox);
});

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.coloured-layer');
    const verticalRectangularContainer = document.querySelector('.posts-container');
    const verticalRectangularBoxes = document.querySelectorAll('.posts-rectangular-box');

    // Calculate the total height of the vertical rectangular boxes
    const totalVerticalRectangularBoxesHeight = Array.from(verticalRectangularBoxes).reduce((acc, box) => acc + box.offsetHeight, 0);

    // Calculate the height of the content area including the top and bottom margin of the vertical rectangular container
    const contentHeight = verticalRectangularContainer.offsetTop + verticalRectangularContainer.offsetHeight;

    // Set the height of the coloured layer to cover the entire content
    colouredLayer.style.height = `${contentHeight}px`;
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
