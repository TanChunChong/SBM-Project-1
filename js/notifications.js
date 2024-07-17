import { auth, db } from '../js/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { collection, query, where, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

async function fetchNotifications(userUID) {
    const notificationsContainer = document.querySelector('.notification-container');
    notificationsContainer.innerHTML = ''; 

    try {
        const pendingNotificationsQuery = query(collection(db, 'friends'), 
            where('receiver', '==', userUID),
            where('status', '==', 'pending'));
        
        const pendingQuerySnapshot = await getDocs(pendingNotificationsQuery);

        for (const docSnapshot of pendingQuerySnapshot.docs) {
            const notificationData = docSnapshot.data();
            const senderUID = notificationData.sender;
            const senderDoc = await getDoc(doc(db, 'users', senderUID));
            
            if (senderDoc.exists()) {
                const senderData = senderDoc.data();
                const senderUsername = senderData.username;
                const senderProfilePic = senderData.imagepath;
                
                displayNotification(notificationsContainer, senderUsername, senderProfilePic, 'A friend request has been received from');
            }
        }

        const acceptedNotificationsQuery = query(collection(db, 'friends'), 
            where('sender', '==', userUID),
            where('status', '==', 'accepted'));
        
        const acceptedQuerySnapshot = await getDocs(acceptedNotificationsQuery);

        for (const docSnapshot of acceptedQuerySnapshot.docs) {
            const notificationData = docSnapshot.data();
            const receiverUID = notificationData.receiver;
            const receiverDoc = await getDoc(doc(db, 'users', receiverUID));
            
            if (receiverDoc.exists()) {
                const receiverData = receiverDoc.data();
                const receiverUsername = receiverData.username;
                const receiverProfilePic = receiverData.imagepath;
                
                displayNotification(notificationsContainer, receiverUsername, receiverProfilePic, 'Friend request has been accepted by');
            }
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function displayNotification(container, username, profilePic, message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');

    notification.innerHTML = `
        <div class="profile-pic" style="background-image: url('${profilePic}');"></div>
        <div class="notification-content">
            <div class="notification-header">
                <div class="username">${username}</div>
                <div class="notification-time">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="notification-text">${message} ${username}.</div>
        </div>
    `;

    container.appendChild(notification);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchNotifications(user.uid);
    } else {
        console.error('No user is signed in.');
    }
});
