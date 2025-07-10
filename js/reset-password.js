// document.addEventListener("DOMContentLoaded", () => {
//     // Kiểm tra Firebase đã được khởi tạo chưa
//     if (!firebase.apps.length) {
//         console.error("Firebase chưa được khởi tạo. Vui lòng kiểm tra file firebase.js.");
//         alert("Lỗi kết nối Firebase. Vui lòng thử lại sau.");
//         return;
//     }

//     console.log("Firebase đã được khởi tạo thành công.");

//     // Lấy các phần tử từ DOM
//     const emailSection = document.getElementById("email-section");
//     const passwordSection = document.getElementById("password-section");
//     const emailForm = document.getElementById("email-form");
//     const resetPasswordForm = document.getElementById("reset-password-form");
//     const backToEmailButton = document.getElementById("back-to-email");
//     const emailInput = document.getElementById("email");
//     const newPasswordInput = document.getElementById("new-password");
//     const confirmPasswordInput = document.getElementById("confirm-password");

//     // Kiểm tra nếu các phần tử không tồn tại
//     if (!emailForm || !resetPasswordForm || !backToEmailButton || !emailInput || !newPasswordInput || !confirmPasswordInput) {
//         console.error("Một hoặc nhiều phần tử DOM không tồn tại. Vui lòng kiểm tra HTML.");
//         return;
//     }

//     // Xử lý khi người dùng nhấn "Xác nhận email"
//     emailForm.addEventListener("submit", (event) => {
//         event.preventDefault(); // Ngăn chặn hành vi mặc định của form

//         const email = emailInput.value.trim().toLowerCase(); // Loại bỏ khoảng trắng và chuyển về chữ thường
//         console.log("Email nhập vào:", email);

//         if (!email) {
//             alert("Vui lòng nhập email.");
//             return;
//         }

//         // Kiểm tra email có chứa ký tự không hợp lệ
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//             alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
//             return;
//         }

//         // Kiểm tra email trong Firebase
//         firebase.auth().fetchSignInMethodsForEmail(email)
//             .then((methods) => {
//                 console.log("Phương thức đăng nhập cho email:", methods);
//                 if (methods.length > 0) {
//                     // Email tồn tại trong Firebase
//                     alert("Tài khoản tồn tại. Vui lòng nhập mật khẩu mới.");
//                     emailSection.classList.add("d-none");
//                     passwordSection.classList.remove("d-none");
//                 } else {
//                     // Email không tồn tại
//                     alert(`Tài khoản không tồn tại. Email: ${email}`);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Lỗi khi kiểm tra email:", error);
//                 if (error.code === "auth/invalid-email") {
//                     alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
//                 } else if (error.code === "auth/network-request-failed") {
//                     alert("Lỗi mạng. Vui lòng kiểm tra kết nối internet.");
//                 } else {
//                     alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
//                 }
//             });
//     });

//     // Xử lý khi người dùng nhấn "Đặt lại mật khẩu"
//     resetPasswordForm.addEventListener("submit", (event) => {
//         event.preventDefault(); // Ngăn chặn hành vi mặc định của form

//         const newPassword = newPasswordInput.value.trim();
//         const confirmPassword = confirmPasswordInput.value.trim();

//         // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu có khớp không
//         if (newPassword !== confirmPassword) {
//             alert("Mật khẩu mới và xác nhận mật khẩu không khớp. Vui lòng thử lại.");
//             return;
//         }

//         // Kiểm tra độ dài mật khẩu (ví dụ: ít nhất 6 ký tự)
//         if (newPassword.length < 6) {
//             alert("Mật khẩu phải có ít nhất 6 ký tự.");
//             return;
//         }

