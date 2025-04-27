// Lấy phần tử input email từ DOM
const inpEmail = document.querySelector(".inp-email");

// Lấy phần tử input password từ DOM
const inpPwd = document.querySelector(".inp-pwd");

// Lấy phần tử form đăng nhập từ DOM
const loginForm = document.querySelector("#login-form");

// // Lấy phần tử liên kết "Quên mật khẩu"
// const forgotPasswordLink = document.getElementById("forgot-password-link");

// Hàm xử lý khi người dùng nhấn nút đăng nhập
function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)

    // Lấy giá trị email và password từ ô input
    let email = inpEmail.value.trim();
    let password = inpPwd.value.trim();

    // Kiểm tra xem người dùng đã nhập đủ email và password chưa
    if (!email || !password) {
        alert("Vui lòng điền đủ các thông tin trước khi đăng nhập"); // Hiển thị thông báo nếu thiếu
        return; // Dừng lại không tiếp tục xử lý
    }

    // Kiểm tra tài khoản admin
    if (email === "admin@gmail.com" && password === "admin@2025") {
        alert("Đăng nhập thành công!\nChuyển sang trang chủ Admin tại đây\nNote: Login_for_Administrator"); // Hiển thị thông báo nếu đăng nhập admin thành công
        localStorage.setItem("isLoggedIn", "true"); // Lưu trạng thái đăng nhập vào localStorage
        localStorage.setItem("username", email); // Lưu email làm tên người dùng
        localStorage.setItem("loginTime", Date.now().toString()); // Lưu thời gian đăng nhập (timestamp)
        window.location.href = "../html/admin.html"; // Chuyển hướng đến trang admin
        return; // Dừng lại không tiếp tục xử lý
    }

    // Gọi Firebase Auth để đăng nhập với email và password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Đăng nhập thành công\nLưu ý đến người dùng: Tài khoản đã đăng nhập sẽ có hiệu lực trong 1 tiếng. Sau 1 tiếng, tài khoản của bạn sẽ tự động đăng xuất."); // Hiển thị thông báo thành công

            // Lưu trạng thái đăng nhập vào localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", JSON.stringify(user.email)); // Lưu email làm tên người dùng
            localStorage.setItem("loginTime", JSON.stringify(Date.now())); // Lưu thời gian đăng nhập (timestamp)

            // Chuyển hướng về trang chủ
            window.location.href = "../index.html";
        })
        .catch((error) => {
            console.error("Lỗi đăng nhập:", error);
            if (error.code === "auth/user-not-found") {
                alert("Tài khoản không tồn tại. Vui lòng kiểm tra lại email.");
            } else if (error.code === "auth/wrong-password") {
                alert("Mật khẩu không đúng. Vui lòng thử lại.");
            } else if (error.code === "auth/invalid-email") {
                alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
            } else {
                alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        });
}

// Xử lý sự kiện khi người dùng nhấn vào "Quên mật khẩu"
// forgotPasswordLink.addEventListener("click", (event) => {
//     event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
//     window.location.href = "../html/reset-password.html"; // Chuyển hướng đến trang đặt lại mật khẩu
// });

// Gán sự kiện "submit" cho form đăng nhập, khi submit thì gọi hàm handleLogin
loginForm.addEventListener("submit", handleLogin);