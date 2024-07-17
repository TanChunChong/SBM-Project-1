import { db } from './firebaseConfig.js';
import { collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    
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
    let selectedDate = null;  // Set to null initially
    let highlightedElement = null;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Function to update the current date in real time
    function updateCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString(undefined, options);
        console.log("Current date updated:", currentDateElement.textContent);
    }

    // Function to generate the calendar days
    function generateCalendar(month, year) {
        console.log("Generating calendar for month:", month, "year:", year);
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
            dayCell.addEventListener('click', function() {
                if (highlightedElement) {
                    highlightedElement.classList.remove('highlighted');
                }
                highlightedElement = dayCell;
                dayCell.classList.add('highlighted');

                selectedDate = new Date(year, month, i);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                currentDateElement.textContent = selectedDate.toLocaleDateString(undefined, options);
                console.log("Selected date:", selectedDate);
            });
            calendarDaysElement.appendChild(dayCell);
        }

        console.log("Calendar generated for", monthNameElement.textContent);
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
        let endTime = new Date(`1970-01-01T${endTimeElement.value}:00`);

        if (endTime < startTime) {
            // If end time is earlier than start time, assume it spans to the next day
            endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
        }

        if (startTime && endTime && startTime < endTime) {
            const duration = (endTime - startTime) / (1000 * 60); // Duration in minutes
            durationElement.value = `${duration} minutes`;
        } else {
            durationElement.value = '';
        }
        console.log("Duration calculated:", durationElement.value);
    }

    startTimeElement.addEventListener('input', calculateDuration);
    endTimeElement.addEventListener('input', calculateDuration);

    // Function to change the color of the add reminders section
    window.changeColor = function(color) {
        selectedColor = color;
        document.querySelector('.add-reminders').style.backgroundColor = color;
        console.log("Color changed to:", color);
    }

    // Initial setup
    updateCurrentDate();
    generateCalendar(currentMonth, currentYear);
    setInterval(updateCurrentDate, 1000); // Update the current date every second

    // Event listener for form submission
    document.querySelector('.add-button').addEventListener('click', async function() {
        const title = document.querySelector('input[placeholder="Title"]').value;
        const location = document.getElementById('location').value; // Changed to fetch from select element
        const startTime = startTimeElement.value;
        const endTime = endTimeElement.value;
        const duration = durationElement.value;
        const email = localStorage.getItem('email');

        // Check if a date is selected
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }

        const date = selectedDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

        // Check if title is provided
        if (!title) {
            alert('Please provide a title');
            return;
        }

        // Check if location is selected
        if (!location) {
            alert('Please select a location or video call');
            return;
        }

        // Check if start time and end time are provided
        if (!startTime || !endTime) {
            alert('Please provide both start time and end time');
            return;
        }

        // Check if start time and end time are the same
        if (startTime === endTime) {
            alert('Start time and end time cannot be the same');
            return;
        }

        // Check if a color is selected
        if (!selectedColor) {
            alert('Please select a color');
            return;
        }

        try {
            // Create a new document reference
            const docRef = doc(collection(db, 'reminders'));
            const reminderID = docRef.id; // Get the document ID

            // Add a new document to the reminders collection with the generated ID
            await setDoc(docRef, {
                title: title,
                location: location,
                startTime: startTime,
                endTime: endTime,
                timing: duration,
                date: date,
                color: selectedColor,
                email: email,
                reminderID: reminderID // Add the reminderID to the document
            });

            alert('Reminder added successfully!');
            console.log("Reminder added to Firestore:", { title, location, startTime, endTime, duration, date, selectedColor, email, reminderID });
            
            // Remove highlighting after successful submission
            if (highlightedElement) {
                highlightedElement.classList.remove('highlighted');
                highlightedElement = null;
            }
            selectedDate = null;  // Reset selected date after successful submission

            // Clear form fields
            document.querySelector('input[placeholder="Title"]').value = '';
            document.getElementById('location').value = ''; // Clear select field
            startTimeElement.value = '';
            endTimeElement.value = '';
            durationElement.value = '';
            selectedColor = '';  // Reset selected color
            document.querySelector('.add-reminders').style.backgroundColor = '';  // Reset background color
            currentDateElement.textContent = '';  // Reset displayed date
        } catch (e) {
            console.error('Error adding document: ', e);
        }
    });
});
