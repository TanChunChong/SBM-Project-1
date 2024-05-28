window.addEventListener('DOMContentLoaded', function () {
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
});

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.coloured-layer');
    const postsContainer = document.querySelector('.posts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

function toggleSearchBox() {
    const elements = ['.greeting', '.find-topics', '.search-icon', '.search-box', '.search-close-icon'];
    elements.forEach(function(selector) {
        const element = document.querySelector(selector);
        element.style.display = (element.style.display === 'none') ? 'block' : 'none';
    });
}

function toggleFillColor(icon) {
    icon.style.fill = (icon.style.fill === 'lightblue') ? '#fff' : 'lightblue';
}
