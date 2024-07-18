import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    const subscriptionForm = document.getElementById("subscriptionForm");

    subscriptionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const subscriptionPlan = document.getElementById("subscriptionPlan").value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const subscriptionData = {
                email: user.email,
                subscriptionPlan: subscriptionPlan,
                startDate: new Date().toISOString(),
                isActive: true
            };

            await setDoc(doc(db, "subscriptions", user.uid), subscriptionData);

            alert("Subscription successful!");
        } catch (error) {
            console.error("Error signing up: ", error);
            alert(`Failed to sign up. Error: ${error.message}`);
        }
    });
});
