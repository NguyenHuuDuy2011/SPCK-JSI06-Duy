import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js"; // Import Firebase từ firebase.js

const db = getFirestore(app);

const questions = [
    { question: "Câu hỏi 1: Thủ đô của Việt Nam là gì?", answers: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế"], correct: 0 },
    { question: "Câu hỏi 2: Người đầu tiên đặt tên nước Việt Nam là?", answers: ["Vua Gia Long", "Chủ tịch Hồ Chí Minh", "Trần Thủ Độ", "Nguyễn Huệ"], correct: 0 },
    { question: "Câu hỏi 3: 2 + 2 bằng mấy?", answers: ["3", "4", "5", "6"], correct: 1 },
    { question: "Câu hỏi 4: Trong tam giác vuông, góc vuông có số đo góc là bao nhiêu?", answers: ["0", "180", "90", "360"], correct: 2 },
    { question: "Câu hỏi 5: Góc tù là góc có số đo?", answers: [">90 và < 180", "<90", "<180", ">180"], correct: 0 },
];

let currentQuestionIndex = 0;
let score = 0;

// DOM elements
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const scoreElement = document.getElementById("score");

// Hiển thị câu hỏi
function showQuestion() {
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
            score: score
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

// Hiển thị câu hỏi đầu tiên khi tải trang
window.onload = function() {
    showQuestion();
};

