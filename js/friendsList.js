import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { auth, db } from '../js/firebaseConfig.js';
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is logged in:", user);
            if (!user.displayName) {
                console.log("User displayName is not set. Using email as displayName.");
                await updateProfile(user, { displayName: user.username });
            }
            initializeApp(user);
        } else {
            console.error("User is not logged in. Redirecting to login page.");
            window.location.href = "../html/index.html";
        }
    });
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function setProfilePicture(imagepath) {
    const profilePicture = document.getElementById("profilePicture");
    if (profilePicture) {
        profilePicture.style.backgroundImage = `url(${imagepath})`;
    } else {
        console.error('Profile picture element not found');
    }
}

function initializeApp(user) {
    const searchIcon = document.getElementById("searchIcon");
    const profilePicture = document.getElementById("profilePicture");
    const profileLink = document.getElementById("profileLink");
    const searchBar = document.getElementById("searchBar");
    const closeIcon = document.getElementById("closeIcon");
    const searchInput = document.getElementById("searchInput");
    const friendsList = document.getElementById("friendsList");

    let currentUserName = '';

    if (searchIcon) {
        searchIcon.addEventListener("click", () => {
            console.log('Search icon clicked');
            profilePicture.style.display = "none";
            profileLink.style.display = "none";
            searchIcon.style.display = "none";
            searchBar.style.display = "flex";
        });
    } else {
        console.error('Search icon not found');
    }

    if (closeIcon) {
        closeIcon.addEventListener("click", () => {
            console.log('Close icon clicked');
            searchBar.style.display = "none";
            profilePicture.style.display = "block";
            profileLink.style.display = "block";
            searchIcon.style.display = "block";
            loadFriends(user);
        });
    } else {
        console.error('Close icon not found');
    }

    if (searchInput) {
        searchInput.addEventListener("input", debounce(async () => {
            await performSearch(searchInput.value.trim(), currentUserName, friendsList);
        }, 300));
    } else {
        console.error('Search input not found');
    }    
    loadFriends(user);
    fetchCurrentUser(user).then((userData) => {
        currentUserName = userData.username;
        setProfilePicture(userData.imagepath);
    });
}

async function performSearch(searchTerm, currentUserName, friendsList) {
    if (searchTerm.length > 0) {
        console.log(`Searching for: ${searchTerm}`);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            friendsList.innerHTML = '';
            if (querySnapshot.empty) {
                console.log('No matching documents.');
            } else {
                const addedUsers = new Set();
                querySnapshot.forEach(async (doc) => {
                    const user = doc.data();
                    if (user.username !== currentUserName && !addedUsers.has(user.username)) {
                        addedUsers.add(user.username);
                        console.log(`Found user: ${user.username}`);
                        const friendRequestStatus = await checkFriendRequestStatus(currentUserName, user.username);
                        const friendItem = document.createElement('div');
                        friendItem.classList.add('friend-item');
                        const iconSrc = friendRequestStatus === 'none' ? '../resources/plus.svg' : '../resources/close.svg';
                        friendItem.innerHTML = `
                            <img src="${user.imagepath}" alt="Profile" class="friend-pic">
                            <div class="friend-name">${user.username}</div>
                            <img src="${iconSrc}" alt="${friendRequestStatus === 'none' ? 'Add Friend' : 'Remove Friend'}" class="friend-action-icon">
                        `;
                        friendItem.querySelector('.friend-name').addEventListener('click', () => {
                            window.location.href = `friendprofile.html?username=${user.username}`;
                        });
                        friendItem.querySelector('.friend-action-icon').addEventListener('click', async () => {
                            if (friendRequestStatus === 'none') {
                                await sendFriendRequest(user.username);
                            } else {
                                await cancelFriendRequest(currentUserName, user.username);
                            }
                            await performSearch(searchTerm, currentUserName, friendsList);
                        });
                        friendsList.appendChild(friendItem);
                    }
                });
            }
        } catch (error) {
            console.error('Error getting documents: ', error);
        }
    } else {
        loadFriends(auth.currentUser);
    }
}

async function fetchCurrentUser(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            throw new Error('Current user document does not exist');
        }
    } catch (error) {
        console.error('Error fetching current user data: ', error);
        throw error;
    }
}

async function sendFriendRequest(receiverUsername) {
    const user = auth.currentUser;
    console.log('Current user:', user);
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            console.log('User document data:', userDoc.exists() ? userDoc.data() : 'No document found');
            if (!userDoc.exists()) {
                throw new Error('Current user document does not exist');
            }
            const userData = userDoc.data();
            const senderUsername = userData.username;

            const friendRequestId = `${senderUsername}+${receiverUsername}`;

            const friendRef = doc(db, 'friends', friendRequestId);
            await setDoc(friendRef, {
                sender: senderUsername,
                receiver: receiverUsername,
                status: 'pending',
                timestamp: new Date()
            });

            alert('Friend request sent successfully!');
            loadFriends(user);
        } catch (error) {
            console.error('Error sending friend request: ', error);
            alert('Error sending friend request: ' + error.message);
        }
    } else {
        alert('Please log in to send friend requests.');
    }
}

