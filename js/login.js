// Lấy phần tử input email từ DOM
const inpEmail = document.querySelector(".inp-email");

// Lấy phần tử input password từ DOM
const inpPwd = document.querySelector(".inp-pwd");

// Lấy phần tử form đăng nhập từ DOM
const loginForm = document.querySelector("#login-form");

// Hàm xử lý khi người dùng nhấn nút đăng nhập
function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)

    // Lấy giá trị email và password từ ô input
    let email = inpEmail.value;
    let password = inpPwd.value;

    // Kiểm tra xem người dùng đã nhập đủ email và password chưa
    if (!email || !password) {
        alert("Vui lòng điền đủ các thông tin trước khi đăng nhập"); // Hiển thị thông báo nếu thiếu
        return; // Dừng lại không tiếp tục xử lý
    }

    if (email == "admin@gmail.com" && password == "admin@2025") {
        alert("Đăng nhập thành công!\nNote: Login_for_Administrator"); // Hiển thị thông báo nếu đăng nhập admin thành công
        localStorage.setItem("isLoggedIn", "true"); // Lưu trạng thái đăng nhập vào localStorage
        localStorage.setItem("username", email); // Lưu email làm tên người dùng
        localStorage.setItem("loginTime", Date.now().toString()); // Lưu thời gian đăng nhập (timestamp)
        window.location.href = "../html/admin.html"; // Chuyển hướng đến trang admin
        return; // Dừng lại không tiếp tục xử lý
    }

    // Gọi Firebase Auth để đăng nhập với email và password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            alert("Đăng nhập thành công\nLưu ý đến người dùng: Tài khoản đã đăng nhập sẽ có hiệu lực trong 1 tiếng. Sau 1 tiếng, tài khoản của bạn sẽ tự động đăng xuất."); // Hiển thị thông báo thành công

            // Lưu trạng thái đăng nhập vào localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", user.email); // Lưu email làm tên người dùng
            localStorage.setItem("loginTime", Date.now().toString()); // Lưu thời gian đăng nhập (timestamp)

            // Chuyển hướng về trang chủ
            window.location.href = "../index.html";
        })
        .catch((error) => {
            alert("Tài khoản hoặc mật khẩu không đúng"); // Hiển thị lỗi
        });
}

// Gán sự kiện "submit" cho form đăng nhập, khi submit thì gọi hàm handleLogin
loginForm.addEventListener("submit", handleLogin);