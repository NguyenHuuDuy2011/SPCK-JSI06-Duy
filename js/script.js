import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js"; // Import Firebase từ firebase.js

const db = getFirestore(app);

// Hàm xáo trộn mảng (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Chọn ngẫu nhiên một chỉ số
        [array[i], array[j]] = [array[j], array[i]]; // Hoán đổi vị trí
    }
}

// Lấy danh sách câu hỏi từ localStorage
const questionSets = JSON.parse(localStorage.getItem("questionSets")) || {
    math: [],
    history: [],
    IT: [],
    literature: []
};

// Lấy môn học từ URL
const params = new URLSearchParams(window.location.search);
const subject = params.get("subject");

let questions = questionSets[subject] || []; // Nếu không có môn học, trả về mảng rỗng

// Xáo trộn câu hỏi
shuffleArray(questions); // Xáo trộn thứ tự câu hỏi

let currentQuestionIndex = 0;
let score = 0;

// DOM elements
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const scoreElement = document.getElementById("score");
const questionNav = document.getElementById("question-nav");
const retryQuizBtn = document.getElementById("retry-quiz-btn");
const endQuizBtn = document.getElementById("end-quiz-btn");
const saveScoreBtn = document.getElementById("save-score-btn");

// ...existing code...

// Mảng theo dõi trạng thái câu hỏi (true nếu đã trả lời, false nếu chưa)
let answeredQuestions = Array(questions.length).fill(false);

// Hiển thị câu hỏi
function showQuestion() {
    if (questions.length === 0) {
        questionElement.innerText = "Không có câu hỏi cho môn học này!";
        answerButtons.innerHTML = "";
        return;
    }

    // Nếu tất cả câu hỏi đã được trả lời, dừng hiển thị câu hỏi
    if (answeredQuestions.every(answered => answered)) {
        checkQuizCompletion();
        return;
    }

    const questionData = questions[currentQuestionIndex];

    // Xáo trộn các đáp án và cập nhật chỉ số đáp án đúng
    const originalAnswers = [...questionData.answers]; // Sao chép mảng đáp án gốc
    shuffleArray(questionData.answers); // Xáo trộn mảng đáp án
    questionData.correct = questionData.answers.indexOf(originalAnswers[questionData.correct]); // Cập nhật chỉ số đáp án đúng

    questionElement.innerText = questionData.question;

    // Hiển thị trạng thái "Đã trả lời" nếu câu hỏi đã được trả lời
    if (answeredQuestions[currentQuestionIndex]) {
        questionElement.innerText += " (Đã trả lời)";
    }

    answerButtons.innerHTML = ""; // Xóa đáp án cũ

    questionData.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.classList.add("btn");
        button.innerText = answer;

        // Nếu câu hỏi đã được trả lời, vô hiệu hóa các nút đáp án
        if (answeredQuestions[currentQuestionIndex]) {
            button.disabled = true;
            button.classList.add("disabled");
        } else {
            button.onclick = () => checkAnswer(index);
        }

        answerButtons.appendChild(button);
    });

    // Cập nhật trạng thái của các nút trong question-nav
    updateQuestionNavState();
}

// Kiểm tra đáp án
function checkAnswer(selectedIndex) {
    if (selectedIndex === questions[currentQuestionIndex].correct) {
        score += 10; // Cộng điểm
        scoreElement.innerText = score; // Cập nhật điểm trên giao diện
    }

    // Đánh dấu câu hỏi hiện tại là đã trả lời
    answeredQuestions[currentQuestionIndex] = true;

    // Kiểm tra trạng thái hoàn thành bài quiz
    checkQuizCompletion();

    // Nếu tất cả câu hỏi đã được trả lời, dừng quiz
    if (answeredQuestions.every(answered => answered)) {
        return; // Dừng lại nếu quiz đã hoàn thành
    }

    // Chuyển sang câu hỏi tiếp theo
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    }
}

