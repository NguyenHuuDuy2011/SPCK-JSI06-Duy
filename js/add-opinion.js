import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById('opinionForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const comment = document.getElementById('comment').value.trim();
    const like = form.like.value;
    const device = form.device.value;
    const address = document.getElementById('address').value.trim();
    const author = document.getElementById('author').value.trim();

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
            author, // thêm dòng này
            createdAt: serverTimestamp()
        });
        form.reset();
        successMsg.classList.remove('d-none');
    } catch (error) {
        alert("Có lỗi xảy ra khi gửi ý kiến. Vui lòng thử lại!");
    }
    // ...existing code...
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
// ...existing code...
});