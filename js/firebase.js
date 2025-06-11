import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqikvMPQ1_Zj2dsPzg9a0kj3Ki_h_AHaM",
  authDomain: "spck-jsi06-duy.firebaseapp.com",
  projectId: "spck-jsi06-duy",
  storageBucket: "spck-jsi06-duy.appspot.com",
  messagingSenderId: "717118983053",
  appId: "1:717118983053:web:1855d19c8ef853c2e54bc4",
  measurementId: "G-42M9NZHWT1"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore và Auth
export const db = getFirestore(app); // Xuất Firestore
export const auth = getAuth(app); // Xuất Auth