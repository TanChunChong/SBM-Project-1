import {initializeApp} from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDdTuA_YgvxtTHTRaB7Hp1kUjju_FZaLG4",
    authDomain: "sbm-project-d8c26.firebaseapp.com",
    projectId: "sbm-project-d8c26",
    storageBucket: "sbm-project-d8c26.appspot.com",
    messagingSenderId: "299155751833",
    appId: "1:299155751833:web:2e1a23d9425f6d096c0908",
    measurementId: "G-Z4RWMHB1XF"
  };

// init firebase app
initializeApp(firebaseConfig)

// init services
const db  = getFirestore()

// collection ref
const colRef = firebase.firestore(db, 'users')

// get collection data
getDocs(colRef).then((snapshot) => {
    console.log(snapshot.docs)
})