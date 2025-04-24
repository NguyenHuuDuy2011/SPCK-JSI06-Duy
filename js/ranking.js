import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app } from "./firebase-quiz.js";

const db = getFirestore(app);
const leaderboardCollection = collection(db, "leaderboard");

// Lấy các phần tử DOM
document.addEventListener("DOMContentLoaded", () => {
    const schoolSelect = document.getElementById("school-select");
    const filterBtn = document.getElementById("filter-btn");
    const leaderboardTable = document.getElementById("leaderboard");
    const leaderboardTableBody = document.querySelector("#leaderboard tbody");
    const noDataRow = document.getElementById("no-data-row"); // Lấy hàng "Không có dữ liệu"

    if (!leaderboardTable || !leaderboardTableBody || !noDataRow) {
        console.error("Không tìm thấy bảng xếp hạng, tbody hoặc hàng 'Không có dữ liệu'. Kiểm tra lại HTML.");
        return;
    }

    // Bản đồ ánh xạ phân môn sang tiếng Việt (chỉ các môn được hỗ trợ)
    const subjectMapping = {
        math: "Toán",
        literature: "Ngữ văn",
        history: "Lịch sử - Địa lý",
        IT: "Tin học",
    };

    // Hàm tải bảng xếp hạng từ Firestore
    async function loadLeaderboard(selectedSchool = "all") {
        leaderboardTableBody.innerHTML = ""; // Xóa nội dung cũ

        let q = query(leaderboardCollection, orderBy("score", "desc"));

        // Lọc theo trường
        if (selectedSchool !== "all") {
            if (selectedSchool === "other") {
                q = query(leaderboardCollection, where("school", "not-in", [
                    "THCS Bình Trị Đông A",
                    "THCS Nguyễn Văn Trỗi",
                    "THCS Lê Quý Đôn"
                ]));
            } else {
                q = query(leaderboardCollection, where("school", "==", selectedSchool));
            }
        }

        const querySnapshot = await getDocs(q);
        const leaderboard = [];

        querySnapshot.forEach((doc) => {
            const subject = doc.data().subject;
            if (subjectMapping[subject]) { // Chỉ thêm nếu môn học nằm trong subjectMapping
                leaderboard.push({
                    name: doc.data().name,
                    school: doc.data().school || "N/A",
                    grade: doc.data().grade || "N/A",
                    class: doc.data().class || "N/A",
                    subject: subjectMapping[subject], // Ánh xạ môn học sang tiếng Việt
                    score: doc.data().score,
                });
            }
        });

        // Kiểm tra nếu không có dữ liệu
        if (leaderboard.length === 0) {
            leaderboardTable.style.display = "none"; // Ẩn bảng
            document.getElementById("no-data-message").style.display = "block"; // Hiển thị thông báo
        } else {
            leaderboardTable.style.display = "table"; // Hiển thị bảng
            document.getElementById("no-data-message").style.display = "none"; // Ẩn thông báo

            leaderboard.sort((a, b) => b.score - a.score); // Sắp xếp điểm từ cao đến thấp

            leaderboard.forEach((entry, index) => {
                leaderboardTableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${entry.school}</td>
                        <td>${entry.grade}</td>
                        <td>${entry.class}</td>
                        <td>${entry.name}</td>
                        <td>${entry.subject}</td>
                        <td>${entry.score}</td>
                    </tr>
                `;
            });
        }
    }

    // Tải toàn bộ dữ liệu khi trang được tải
    loadLeaderboard();

    // Lắng nghe sự kiện bấm nút "Lọc"
    filterBtn.addEventListener("click", () => {
        const selectedSchool = schoolSelect.value;
        loadLeaderboard(selectedSchool); // Lọc dữ liệu theo trường
    });
});