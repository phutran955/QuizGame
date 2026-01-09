import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import { currentLevel } from "./LevelScene.js";

import ResultPopup from "../components/ResultPopup.js";
import SettingMenu from "../components/SettingMenu.js";

import HeartBar from "../components/HeartBar.js";
import Messages from "../components/MessagesPopup.js";
import Mascot from "../components/Mascot/Mascot.js";

import StartScene from "./StartScene.js";
import LevelScene from "./LevelScene.js";
import { levelConfig } from "../configs/levelConfig.js";

import { playSound } from "../components/soundManager.js";

export default function QuizScene() {
  // ====== STATE ======
  let questions = [];
  let currentQuestionIndex = 0;
  let hearts = 3;
  let settingMenu = null;
  let popup = null;
  let isPaused = false;
  let mascotInstance = null;


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

      currentQuestionIndex = 0;
      hearts = 3;
      popup = null;
      render();
    } catch (err) {
      console.error(err);
      div.innerHTML = `<p>❌ Lỗi tải câu hỏi</p>`;
    }
  }

  // ====== TIMER ======
  function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
      if (isPaused) return;

      timeLeft--;

      const fill = div.querySelector(".timer-fill");
      const percent = (timeLeft / TOTAL_TIME) * 100;
      if (fill) fill.style.width = percent + "%";

      if (timeLeft <= 0) {
        clearInterval(timer);
        handleTimeOut();
      }
    }, 1000);
  }

  function handleTimeOut() {
    if (isPaused) return;

    clearInterval(timer);
    hearts--;
    mascotInstance?.sad();


    playSound("wrong");

    div.querySelector(".hearts").innerHTML = "";
    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

    if (hearts <= 0) {
      playSound("gameover");

      popup = ResultPopup({
        isWin: false,
        level: currentLevel,
        onRestart: () => router.navigate(() => QuizScene()),
        onGoLevel: () => router.navigate(() => LevelScene()),
        onGoHome: () => router.navigate(() => StartScene()),
      });

      div.appendChild(popup);
      return;
    }

    popup = Messages({
      type: "wrong",
      message: "Hết giờ rồi 😭",
      onClose: () => {
        mascotInstance?.idle();
        popup = null;
        currentQuestionIndex++;
        render();
      },
    });

    div.appendChild(popup);
  }

  // ====== RENDER ======
  function render() {
    clearInterval(timer);
    timeLeft = TOTAL_TIME;

    const q = questions[currentQuestionIndex];

    // ===== WIN =====
    if (!q) {
      playSound("win"); // 🎉 âm thanh chiến thắng

      popup = ResultPopup({
        isWin: true,
        level: currentLevel,
        onRestart: () => router.navigate(() => QuizScene()),
        onGoLevel: () => router.navigate(() => LevelScene()),
        onGoHome: () => router.navigate(() => StartScene()),
      });

      div.innerHTML = "";
      div.appendChild(popup);
      return;
    }

    const config = levelConfig[currentLevel] || {};

    div.style.backgroundImage = config.background
      ? `url(${config.background})`
      : "none";

    div.innerHTML = `
  <div class="quiz-content">

    <!-- TOP BAR -->
    <div class="quiz-top">
      <div class="hearts"></div>

      <div class="timer-bar">
        <div class="timer-fill"></div>
      </div>

      <div class="level">Level ${currentLevel}</div>
      <button class="setting-btn">⚙️</button>
    </div>

    <!-- QUIZ ZONE -->
    <div class="quiz-zone">

      <!-- Mascot -->
      <div class="mascot-area"></div>

      <!-- Question & Answers -->
      <div class="quiz-panel">
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

    </div>
  </div>
`;


    // ===== INIT MASCOT =====
    const mascotArea = div.querySelector(".mascot-area");

    if (config.mascot && !mascotInstance) {
      mascotInstance = Mascot({
        mascotName: config.mascot,
      });
    }

    if (mascotInstance && !mascotArea.contains(mascotInstance.el)) {
      mascotArea.appendChild(mascotInstance.el);
    }



    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

    // SETTINGS
    div.querySelector(".setting-btn").onclick = () => {
      if (settingMenu) return;
      isPaused = true;
      clearInterval(timer);

      settingMenu = SettingMenu({
        onClose: () => {
          settingMenu.remove();
          settingMenu = null;
          isPaused = false;
          startTimer();
        },
        onGoStart: () => router.navigate(() => StartScene()),
        onGoLevel: () => router.navigate(() => LevelScene()),
        onReplay: () => router.navigate(() => QuizScene()),
      });

      div.appendChild(settingMenu);
    };

    // ===== ANSWERS =====
// ===== ANSWERS =====
div.querySelectorAll(".quiz-answers button").forEach((btn) => {
  btn.onclick = () => {
    if (isPaused) return;

    // 1. Stop timer & lock buttons
    clearInterval(timer);
    const buttons = div.querySelectorAll(".quiz-answers button");
    buttons.forEach((b) => (b.disabled = true));

    // 2. Check answer
    const answerIndex = Number(btn.dataset.index);
    const isCorrect = answerIndex === q.correctIndex;

    // 3. UI feedback
    if (isCorrect) {
      btn.classList.add("correct");
      playSound("correct");
    } else {
      btn.classList.add("wrong");
      playSound("wrong");
      mascotInstance?.sad();

      // highlight correct answer
      buttons.forEach((b) => {
        if (Number(b.dataset.index) === q.correctIndex) {
          b.classList.add("correct-answer");
        }
      });
    }

    // 4. Logic game
    if (isCorrect) {
      currentQuestionIndex++;

      popup = Messages({
        type: "correct",
        message: config.popupText?.correct || "Đúng rồi! 🎉",
        onClose: () => {
          popup = null;
          mascotInstance?.idle();
          render();
        },
      });

      div.appendChild(popup);
    } else {
      hearts--;

      div.querySelector(".hearts").innerHTML = "";
      div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

      if (hearts <= 0) {
        playSound("gameover");

        popup = ResultPopup({
          isWin: false,
          level: currentLevel,
          onRestart: () => router.navigate(() => QuizScene()),
          onGoLevel: () => router.navigate(() => LevelScene()),
          onGoHome: () => router.navigate(() => StartScene()),
        });

        div.appendChild(popup);
        return;
      }

      popup = Messages({
        type: "wrong",
        message: config.popupText?.wrong || "Sai rồi 😢",
        onClose: () => {
          popup = null;
          currentQuestionIndex++;
          render();
        },
      });

      div.appendChild(popup);
    }
  };
});

    startTimer();
  }

  loadQuestions();
  return div;
}
