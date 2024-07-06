function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.coloured-layer');
    const postsContainer = document.querySelector('.posts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.viewPost-coloured-layer');
    const postsContainer = document.querySelector('.viewPosts-container');
    colouredLayer.style.height = `calc(${postsContainer.offsetTop + postsContainer.offsetHeight}px - 70%)`;
}

document.addEventListener('DOMContentLoaded', function() {
    adjustColouredLayerHeight();
});
