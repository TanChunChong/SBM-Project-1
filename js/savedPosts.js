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
