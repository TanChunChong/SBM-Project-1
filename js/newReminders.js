document.addEventListener("DOMContentLoaded", function() {
    const currentDateElement = document.getElementById('currentDate');
    const startTimeElement = document.getElementById('startTime');
    const endTimeElement = document.getElementById('endTime');
    const durationElement = document.getElementById('duration');
    const calendarDaysElement = document.getElementById('calendarDays');
    const monthNameElement = document.getElementById('monthName');
    const prevMonthElement = document.getElementById('prevMonth');
    const nextMonthElement = document.getElementById('nextMonth');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedColor = '';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Function to update the current date in real time
    function updateCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString(undefined, options);
    }

    // Function to generate the calendar days
    function generateCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendarDaysElement.innerHTML = '';
        monthNameElement.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

        // Add days of the week headers
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarDaysElement.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDaysElement.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = i;
            calendarDaysElement.appendChild(dayCell);
        }
    }

    // Event listeners for month navigation
    prevMonthElement.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });

    nextMonthElement.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    // Event listener for start and end time to calculate duration
    function calculateDuration() {
        const startTime = new Date(`1970-01-01T${startTimeElement.value}:00`);
        const endTime = new Date(`1970-01-01T${endTimeElement.value}:00`);

        if (startTime && endTime && startTime < endTime) {
            const duration = (endTime - startTime) / (1000 * 60); // Duration in minutes
            durationElement.value = `${duration} minutes`;
        } else {
            durationElement.value = '';
        }
    }

    startTimeElement.addEventListener('input', calculateDuration);
    endTimeElement.addEventListener('input', calculateDuration);

    // Function to change the color of the add reminders section
    window.changeColor = function(color) {
        selectedColor = color;
        document.querySelector('.add-reminders').style.backgroundColor = color;
    }

    // Initial setup
    updateCurrentDate();
    generateCalendar(currentMonth, currentYear);
    setInterval(updateCurrentDate, 1000); // Update the current date every second
});
