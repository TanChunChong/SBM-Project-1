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

    truncateText();
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
