import { db } from './firebase.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const carouselInner = document.querySelector('.carousel-inner');
const carouselIndicators = document.querySelector('.carousel-indicators');
const carouselPrev = document.querySelector('.carousel-control-prev');
const carouselNext = document.querySelector('.carousel-control-next');
const currentEmail = localStorage.getItem("email") || "";
const isAdmin = currentEmail === "admin@gmail.com";

async function loadOpinions() {
    const q = query(collection(db, "opinions"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    // Nếu không có ý kiến nào
    if (querySnapshot.empty) {
        carouselInner.innerHTML = `
            <div class="carousel-item active container-fluid">
                <h2 class="testimonial-text nhan-xet text-center">Chưa có ý kiến từ người dùng</h2>
            </div>
        `;
        carouselIndicators.innerHTML = '';
        carouselPrev.style.display = 'none';
        carouselNext.style.display = 'none';
        return;
    }

    // Có ý kiến
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    let idx = 0;
    let count = 0;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
    const item = document.createElement('div');
    item.className = `carousel-item container-fluid${idx === 0 ? ' active' : ''}`;
    item.innerHTML = `
    <h2 class="testimonial-text nhan-xet">${data.comment}</h2>
    <em><i class="fa-solid ${data.deviceIcon}"></i> Bình luận từ ${data.deviceText}${data.address ? ' - ' + data.address : ''}${data.author ? ' - ' + data.author : ''}</em><br>
    <em><i class="fa-solid ${data.likeIcon}"></i> ${data.likeText}</em>
    ${isAdmin ? `
        <div class="mt-2">
            <button class="btn btn-sm btn-warning me-2 btn-edit-opinion" data-id="${doc.id}"><i class="fa fa-edit"></i> Sửa</button>
            <button class="btn btn-sm btn-danger btn-delete-opinion" data-id="${doc.id}"><i class="fa fa-trash"></i> Xóa</button>
            <span class="loading-dots d-none" id="loading-${doc.id}">Đang xử lý <span class="dots"></span></span>
        </div>
    ` : ""}
`;
    carouselInner.appendChild(item);

        // Tạo indicator
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#carouselExampleIndicators');
        indicator.setAttribute('data-bs-slide-to', idx);
        if (idx === 0) {
            indicator.className = 'active';
            indicator.setAttribute('aria-current', 'true');
        }
        indicator.setAttribute('aria-label', `Slide ${idx + 1}`);
        carouselIndicators.appendChild(indicator);

        idx++;
        count++;
    });

    // Nếu chỉ có 1 ý kiến, ẩn nút chuyển
    if (count <= 1) {
        carouselPrev.style.display = 'none';
        carouselNext.style.display = 'none';
    } else {
        carouselPrev.style.display = '';
        carouselNext.style.display = '';
    }
    
function startLoadingDotsSpan(span) {
    let count = 0;
    span.classList.remove('d-none');
    const dots = span.querySelector('.dots');
    span._interval = setInterval(() => {
        count = (count + 1) % 4; // 0, 1, 2, 3, 0, 1, ...
        dots.textContent = '.'.repeat(count);
    }, 400);
}
function stopLoadingDotsSpan(span) {
    if (span._interval) clearInterval(span._interval);
    const dots = span.querySelector('.dots');
    if (dots) dots.textContent = '';
    span.classList.add('d-none');
}

// ...sau khi loadOpinions() xong, thêm sự kiện:
carouselInner.querySelectorAll('.btn-delete-opinion').forEach(btn => {
    btn.onclick = async function () {
        if (!confirm("Bạn chắc chắn muốn xóa ý kiến của người dùng này?")) return;
        const id = btn.getAttribute('data-id');
        const loadingSpan = document.getElementById(`loading-${id}`);
        startLoadingDotsSpan(loadingSpan);
        try {
            await deleteDoc(doc(db, "opinions", id));
            await loadOpinions();
        } catch (e) {
            alert("Xóa thất bại!");
        }
        stopLoadingDotsSpan(loadingSpan);
    };
});

carouselInner.querySelectorAll('.btn-edit-opinion').forEach(btn => {
    btn.onclick = async function () {
        const id = btn.getAttribute('data-id');
        const loadingSpan = document.getElementById(`loading-${id}`);
        // Lấy ý kiến cũ
        const item = btn.closest('.carousel-item');
        const oldComment = item.querySelector('.testimonial-text.nhan-xet').textContent || "";
        const comment = prompt("Nhập nội dung mới cho ý kiến này:", oldComment); // <-- truyền giá trị cũ vào prompt
        if (comment && comment.trim()) {
            startLoadingDotsSpan(loadingSpan);
            try {
                await updateDoc(doc(db, "opinions", id), { comment: comment.trim() });
                await loadOpinions();
            } catch (e) {
                alert("Sửa thất bại!");
            }
            stopLoadingDotsSpan(loadingSpan);
        }
    };
});
}

loadOpinions();