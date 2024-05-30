document.addEventListener("DOMContentLoaded", function() {
    var boxContainer = document.getElementById("box-container");

    // Hide the box container initially
    boxContainer.style.display = "none";

    var payDiv = document.getElementById("pay");

    payDiv.addEventListener("click", function() {
        // Show the box container when pay is clicked
        boxContainer.style.display = "block";
    });
});

