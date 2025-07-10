(function() {
    const theme = localStorage.getItem("theme") || "light";
    const lang = localStorage.getItem("lang") || "vi";
    if (theme === "dark") document.body.classList.add("dark-mode");
    // Có thể gọi hàm đổi ngôn ngữ nếu muốn
})();
window.onload = function () {
    const loginLink = document.getElementById("login-link");

    // Lấy trạng thái đăng nhập và thời gian đăng nhập từ localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");
    const loginTime = localStorage.getItem("loginTime");
    const email = localStorage.getItem("email");

    console.log("isLoggedIn:", isLoggedIn);
    console.log("username:", username);
    console.log("loginTime:", loginTime);
    console.log("email:", email);

    // Kiểm tra nếu chưa đăng nhập
    if (!isLoggedIn || isLoggedIn !== "true" || !username || !loginTime) {
        alert(":(\nTrang web chưa sẵn sàng!\nHãy đăng nhập để tiếp tục\nStop code: LOGIN_REQUIRED");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        window.location.href = "../html/login.html"; // Chuyển hướng đến trang đăng nhập
        return;
    }

    // Kiểm tra nếu phiên đăng nhập đã hết hạn (quá 1 tiếng)
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 tiếng (ms)
    if (currentTime - parseInt(loginTime) > oneHour) {
        alert(":(\nPhiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!\nStop code: SESSION_EXPIRED");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("email");
        window.location.href = "../html/login.html"; // Chuyển hướng đến trang đăng nhập
        return;
    }

    // Nếu đã đăng nhập và phiên còn hiệu lực, hiển thị thông tin người dùng
    loginLink.innerHTML = `
    <div class="dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: black;">
            <i class="fa-solid fa-user" style="color: green;"></i> Xin chào, ${username.replace(/"/g, "")}
        </a>
        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="userDropdown" id="profile-dropdown">
            <li>
                <a class="dropdown-item" href="#" id="logout-link" style="color: yellow;">
                    <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item" href="../html/info.html" style="color: yellow;">
                    <i class="fa-solid fa-clock-rotate-left"></i> Lịch sử làm bài
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item" href="../html/billing.html" style="color: yellow;">
                    <i class="fa-solid fa-wallet"></i> Đăng ký gói học / Nạp tiền
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item" href="../html/setting.html" style="color: yellow;">
                    <i class="fa-solid fa-wallet"></i> Cài đặt Quiz Website
                </a>
            </li>
        </ul>
    </div>
    `;

    // Thêm sự kiện cho nút Đăng xuất
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // Xóa thông tin đăng nhập khỏi localStorage
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("loginTime");
            localStorage.removeItem("email");
            alert("Đăng xuất thành công!");
            window.location.href = "../html/login.html"; // Chuyển hướng đến trang đăng nhập
        }
    });
};
