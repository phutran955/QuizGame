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
  let totalQuestions = 0;
  let currentQuestionIndex = 0;
  let correctCount = 0;
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

  // ===== HEART EFFECT =====
  function applyHeartBeat() {
    div.querySelectorAll(".hearts img, .hearts .heart").forEach(h => {
      h.classList.remove("heart-beat");
      void h.offsetWidth; // restart animation
      h.classList.add("heart-beat");
    });
  }

  // ===== MASCOT CHAT =====
  function showMascotChat(content) {
    const chatBox = div.querySelector(".mascot-chat");
    if (!chatBox) return;
    chatBox.innerHTML = "";
    chatBox.appendChild(content);
  }

  // ====== LOAD DATA ======
  async function loadQuestions() {

    try {
      questions = await quizService.getQuestions(currentLevel);

      if (!questions || questions.length === 0) {
        div.innerHTML = `<p>⚠️ Không có câu hỏi cho level này</p>`;
        return;
      }

      totalQuestions = questions.length;
      currentQuestionIndex = 0;
      correctCount = 0;
      hearts = 3;
      popup = null;
      render();
    } catch (err) {
      console.error(err);
      div.innerHTML = `<p>❌ Lỗi tải câu hỏi</p>`;
    }
  }
  // ==== SCALE GAME ====
  function scaleGame() {
    const DESIGN_WIDTH = 1280;
    const DESIGN_HEIGHT = 720;

    const scaleX = window.innerWidth / DESIGN_WIDTH;
    const scaleY = window.innerHeight / DESIGN_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    div.style.transform =
      `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener("resize", scaleGame);
  setTimeout(scaleGame, 0);


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
    mascotInstance?.idle();
    playSound("wrong");

    div.querySelector(".hearts").innerHTML = "";
    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));
    applyHeartBeat();

    if (hearts <= 0) {
      playSound("gameover");

      popup = ResultPopup({
        isWin: false,
        level: currentLevel,
        correctCount,
        totalQuestions,
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
      onClose: async () => {
        popup = null;
        await mascotInstance.sad();
        currentQuestionIndex++;
        render();
      },
    });

    showMascotChat(popup);
  }

  // ====== RENDER ======
  function render() {
    clearInterval(timer);
    timeLeft = TOTAL_TIME;

    const q = questions[currentQuestionIndex];

    // ===== WIN =====
    if (!q) {
      playSound("win");

      popup = ResultPopup({
        isWin: true,
        level: currentLevel,
        correctCount,
        totalQuestions,
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
        <div class="quiz-top">
          <div class="hearts"></div>
          <div class="timer-bar"><div class="timer-fill"></div></div>
          <div class="level">Level ${currentLevel}</div>
          <button class="setting-btn"></button>
        </div>

        <div class="quiz-zone">
          <div class="mascot-area">
            <div class="mascot-chat"></div>
          </div>

          <div class="quiz-panel">
            <div class="quiz-question">
              <h2>${q.question}</h2>
            </div>

            <div class="quiz-answers">
              ${q.answers.map((ans, i) =>
      `<button data-index="${i}">${ans}</button>`
    ).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    // 🍃 ADD LEAVES AFTER RENDER
    // 🌦 EFFECT BY LEVEL
    if (currentLevel === 1) {
      createFallingLeaves(div);
    } else {
      createLevelEffect(div, currentLevel);
    }

    // ===== INIT MASCOT =====
    const mascotArea = div.querySelector(".mascot-area");
    if (config.mascot && !mascotInstance) {
      mascotInstance = Mascot({ mascotName: config.mascot });
    }
    if (mascotInstance && !mascotArea.contains(mascotInstance.el)) {
      mascotArea.appendChild(mascotInstance.el);
    }

    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

    // ===== SETTINGS =====
    div.querySelector(".setting-btn").onclick = () => {
      playSound("click");

      // 🔁 Nếu đang mở → đóng
      if (settingMenu) {
        settingMenu.remove();
        settingMenu = null;
        isPaused = false;
        startTimer();
        return;
      }

      // ▶ Nếu đang đóng → mở
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
    div.querySelectorAll(".quiz-answers button").forEach((btn) => {
      btn.onclick = () => {
        if (isPaused) return;
        clearInterval(timer);

        const buttons = div.querySelectorAll(".quiz-answers button");
        buttons.forEach((b) => (b.disabled = true));

        const answerIndex = Number(btn.dataset.index);
        const isCorrect = answerIndex === q.correctIndex;

        if (isCorrect) {
          btn.classList.add("correct");
          playSound("correct");
          mascotInstance.happy();
          correctCount++;

          popup = Messages({
            type: "correct",
            message: config.popupText?.correct || "Đúng rồi! 🎉",
            onClose: async () => {
              popup = null;
              await mascotInstance.idle();
              currentQuestionIndex++;
              render();
            },
          });

          showMascotChat(popup);
        } else {
          btn.classList.add("wrong");
          playSound("wrong");
          mascotInstance.sad();

          buttons.forEach((b) => {
            if (Number(b.dataset.index) === q.correctIndex) {
              b.classList.add("correct-answer");
            }
          });

          hearts--;
          div.querySelector(".hearts").innerHTML = "";
          div.querySelector(".hearts").appendChild(HeartBar(3, hearts));
          applyHeartBeat();

          if (hearts <= 0) {
            playSound("gameover");

            popup = ResultPopup({
              isWin: false,
              level: currentLevel,
              correctCount,
              totalQuestions,
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
            onClose: async () => {
              popup = null;
              await mascotInstance.idle();
              currentQuestionIndex++;
              render();
            },
          });

          showMascotChat(popup);
        }
      };
    });

    startTimer();
  }

  // ===== FALLING LEAVES =====
  function createFallingLeaves(parent) {
    parent.querySelector(".leaves-container")?.remove();

    const container = document.createElement("div");
    container.className = "leaves-container";

    for (let i = 0; i < 12; i++) {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.style.left = Math.random() * 100 + "%";
      leaf.style.animationDuration = 6 + Math.random() * 6 + "s";
      leaf.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(leaf);
    }

    parent.appendChild(container);
  }

  function createLevelEffect(parent, level) {
    parent.querySelector(".effects-layer")?.remove();

    const layer = document.createElement("div");
    layer.className = "effects-layer";

    let count = 15;
    if (level === 2) count = 70;
    if (level === 3) count = 18;
    if (level === 4) count = 35;

    for (let i = 0; i < count; i++) {
      const item = document.createElement("div");

      item.style.left = Math.random() * 100 + "%";
      item.style.animationDuration = 3 + Math.random() * 5 + "s";
      item.style.animationDelay = Math.random() * 5 + "s";

      if (level === 2) item.className = "rain";
      if (level === 3) item.className = "leaf-yellow";
      if (level === 4) {
        item.className = "ember";

        // 🔥 size to nhỏ ngẫu nhiên
        const size = 24 + Math.random() * 36;
        item.style.width = size + "px";
        item.style.height = size + "px";

        // 🔥 vị trí ngang
        item.style.left = Math.random() * 100 + "%";

        // 🔥 VỊ TRÍ DỌC – vùng dung nham (65% → 85% màn hình)
        const lavaStart = window.innerHeight * 0.65;
        const lavaRange = window.innerHeight * 0.2;
        item.style.top = lavaStart + Math.random() * lavaRange + "px";

        // ⏱ thời gian bay
        item.style.animationDuration = 4 + Math.random() * 4 + "s";
        item.style.animationDelay = Math.random() * 0.1 + "s";
      }


      layer.appendChild(item);
    }

    parent.appendChild(layer);
  }


  loadQuestions();
  return div;
}
