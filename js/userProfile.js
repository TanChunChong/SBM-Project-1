import { db } from './firebaseConfig.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

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
            fetchAndDisplayScores(userId)
            document.querySelector('.name').textContent = userData.username || "No username provided.";
            document.querySelector('.description').textContent = userData.description || "No description provided.";
            document.querySelector('.pfp').src = userData.imagepath || "../resources/bear.png";
            

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
        } else { 
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    finally{
        const loaderContainer = document.getElementById('loader-container');
        loaderContainer.style.display = 'none';
    }
});

async function fetchAndDisplayScores(friendUID) {
    try {
      const totalScoreElement = document.querySelector('.score1'); // Element to show total score
      const highScoreElement = document.querySelector('.score2'); // Element to show high score
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