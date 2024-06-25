document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.username').textContent = username;
    } else {
        console.log("Username not found in localStorage.");
    }
});