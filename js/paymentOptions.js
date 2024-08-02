import { auth, db } from "../js/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

function displayCardData(cardData) {
  const maskedNumber = "**** **** **** " + cardData.number.slice(-4);
  const cvc = cardData.cvc;

  const cardNumberElement = document.getElementById("card-number");
  const cvcElement = document.getElementById("cvc");

  cardNumberElement.textContent = maskedNumber;
  cvcElement.textContent = cvc;
}

async function fetchCardData(username) {
  try {
    const docName = `${username}Card`;
    const cardDocRef = doc(db, "usersCard", docName);
    const cardDocSnapshot = await getDoc(cardDocRef);

    if (cardDocSnapshot.exists()) {
      const cardData = cardDocSnapshot.data().cardDetails;
      displayCardData(cardData);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

async function fetchSubscriptionData(userId) {
  try {
    const subscriptionDocRef = doc(db, "subscriptions", userId);
    const subscriptionDocSnapshot = await getDoc(subscriptionDocRef);

    if (subscriptionDocSnapshot.exists()) {
      const subscriptionData = subscriptionDocSnapshot.data();
      document.getElementById(
        "subscription-expiry"
      ).textContent = `Expires on: ${new Date(
        subscriptionData.expiry
      ).toDateString()}`;
    } else {
      console.log("No active subscription");
    }
  } catch (error) {
    console.error("Error fetching subscription:", error);
  }
}

async function fetchPaymentHistory(userId) {
  try {
    const q = query(
      collection(db, "paymentHistory"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    const paymentRecordsContainer = document.getElementById("payment-records");
    paymentRecordsContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const paymentData = doc.data();
      const paymentRecordElement = document.createElement("div");
      paymentRecordElement.classList.add("payment-record");
      paymentRecordElement.innerHTML = `
                <p>Type: ${paymentData.subscriptionType}</p>
                <p>Method: **** **** **** ${paymentData.cardNumber.slice(
                  -4
                )}</p>
                <p>Amount: $${paymentData.amount}</p>
                <p>Payment Date: ${new Date(
                  paymentData.paymentDate
                ).toDateString()}</p>
            `;
      paymentRecordsContainer.appendChild(paymentRecordElement);
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
  }
}

async function confirmSubscription(
  userId,
  username,
  subscriptionType,
  amount,
  email
) {
  const currentDate = new Date();
  let expiryDate = new Date();
  switch (subscriptionType) {
    case "Daily Payment":
      expiryDate.setDate(expiryDate.getDate() + 1);
      break;
    case "Weekly Payment":
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case "Monthly Payment":
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      break;
    case "Yearly Payment":
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      break;
    default:
      break;
  }

  try {
    await setDoc(doc(db, "subscriptions", userId), {
      userId,
      subscriptionType,
      expiry: expiryDate.toISOString(),
      email: email,
    });

    await setDoc(doc(db, "paymentHistory", `${userId}_${Date.now()}`), {
      userId,
      subscriptionType,
      amount,
      cardNumber: document
        .getElementById("card-number")
        .textContent.replace("**** **** **** ", ""),
      paymentDate: currentDate.toISOString(),
    });

    fetchSubscriptionData(userId);
    fetchPaymentHistory(userId);
  } catch (error) {
    console.error("Error confirming subscription:", error);
  }
}

document
  .getElementById("plan-selector")
  .addEventListener("change", async (event) => {
    const selectedPlan = event.target.value.split(":");
    document.getElementById(
      "pricing-display"
    ).textContent = `Price: ${selectedPlan[1]}`;
  });

document
  .getElementById("confirm-subscription")
  .addEventListener("click", async () => {
    const selectedPlan = document.getElementById("plan-selector").value;
    if (!selectedPlan) {
      alert("Please select a subscription plan first.");
      return;
    }

    const [subscriptionType, amountText] = selectedPlan.split(":");
    const amount = parseFloat(amountText.replace(/[^0-9.]/g, ""));
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const email = user.email; // Get the user's email
      const subscriptionDocRef = doc(db, "subscriptions", userId);
      const subscriptionDocSnapshot = await getDoc(subscriptionDocRef);

      if (subscriptionDocSnapshot.exists()) {
        const subscriptionData = subscriptionDocSnapshot.data();
        const currentDate = new Date();
        const expiryDate = new Date(subscriptionData.expiry);

        if (currentDate < expiryDate) {
          alert(
            "You can only select a new option plan when your current plan has expired"
          );
          return;
        }
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const username = userData.username;

        const cardDocRef = doc(db, "usersCard", `${username}Card`);
        const cardDocSnapshot = await getDoc(cardDocRef);
        if (cardDocSnapshot.exists()) {
          confirmSubscription(
            userId,
            username,
            subscriptionType,
            amount,
            email
          ); // Pass the email to the function
        } else {
          alert("You need to add a card before subscribing to a plan.");
        }
      } else {
        console.error("User data not found!");
      }
    } else {
      console.error("No user is logged in!");
    }
  });

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    const userDocRef = doc(db, "users", userId);

    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const username = userData.username;
          fetchCardData(username);
          fetchSubscriptionData(userId);
          fetchPaymentHistory(userId);
        } else {
          console.error("No such user document!");
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
      });
  } else {
    console.error("User is not signed in.");
  }
});
