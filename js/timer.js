let timer;
let seconds = 0;
const cupFill = document.querySelector('.cup-fill');
const steam = document.querySelector('.steam');
const stopwatch = document.getElementById('stopwatch');

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    seconds = 0;
    updateStopwatch();
    cupFill.style.height = '0';
    steam.style.opacity = '1';
    timer = setInterval(() => {
        seconds++;
        updateStopwatch();
        updateCupFill();
    }, 1000);
}

function updateStopwatch() {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    stopwatch.textContent = `${hrs}:${mins}:${secs}`;
}

function updateCupFill() {
    const maxSeconds = 60;
    const fillHeight = Math.min((seconds / maxSeconds) * 100, 100);
    cupFill.style.height = `${fillHeight}%`;

    if (fillHeight === 100) {
        clearInterval(timer);
        steam.style.opacity = '0';
    }
}
