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

// Thêm thanh trạng thái tiến trình
const progressBarContainer = document.createElement("div");
progressBarContainer.id = "progress-bar-container";
progressBarContainer.style.position = "relative";
progressBarContainer.style.height = "10px";
progressBarContainer.style.backgroundColor = "#e0e0e0";
progressBarContainer.style.marginTop = "20px";
progressBarContainer.style.borderRadius = "5px";

const progressBar = document.createElement("div");
progressBar.id = "progress-bar";
progressBar.style.height = "100%";
progressBar.style.width = "0%";
progressBar.style.backgroundColor = "#4CAF50";
progressBar.style.borderRadius = "5px";
progressBar.style.transition = "none"; // Tắt transition để cập nhật mượt mà

progressBarContainer.appendChild(progressBar);
questionElement.parentNode.insertBefore(progressBarContainer, questionElement.nextSibling);

// Mảng theo dõi trạng thái câu hỏi (true nếu đã trả lời, false nếu chưa)
let answeredQuestions = [];
let timer; // Biến lưu trữ interval
let timeLeft = 120; // Thời gian mỗi câu hỏi (giây)

let isQuizFinished = false; // Trạng thái bài quiz (false: đang làm, true: đã kết thúc)
let progressInterval; // Biến lưu trữ interval của thanh trạng thái
let selectedAnswers = Array(questions.length).fill(null); // Mảng lưu trữ đáp án đã chọn (null nếu chưa trả lời)

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
    if (isQuizFinished) return; // Không chạy bộ đếm thời gian nếu quiz đã kết thúc

    clearInterval(timer); // Xóa interval cũ nếu có
    timerElement.innerText = formatTime(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = formatTime(timeLeft);

        // Thay đổi màu sắc khi thời gian <= 30 giây
        if (timeLeft <= 30) {
            timerElement.style.color = "red"; // Đổi màu chữ thành đỏ
        } else {
            timerElement.style.color = "black"; // Đổi lại màu chữ thành đen
        }

        if (timeLeft <= 0) {
            handleTimeUp(); // Gọi hàm xử lý khi hết thời gian
        }
    }, 1000); // Cập nhật mỗi giây
}

// Hàm xử lý khi hết thời gian làm bài
function handleTimeUp() {
    resetProgressBar(); // Ẩn thanh trạng thái khi hết thời gian
    clearInterval(timer); // Dừng đếm ngược
    questionElement.innerText = "Thời gian làm bài đã hết!";
    answerButtons.innerHTML = ""; // Xóa các nút đáp án

    // Disable các nút chuyển câu hỏi
    const navButtons = questionNav.querySelectorAll(".nav-btn");
    navButtons.forEach((button) => {
        button.disabled = true;
        button.classList.add("disabled"); // Thêm lớp CSS để hiển thị trạng thái bị vô hiệu hóa
    });

    enableButtons(); // Kích hoạt các nút "Lưu điểm" và "Làm lại bài"
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
            console.warn(`Không tìm thấy câu hỏi tại đường dẫn: ${questionPath}`);
            questionElement.innerText = "Chưa có câu hỏi nào được thêm cho môn học này!";
            answerButtons.innerHTML = ""; // Xóa các nút đáp án
            resetProgressBar(); // Ẩn thanh trạng thái
        }
    } catch (error) {
        console.error("Lỗi khi tải câu hỏi từ Firebase:", error);
        alert(`Không thể tải câu hỏi. Vui lòng kiểm tra kết nối mạng hoặc quyền truy cập Firebase.\nChi tiết lỗi: ${error.message}`);
        resetProgressBar(); // Ẩn thanh trạng thái khi xảy ra lỗi
    }
}

// Cập nhật thanh trạng thái tiến trình
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100; // Tính phần trăm tiến trình
    progressBar.style.width = `${progress}%`; // Cập nhật chiều rộng của thanh trạng thái
}

