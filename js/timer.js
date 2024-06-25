document.addEventListener('DOMContentLoaded', function () {
    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const steam = document.getElementById('steam');
    const cupWater = document.getElementById('cup-water');
    let timerInterval;
    let secondsElapsed = 0;

    function updateTimerDisplay() {
        const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(secondsElapsed % 60).padStart(2, '0');
        timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    function startTimer() {
        steam.style.display = 'inline-block';
        startButton.textContent = 'Stop';
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateTimerDisplay();
            updateWaterLevel();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        steam.style.display = 'none';
        startButton.textContent = 'Start';
    }

    function resetTimer() {
        stopTimer();
        secondsElapsed = 0;
        updateTimerDisplay();
        cupWater.style.clipPath = 'inset(331px 0 0 0)';
    }

    function updateWaterLevel() {
        const maxWaterHeight = 331;
        const maxTime = 7200; // Change time unit in seconds
        const filledHeight = Math.min((secondsElapsed / maxTime) * maxWaterHeight, maxWaterHeight);
        cupWater.style.clipPath = `inset(${maxWaterHeight - filledHeight}px 0 0 0)`;
    }

    startButton.addEventListener('click', () => {
        if (startButton.textContent === 'Start') {
            startTimer();
        } else {
            stopTimer();
        }
    });

    resetButton.addEventListener('click', resetTimer);
});
