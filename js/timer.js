const toggleButton = document.getElementById("toggleButton");
const resetButton = document.getElementById("resetButton");
const sandTop = document.querySelector(".sand-top");
const sandBottom = document.querySelector(".sand-bottom");
const stopwatchDisplay = document.getElementById("stopwatch");
const animationDuration = 2; // Change the animation duration here
let animationInterval;
let stopwatchInterval;
let isPlaying = false;
let seconds = 0;

function toggleAnimation() {
  if (isPlaying) {
    pauseAnimation();
  } else {
    startAnimation();
  }
}

function startAnimation() {
  sandTop.style.animation = `sandFallTop ${animationDuration}s linear forwards`;
  sandBottom.style.animation = `sandFallBottom ${animationDuration}s linear forwards`;
  clearInterval(animationInterval);
  stopwatchInterval = setInterval(updateStopwatch, 1000);
  isPlaying = true;
  toggleButton.textContent = "Pause";
}

function pauseAnimation() {
  sandTop.style.animationPlayState = "paused";
  sandBottom.style.animationPlayState = "paused";
  clearInterval(animationInterval);
  clearInterval(stopwatchInterval);
  isPlaying = false;
  toggleButton.textContent = "Resume";
}

function resetAnimation() {
  sandTop.style.animationPlayState = "paused";
  sandBottom.style.animationPlayState = "paused";
  clearInterval(animationInterval);
  isPlaying = false;
  toggleButton.textContent = "Start";
}

function updateStopwatch() {
  seconds++;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  stopwatchDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(num) {
  return num.toString().padStart(2, "0");
}

function resetAll() {
  pauseAnimation();
  seconds = 0;
  stopwatchDisplay.textContent = "00:00:00";
  sandTop.style.animation = "none";
  sandBottom.style.animation = "none";
  sandTop.offsetHeight;
  sandBottom.offsetHeight;
  isPlaying = false;
  toggleButton.textContent = "Start";
}

toggleButton.addEventListener("click", toggleAnimation);
resetButton.addEventListener("click", resetAll);