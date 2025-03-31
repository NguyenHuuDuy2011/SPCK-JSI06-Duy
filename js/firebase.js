// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqikvMPQ1_Zj2dsPzg9a0kj3Ki_h_AHaM",
  authDomain: "spck-jsi06-duy.firebaseapp.com",
  projectId: "spck-jsi06-duy",
  storageBucket: "spck-jsi06-duy.firebasestorage.app",
  messagingSenderId: "717118983053",
  appId: "1:717118983053:web:1855d19c8ef853c2e54bc4",
  measurementId: "G-42M9NZHWT1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore(); 