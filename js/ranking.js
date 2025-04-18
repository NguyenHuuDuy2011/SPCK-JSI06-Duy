import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js";

const db = getFirestore(app);
const leaderboardCollection = collection(db, "leaderboard");

// Hàm lưu điểm vào Firestore
async function saveScore(username, score) {
    const userDoc = doc(leaderboardCollection, username);
    try {
        const docSnap = await getDoc(userDoc);
        if (!docSnap.exists() || score > docSnap.data().score) {
            await setDoc(userDoc, { name: username, score: score });
        }
    } catch (error) {
        console.error("Lỗi khi lưu điểm số:", error);
    }
}

// Load leaderboard từ Firestore
async function loadLeaderboard() {
    const subjectMapping = {
        math: "Toán",
        history: "Lịch sử - Địa lí",
        IT: "Tin học",
        literature: "Ngữ văn",
    };

    const querySnapshot = await getDocs(leaderboardCollection);
    const leaderboard = [];

    querySnapshot.forEach((doc) => {
        leaderboard.push({
            name: doc.data().name,
            score: doc.data().score,
            subject: subjectMapping[doc.data().subject] || "Không xác định", // Chuyển đổi sang tiếng Việt
        });
    });

    const table = document.getElementById("leaderboard");
    if (!table) {
        console.error("Không tìm thấy phần tử bảng");
        return;
    }

    table.innerHTML = `
        <tr>
            <th class='title-th'>Hạng</th>
            <th class='dash'>|</th>
            <th class='title-th'>Tên Người Chơi</th>
            <th class='dash'>|</th>
            <th class='title-th'>Phân môn</th>
            <th class='dash'>|</th>
            <th class='title-th'>Điểm</th>
        </tr>
    `;

    leaderboard
        .sort((a, b) => b.score - a.score)
        .forEach((entry, index) => {
            table.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <th class='dash'>|</th>
                    <td>${entry.name}</td>
                    <th class='dash'>|</th>
                    <td>${entry.subject}</td>
                    <th class='dash'>|</th>
                    <td>${entry.score}</td>
                </tr>
            `;
        });
}

// Gọi loadLeaderboard khi trang được tải
window.onload = async () => {
    console.log("Đang tải bảng xếp hạng...");
    await loadLeaderboard();
};

export { saveScore, loadLeaderboard };
