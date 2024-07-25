import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, query, where, orderBy, limit, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

async function getUserData() {
    const userCollection = collection(db, 'users');
    const userModulesCollection = collection(db, 'userModules');
    const userSnapshot = await getDocs(userCollection);
    const usersData = [];
    const placeholderImage = '../resources/user.png'; // Path to your placeholder image

    for (const userDoc of userSnapshot.docs) {
        const userData = userDoc.data();
        const userModulesQuery = query(userModulesCollection, where('email', '==', userData.email));
        const userModulesSnapshot = await getDocs(userModulesQuery);
        let totalScore = 0;

        userModulesSnapshot.forEach((moduleDoc) => {
            totalScore += moduleDoc.data().score;
        });

        // Update the user's score in the scores collection
        await updateUserTotalScore(userData.email, userData.userID, totalScore);

        usersData.push({
            username: userData.username,
            email: userData.email,
            imagepath: userData.imagepath || placeholderImage, // Use placeholder image if imagepath is null or empty
            totalScore: totalScore,
            userID: userData.userID // Include userID
        });
    }

    // Sort users by totalScore in descending order and take the top 10
    usersData.sort((a, b) => b.totalScore - a.totalScore);
    const topUsers = usersData.slice(0, 10);

    displayLeaderboard(topUsers);
}

async function updateUserTotalScore(email, userID, totalScore) {
    try {
        const scoreRef = doc(db, 'scores', email);
        const scoreDoc = await getDoc(scoreRef);

        if (scoreDoc.exists()) {
            await updateDoc(scoreRef, { totalScore: totalScore, userID: userID });
        } else {
            await setDoc(scoreRef, { email: email, userID: userID, totalScore: totalScore });
        }
    } catch (error) {
        console.error('Error updating user total score: ', error);
    }
}

function displayLeaderboard(users) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = ''; // Clear existing leaderboard entries

    users.forEach((user, index) => {
        const entry = document.createElement('div');
        entry.classList.add('entry');
        entry.addEventListener('click', () => {
            window.location.href = `friendprofile.html?uid=${user.userID}`;
        });

        const rank = document.createElement('div');
        rank.classList.add('rank');
        rank.textContent = index + 1;

        const circle = document.createElement('div');
        circle.classList.add('circle');
        const img = document.createElement('img');
        img.src = user.imagepath;
        img.alt = `${user.username}'s profile picture`;
        circle.appendChild(img);

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = user.username;

        const points = document.createElement('div');
        points.classList.add('points');
        points.textContent = `${user.totalScore} pts`;

        

        entry.appendChild(rank);
        entry.appendChild(circle);
        entry.appendChild(name);
        entry.appendChild(points);

        leaderboard.appendChild(entry);
    });

    // Hide the loader after displaying the leaderboard
    const loaderContainer = document.getElementById('loader-container');
    loaderContainer.style.display = 'none';
}

getUserData().catch(error => console.error('Error fetching user data:', error));
