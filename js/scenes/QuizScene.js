import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import { currentLevel } from "./LevelScene.js";
import ResultScene from "./ResultScene.js";
import SettingMenu from "../components/SettingMenu.js";
import HeartBar from "../components/HeartBar.js";
import ResultPopup from "../components/ResultPopup.js";
import StartScene from "./StartScene.js";
import LevelScene from "./LevelScene.js";
import { levelConfig } from "../configs/levelConfig.js";

export default function QuizScene() {
  // ====== STATE ======
  let questions = [];
  let currentQuestionIndex = 0;
  let hearts = 3;
  let settingMenu = null;
  let popup = null;

  let timer = null;
  const TOTAL_TIME = 10;
  let timeLeft = TOTAL_TIME;

  const div = document.createElement("div");
  div.className = "quiz-scene";

  // ====== LOAD DATA ======
  async function loadQuestions() {
    div.innerHTML = `<p>⏳ Đang tải câu hỏi...</p>`;

    try {
      questions = await quizService.getQuestions(currentLevel);

      if (!questions || questions.length === 0) {
        div.innerHTML = `<p>⚠️ Không có câu hỏi cho level này</p>`;
        return;
      }

      render();
    } catch (err) {
      console.error(err);
      div.innerHTML = `<p>❌ Lỗi tải câu hỏi</p>`;
    }
  }

  // ====== TIMER ======
  function startTimer() {
    clearInterval(timer);
    timeLeft = TOTAL_TIME;

    const fill = div.querySelector(".timer-fill");
    fill.style.width = "100%";

    timer = setInterval(() => {
      timeLeft--;

      const percent = (timeLeft / TOTAL_TIME) * 100;
      fill.style.width = percent + "%";

      if (timeLeft <= 0) {
        clearInterval(timer);
        handleTimeOut();
      }
    }, 1000);
  }

  function handleTimeOut() {
    if (popup) return;

    hearts--;

    if (hearts <= 0) {
      router.navigate(() => ResultScene(false, currentLevel));
    } else {
      popup = ResultPopup({
        type: "wrong",
        message: "Hết giờ rồi 😭",
        onClose: () => {
          popup = null;
          currentQuestionIndex++;
          render();
        },
      });

      div.appendChild(popup);
    }
  }

  // ====== RENDER ======
  function render() {
    clearInterval(timer);

    const q = questions[currentQuestionIndex];
    const config = levelConfig[currentLevel];

    // 🎨 BACKGROUND THEO LEVEL
    div.style.backgroundImage = `url(${config.background})`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";

    // ===== LAYOUT =====
    div.innerHTML = `
      <div class="quiz-content">
        <div class="quiz-top">
          <div class="hearts"></div>

          <div class="timer-bar">
            <div class="timer-fill"></div>
          </div>

          <div class="level">Level ${currentLevel}</div>
          <button class="setting-btn">⚙️</button>
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
      </div>
    `;

    // ❤️ HEART BAR
    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

    // ⚙️ SETTINGS MENU
    div.querySelector(".setting-btn").onclick = () => {
      if (settingMenu) return;

      settingMenu = SettingMenu({
        onClose: () => {
          settingMenu.remove();
          settingMenu = null;
        },

        onGoStart: () => {
          settingMenu.remove();
          settingMenu = null;
          router.navigate(() => StartScene());
        },

        onGoLevel: () => {
          settingMenu.remove();
          settingMenu = null;
          router.navigate(() => LevelScene());
        },

        onReplay: () => {
          settingMenu.remove();
          settingMenu = null;
          router.navigate(() => QuizScene());
        },
      });

      div.appendChild(settingMenu);
    };

    // ===== ANSWERS =====
    div.querySelectorAll(".quiz-answers button").forEach((btn) => {
      btn.onclick = () => {
        if (popup) return;
        clearInterval(timer);

        const answerIndex = Number(btn.dataset.index);

        // ✅ ĐÚNG
        if (answerIndex === q.correctIndex) {
          currentQuestionIndex++;

          popup = ResultPopup({
            type: "correct",
            message: config.popupText.correct,
            onClose: () => {
              popup = null;

              if (currentQuestionIndex >= questions.length) {
                router.navigate(() => ResultScene(true, currentLevel));
              } else {
                render();
              }
            },
          });

          div.appendChild(popup);
        }

        // ❌ SAI
        else {
          hearts--;

          if (hearts <= 0) {
            router.navigate(() => ResultScene(false, currentLevel));
          } else {
            popup = ResultPopup({
              type: "wrong",
              message: config.popupText.wrong,
              onClose: () => {
                popup = null;
                render();
              },
            });

            div.appendChild(popup);
          }
        }
      };
    });

    // ⏱ START TIMER SAU KHI RENDER XONG
    startTimer();
  }

  // ====== START ======
  loadQuestions();
  return div;
}
