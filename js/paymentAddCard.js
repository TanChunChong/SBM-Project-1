import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

function formatCardNumber(input) {
    input = input.replace(/\D/g, '');
    if (input.length > 16) {
        input = input.slice(0, 16);
    }
    return input.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryDate(input) {
    input = input.replace(/\D/g, '');
    if (input.length > 4) {
        input = input.slice(0, 4);
    }
    if (input.length > 2) {
        input = input.slice(0, 2) + '/' + input.slice(2);
    }
    return input;
}

document.addEventListener("DOMContentLoaded", function () {
    const cardForm = document.getElementById("cardForm");

    const cardNumberInput = document.getElementById("cNumber");
    const expiryInput = document.getElementById("expiry");
    const cvcInput = document.getElementById("cvc");

    cardNumberInput.addEventListener("input", function () {
        cardNumberInput.value = formatCardNumber(cardNumberInput.value);
    });

    expiryInput.addEventListener("input", function () {
        expiryInput.value = formatExpiryDate(expiryInput.value);
    });

    cardForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const cardNumber = cardNumberInput.value.replace(/\s+/g, '');
        const cardName = document.getElementById("cName").value;
        const expiry = expiryInput.value;
        const cvc = cvcInput.value;

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;
                const userEmail = user.email;
                const username = localStorage.getItem('username');

                try {
                    const docName = `${username}Card`;
                    const cardDocRef = doc(db, "usersCard", docName);

                    await setDoc(cardDocRef, {
                        email: userEmail,
                        cardDetails: {
                            number: cardNumber,
                            name: cardName,
                            expiry: expiry,
                            cvc: cvc
                        }
                    });

                    alert("Card added successfully!");
                } catch (error) {
                    console.error("Error adding card: ", error);
                    alert(`Failed to add card. Error: ${error.message}`);
                }
            } else {
                alert("No user is signed in.");
            }
        });
    });
});
