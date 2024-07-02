document.addEventListener("DOMContentLoaded", function() {
    const currentMonthYear = document.getElementById('currentMonthYear');
    const dateRange = document.getElementById('dateRange');
    const tasksContainer = document.querySelector('.tasks');

    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Display current month and year
    currentMonthYear.textContent = `${monthNames[now.getMonth()]}, ${now.getFullYear()}`;

    // Number of date elements to display (odd number to center current date)
    const numberOfDates = 5;
    const middleIndex = Math.floor(numberOfDates / 2);

    for (let i = middleIndex; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        createAndAppendDateElement(date);
    }

    for (let i = 1; i <= middleIndex; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        createAndAppendDateElement(date);
    }

    function createAndAppendDateElement(date) {
        const dateElement = document.createElement('div');
        dateElement.className = 'date';
        if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            dateElement.classList.add('current-date-bold');
        }
        dateElement.innerHTML = `${date.getDate()}<br>${daysOfWeek[date.getDay()]}`;
        dateElement.onclick = function() {
            // Remove 'active' class from all dates except the current date
            document.querySelectorAll('.date').forEach(date => date.classList.remove('active'));
            // Add 'active' class to the clicked date
            this.classList.add('active');
        };
        dateRange.appendChild(dateElement);
    }

    // Function to load and display reminders
    function loadReminders() {
        let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        tasksContainer.innerHTML = '<div class="section-title">Today\'s task</div>'; // Reset the tasks container

        reminders.forEach(reminder => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';
            taskElement.innerHTML = `
                <div class="task-time">${reminder.startTime}</div>
                <div class="task-details task-${reminder.color}">
                    <div class="task-title">${reminder.title}</div>
                    <div class="task-info">
                        <div class="task-schedule">
                            <img src="../resources/clock.svg" alt="Clock Icon" class="icon"> ${reminder.startTime} - ${reminder.endTime} <br>
                            <img src="../resources/calendar2.svg" alt="Calendar Icon" class="icon"> ${reminder.date}
                        </div>
                        <div class="task-progress-circle">
                            <div class="task-progress">0%</div>
                        </div>
                    </div>
                </div>
            `;
            tasksContainer.appendChild(taskElement);
        });
    }

    // Initial load of reminders
    loadReminders();
});
