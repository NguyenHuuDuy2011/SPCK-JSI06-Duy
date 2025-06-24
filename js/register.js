import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Lấy các phần tử input của form đăng ký từ DOM
const inpUsername = document.querySelector(".inp-username");
const inpEmail = document.querySelector(".inp-email");
const inpPwd = document.querySelector(".inp-pwd");
const inpConfirmPwd = document.querySelector(".inp-cf-pw");
const registerForm = document.querySelector("#register-form"); // Đảm bảo khai báo biến trước khi sử dụng

// Hàm xử lý khi người dùng nhấn nút đăng ký
function handleRegister(event) {
    event.preventDefault();

    const username = inpUsername.value.trim();
    const email = inpEmail.value.trim();
    const password = inpPwd.value.trim();
    const confirmPassword = inpConfirmPwd.value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert("Vui lòng điền đủ thông tin!");
        return;
    }

    // if (email === "admin@gmail.com") {
    //     alert("Email hệ thống không thể sử dụng để đăng ký!\nStop code: SYSTEM_EMAIL_DOES_NOT_USE_TO_REGISTER");
    //     return;
    // }

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Lưu thông tin người dùng vào Firestore
            addDoc(collection(db, "users"), {
                uid: user.uid,
                username: username,
                email: email,
                hasPackage: false, // Chưa mua gói học
                balance: 0         // Số dư tài khoản
            })
                .then(() => {
                    alert("Đăng ký tài khoản thành công!\nChuyển đến trang Đăng nhập tại đây");
                    window.location.href = "../html/login.html";
                })
                .catch((error) => {
                    console.error("Lỗi khi lưu thông tin người dùng:", error);
                    alert("Đăng ký thất bại!");
                });
        })
        .catch((error) => {
            console.error("Lỗi đăng ký:", error);
            alert("Đăng ký thất bại! " + error.message);
        });
}

// Gắn sự kiện "submit" cho form
registerForm.addEventListener("submit", handleRegister);