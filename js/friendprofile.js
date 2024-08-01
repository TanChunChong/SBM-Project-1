import { auth, db } from "../js/firebaseConfig.js";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

const profilePicture = document.querySelector(".pfp");
const usernameElement = document.querySelector(".name");
const descriptionElement = document.querySelector(".description");
const primaryButton = document.getElementById("primaryButton");
const acceptButton = document.getElementById("acceptButton");
const dayStreakElement = document.querySelector('.card:nth-child(1) .big');
const reviewsElement = document.querySelector('.card:nth-child(2) .big');
const totalScoreElement = document.querySelector('.score1'); // Element to show total score
const highScoreElement = document.querySelector('.score2'); // Element to show high score

const urlParams = new URLSearchParams(window.location.search);
const friendUID = urlParams.get("uid");

async function createNotification(
  senderUID,
  senderUsername,
  receiverUID,
  receiverUsername,
  status
) {
  try {
    const notificationRef = doc(collection(db, "notifications"));
    await setDoc(notificationRef, {
      senderUID: senderUID,
      senderUsername: senderUsername,
      receiverUID: receiverUID,
      receiverUsername: receiverUsername,
      status: status,
      timestamp: new Date(),
    });
    console.log("Notification created successfully!");
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

async function fetchFriendData(friendUID) {
  try {
    const friendRef = doc(db, "users", friendUID);
    const friendDoc = await getDoc(friendRef);
    if (friendDoc.exists()) {
      const friendData = friendDoc.data();
      profilePicture.src = friendData.imagepath;
      usernameElement.textContent = friendData.username;
      descriptionElement.textContent = friendData.description;

      // Count posts by the user
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', friendUID));
      const postsSnapshot = await getDocs(postsQuery);
      const postsCount = postsSnapshot.size;
      dayStreakElement.textContent = postsCount;
 
      // Count comments by the user
      const commentsQuery = query(collection(db, 'comments'), where('userId', '==', friendUID));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsCount = commentsSnapshot.size;
      reviewsElement.textContent = commentsCount;

      // Fetch and display scores
      await fetchAndDisplayScores(friendUID);

      return friendData;
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching friend data:", error);
  }
  return null;
}

async function fetchAndDisplayScores(friendUID) {
  try {
    console.log(`Fetching scores for UID: ${friendUID}`); // Debug log
    const scoresQuery = query(collection(db, 'scores'), where('userID', '==', friendUID));
    const scoresSnapshot = await getDocs(scoresQuery);

    if (!scoresSnapshot.empty) {
      scoresSnapshot.forEach(scoreDoc => {
        const scoreData = scoreDoc.data();
        console.log(`Score data for ${friendUID}:`, scoreData); // Debug log
        totalScoreElement.textContent = scoreData.totalScore || 0;
        highScoreElement.textContent = scoreData.highscore || 0;
      });
    } else {
      console.log(`No score document found for ${friendUID}`); // Debug log
      totalScoreElement.textContent = 0;
      highScoreElement.textContent = 0;
    }
  } catch (error) {
    console.error('Error fetching scores:', error);
    totalScoreElement.textContent = 0;
    highScoreElement.textContent = 0;
  }
}

async function updateTotalScore(email, userID) {
  try {
    const userModulesSnapshot = await getDocs(query(collection(db, 'userModules'), where('email', '==', email)));
    let totalScore = 0;

    userModulesSnapshot.forEach(doc => {
      totalScore += doc.data().score;
    });

    const scoreRef = doc(db, 'scores', email, uid);
    const scoreDoc = await getDoc(scoreRef);

    if (scoreDoc.exists()) {
      await updateDoc(scoreRef, { totalScore: totalScore });
    } else {
      
      await setDoc(scoreRef, { email: email, userID: userID, totalScore: totalScore });
    }

    totalScoreElement.textContent = totalScore;
  } catch (error) {
    console.error('Error updating total score:', error);
  }
}

async function checkFriendStatus(
  currentUserId,
  currentUsername,
  friendUID,
  friendUsername
) {
  const friendDocId1 = `${currentUserId}+${friendUID}`;
  const friendDocId2 = `${friendUID}+${currentUserId}`;
  const friendDocRef1 = doc(db, "friends", friendDocId1);
  const friendDocRef2 = doc(db, "friends", friendDocId2);
  const friendDocSnap1 = await getDoc(friendDocRef1);
  const friendDocSnap2 = await getDoc(friendDocRef2);
  const updateButton = (button, text, handler, visible = true) => {
    button.value = text;
    button.onclick = async () => {
      await handler();
      await checkFriendStatus(
        currentUserId,
        currentUsername,
        friendUID,
        friendUsername
      );
    }; 
    button.style.display = visible ? "inline-block" : "none";
  };

  if (friendDocSnap1.exists()) {
    const friendData1 = friendDocSnap1.data();
    if (friendData1.status === "accepted") {
      updateButton(primaryButton, "Remove friend", async () => {
        await deleteDoc(friendDocRef1);
      });
      acceptButton.style.display = "none";
    } else if (friendData1.sender === currentUserId) {
      updateButton(primaryButton, "Cancel friend request", async () => {
        await deleteDoc(friendDocRef1);
      });
      acceptButton.style.display = "none";
    } else if (
      friendData1.receiver === currentUserId &&
      friendData1.status === "pending"
    ) {
      updateButton(primaryButton, "Reject friend request", async () => {
        await deleteDoc(friendDocRef1);
      });
      updateButton(acceptButton, "Accept friend request", async () => {
        await acceptFriendRequest(
          friendDocRef1,
          friendData1,
          currentUsername,
          friendUsername
        );
      });
    } else {
      primaryButton.style.display = "none";
      acceptButton.style.display = "none";
    }
  } else if (friendDocSnap2.exists()) {
    const friendData2 = friendDocSnap2.data();
    if (friendData2.status === "accepted") {
      updateButton(primaryButton, "Remove friend", async () => {
        await deleteDoc(friendDocRef2);
      });
      acceptButton.style.display = "none";
    } else if (friendData2.sender === currentUserId) {
      updateButton(primaryButton, "Cancel friend request", async () => {
        await deleteDoc(friendDocRef2);
      });
      acceptButton.style.display = "none";
    } else if (
      friendData2.receiver === currentUserId &&
      friendData2.status === "pending"
    ) {
      updateButton(primaryButton, "Reject friend request", async () => {
        await deleteDoc(friendDocRef2);
      });
      updateButton(acceptButton, "Accept friend request", async () => {
        await acceptFriendRequest(
          friendDocRef2,
          friendData2,
          currentUsername,
          friendUsername
        );
      });
    } else {
      primaryButton.style.display = "none";
      acceptButton.style.display = "none";
    }
  } else {
    updateButton(primaryButton, "Send friend request", async () => {
      await setDoc(doc(db, "friends", friendDocId1), {
        sender: currentUserId,
        receiver: friendUID,
        status: "pending",
        timestamp: new Date(),
      });
      await createNotification(
        currentUserId,
        currentUsername,
        friendUID,
        friendUsername,
        "pending"
      );
    });
    acceptButton.style.display = "none";
  }
}

async function fetchCurrentUser(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("Current user document does not exist");
    }
  } catch (error) {
    console.error("Error fetching current user data:", error);
    throw error;
  }
  finally {
    const loaderContainer = document.getElementById('loader-container');
    setTimeout(() => {
        loaderContainer.style.display = 'none';
    }, 400); // Delay in milliseconds (2000ms = 2 seconds)
}
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const currentUserData = await fetchCurrentUser(user);
    // Redirect to userProfile.html if the UID matches
    if (user.uid === friendUID) {
      window.location.href = "userProfile.html";
      return;
    }
    const friendData = await fetchFriendData(friendUID);
    if (currentUserData && friendData) {
      const currentUserId = currentUserData.userID;
      const currentUsername = currentUserData.username;
      const friendUsername = friendData.username;
      checkFriendStatus(
        currentUserId,
        currentUsername,
        friendUID,
        friendUsername
      );

      // Update total score
      await updateTotalScore(user.email, user.uid);
    }
  } else {
    console.error("No user is signed in.");
  }
});

async function acceptFriendRequest(
  friendDocRef,
  friendData,
  currentUsername,
  friendUsername
) {
  try {
    await setDoc(friendDocRef, { ...friendData, status: "accepted" });

    await createNotification(
      friendData.sender,
      friendUsername,
      friendData.receiver,
      currentUsername,
      "accepted"
    );

    alert("Friend request accepted successfully!");
  } catch (error) {
    console.error("Error accepting friend request:", error);
    alert("Error accepting friend request: " + error.message);
  }
}
