import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById('opinionForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Hiện loading + hiệu ứng ba chấm
    document.getElementById("loading-overlay").style.display = "flex";
    startLoadingDots();
    const comment = document.getElementById('comment').value.trim();
    const like = form.like.value;
    const device = form.device.value;
    const address = document.getElementById('address').value.trim();
    const author = document.getElementById('author').value.trim();
    const email = localStorage.getItem("email") || "";

    let deviceText = '';
    let deviceIcon = '';
    if (device === 'pc') {
        deviceText = 'Máy tính cá nhân';
        deviceIcon = 'fa-computer';
    } else if (device === 'tablet') {
        deviceText = 'Máy tính bảng';
        deviceIcon = 'fa-tablet-screen-button';
    } else if (device === 'mobile') {
        deviceText = 'Điện thoại';
        deviceIcon = 'fa-mobile-screen';
    }

    let likeText = '';
    let likeIcon = '';
    if (like === 'yes') {
        likeText = 'Có, tôi rất thích Quiz Website!';
        likeIcon = 'fa-circle-check';
    } else {
        likeText = 'Không, tôi không thích lắm';
        likeIcon = 'fa-circle-xmark';
    }

    try {
        await addDoc(collection(db, "opinions"), {
            comment,
            device,
            deviceText,
            deviceIcon,
            address,
            like,
            likeText,
            likeIcon,
            author,
            email, // <-- thêm dòng này
            createdAt: serverTimestamp()
        });
        form.reset();
        successMsg.classList.remove('d-none');
        // Hiện progress bar và đếm ngược
        howProgressAndRedirect(form, "../index.html");
    } catch (error) {
        alert("Có lỗi xảy ra khi gửi ý kiến. Vui lòng thử lại!");
    }
console.log({
    comment,
    device,
    deviceText,
    deviceIcon,
    address,
    like,
    likeText,
    likeIcon,
    createdAt: serverTimestamp()
});
    // Ẩn loading + hiệu ứng ba chấm
    document.getElementById("loading-overlay").style.display = "none";
    stopLoadingDots();

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
});