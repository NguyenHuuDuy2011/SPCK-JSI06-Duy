document.addEventListener("DOMContentLoaded", () => {
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

        const email = emailInput.value.trim(); // Loại bỏ khoảng trắng thừa
        console.log("Email nhập vào:", email);
            
        firebase.auth().fetchSignInMethodsForEmail(email)
            .then((methods) => {
                console.log("Phương thức đăng nhập:", methods);
                if (methods.length > 0) {
                    alert("Email hợp lệ. Vui lòng nhập mật khẩu mới.");
                    emailSection.classList.add("d-none");
                    passwordSection.classList.remove("d-none");
                
                    // Kích hoạt các trường nhập mật khẩu
                    newPasswordInput.disabled = false;
                    confirmPasswordInput.disabled = false;
                } else {
                    alert("Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");
                }
            })
            .catch((error) => {
                console.error("Lỗi khi kiểm tra email:", error);
                alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            });
    });

    // Xử lý khi người dùng nhấn "Đặt lại mật khẩu"
    resetPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của form

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

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

        // Gọi Firebase để đặt lại mật khẩu
        const user = firebase.auth().currentUser;
        if (user) {
            user.updatePassword(newPassword)
                .then(() => {
                    alert("Mật khẩu đã được đặt lại thành công!");
                    window.location.href = "../html/login.html"; // Chuyển hướng về trang đăng nhập
                })
                .catch((error) => {
                    console.error("Lỗi khi đặt lại mật khẩu:", error);
                    alert("Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.");
                });
        } else {
            alert("Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
            window.location.href = "../html/login.html"; // Chuyển hướng về trang đăng nhập
        }
    });

    // Xử lý khi người dùng nhấn "Quay lại nhập email"
    backToEmailButton.addEventListener("click", () => {
        emailSection.classList.remove("d-none");
        passwordSection.classList.add("d-none");

        // Vô hiệu hóa các trường nhập mật khẩu
        newPasswordInput.disabled = true;
        confirmPasswordInput.disabled = true;
    });
});