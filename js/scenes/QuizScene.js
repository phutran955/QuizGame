import { router } from "../router.js";
import { currentLevel } from "./LevelScene.js";

import ResultPopup from "../components/ResultPopup.js";
import SettingMenu from "../components/SettingMenu.js";

import HeartBar from "../components/HeartBar.js";
import Messages from "../components/MessagesPopup.js";
import Mascot from "../components/Mascot/Mascot.js";

import StartScene from "./StartScene.js";
import LevelScene from "./LevelScene.js";
import LoadingScene from "./LoadingScene.js";
import { levelConfig } from "../configs/levelConfig.js";

import { playSound } from "../components/soundManager.js";

export default function (questionsData) {
  // ====== STATE ======
  let questions = questionsData || [];
  let totalQuestions = questions.length;
  let currentQuestionIndex = 0;
  let correctCount = 0;
  let hearts = 3;
  let settingMenu = null;
  let popup = null;
  let isPaused = false;
  let mascotInstance = null;
  let enemyMascotInstance = null;

  let timer = null;
  const TOTAL_TIME = 10;
  let timeLeft = TOTAL_TIME;

  const div = document.createElement("div");
  div.className = "quiz-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

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

    // ===== HIGHLIGHT ĐÁP ÁN ĐÚNG KHI HẾT GIỜ =====
    const buttons = div.querySelectorAll(".quiz-answers button");
    if (buttons.length > 0) {
      buttons.forEach((b) => (b.disabled = true));

      buttons.forEach((b) => {
        if (Number(b.dataset.index) === questions[currentQuestionIndex].correctIndex) {
          b.classList.add("correct-answer"); // 🌟 màu vàng
        }
      });
    }

    // ===== FILL ANSWER =====
    const input = div.querySelector(".fill-input");
    const submitBtn = div.querySelector(".fill-submit");

    if (input) {
      input.classList.add("timeout"); // 🌟 vàng
      input.value = questions[currentQuestionIndex].fill?.answerText || "";
      input.disabled = true;
    }

    if (submitBtn) submitBtn.disabled = true;


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
        onRestart: () => router.navigate(() => LoadingScene(currentLevel)),
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
        mascotInstance.sad();
        await enemyMascotInstance.happy() ;
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

    // ===== FUNCTION QUESTION TYPE =====

    function renderAnswers(q) {
      // ==== CASE FILL (PHẢI CHECK TRƯỚC) ====
      if (Number(q.typeQuestion) === 200) {
        const a = q.fill || q.answers?.[0]; // hỗ trợ cả DB mới & cũ
        if (!a) return "<p>❌ Thiếu dữ liệu fill</p>";

        return `
          <div class="quiz-fill">
            <div class="fill-row">
              <span>${a.leftText}</span>
              <input class="fill-input" />
              <span>${a.rightText}</span>
            </div>
            <button class="fill-submit">Trả lời</button>
          </div>
        `;
      }

      // ==== CASE MULTI (DB MỚI) ====
      if (Number(q.typeQuestion) === 100) {
        // legacy: answers là mảng string
        if (typeof q.answers?.[0] === "string") {
          return `
        <div class="quiz-answers">
          ${q.answers
              .map(
                (ans, i) =>
                  `<button data-index="${i}">${ans}</button>`
              )
              .join("")}
        </div>
      `;
        }
        return `
      <div class="quiz-answers">
        ${q.answers
            .map(
              (ans, i) => `
            <button
              class="answer-btn"
              data-index="${i}"
              data-correct="${ans.isAnswer}"
            >
              ${ans.answerName}
            </button>
          `
            )
            .join("")}
      </div>
    `;
      }

      return "<p>❌ Không hỗ trợ dạng câu hỏi</p>";
    }


    // ===== WIN =====
    if (!q) {
      playSound("win");

      popup = ResultPopup({
        isWin: true,
        level: currentLevel,
        correctCount,
        totalQuestions,
        onRestart: () => router.navigate(() => LoadingScene(currentLevel)),
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
          <div class="mascot-area player">
            <div class="mascot-chat"></div>
          </div>

        <div class="quiz-panel">
          <div class="quiz-question">
            <h2>${q.question}</h2>
          </div>

          ${renderAnswers(q)}
          </div>

        <div class="mascot-area enemy">
          <div class="enemy-chat"></div>
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

    // ===== PLAYER =====
    const playerArea = div.querySelector(".mascot-area.player");

    if (config.mascot && !mascotInstance) {
      mascotInstance = Mascot({
        mascotName: config.mascot,
        role: "player",
      });
    }

    if (mascotInstance && !playerArea.contains(mascotInstance.el)) {
      playerArea.appendChild(mascotInstance.el);
    }

    // ===== ENEMY =====
    const enemyArea = div.querySelector(".mascot-area.enemy");

    if (config.enemyMascot && !enemyMascotInstance) {
      enemyMascotInstance = Mascot({
        mascotName: config.enemyMascot,
        role: "enemy",
      });
    }

    if (
      enemyMascotInstance &&
      !enemyArea.contains(enemyMascotInstance.el)
    ) {
      enemyArea.appendChild(enemyMascotInstance.el);
    }

    div.querySelector(".hearts").appendChild(HeartBar(3, hearts));

    // ===== SETTINGS =====
    div.querySelector(".setting-btn").onclick = () => {
      playSound("click");

      // Nếu đang mở → đóng
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
        onReplay: () => router.navigate(() => LoadingScene(currentLevel)),
      });

      div.appendChild(settingMenu);
    };

    // ===== ANSWERS =====
    if (q.typeQuestion === 100) {
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
            enemyMascotInstance.sad();
            correctCount++;

            Messages({
              type: "correct",
              message: config.popupText?.correct?.mascot || "Đúng rồi! 🎉",
              target: "player",
            });

            popup = Messages({
              type: "correct",
              message: config.popupText?.correct?.enemyMascot || "Bạn may thôi",
              target: "enemy",
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
            enemyMascotInstance.happy();

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
              div.appendChild(
                ResultPopup({
                  isWin: false,
                  level: currentLevel,
                  correctCount,
                  totalQuestions,
                  onRestart: () => router.navigate(() => LoadingScene(currentLevel)),
                  onGoLevel: () => router.navigate(() => LevelScene()),
                  onGoHome: () => router.navigate(() => StartScene()),
                })
              );
              return;
            }

            Messages({
              type: "wrong",
              message: config.popupText?.wrong?.mascot || "Huhu sai rồi",
              target: "player",
            });

            popup = Messages({
              type: "wrong",
              message:
                q.detailedText ||
                config.popupText?.wrong?.enemyMascot ||
                "Chưa tày đâu",
              target: "enemy",
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
    }

    // ===== FILL ANSWER =====
    if (q.typeQuestion === 200) {
      const input = div.querySelector(".fill-input");
      const submitBtn = div.querySelector(".fill-submit");

      if (input && submitBtn) {
        submitBtn.onclick = async () => {
          if (isPaused) return;
          clearInterval(timer);

          const userAnswer = input.value.trim();
          const correctAnswer = String(q.fill.answerText).trim();

          const isEmpty = !userAnswer;
          const isCorrect = !isEmpty && userAnswer === correctAnswer;


          if (isCorrect) {
            playSound("correct");
            input.classList.add("correct");
            input.disabled = true;
            submitBtn.disabled = true;
            mascotInstance.happy();
            enemyMascotInstance.sad();
            correctCount++;

            Messages({
              type: "correct",
              message: config.popupText?.correct?.mascot || "Đúng rồi! 🎉",
              target: "player",
            });

            popup = Messages({
              type: "correct",
              message: config.popupText?.correct?.enemyMascot || "Bạn may thôi",
              target: "enemy",
              onClose: async () => {
                popup = null;
                await mascotInstance.idle();
                currentQuestionIndex++;
                render();
              },
            });

            showMascotChat(popup);
          } else {
            playSound("wrong");
            input.classList.add("wrong");

            if (isEmpty) {
              input.classList.add("timeout");
            } else {
              input.classList.add("wrong");
            }

            input.value = correctAnswer;
            input.disabled = true;
            submitBtn.disabled = true;
            mascotInstance.sad();
            enemyMascotInstance.happy();

            hearts--;
            div.querySelector(".hearts").innerHTML = "";
            div.querySelector(".hearts").appendChild(HeartBar(3, hearts));
            applyHeartBeat();

            if (hearts <= 0) {
              playSound("gameover");

              div.appendChild(
                ResultPopup({
                  isWin: false,
                  level: currentLevel,
                  correctCount,
                  totalQuestions,
                  onRestart: () => router.navigate(() => LoadingScene(currentLevel)),
                  onGoLevel: () => router.navigate(() => LevelScene()),
                  onGoHome: () => router.navigate(() => StartScene()),
                })
              );
              return;
            }

            Messages({
              type: "wrong",
              message: config.popupText?.wrong?.mascot || "Huhu sai rồi",
              target: "player",
            });

            popup = Messages({
              type: "wrong",
              message:
                q.detailedText ||
                config.popupText?.wrong?.enemyMascot ||
                "Chưa tày đâu",
              target: "enemy",
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

        // ⌨ Enter submit
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") submitBtn.click();
        });
      }
    }

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

  if (!questions || questions.length === 0) {
    router.navigate(() => LoadingScene(currentLevel));
    return div;
  }

  render();
  return div;

}