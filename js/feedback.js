function setRating(rating) {
    document.getElementById('rating').value = rating;
    // Remove color classes from all circles
    var circles = document.getElementsByClassName('circle');
    for (var i = 0; i < circles.length; i++) {
        circles[i].classList.remove('bad', 'ok', 'good');
    }
    // Add color class to the clicked circle
    document.getElementById(rating.toLowerCase()).classList.add(rating.toLowerCase());
}