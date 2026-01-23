import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import QuizScene from "./QuizScene.js";
import LevelScene from "./LevelScene.js";

export default function LoadingScene(level) {
    const div = document.createElement("div");
    div.className = "loading-scene";
    div.style.width = "1720px";
    div.style.height = "720px";

    div.innerHTML = `
    <div class="loading-box">
      <p>Đang tải câu hỏi...</p>
      <div class="loading-bar">
        <div class="loading-fill"></div>
      </div>
      <p class="loading-percent">0%</p>
    </div>
  `;

    const fill = div.querySelector(".loading-fill");
    const percentText = div.querySelector(".loading-percent");

    let fakeProgress = 0;

    const fakeTimer = setInterval(() => {
        fakeProgress += 10;
        if (fakeProgress > 90) fakeProgress = 90;
        fill.style.width = fakeProgress + "%";
        percentText.innerText = fakeProgress + "%";
    }, 200);

    async function load() {
        try {
            const questions = await quizService.getQuestions(level);

            clearInterval(fakeTimer);
            fill.style.width = "100%";
            percentText.innerText = "100%";

            await new Promise(r => setTimeout(r, 400));

            if (!questions || questions.length === 0) {
                showError("⚠️ Level này chưa có câu hỏi");
                return;
            }

            router.navigate(() => QuizScene(questions));
        } catch (err) {
            console.error(err);
            showError("❌ Lỗi tải dữ liệu");
        }
    }

    function showError(message) {
        div.innerHTML = `
      <div class="error-popup">
        <p>${message}</p>
        <button id="back">Quay lại</button>
      </div>
    `;

        div.querySelector("#back").onclick = () =>
            router.navigate(() => LevelScene());
    }

    load();
    return div;
}