// Hàm khởi động thanh trạng thái
function startProgressBar(duration) {
    clearInterval(progressInterval); // Dừng interval cũ nếu có

    let progress = 0; // Bắt đầu từ 0%
    const interval = 50; // Cập nhật mỗi 50ms
    const step = (100 / (duration / interval)); // Tính bước tăng theo thời gian

    progressBar.style.width = "0%"; // Reset thanh trạng thái
    progressBarContainer.style.display = "block"; // Hiển thị thanh trạng thái

    progressInterval = setInterval(() => {
        progress += step; // Tăng tiến trình
        progressBar.style.width = `${progress}%`; // Cập nhật chiều rộng của thanh trạng thái

        if (progress >= 100) {
            clearInterval(progressInterval); // Dừng khi đầy
            progressBarContainer.style.display = "none"; // Ẩn thanh trạng thái sau khi đầy
        }
    }, interval); // Cập nhật mỗi 50ms
}

// Hàm reset thanh trạng thái
function resetProgressBar() {
    progressBar.style.width = "0%"; // Đặt lại chiều rộng về 0%
    progressBarContainer.style.display = "none"; // Ẩn thanh trạng thái
}

// Hàm hiệu ứng chuyển cảnh
function applyTransitionEffect(callback) {
    // Làm mờ dần câu hỏi và đáp án
    questionElement.style.opacity = "0";
    answerButtons.style.opacity = "0";

    setTimeout(() => {
        callback(); // Gọi hàm hiển thị câu hỏi hoặc thông báo hoàn thành
        // Hiện dần câu hỏi và đáp án
        questionElement.style.opacity = "1";
        answerButtons.style.opacity = "1";
    }, 500); // Thời gian hiệu ứng (500ms)
}

// Hiển thị câu hỏi
function showQuestion() {
    resetProgressBar(); // Đảm bảo thanh trạng thái bị ẩn khi hiển thị câu hỏi

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

        // Nếu câu hỏi đã được trả lời, disable các nút và hiển thị trạng thái đúng/sai
        if (answeredQuestions[currentQuestionIndex]) {
            button.disabled = true;
            if (index === questions[currentQuestionIndex].correct) {
                button.classList.add("correct");
                button.innerHTML += " ✅";
            } else if (index === selectedAnswers[currentQuestionIndex]) {
                button.classList.add("incorrect");
                button.innerHTML += " ❌ <span style='color: black;'>(Đáp án bạn chọn)</span>";
            }
        } else {
            button.onclick = () => {
                clearInterval(timer); // Dừng đếm ngược khi người dùng trả lời
                checkAnswer(index); // Kiểm tra đáp án
            };
        }

        answerButtons.appendChild(button);
    });

    // Hiển thị trạng thái "Đã trả lời" nếu câu hỏi đã được trả lời
    if (answeredQuestions[currentQuestionIndex]) {
        const answeredStatus = document.createElement("span");
        answeredStatus.innerText = " (Đã trả lời)";
        answeredStatus.style.color = "green";
        if (!questionElement.querySelector("span")) {
            questionElement.appendChild(answeredStatus);
        }
    }

    updateQuestionNavState(); // Cập nhật trạng thái của các nút trong question-nav
    updateProgressBar(); // Cập nhật thanh trạng thái tiến trình
    startCountdown(); // Bắt đầu đếm ngược cho câu hỏi mới
}

