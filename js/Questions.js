import { auth, db } from './firebaseConfig.js';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.getElementById('goBackButton').addEventListener('click', () => {
    window.history.back();
});

let email;
let selectedAnswer = null;
let questionsArray = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0; // Counter for correct answers

document.addEventListener('DOMContentLoaded', async function () {
    email = localStorage.getItem('email');
    const urlParams = new URLSearchParams(window.location.search);
    const moduleID = urlParams.get('moduleID');
    if (moduleID) {
        await loadModuleName(moduleID);
        await loadQuestions(moduleID);
        shuffleQuestions(); 
        displayQuestion(currentQuestionIndex);
    } else {
        console.error('No module ID found in URL');
    }

    // Get the modal
    const modal = document.getElementById("incorrectModal");

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

async function loadModuleName(moduleID) {
    try {
        const q = query(collection(db, 'module'), where('moduleID', '==', moduleID));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                document.querySelector('header h1').textContent = data.moduleName;
            });
        } else {
            console.error('No matching module found');
        }
    } catch (error) {
        console.error('Error fetching module name: ', error);
    }
}

async function loadQuestions(moduleID) {
    const loaderContainer = document.getElementById('loader-container');
    try {

        const q = query(collection(db, 'questions'), where('moduleID', '==', moduleID));
        const querySnapshot = await getDocs(q);

        const answeredQuery = query(collection(db, 'userAnsweredQuestions'), where('email', '==', email), where('moduleID', '==', moduleID));
        const answeredSnapshot = await getDocs(answeredQuery);
        const answeredQuestions = new Set();

        answeredSnapshot.forEach(doc => {
            answeredQuestions.add(doc.data().questionID);
        });

        querySnapshot.forEach((doc) => {
            if (!answeredQuestions.has(doc.id)) {
                const questionData = doc.data();
                questionsArray.push({ id: doc.id, ...questionData });
            }
        });

        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else {
            console.error('MathJax is not loaded.');
        }
    } catch (error) {
        console.error('Error fetching questions: ', error);
    } finally {
        setTimeout(() => {
            loaderContainer.style.display = 'none'; // Hide loader after delay
        }, 400);
    }
}

function shuffleQuestions() {
    for (let i = questionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsArray[i], questionsArray[j]] = [questionsArray[j], questionsArray[i]];
    }
}

function displayQuestion(index) {
    const questionsContainer = document.querySelector('.question');

    if (index >= questionsArray.length) {
        questionsContainer.innerHTML = '<p>No questions are available right now.</p>';  
        return;
    }

    const data = questionsArray[index];
    questionsContainer.innerHTML = ''; 

    const questionElement = document.createElement('div');
    questionElement.classList.add('question2');

    const questionText = document.createElement('p');
    questionText.innerHTML = data.question; 

    const brElement = document.createElement('br');
    const brElement2 = document.createElement('br');

    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options');

    ['option1', 'option2', 'option3', 'option4'].forEach((option, optionIndex) => {
        const optionButton = document.createElement('button');
        optionButton.innerHTML = `${String.fromCharCode(97 + optionIndex)}) ${data[option]}`;
        optionButton.addEventListener('click', () => selectOption(optionButton, data[option]));
        optionsContainer.appendChild(optionButton);
    });

    questionElement.appendChild(brElement);
    questionElement.appendChild(questionText);
    questionElement.appendChild(brElement2);
    questionElement.appendChild(optionsContainer);

    const submitButton = document.createElement('button');
    submitButton.classList.add('next-button');
    submitButton.textContent = 'Submit Answer';
    submitButton.addEventListener('click', () => checkAnswer(data.answer, optionsContainer, data.id, data.moduleID));

    questionElement.appendChild(submitButton);

    questionsContainer.appendChild(questionElement);

    if (window.MathJax) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, questionsContainer]);
    }
}

function selectOption(optionButton, answer) {
    const optionsContainer = optionButton.parentElement;
    optionsContainer.querySelectorAll('button').forEach(button => {
        button.classList.remove('selected');
    });

    optionButton.classList.add('selected');
    selectedAnswer = answer;
}

async function checkAnswer(correctAnswer, optionsContainer, questionID, moduleID) {
    if (!selectedAnswer) {
        alert('Please select an answer.');
        return;
    }

    if (selectedAnswer === correctAnswer) {
        console.log('Correct answer!');
        optionsContainer.querySelector('.selected').classList.add('correct');

        correctAnswersCount++; // Increment the counter for correct answers
        document.querySelector('.score').textContent = `Your Score: ${correctAnswersCount}`;

        await incrementUserScore(email, moduleID);
        await markQuestionAsAnswered(email, moduleID, questionID);

        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    } else {
        console.log('Incorrect answer!');
        optionsContainer.querySelector('.selected').classList.add('incorrect');

        // Show the modal
        const modal = document.getElementById("incorrectModal");
        modal.style.display = "block";
    }
}

async function incrementUserScore(email, moduleID) {
    try {
        const q = query(collection(db, 'userModules'), where('email', '==', email), where('moduleID', '==', moduleID));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
                const userModuleRef = doc.ref;
                await updateDoc(userModuleRef, {
                    score: increment(1)
                });
            });
        } else {
            console.error('No matching user module found');
        }
    } catch (error) {
        console.error('Error incrementing user score: ', error);
    }
}

async function markQuestionAsAnswered(email, moduleID, questionID) {
    try {
        const userAnsweredRef = doc(collection(db, 'userAnsweredQuestions'));
        await setDoc(userAnsweredRef, {
            email: email,
            moduleID: moduleID,
            questionID: questionID
        });
    } catch (error) {
        console.error('Error marking question as answered: ', error);
    }
}
