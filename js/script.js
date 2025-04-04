import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js"; // Import Firebase từ firebase.js

const db = getFirestore(app);

const questionSets = {
    math: [
        { question: "Câu hỏi Toán 1: 2 + 2 bằng mấy?", answers: ["3", "4", "5", "6"], correct: 1 },
        { question: "Câu hỏi Toán 2: Góc vuông có số đo bao nhiêu?", answers: ["0", "90", "180", "360"], correct: 1 },
    ],
    history: [
        { question: "Câu hỏi Lịch sử 1: Ai là người đầu tiên đặt tên nước Việt Nam?", answers: ["Vua Gia Long", "Hồ Chí Minh", "Trần Thủ Độ", "Nguyễn Huệ"], correct: 0 },
        { question: "Câu hỏi Lịch sử 2: Năm 1945, sự kiện gì xảy ra ở Việt Nam?", answers: ["Cách mạng tháng Tám", "Chiến tranh thế giới thứ hai", "Thành lập Đảng", "Chiến tranh Đông Dương"], correct: 0 },
    ],
    IT: [
        { question: "Câu hỏi Tin học 1: HTML là viết tắt của?", answers: ["HyperText Markup Language", "HyperText Machine Language", "HighText Markup Language", "None of the above"], correct: 0 },
        { question: "Câu hỏi Tin học 2: CSS dùng để làm gì?", answers: ["Định dạng giao diện", "Lập trình logic", "Lưu trữ dữ liệu", "Tạo cơ sở dữ liệu"], correct: 0 },
    ],
    literature: [
        { question: "Câu hỏi Văn 1: Tác giả của 'Truyện Kiều' là ai?", answers: ["Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi", "Phạm Ngũ Lão"], correct: 0 },
        { question: "Câu hỏi Văn 2: 'Chinh phụ ngâm' được viết bằng thể loại nào?", answers: ["Thơ lục bát", "Thơ song thất lục bát", "Thơ thất ngôn", "Thơ ngũ ngôn"], correct: 1 },
    ],
};

// Lấy môn học từ URL
const params = new URLSearchParams(window.location.search);
const subject = params.get("subject");

const questions = questionSets[subject] || []; // Nếu không có môn học, trả về mảng rỗng

let currentQuestionIndex = 0;
let score = 0;

// DOM elements
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const scoreElement = document.getElementById("score");
const questionNav = document.getElementById("question-nav"); // Thêm phần tử DOM cho danh sách câu hỏi

// Hiển thị danh sách các câu hỏi
// ...existing code...

// Hiển thị danh sách các câu hỏi
function renderQuestionNav() {
    questionNav.innerHTML = ""; // Xóa danh sách cũ

    questions.forEach((_, index) => {
        const button = document.createElement("button");
        button.classList.add("btn-nav");
        button.innerText = `Câu ${index + 1}`;
        button.onclick = () => goToQuestion(index); // Chuyển đến câu hỏi tương ứng

        // Thêm lớp 'active' nếu đây là câu hỏi hiện tại
        if (index === currentQuestionIndex) {
            button.classList.add("active");
        }

        questionNav.appendChild(button);
    });
}

// Chuyển đến câu hỏi tương ứng
function goToQuestion(index) {
    currentQuestionIndex = index;
    renderQuestionNav(); // Cập nhật trạng thái nút
    showQuestion();
}


// Hiển thị câu hỏi
function showQuestion() {
    if (questions.length === 0) {
        questionElement.innerText = "Không có câu hỏi cho môn học này!";
        answerButtons.innerHTML = "";
        return;
    }

    const questionData = questions[currentQuestionIndex];
    questionElement.innerText = questionData.question;

    answerButtons.innerHTML = ""; // Xóa đáp án cũ

    questionData.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.classList.add("btn");
        button.innerText = answer;
        button.onclick = () => checkAnswer(index);
        answerButtons.appendChild(button);
    });
}

// Kiểm tra đáp án
function checkAnswer(selectedIndex) {
    if (selectedIndex === questions[currentQuestionIndex].correct) {
        score += 10; // Cộng điểm
        scoreElement.innerText = score; // Cập nhật điểm trên giao diện
    }

    // Chuyển sang câu hỏi tiếp theo
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        alert(`Quiz hoàn thành! Tổng điểm: ${score}`);
        saveScore(); // Lưu điểm
    }
}

// Lưu điểm vào Firebase
async function saveScore() {
    const playerName = prompt("Nhập tên của bạn:");
    if (!playerName) return;

    try {
        await addDoc(collection(db, "leaderboard"), {
            name: playerName,
            score: score,
            subject: subject, // Lưu cả môn học
        });
        alert("Điểm đã được lưu!");
        window.location.href = "ranking.html"; // Chuyển sang bảng xếp hạng
    } catch (error) {
        console.error("Lỗi khi lưu điểm:", error);
        alert("Lưu điểm thất bại!");
    }
}

// Gán sự kiện cho nút Lưu điểm
document.querySelector(".btn-home").addEventListener("click", saveScore);

// Hiển thị câu hỏi đầu tiên và danh sách câu hỏi khi tải trang
window.onload = function () {
    renderQuestionNav(); // Hiển thị danh sách câu hỏi
    showQuestion();
};