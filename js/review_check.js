import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.getElementById("review-btn").addEventListener("click", async function (e) {
    e.preventDefault();
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Bạn cần đăng nhập để sử dụng chức năng này!");
        window.location.href = "./html/login.html";
        return;
    }
    const q = query(collection(db, "users"), where("username", "==", username.replace(/"/g, "")));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        alert("Không tìm thấy thông tin tài khoản!");
        return;
    }
    const userData = querySnapshot.docs[0].data();
    if (userData.packageType) {
        window.location.href = "../html/review.html";
    } else {
        window.location.href = "../html/billing.html";
    }
});