// Kiểm tra câu hỏi chưa trả lời
function checkUnansweredQuestions() {
    const unansweredIndexes = answeredQuestions
        .map((answered, index) => (!answered ? index : null))
        .filter((index) => index !== null);

    if (unansweredIndexes.length > 0) {
        alert(`Bạn vẫn còn ${unansweredIndexes.length} câu hỏi chưa trả lời!`);
        // Chuyển đến câu hỏi chưa trả lời đầu tiên
        currentQuestionIndex = unansweredIndexes[0];
        showQuestion();
    } else {
        // Nếu tất cả câu hỏi đã được trả lời
        questionElement.innerText = "Chúc mừng bạn đã hoàn thành bài Quiz!";
        answerButtons.innerHTML = ""; // Xóa các nút đáp án
        disableQuestionNav(); // Vô hiệu hóa các nút trong question-nav
        enableButtons(); // Kích hoạt các nút sau khi hoàn thành quiz
    }
}

function checkQuizCompletion() {
    console.log("Đang kiểm tra trạng thái hoàn thành...");
    const allAnswered = answeredQuestions.every(answered => answered); // Kiểm tra nếu tất cả câu hỏi đã được trả lời

    if (allAnswered) {
        console.log("Tất cả câu hỏi đã được trả lời!");
        questionElement.innerText = "Chúc mừng bạn đã hoàn thành bài Quiz!";
        answerButtons.innerHTML = ""; // Xóa các nút đáp án
        disableQuestionNav(); // Vô hiệu hóa các nút trong question-nav
        enableButtons(); // Kích hoạt các nút sau khi hoàn thành quiz
    }
}

// Kích hoạt các nút sau khi hoàn thành quiz
function enableButtons() {
    saveScoreBtn.disabled = false;
    retryQuizBtn.disabled = false;
}

// Vô hiệu hóa các nút khi bắt đầu quiz
function disableButtons() {
    saveScoreBtn.disabled = true;
    retryQuizBtn.disabled = true;
}


// Vô hiệu hóa các nút trong question-nav
function disableQuestionNav() {
    const navButtons = questionNav.querySelectorAll(".nav-btn");
    navButtons.forEach((button) => {
        button.disabled = true; // Vô hiệu hóa nút
        button.classList.add("disabled"); // Thêm lớp CSS để hiển thị trạng thái bị vô hiệu hóa
    });
}

// Làm lại bài Quiz
retryQuizBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn làm lại bài Quiz?")) {
        currentQuestionIndex = 0; // Đặt lại chỉ số câu hỏi
        score = 0; // Đặt lại điểm
        scoreElement.innerText = score; // Cập nhật điểm trên giao diện
        answeredQuestions = Array(questions.length).fill(false); // Đặt lại trạng thái câu hỏi
        disableButtons(); // Vô hiệu hóa các nút
        renderQuestionNav(); // Làm mới danh sách câu hỏi trong question-nav
        showQuestion(); // Hiển thị lại câu hỏi đầu tiên
    }
});

// Kết thúc Quiz
endQuizBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn kết thúc bài Quiz?")) {
        alert(`Quiz đã kết thúc! Tổng điểm của bạn là: ${score}\nStop code: QUIZ_ENDED_BY_USER`);
        window.location.href = "./choose.html"; // Quay lại trang chọn môn học
    }
});

// Hiển thị danh sách câu hỏi trong question-nav
function renderQuestionNav() {
    questionNav.innerHTML = ""; // Xóa nội dung cũ

    questions.forEach((_, index) => {
        const navButton = document.createElement("button");
        navButton.classList.add("nav-btn");
        navButton.innerText = `Câu ${index + 1}`;
        navButton.onclick = () => goToQuestion(index); // Chuyển đến câu hỏi tương ứng
        questionNav.appendChild(navButton);
    });
}

// Cập nhật trạng thái của các nút trong question-nav
function updateQuestionNavState() {
    const navButtons = questionNav.querySelectorAll(".nav-btn");
    navButtons.forEach((button, index) => {
        if (index === currentQuestionIndex) {
            button.classList.add("active"); // Đánh dấu câu hỏi hiện tại
        } else {
            button.classList.remove("active");
        }
    });
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

// Chuyển đến câu hỏi tương ứng
function goToQuestion(index) {
    currentQuestionIndex = index; // Cập nhật chỉ số câu hỏi hiện tại
    showQuestion(); // Hiển thị câu hỏi
    checkQuizCompletion(); // Kiểm tra trạng thái hoàn thành bài quiz
}

// Gọi hàm renderQuestionNav khi trang được tải
window.onload = function () {
    disableButtons(); // Vô hiệu hóa các nút khi bắt đầu
    renderQuestionNav(); // Hiển thị danh sách câu hỏi trong question-nav
    showQuestion(); // Hiển thị câu hỏi đầu tiên
};