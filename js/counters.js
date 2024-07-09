import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { db } from './firebaseConfig.js';

const initializeCounter = async () => {
    const counterDocRef = doc(db, 'counters', 'postsCounter');
    await setDoc(counterDocRef, { currentPostID: 0 });
    console.log("Counter initialized");
};

initializeCounter();
