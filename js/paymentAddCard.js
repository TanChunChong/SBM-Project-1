document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("focus", () => {
            input.nextElementSibling.style.top = "-20px";
        });
        input.addEventListener("blur", () => {
            if (input.value === "") {
                input.nextElementSibling.style.top = "0";
            }
        });
    });
});
