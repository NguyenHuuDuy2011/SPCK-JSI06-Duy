// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCqlquFnXmx6b2zeunFlBEkpHxIfS11UnQ",
  authDomain: "baitaptuan3---duy.firebaseapp.com",
  projectId: "baitaptuan3---duy",
  storageBucket: "baitaptuan3---duy.firebasestorage.app",
  messagingSenderId: "557364892053",
  appId: "1:557364892053:web:616d277eb77cd82263269c",
  measurementId: "G-R4TTFKQQEV"
};

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);

// Export app để dùng trong script.js
export { app };
  


