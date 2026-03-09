import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import { randomBackground } from "../configs/backgrounds.js";
import QuizScene from "./QuizScene.js";
import StartScene from "./StartScene.js";

export default function LoadingScene(allQuestions = null, startIndex = 0, level = null) {
  const div = document.createElement("div");
  div.className = "loading-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

  const background = randomBackground();

  div.style.background = `
    linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
    url("${background.bg}") center / cover no-repeat
  `;

  div.innerHTML = `
    <div class="loading-box">
      <p>Đang tải câu hỏi...</p>
      <div class="loading-bar">
        <div class="loading-fill">
          <div class="loading-sprite"></div>
        </div>
      </div>
      <p class="loading-percent">0%</p>
    </div>
  `;

  // ===== UI =====
  const fill = div.querySelector(".loading-fill");
  const percentText = div.querySelector(".loading-percent");
  const sprite = div.querySelector(".loading-sprite");

  sprite.style.backgroundImage =
    `url("/assets/mascots/cat/win.png")`;

  let fakeProgress = 0;
  const fakeTimer = setInterval(() => {
    fakeProgress += 10;
    if (fakeProgress > 90) fakeProgress = 90;
    fill.style.width = fakeProgress + "%";
    percentText.innerText = fakeProgress + "%";
  }, 200);

  async function load() {
    try {
      // 🔹 Chỉ fetch DB 1 lần
      if (!allQuestions) {
        allQuestions = await quizService.getQuestions();
      }

      clearInterval(fakeTimer);
      fill.style.width = "100%";
      percentText.innerText = "100%";
      await new Promise((r) => setTimeout(r, 300));

      if (!allQuestions || allQuestions.length === 0) {
        showError("⚠️ Không có câu hỏi");
        return;
      }

      // 🔹 CẮT CÂU CHO 3 MÀN
      const batch = allQuestions.slice(startIndex, startIndex + allQuestions.length / 3);

      router.navigate(() =>
        QuizScene({
          questions: batch,
          allQuestions,
          nextIndex: startIndex + allQuestions.length / 3,
          background,
        })
      );
    } catch (err) {
      console.error(err);
      showError("❌ Lỗi tải dữ liệu");
    }
  }

  function showError(message) {
    clearInterval(fakeTimer);
    div.innerHTML = `
      <div class="error-popup">
        <p>${message}</p>
        <button id="back">Về trang chủ</button>
      </div>
    `;

    div.querySelector("#back").onclick = () =>
      router.navigate(() => StartScene());
  }

  load();
  return div;
}
