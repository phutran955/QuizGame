import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import { currentLevel } from "./LevelScene.js";
import ResultScene from "./ResultScene.js";

export default function QuizScene() {
  // ====== STATE ======
  let questions = [];
  let currentQuestionIndex = 0;
  let hearts = 3;

  const div = document.createElement("div");
  div.className = "quiz-scene";

  // ====== LOAD DATA TỪ SERVICE ======
  async function loadQuestions() {
    div.innerHTML = `<p>⏳ Đang tải câu hỏi...</p>`;

    try {
      questions = await quizService.getQuestions(currentLevel);
      render();
    } catch (err) {
      div.innerHTML = `<p>❌ Lỗi tải câu hỏi</p>`;
      console.error(err);
    }
  }

  // ====== RENDER UI ======
  function render() {
    const q = questions[currentQuestionIndex];

    div.innerHTML = `
      <div class="quiz-top">
        <div class="hearts">❤️ ${hearts}</div>
        <div class="level">Level ${currentLevel}</div>
      </div>

      <div class="quiz-question">
        <h2>${q.question}</h2>
      </div>

      <div class="quiz-answers">
        ${q.answers
          .map(
            (ans, index) =>
              `<button data-index="${index}">${ans}</button>`
          )
          .join("")}
      </div>
    `;

    div.querySelectorAll(".quiz-answers button").forEach((btn) => {
      btn.onclick = () => {
        const answerIndex = Number(btn.dataset.index);

        // ===== ĐÚNG =====
        if (answerIndex === q.correctIndex) {
          currentQuestionIndex++;

          if (currentQuestionIndex >= questions.length) {
            router.navigate(() => ResultScene(true, currentLevel));
          } else {
            render();
          }
        }

        // ===== SAI =====
        else {
          hearts--;

          if (hearts <= 0) {
            router.navigate(() => ResultScene(false, currentLevel));
          } else {
            alert("❌ Sai rồi! Thử lại nhé!");
            render();
          }
        }
      };
    });
  }

  // ====== START ======
  loadQuestions();
  return div;
}
