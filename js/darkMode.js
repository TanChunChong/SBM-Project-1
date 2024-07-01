document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');
    const navBarLightMode = document.getElementById('nav-bar-light-mode');
    const navBarDarkMode = document.getElementById('nav-bar-dark-mode');

    // Check the saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        darkModeToggle.checked = true;
        darkModeStylesheet.disabled = false;
        navBarLightMode.disabled = true;
        navBarDarkMode.disabled = false;
    }

    darkModeToggle.addEventListener('change', (event) => {
        if (event.target.checked) {
            darkModeStylesheet.disabled = false;
            navBarLightMode.disabled = true;
            navBarDarkMode.disabled = false;
            localStorage.setItem('theme', 'dark');
        } else {
            darkModeStylesheet.disabled = true;
            navBarLightMode.disabled = false;
            navBarDarkMode.disabled = true;
            localStorage.setItem('theme', 'light');
        }
    });
});

// Apply dark mode when the page loads based on localStorage
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');
    const navBarLightMode = document.getElementById('nav-bar-light-mode');
    const navBarDarkMode = document.getElementById('nav-bar-dark-mode');

    if (savedTheme === 'dark') {
        darkModeStylesheet.disabled = false;
        navBarLightMode.disabled = true;
        navBarDarkMode.disabled = false;
    } else {
        darkModeStylesheet.disabled = true;
        navBarLightMode.disabled = false;
        navBarDarkMode.disabled = true;
    }
});
