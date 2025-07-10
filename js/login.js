import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const inpEmail = document.querySelector(".inp-email");
const inpPwd = document.querySelector(".inp-pwd");
const loginForm = document.querySelector("#login-form");

function handleLogin(event) {
    event.preventDefault();

    // Hiện overlay loading
    document.getElementById("loading-overlay").style.display = "flex";

    const email = inpEmail.value.trim();
    const password = inpPwd.value.trim();

    if (!email || !password) {
        alert("Vui lòng điền đủ các thông tin trước khi đăng nhập!");
        document.getElementById("loading-overlay").style.display = "none";
        return;
    }

    // Kiểm tra tài khoản admin
    if (email === "admin@gmail.com") {
        alert("Đăng nhập thành công!\nChuyển sang trang chủ Admin tại đây");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", "Administrator");
        localStorage.setItem("email", "admin@gmail.com");
        localStorage.setItem("loginTime", Date.now().toString());
        window.location.href = "../html/admin.html";
        return;
    }

    // Đăng nhập với Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Lấy username từ Firestore
            alert("Đăng nhập thành công\nLưu ý đến người dùng: Tài khoản đã đăng nhập sẽ có hiệu lực trong 1 tiếng. Sau 1 tiếng, tài khoản của bạn sẽ tự động đăng xuất.");
            const q = query(collection(db, "users"), where("email", "==", email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const userData = snap.docs[0].data();
                localStorage.setItem("username", userData.username);
            } else {
                localStorage.setItem("username", email); // fallback
            }
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loginTime", Date.now().toString());
            // ...chuyển trang hoặc các thao tác khác
            // ...xử lý thành công...
            document.getElementById("loading-overlay").style.display = "none";
            window.location.href = "../index.html";
        })
        .catch((error) => {
            console.error("Lỗi đăng nhập:", error);
            document.getElementById("loading-overlay").style.display = "none";
            // if (error.code === "auth/user-not-found") {
            //     alert("Tài khoản không tồn tại. Vui lòng kiểm tra lại email.");
            // } else if (error.code === "auth/wrong-password") {
            //     alert("Mật khẩu không đúng. Vui lòng thử lại.");
            // } else if (error.code === "auth/invalid-email") {
            //     alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
            // } else {
            alert("Lỗi đăng nhập!\nVui lòng kiểm tra lại thông tin tài khoản và mật khẩu hoặc đường truyền mạng của bạn.");
        });
}

loginForm.addEventListener("submit", handleLogin);