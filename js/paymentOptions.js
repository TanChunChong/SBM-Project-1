import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
    var boxContainer = document.getElementById("box-container");

    boxContainer.style.display = "none";

    var payDiv = document.getElementById("pay");

    payDiv.addEventListener("click", function () {
        boxContainer.style.display = "block";
    });

    const cardNumberElement = document.getElementById("card-number");
    const cvcElement = document.getElementById("cvc");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid;
            const username = localStorage.getItem('username');

            try {
                const docName = `${username}Card`;
                const cardDocRef = doc(db, "usersCard", docName);
                const cardDoc = await getDoc(cardDocRef);

                if (cardDoc.exists()) {
                    const cardData = cardDoc.data().cardDetails;
                    const maskedNumber = "**** **** **** " + cardData.number.slice(-4);
                    const cvc = cardData.cvc;

                    cardNumberElement.textContent = maskedNumber;
                    cvcElement.textContent = cvc;
                } else {
                    console.log("No card data found!");
                }
            } catch (error) {
                console.error("Error fetching card data: ", error);
            }
        } else {
            alert("No user is signed in.");
        }
    });
});
