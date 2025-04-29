import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js"; // Import Firebase từ firebase-quiz.js

const db = getDatabase(app);
const firestore = getFirestore(app);

// Hàm xáo trộn mảng (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Lấy môn học và khối lớp từ URL
const params = new URLSearchParams(window.location.search);
const subject = params.get("subject");
const grade = params.get("grade");

let questions = []; // Mảng câu hỏi sẽ được lấy từ Firebase
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

// Tạo phần tử h5 cho bộ đếm thời gian
const timerElement = document.createElement("h4");
timerElement.id = "timer";
timerElement.style.marginTop = "10px";
questionElement.parentNode.insertBefore(timerElement, questionElement);

// Mảng theo dõi trạng thái câu hỏi (true nếu đã trả lời, false nếu chưa)
let answeredQuestions = [];
let timer; // Biến lưu trữ interval
let timeLeft = 120; // Thời gian mỗi câu hỏi (giây)

// Hàm định dạng thời gian
function formatTime(seconds) {
    if (seconds > 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `Thời gian còn lại: ${minutes} phút ${remainingSeconds} giây`;
    }
    return `Thời gian còn lại: ${seconds} giây`;
}

// Bắt đầu đếm ngược thời gian
function startCountdown() {
    clearInterval(timer); // Xóa interval cũ nếu có
    timeLeft = 120; // Đặt lại thời gian cho mỗi câu hỏi
    timerElement.innerText = formatTime(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = formatTime(timeLeft);

        // Thay đổi màu sắc khi thời gian <= 20 giây
        if (timeLeft <= 30) {
            timerElement.style.color = "red"; // Đổi màu chữ thành đỏ
        } else {
            timerElement.style.color = "black"; // Đổi lại màu chữ thành đen
        }

        if (timeLeft <= 0) {
            clearInterval(timer); // Dừng đếm ngược
            alert("Hết thời gian cho câu hỏi này!");
            answeredQuestions[currentQuestionIndex] = false; // Đánh dấu câu hỏi chưa trả lời
            currentQuestionIndex++; // Chuyển sang câu hỏi tiếp theo

            if (currentQuestionIndex < questions.length) {
                showQuestion();
                startCountdown(); // Bắt đầu đếm ngược cho câu hỏi tiếp theo
            } else {
                checkQuizCompletion(); // Kiểm tra trạng thái hoàn thành bài Quiz
            }
        }
    }, 1000); // Cập nhật mỗi giây
}

// Hàm lấy câu hỏi từ Firebase
async function fetchQuestions() {
    const questionPath = `questions/${grade}/${subject}`;
    const questionRef = ref(db, questionPath);

    try {
        const snapshot = await get(questionRef);
        if (snapshot.exists()) {
            questions = snapshot.val(); // Lấy dữ liệu từ Firebase
            answeredQuestions = Array(questions.length).fill(false); // Đặt trạng thái câu hỏi chưa trả lời
            shuffleArray(questions); // Xáo trộn câu hỏi
            renderQuestionNav(); // Hiển thị danh sách câu hỏi
            showQuestion(); // Hiển thị câu hỏi đầu tiên
        } else {
            console.warn("Không tìm thấy câu hỏi trong Firebase.");
            questionElement.innerText = "Chưa có câu hỏi nào được thêm cho môn học này!";
            answerButtons.innerHTML = ""; // Xóa các nút đáp án
        }
    } catch (error) {
        console.error("Lỗi khi tải câu hỏi từ Firebase:", error);
        alert("Không thể tải câu hỏi. Vui lòng kiểm tra kết nối mạng hoặc quyền truy cập Firebase.");
    }
}

// Hiển thị câu hỏi
function showQuestion() {
    if (questions.length === 0) {
        questionElement.innerText = "Chưa có câu hỏi nào được thêm cho môn học này!";
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
        button.onclick = () => {
            clearInterval(timer); // Dừng đếm ngược khi người dùng trả lời
            checkAnswer(index); // Kiểm tra đáp án
        };
        answerButtons.appendChild(button);
    });

    updateQuestionNavState(); // Cập nhật trạng thái của các nút trong question-nav
    startCountdown(); // Bắt đầu đếm ngược cho câu hỏi mới
}

