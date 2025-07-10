const themeSwitch = document.getElementById("theme-switch");
const themeLabel = document.getElementById("theme-label");
const langSelect = document.getElementById("lang-select");
const form = document.getElementById("settings-form");

// Load settings từ localStorage
window.onload = function () {
    const theme = localStorage.getItem("theme") || "light";
    const lang = localStorage.getItem("lang") || "vi";
    themeSwitch.checked = theme === "dark";
    themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
    langSelect.value = lang;
    applyTheme(theme);
    applyLang(lang);
};

themeSwitch.onchange = function () {
    themeLabel.textContent = themeSwitch.checked ? "Dark" : "Light";
};

form.onsubmit = function (e) {
    e.preventDefault();
    const theme = themeSwitch.checked ? "dark" : "light";
    const lang = langSelect.value;
    localStorage.setItem("theme", theme);
    localStorage.setItem("lang", lang);
    applyTheme(theme);
    applyLang(lang);
    alert(lang === "vi" ? "Đã lưu cài đặt!" : "Settings saved!");
    showProgressAndRedirect(form, "../index.html");
};

// Hàm đổi theme
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        if (theme === "dark") {
            navbar.classList.remove('navbar-light', 'bg-light');
            navbar.classList.add('navbar-dark', 'bg-dark');
        } else {
            navbar.classList.remove('navbar-dark', 'bg-dark');
            navbar.classList.add('navbar-light', 'bg-light');
        }
}

// Hàm đổi ngôn ngữ (demo: đổi tiêu đề)
function applyLang(lang) {
    // Object lưu text cho từng ngôn ngữ
    const texts = {
        vi: {
            hello: "Xin chào",
            logout: "Đăng xuất",
            history: "Lịch sử làm bài",
            billing: "Đăng ký gói học / Nạp tiền",
            setting: "Cài đặt Quiz Website"
        },
        en: {
            hello: "Hello",
            logout: "Logout",
            history: "Quiz History",
            billing: "Subscription / Top-up",
            setting: "Quiz Website Settings"
        }
    };
    // Lấy text theo ngôn ngữ
    const t = texts[lang] || texts.vi;

    // Đổi các thành phần giao diện (ví dụ dropdown)
    const loginLink = document.getElementById("login-link");
    const username = localStorage.getItem("username") || "";
    if (loginLink) {
        loginLink.innerHTML = `
        <div class="dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: black;">
                <i class="fa-solid fa-user" style="color: green;"></i> ${t.hello}, ${username.replace(/"/g, "")}
            </a>
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="userDropdown" id="profile-dropdown">
                <li>
                    <a class="dropdown-item" href="#" id="logout-link" style="color: yellow;">
                        <i class="fa-solid fa-right-from-bracket"></i> ${t.logout}
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="../html/info.html" style="color: yellow;">
                        <i class="fa-solid fa-clock-rotate-left"></i> ${t.history}
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="../html/billing.html" style="color: yellow;">
                        <i class="fa-solid fa-wallet"></i> ${t.billing}
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="../html/settings.html" style="color: yellow;">
                        <i class="fa-solid fa-gear"></i> ${t.setting}
                    </a>
                </li>
            </ul>
        </div>
        `;
    }

}

// Đặt ngoài cùng file, không lồng trong hàm khác
function showProgressAndRedirect(form, redirectUrl = "../index.html") {
    // Disable toàn bộ input, button, select, textarea
    const allInputs = document.querySelectorAll("input, button, select, textarea");
    allInputs.forEach(el => el.disabled = true);

    let container = document.createElement("div");
    container.style.marginTop = "2rem";
    container.style.textAlign = "center";

    let progressBarContainer = document.createElement("div");
    progressBarContainer.style.position = "relative";
    progressBarContainer.style.height = "10px";
    progressBarContainer.style.backgroundColor = "#e0e0e0";
    progressBarContainer.style.margin = "0 auto";
    progressBarContainer.style.width = "60%";
    progressBarContainer.style.borderRadius = "5px";

    let progressBar = document.createElement("div");
    progressBar.style.height = "100%";
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = "#4CAF50";
    progressBar.style.borderRadius = "5px";
    progressBar.style.transition = "width 0.2s linear";

    progressBarContainer.appendChild(progressBar);

    let countdownText = document.createElement("div");
    countdownText.style.marginTop = "1.2rem";
    countdownText.style.fontSize = "1.2rem";
    countdownText.innerHTML = `Chuyển về trang chủ trong <span id="countdown">3</span> giây...`;

    container.appendChild(progressBarContainer);
    container.appendChild(countdownText);

    // Thêm vào DOM (sau form hoặc sau alert)
    form.parentNode.insertBefore(container, form.nextSibling);

    let duration = 3000;
    let interval = 30;
    let elapsed = 0;
    let lastSecond = 3;
    const countdownSpan = countdownText.querySelector("#countdown");

    const timer = setInterval(() => {
        elapsed += interval;
        let percent = Math.min(100, (elapsed / duration) * 100);
        progressBar.style.width = percent + "%";
        let nowSecond = Math.ceil((duration - elapsed) / 1000);
        if (nowSecond !== lastSecond && nowSecond >= 0) {
            countdownSpan.textContent = nowSecond;
            lastSecond = nowSecond;
        }
        if (elapsed >= duration) {
            countdownText.innerHTML = `Bắt đầu chuyển hướng...`;
            clearInterval(timer);
            window.location.href = redirectUrl;
        }
    }, interval);
}

// Gợi ý CSS cho dark mode (thêm vào file css chung)