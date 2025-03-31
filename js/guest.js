// Lấy phần tử dropdown của profile từ DOM
const profileDropdown = document.querySelector('#login-link');

// Kiểm tra xem userSession có tồn tại không
        // Nếu phiên còn hiệu lực, hiển thị thông tin người dùng trong dropdown
        profileDropdown.innerHTML = `
            <li class="bg-grey-light"><span class="dropdown-item">${user.providerData[0].email}</span></li>
            <li><a class="dropdown-item" href="order.html">Thông tin tài khoản</a></li>
            <li><button id="logout-btn" class="btn text-danger">Đăng xuất</button></li>
        `;

        // Gán sự kiện click cho nút đăng xuất
        document.getElementById('logout-btn').addEventListener('click', function () {
            // Hiển thị hộp thoại xác nhận đăng xuất
            if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                // Gọi Firebase Auth để đăng xuất
                firebase.auth().signOut().then(() => {
                    // Nếu đăng xuất thành công, xóa thông tin phiên người dùng khỏi localStorage
                    localStorage.removeItem('user_session');
                    // Chuyển hướng người dùng về trang đăng nhập
                    window.location.href = "../html/login.html";
                }).catch((error) => {
                    // Xử lý lỗi nếu có
                    console.log("Lỗi đăng xuất");
                });
            }
        });