// Kiểm tra đáp án
function checkAnswer(selectedIndex) {
    const correctIndex = questions[currentQuestionIndex].correct;

    // Lưu đáp án đã chọn
    selectedAnswers[currentQuestionIndex] = selectedIndex;

    // Hiển thị đáp án đúng và sai
    const buttons = answerButtons.querySelectorAll("button");
    buttons.forEach((button, index) => {
        if (index === correctIndex) {
            button.classList.add("correct"); // Thêm lớp CSS cho đáp án đúng
            button.innerHTML += " ✅"; // Thêm ký hiệu đúng
        } else if (index === selectedIndex) {
            button.classList.add("incorrect"); // Thêm lớp CSS cho đáp án sai
            button.innerHTML += " ❌"; // Thêm ký hiệu sai
        }
        button.disabled = true; // Vô hiệu hóa tất cả các nút sau khi trả lời
    });

    // Cập nhật trạng thái câu hỏi đã trả lời
    answeredQuestions[currentQuestionIndex] = true;

    // Hiển thị trạng thái "Đã trả lời" bên cạnh câu hỏi
    const answeredStatus = document.createElement("span");
    answeredStatus.innerText = " (Đã trả lời)";
    answeredStatus.style.color = "green";
    if (!questionElement.querySelector("span")) {
        questionElement.appendChild(answeredStatus);
    }

    // Cộng điểm nếu trả lời đúng
    if (selectedIndex === correctIndex) {
        score += 10;
        scoreElement.innerText = score; // Cập nhật điểm trên giao diện
    }

    // Kiểm tra nếu còn câu hỏi phía sau
    if (currentQuestionIndex < questions.length - 1) {
        // Thêm nút "Tiếp tục" để chuyển câu tiếp theo
        const nextButton = document.createElement("button");
        nextButton.classList.add("btn", "next-btn");
        nextButton.innerText = "Chuyển tiếp câu hỏi";
        nextButton.onclick = () => {
            clearTimeout(autoNextTimeout); // Hủy tự động chuyển câu
            applyTransitionEffect(goToNextQuestion); // Thêm hiệu ứng chuyển cảnh
        };
        answerButtons.appendChild(nextButton);

        // Tự động chuyển câu sau 5 giây
        startProgressBar(5000); // Khởi động thanh trạng thái trong 5 giây
        const autoNextTimeout = setTimeout(() => {
            applyTransitionEffect(goToNextQuestion); // Thêm hiệu ứng chuyển cảnh
        }, 5000);
    } else {
        // Nếu không còn câu hỏi, hiển thị thông báo hoàn thành
        startProgressBar(5000); // Khởi động thanh trạng thái trong 5 giây
        setTimeout(() => {
            applyTransitionEffect(checkQuizCompletion); // Thêm hiệu ứng chuyển cảnh
        }, 5000);
    }
}

// Chuyển sang câu hỏi tiếp theo
function goToNextQuestion() {
    clearInterval(progressInterval); // Dừng thanh trạng thái của câu hỏi trước
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(); // Hiển thị câu hỏi tiếp theo
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
    clearInterval(progressInterval); // Dừng thanh trạng thái của câu hỏi trước
    currentQuestionIndex = index; // Cập nhật chỉ số câu hỏi hiện tại
    showQuestion(); // Hiển thị câu hỏi
}

// Kiểm tra trạng thái hoàn thành bài quiz
function checkQuizCompletion() {
    resetProgressBar(); // Ẩn thanh trạng thái khi hoàn thành quiz
    questionElement.innerText = "Chúc mừng bạn đã hoàn thành bài Quiz!";
    answerButtons.innerHTML = ""; // Xóa các nút đáp án
    saveQuizHistory(subject, score); // Lưu lịch sử quiz
    clearInterval(timer); // Dừng bộ đếm thời gian
    isQuizFinished = true; // Đánh dấu trạng thái bài quiz đã kết thúc
    enableButtons(); // Kích hoạt các nút sau khi hoàn thành quiz
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
        timeLeft = 30; // Reset thời gian
        isQuizFinished = false; // Đặt lại trạng thái bài quiz
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
    resetProgressBar(); // Ẩn thanh trạng thái khi trang bắt đầu tải
    disableButtons(); // Vô hiệu hóa các nút khi bắt đầu
    fetchQuestions(); // Lấy câu hỏi từ Firebase và bắt đầu quiz
};