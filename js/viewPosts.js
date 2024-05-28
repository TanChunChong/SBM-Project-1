window.addEventListener('DOMContentLoaded', function () {
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);

    const likeIcons = document.querySelectorAll('.posts-like-icon');
    const savedIcons = document.querySelectorAll('.vertical-saved-icon');

    likeIcons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            toggleFillColor(icon);
        });
    });

    savedIcons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            toggleFillColor(icon);
        });
    });
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
