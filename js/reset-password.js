document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra Firebase đã được khởi tạo chưa
    if (!firebase.apps.length) {
        console.error("Firebase chưa được khởi tạo. Vui lòng kiểm tra file firebase.js.");
        alert("Lỗi kết nối Firebase. Vui lòng thử lại sau.");
        return;
    }

    console.log("Firebase đã được khởi tạo thành công.");

    // Lấy các phần tử từ DOM
    const emailSection = document.getElementById("email-section");
    const passwordSection = document.getElementById("password-section");
    const emailForm = document.getElementById("email-form");
    const resetPasswordForm = document.getElementById("reset-password-form");
    const backToEmailButton = document.getElementById("back-to-email");
    const emailInput = document.getElementById("email");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    // Kiểm tra nếu các phần tử không tồn tại
    if (!emailForm || !resetPasswordForm || !backToEmailButton || !emailInput || !newPasswordInput || !confirmPasswordInput) {
        console.error("Một hoặc nhiều phần tử DOM không tồn tại. Vui lòng kiểm tra HTML.");
        return;
    }

    // Xử lý khi người dùng nhấn "Xác nhận email"
    emailForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của form

        const email = emailInput.value.trim().toLowerCase(); // Loại bỏ khoảng trắng và chuyển về chữ thường
        console.log("Email nhập vào:", email);

        if (!email) {
            alert("Vui lòng nhập email.");
            return;
        }

        // Kiểm tra email có chứa ký tự không hợp lệ
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
            return;
        }

        // Kiểm tra email trong Firebase
        firebase.auth().fetchSignInMethodsForEmail(email)
            .then((methods) => {
                console.log("Phương thức đăng nhập cho email:", methods);
                if (methods.length > 0) {
                    // Email tồn tại trong Firebase
                    alert("Tài khoản tồn tại. Vui lòng nhập mật khẩu mới.");
                    emailSection.classList.add("d-none");
                    passwordSection.classList.remove("d-none");
                } else {
                    // Email không tồn tại
                    alert(`Tài khoản không tồn tại. Email: ${email}`);
                }
            })
            .catch((error) => {
                console.error("Lỗi khi kiểm tra email:", error);
                if (error.code === "auth/invalid-email") {
                    alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
                } else if (error.code === "auth/network-request-failed") {
                    alert("Lỗi mạng. Vui lòng kiểm tra kết nối internet.");
                } else {
                    alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                }
            });
    });

    // Xử lý khi người dùng nhấn "Đặt lại mật khẩu"
    resetPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của form

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu có khớp không
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp. Vui lòng thử lại.");
            return;
        }

        // Kiểm tra độ dài mật khẩu (ví dụ: ít nhất 6 ký tự)
        if (newPassword.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        // Đặt lại mật khẩu trong Firebase
        const email = emailInput.value.trim();
        firebase.auth().signInWithEmailAndPassword(email, "temporaryPassword") // Đăng nhập tạm thời
            .then((userCredential) => {
                const user = userCredential.user;
                return user.updatePassword(newPassword); // Cập nhật mật khẩu mới
            })
            .then(() => {
                alert("Mật khẩu đã được thay đổi thành công!");
                window.location.href = "../html/login.html"; // Chuyển hướng về trang đăng nhập
            })
            .catch((error) => {
                console.error("Lỗi khi đặt lại mật khẩu:", error);
                if (error.code === "auth/wrong-password") {
                    alert("Không thể thay đổi mật khẩu. Vui lòng liên hệ quản trị viên.");
                } else if (error.code === "auth/user-not-found") {
                    alert("Tài khoản không tồn tại. Vui lòng kiểm tra email.");
                } else {
                    alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                }
            });
    });

    // Xử lý khi người dùng nhấn "Quay lại nhập email"
    backToEmailButton.addEventListener("click", () => {
        emailSection.classList.remove("d-none");
        passwordSection.classList.add("d-none");
    });
});