//         // Đặt lại mật khẩu trong Firebase
//         const email = emailInput.value.trim();
//         firebase.auth().signInWithEmailAndPassword(email, "temporaryPassword") // Đăng nhập tạm thời
//             .then((userCredential) => {
//                 const user = userCredential.user;
//                 return user.updatePassword(newPassword); // Cập nhật mật khẩu mới
//             })
//             .then(() => {
//                 alert("Mật khẩu đã được thay đổi thành công!");
//                 window.location.href = "../html/login.html"; // Chuyển hướng về trang đăng nhập
//             })
//             .catch((error) => {
//                 console.error("Lỗi khi đặt lại mật khẩu:", error);
//                 if (error.code === "auth/wrong-password") {
//                     alert("Không thể thay đổi mật khẩu. Vui lòng liên hệ quản trị viên.");
//                 } else if (error.code === "auth/user-not-found") {
//                     alert("Tài khoản không tồn tại. Vui lòng kiểm tra email.");
//                 } else {
//                     alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
//                 }
//             });
//     });

//     // Xử lý khi người dùng nhấn "Quay lại nhập email"
//     backToEmailButton.addEventListener("click", () => {
//         emailSection.classList.remove("d-none");
//         passwordSection.classList.add("d-none");
//     });
// });

// cách 2
// import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// document.addEventListener("DOMContentLoaded", () => {
//     const emailForm = document.getElementById("email-form");
//     const emailInput = document.getElementById("email");

//     emailForm.addEventListener("submit", async (event) => {
//         event.preventDefault();
//         const email = emailInput.value.trim().toLowerCase();
//         if (!email) {
//             alert("Vui lòng nhập email.");
//             return;
//         }
//         try {
//             const auth = getAuth();
//             await sendPasswordResetEmail(auth, email);
//             alert("Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
//         } catch (error) {
//             if (error.code === "auth/user-not-found") {
//                 alert("Tài khoản không tồn tại.");
//             } else if (error.code === "auth/invalid-email") {
//                 alert("Email không hợp lệ.");
//             } else {
//                 alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
//             }
//         }
//     });
// });

// cách 3
// import { getAuth, updatePassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// const form = document.getElementById("reset-password-form");
// const loadingOverlay = document.getElementById("loading-overlay");

// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const email = document.getElementById("email").value.trim();
//     const newPassword = document.getElementById("new-password").value.trim();
//     const confirmPassword = document.getElementById("confirm-password").value.trim();

//     if (!email || !newPassword || !confirmPassword) {
//         alert("Vui lòng nhập đầy đủ thông tin.");
//         return;
//     }
//     if (newPassword !== confirmPassword) {
//         alert("Mật khẩu xác nhận không khớp.");
//         return;
//     }
//     if (newPassword.length < 6) {
//         alert("Mật khẩu phải có ít nhất 6 ký tự.");
//         return;
//     }

//     loadingOverlay.style.display = "flex";

//     try {
//         const auth = getAuth();
//         // Nếu đã đăng nhập, đổi mật khẩu luôn
//         if (auth.currentUser && auth.currentUser.email === email) {
//             await updatePassword(auth.currentUser, newPassword);
//             loadingOverlay.style.display = "none";
//             alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
//             window.location.href = "./login.html";
//         } else {
//             // Nếu chưa đăng nhập, yêu cầu đăng nhập trước
//             loadingOverlay.style.display = "none";
//             alert("Bạn cần đăng nhập trước khi đổi mật khẩu!");
//             window.location.href = "./login.html";
//         }
//     } catch (err) {
//         loadingOverlay.style.display = "none";
//         alert("Đổi mật khẩu thất bại: " + (err.message || "Vui lòng thử lại."));
//     }
// });

import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const form = document.getElementById("reset-password-form");
const loadingOverlay = document.getElementById("loading-overlay");
const successMsg = document.getElementById("reset-success");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) {
        alert("Vui lòng nhập email.");
        return;
    }
    loadingOverlay.style.display = "flex";
    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        loadingOverlay.style.display = "none";
        successMsg.textContent = "Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam).";
        successMsg.classList.remove("d-none");
    } catch (error) {
        loadingOverlay.style.display = "none";
        if (error.code === "auth/user-not-found") {
            alert("Tài khoản không tồn tại.");
        } else if (error.code === "auth/invalid-email") {
            alert("Email không hợp lệ.");
        } else {
            alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }
});