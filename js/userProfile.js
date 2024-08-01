import { db } from './firebaseConfig.js';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    console.log(`User ID from localStorage: ${userId}`);
    console.log(`Username from localStorage: ${username}`);

    if (!userId || !username) {
        console.log('User ID or username not found in localStorage.');
        return;
    }

    try {
        const userRef = doc(db, 'users', userId);
        console.log(`Firestore document reference: ${userRef.path}`);
        
        const userDoc = await getDoc(userRef);
        console.log(`User document exists: ${userDoc.exists()}`);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data fetched from Firestore:', userData);
            
            document.querySelector('.name').textContent = userData.username || "No username provided.";
            document.querySelector('.description').textContent = userData.description || "No description provided.";
            document.querySelector('.pfp').src = userData.imagepath || "../resources/bear.png";
            
            fetchAndDisplayScores(userId); // Fetch and display scores

            // Count posts by the user
            const postsQuery = query(collection(db, 'posts'), where('username', '==', username));
            const postsSnapshot = await getDocs(postsQuery);
            const postsCount = postsSnapshot.size;

            // Assuming the first card is for posts
            document.querySelector('.card:nth-child(1) .big').textContent = postsCount;

            // Count comments by the user
            const commentsQuery = query(collection(db, 'comments'), where('username', '==', username));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsCount = commentsSnapshot.size;

            // Assuming the second card is for comments
            document.querySelector('.card:nth-child(2) .big').textContent = commentsCount;

            // Update total score
            await updateTotalScore(userData.email, userId);
        } else { 
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        const loaderContainer = document.getElementById('loader-container');
        loaderContainer.style.display = 'none';
    }
});

async function fetchAndDisplayScores(userID) { 
    try {
        const totalScoreElement = document.querySelector('.score1'); // Element to show total score
        const highScoreElement = document.querySelector('.score2'); // Element to show high score
        console.log(`Fetching scores for UID: ${userID}`); // Debug log
        const scoresQuery = query(collection(db, 'scores'), where('userID', '==', userID));
        const scoresSnapshot = await getDocs(scoresQuery);

        if (!scoresSnapshot.empty) {
            scoresSnapshot.forEach(scoreDoc => {
                const scoreData = scoreDoc.data();
                console.log(`Score data for ${userID}:`, scoreData); // Debug log
                totalScoreElement.textContent = scoreData.totalScore || 0;
                highScoreElement.textContent = scoreData.highscore || 0;
            });
        } else {
            console.log(`No score document found for ${userID}`); // Debug log
            totalScoreElement.textContent = 0;
            highScoreElement.textContent = 0;
        }
    } catch (error) {
        console.error('Error fetching scores:', error);
        const totalScoreElement = document.querySelector('.score1'); // Element to show total score
        const highScoreElement = document.querySelector('.score2'); // Element to show high score
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

        const scoreRef = doc(db, 'scores', email);
        const scoreDoc = await getDoc(scoreRef);

        if (scoreDoc.exists()) {
            await updateDoc(scoreRef, { totalScore: totalScore });
        } else {
            await setDoc(scoreRef, { email: email, userID: userID, totalScore: totalScore });
        }

        const totalScoreElement = document.querySelector('.score1'); // Element to show total score
        totalScoreElement.textContent = totalScore;
    } catch (error) {
        console.error('Error updating total score:', error);
    }
}
