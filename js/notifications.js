import { auth, db } from "../js/firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Selector for notification container
const notificationContainer = document.querySelector(".notification-container");

// Function to display notifications
function displayNotification(notificationData, otherUserImage, otherUsername) {
  const notificationElement = document.createElement("div");
  notificationElement.className = "notification";

  const profilePicElement = document.createElement("div");
  profilePicElement.className = "profile-pic";
  profilePicElement.style.backgroundImage = `url(${otherUserImage})`;

  const notificationContentElement = document.createElement("div");
  notificationContentElement.className = "notification-content";

  const notificationHeaderElement = document.createElement("div");
  notificationHeaderElement.className = "notification-header";

  const usernameElement = document.createElement("div");
  usernameElement.className = "username";
  usernameElement.textContent = otherUsername;

  const notificationTimeElement = document.createElement("div");
  notificationTimeElement.className = "notification-time";
  notificationTimeElement.textContent = new Date(
    notificationData.timestamp.seconds * 1000
  ).toLocaleString();

  notificationHeaderElement.appendChild(usernameElement);
  notificationHeaderElement.appendChild(notificationTimeElement);

  const notificationTextElement = document.createElement("div");
  notificationTextElement.className = "notification-text";
  notificationTextElement.textContent =
    notificationData.status === "pending"
      ? `Received a friend request from ${notificationData.senderUsername}.`
      : `Your friend request has been accepted by ${notificationData.receiverUsername}.`;

  notificationContentElement.appendChild(notificationHeaderElement);
  notificationContentElement.appendChild(notificationTextElement);

  notificationElement.appendChild(profilePicElement);
  notificationElement.appendChild(notificationContentElement);

  notificationContainer.appendChild(notificationElement);
}

// Function to display reminder notifications
function displayReminderNotification(reminderData) {
  const notificationElement = document.createElement("div");
  notificationElement.className = "notification";

  const profilePicElement = document.createElement("div");
  profilePicElement.className = "profile-pic";
  profilePicElement.style.backgroundImage = `url('../resources/calender.svg')`;

  const notificationContentElement = document.createElement("div");
  notificationContentElement.className = "notification-content";

  const notificationHeaderElement = document.createElement("div");
  notificationHeaderElement.className = "notification-header";

  const usernameElement = document.createElement("div");
  usernameElement.className = "username";
  usernameElement.textContent = "Reminder";

  const notificationTimeElement = document.createElement("div");
  notificationTimeElement.className = "notification-time";
  const reminderDate = new Date(`${reminderData.date}T${reminderData.startTime}`);
  notificationTimeElement.textContent = `${reminderDate.toLocaleDateString()} | Start Time: ${reminderData.startTime}`;

  notificationHeaderElement.appendChild(usernameElement);
  notificationHeaderElement.appendChild(notificationTimeElement);

  const notificationTextElement = document.createElement("div");
  notificationTextElement.className = "notification-text";
  notificationTextElement.textContent = `Reminder: ${reminderData.title} at ${reminderData.location}`;

  notificationContentElement.appendChild(notificationHeaderElement);
  notificationContentElement.appendChild(notificationTextElement);

  notificationElement.appendChild(profilePicElement);
  notificationElement.appendChild(notificationContentElement);

  notificationContainer.appendChild(notificationElement);
}


// Function to fetch and display notifications
async function fetchNotifications(userId) {
  try {
    const pendingQuery = query(
      collection(db, "notifications"),
      where("receiverUID", "==", userId),
      where("status", "==", "pending")
    );
    const acceptedQuery = query(
      collection(db, "notifications"),
      where("senderUID", "==", userId),
      where("status", "==", "accepted")
    );

    const [pendingSnapshot, acceptedSnapshot] = await Promise.all([
      getDocs(pendingQuery),
      getDocs(acceptedQuery),
    ]);

    for (const docSnap of pendingSnapshot.docs) {
      const notificationData = docSnap.data();
      const otherUserImage = await fetchUserProfileImage(
        notificationData.senderUID
      );
      displayNotification(
        notificationData,
        otherUserImage,
        notificationData.senderUsername
      );
    }

    for (const docSnap of acceptedSnapshot.docs) {
      const notificationData = docSnap.data();
      const otherUserImage = await fetchUserProfileImage(
        notificationData.receiverUID
      );
      displayNotification(
        notificationData,
        otherUserImage,
        notificationData.receiverUsername
      );
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

// Function to fetch and display reminders
async function fetchReminders(userEmail) {
  try {
    const reminderQuery = query(
      collection(db, "reminders"),
      where("email", "==", userEmail)
    );
    const reminderSnapshot = await getDocs(reminderQuery);

    const now = new Date();

    for (const docSnap of reminderSnapshot.docs) {
      const reminderData = docSnap.data();
      const reminderDate = new Date(`${reminderData.date}T${reminderData.startTime}`);
      
      // Check if reminder date and time has passed
      if (now >= reminderDate) {
        displayReminderNotification(reminderData);
      }
    }
  } catch (error) {
    console.error("Error fetching reminders:", error);
  }
}

// Function to fetch user profile images
async function fetchUserProfileImage(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().imagepath;
    } else {
      throw new Error("User document does not exist");
    }
  } catch (error) {
    console.error("Error fetching user profile image:", error);
    return "";
  }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchNotifications(user.uid);
    const userEmail = localStorage.getItem("email");
    fetchReminders(userEmail);
  } else {
    console.error("No user is signed in.");
  }
});