async function cancelFriendRequest(currentUserName, friendUsername) {
    try {
        const friendRequestId1 = `${currentUserName}+${friendUsername}`;
        const friendRequestId2 = `${friendUsername}+${currentUserName}`;

        const friendRef1 = doc(db, 'friends', friendRequestId1);
        const friendRef2 = doc(db, 'friends', friendRequestId2);

        const friendDoc1 = await getDoc(friendRef1);
        const friendDoc2 = await getDoc(friendRef2);

        let status = '';
        if (friendDoc1.exists()) {
            status = friendDoc1.data().status;
            await deleteDoc(friendRef1);
        } else if (friendDoc2.exists()) {
            status = friendDoc2.data().status;
            await deleteDoc(friendRef2);
        }

        if (status === 'pending') {
            alert('Friend request canceled.');
        } else if (status === 'accepted') {
            alert('Friend removed.');
        } else {
            alert('Action completed.');
        }

        const user = auth.currentUser;
        loadFriends(user);
    } catch (error) {
        console.error('Error canceling friend request: ', error);
        alert('Error canceling friend request: ' + error.message);
    }
}

async function checkFriendRequestStatus(currentUserName, friendUsername) {
    try {
        const friendRequestId1 = `${currentUserName}+${friendUsername}`;
        const friendRequestId2 = `${friendUsername}+${currentUserName}`;

        const friendRef1 = doc(db, 'friends', friendRequestId1);
        const friendRef2 = doc(db, 'friends', friendRequestId2);

        const friendDoc1 = await getDoc(friendRef1);
        const friendDoc2 = await getDoc(friendRef2);

        if (friendDoc1.exists() && friendDoc1.data().status === 'pending') {
            return 'pending';
        }
        if (friendDoc2.exists() && friendDoc2.data().status === 'pending') {
            return 'pending';
        }
        if (friendDoc1.exists() && friendDoc1.data().status === 'accepted') {
            return 'accepted';
        }
        if (friendDoc2.exists() && friendDoc2.data().status === 'accepted') {
            return 'accepted';
        }

        return 'none';
    } catch (error) {
        console.error('Error checking friend request status:', error);
        return 'none';
    }
}

async function removeFriend(friendUsername) {
    const user = auth.currentUser;
    console.log('Current user:', user);
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            console.log('User document data:', userDoc.exists() ? userDoc.data() : 'No document found');
            if (!userDoc.exists()) {
                throw new Error('Current user document does not exist');
            }
            const userData = userDoc.data();
            const currentUserName = userData.username;

            const friendRequestId = currentUserName < friendUsername ? `${currentUserName}+${friendUsername}` : `${friendUsername}+${currentUserName}`;

            const friendRef = doc(db, 'friends', friendRequestId);
            await deleteDoc(friendRef);

            alert('Friend removed successfully!');
            loadFriends(user);
        } catch (error) {
            console.error('Error removing friend:', error);
            alert('Error removing friend: ' + error.message);
        }
    } else {
        alert('Please log in to remove friends.');
    }
}

async function loadFriends(user) {
    const friendsList = document.getElementById("friendsList");
    friendsList.innerHTML = '<div class="loading-indicator">Loading...</div>';

    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentUserName = userData.username;

            const friendsRef = collection(db, 'friends');
            const q1 = query(friendsRef, where('sender', '==', currentUserName), where('status', '==', 'accepted'));
            const q2 = query(friendsRef, where('receiver', '==', currentUserName), where('status', '==', 'accepted'));
            const querySnapshot1 = await getDocs(q1);
            const querySnapshot2 = await getDocs(q2);

            friendsList.innerHTML = '';

            const friends = [];
            querySnapshot1.forEach(doc => {
                const data = doc.data();
                friends.push(data.receiver);
            });
            querySnapshot2.forEach(doc => {
                const data = doc.data();
                friends.push(data.sender);
            });

            if (friends.length === 0) {
                friendsList.innerHTML = '<div class="no-friends-message">You have no friends added yet.</div>';
                return;
            }

            for (const friendUsername of friends) {
                const friendQuery = query(collection(db, 'users'), where('username', '==', friendUsername));
                const friendQuerySnapshot = await getDocs(friendQuery);
                friendQuerySnapshot.forEach(doc => {
                    const friendData = doc.data();
                    const friendItem = document.createElement('div');
                    friendItem.classList.add('friend-item');
                    friendItem.innerHTML = `
                        <img src="${friendData.imagepath}" alt="Profile" class="friend-pic">
                        <div class="friend-name">${friendData.username}</div>
                        <img src="../resources/close.svg" alt="Remove Friend" class="remove-friend-icon">
                    `;
                    friendItem.querySelector('.friend-name').addEventListener('click', () => {
                        window.location.href = `friendprofile.html?username=${friendData.username}`;
                    });
                    friendItem.querySelector('.remove-friend-icon').addEventListener('click', () => cancelFriendRequest(currentUserName, friendData.username));
                    friendsList.appendChild(friendItem);
                });
            }
        } else {
            throw new Error('Current user document does not exist');
        }
    } catch (error) {
        console.error('Error loading friends: ', error);
        friendsList.innerHTML = '<div class="error-message">Error loading friends.</div>';
    }
}