// Kiểm tra đáp án
function checkAnswer(selectedIndex) {
    const correctIndex = questions[currentQuestionIndex].correct;
    if (selectedIndex === correctIndex) {
        score += 10; // Cộng điểm nếu trả lời đúng
        scoreElement.innerText = score; // Cập nhật điểm trên giao diện
    }

    answeredQuestions[currentQuestionIndex] = true; // Đánh dấu câu hỏi hiện tại là đã trả lời

    // Chuyển sang câu hỏi tiếp theo
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        checkQuizCompletion(); // Kiểm tra trạng thái hoàn thành bài quiz
    }
}

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

// Chuyển đến câu hỏi tương ứng
function goToQuestion(index) {
    currentQuestionIndex = index; // Cập nhật chỉ số câu hỏi hiện tại
    showQuestion(); // Hiển thị câu hỏi
}

// Kiểm tra trạng thái hoàn thành bài quiz
function checkQuizCompletion() {
    if (answeredQuestions.every(answered => answered)) {
        questionElement.innerText = "Chúc mừng bạn đã hoàn thành bài Quiz!";
        answerButtons.innerHTML = ""; // Xóa các nút đáp án
        saveQuizHistory(subject, score); // Lưu lịch sử quiz
        clearInterval(timer); // Dừng bộ đếm thời gian
        enableButtons(); // Kích hoạt các nút sau khi hoàn thành quiz
    }
}

// Lưu lịch sử quiz vào localStorage
function saveQuizHistory(subject, score) {
    const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
    quizHistory.push({
        subject: subject,
        grade: grade,
        score: score,
        timestamp: Date.now(),
    });
    localStorage.setItem("quizHistory", JSON.stringify(quizHistory));
}

// Gán sự kiện cho nút Lưu điểm
saveScoreBtn.addEventListener("click", saveScore);

// Làm lại bài Quiz
retryQuizBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn làm lại bài Quiz?")) {
        currentQuestionIndex = 0;
        score = 0;
        scoreElement.innerText = score;
        answeredQuestions = Array(questions.length).fill(false);
        showQuestion();
    }
});

// Kết thúc Quiz
endQuizBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn kết thúc bài Quiz?")) {
        alert(`Quiz đã kết thúc! Tổng điểm của bạn là: ${score}`);
        window.location.href = "./choose.html";
    }
});

// Hàm lưu điểm vào Firestore
async function saveScore() {
    if (score <= 0) {
        alert("Bạn chưa trả lời câu hỏi nào! Không thể lưu điểm.");
        return;
    }

    // Hỏi thông tin người dùng
    const playerName = prompt("Nhập họ và tên của bạn:");
    if (!playerName) {
        alert("Bạn cần nhập họ và tên để lưu điểm.");
        return;
    }

    const schoolName = prompt("Nhập tên trường của bạn:\n Mã tên trường cần nhập: THCS + tên trường. VD: THCS Bình Trị Đông A");
    if (!schoolName) {
        alert("Bạn cần nhập tên trường để lưu điểm.");
        return;
    }

    const className = prompt("Nhập lớp của bạn:\n VD: 6A1, 7A2, 8A3");
    if (!className) {
        alert("Bạn cần nhập lớp để lưu điểm.");
        return;
    }

    try {
        // Lưu thông tin vào Firestore
        await addDoc(collection(firestore, "leaderboard"), {
            name: playerName,
            school: schoolName,
            class: className,
            score: score,
            grade: grade,
            subject: subject,
            timestamp: new Date(),
        });
        alert("Điểm đã được lưu thành công!");
    } catch (error) {
        console.error("Lỗi khi lưu điểm:", error);
        alert("Lưu điểm thất bại! Vui lòng thử lại.");
    }
}

// Vô hiệu hóa các nút khi bắt đầu quiz
function disableButtons() {
    saveScoreBtn.disabled = true;
    retryQuizBtn.disabled = true;
    saveScoreBtn.classList.add("disabled"); // Thêm lớp CSS để hiển thị trạng thái bị vô hiệu hóa
    retryQuizBtn.classList.add("disabled");
}

// Kích hoạt các nút sau khi hoàn thành quiz
function enableButtons() {
    saveScoreBtn.disabled = false;
    retryQuizBtn.disabled = false;
    saveScoreBtn.classList.remove("disabled"); // Xóa lớp CSS để hiển thị trạng thái bình thường
    retryQuizBtn.classList.remove("disabled");
}

// Bắt đầu quiz khi trang được tải
window.onload = function () {
    disableButtons(); // Vô hiệu hóa các nút khi bắt đầu
    fetchQuestions(); // Lấy câu hỏi từ Firebase và bắt đầu quiz
};