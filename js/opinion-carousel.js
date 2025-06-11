import { db } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const carouselInner = document.querySelector('.carousel-inner');
const carouselIndicators = document.querySelector('.carousel-indicators');
const carouselPrev = document.querySelector('.carousel-control-prev');
const carouselNext = document.querySelector('.carousel-control-next');

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
}

loadOpinions();