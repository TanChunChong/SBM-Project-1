import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function() {
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
            // Fetch and display reminders for the selected date
            displayRemindersForSelectedDate(date);
        };
        dateRange.appendChild(dateElement);
    }

    // Fetch and display reminders
    async function displayRemindersForSelectedDate(selectedDate) {
        tasksContainer.innerHTML = ''; // Clear previous reminders
        const email = localStorage.getItem('email');
        const remindersQuery = query(collection(db, 'reminders'), where('email', '==', email), where('date', '==', selectedDate.toISOString().split('T')[0]));
        const querySnapshot = await getDocs(remindersQuery);

        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} task`;
        tasksContainer.appendChild(sectionTitle);

        querySnapshot.forEach((doc) => {
            const reminder = doc.data();
            displayReminder(reminder, doc.id, tasksContainer);
        });
    }

    function displayReminder(reminder, docId, container) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';

        const taskTimeDiv = document.createElement('div');
        taskTimeDiv.className = 'task-time';
        taskTimeDiv.textContent = new Date(`1970-01-01T${reminder.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const taskDetailsDiv = document.createElement('div');
        taskDetailsDiv.className = `task-details task-${reminder.color}`;

        const taskTitleDiv = document.createElement('div');
        taskTitleDiv.className = 'task-title';
        taskTitleDiv.textContent = reminder.title;

        const taskInfoDiv = document.createElement('div');
        taskInfoDiv.className = 'task-info';

        const taskScheduleDiv = document.createElement('div');
        taskScheduleDiv.className = 'task-schedule';
        taskScheduleDiv.innerHTML = `
            <img src="../resources/clock.svg" alt="Clock Icon" class="icon"> ${new Date(`1970-01-01T${reminder.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${reminder.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br>
            <img src="../resources/calendar2.svg" alt="Calendar Icon" class="icon"> ${new Date(reminder.date).toLocaleDateString()} <br>
            <img src="../resources/map-pin.svg" alt="Location Icon" class="icon"> ${reminder.location}
        `;

        const taskProgressCircleDiv = document.createElement('div');
        taskProgressCircleDiv.className = 'task-progress-circle';
        taskProgressCircleDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path>
            </svg>
        `;
        
        taskProgressCircleDiv.addEventListener('click', async function() {
            try {
                await deleteDoc(doc(db, 'reminders', docId));
                taskDiv.remove();
                console.log("Reminder deleted:", docId);
            } catch (e) {
                console.error("Error deleting reminder:", e);
            }
        });

        taskInfoDiv.appendChild(taskScheduleDiv);
        taskInfoDiv.appendChild(taskProgressCircleDiv);
        taskDetailsDiv.appendChild(taskTitleDiv);
        taskDetailsDiv.appendChild(taskInfoDiv);
        taskDiv.appendChild(taskTimeDiv);
        taskDiv.appendChild(taskDetailsDiv);
        container.appendChild(taskDiv);
    }

    // Initial setup
    displayRemindersForSelectedDate(now);
});
