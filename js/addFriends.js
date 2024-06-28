document.addEventListener("DOMContentLoaded", () => {
    const searchIcon = document.getElementById("searchIcon");
    const profilePicture = document.getElementById("profilePicture");
    const profileLink = document.getElementById("profileLink");
    const searchBar = document.getElementById("searchBar");
    const closeIcon = document.getElementById("closeIcon");

    searchIcon.addEventListener("click", () => {
        profilePicture.style.display = "none";
        profileLink.style.display = "none";
        searchIcon.style.display = "none";
        searchBar.style.display = "flex";
    });

    closeIcon.addEventListener("click", () => {
        searchBar.style.display = "none";
        profilePicture.style.display = "block";
        profileLink.style.display = "block";
        searchIcon.style.display = "block";
    });
});
