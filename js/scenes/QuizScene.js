import { router } from "../router.js";
import ResultPopup from "../components/ResultPopup.js";
import SettingMenu from "../components/SettingMenu.js";
import HeartBar from "../components/HeartBar.js";
import StarBar from "../components/StarBar.js";
import Messages from "../components/MessagesPopup.js";
import Mascot from "../components/Mascot/Mascot.js";
import StartScene from "./StartScene.js";
import LoadingScene from "./LoadingScene.js";
import { playSound } from "../components/soundManager.js";
import { gameState } from "../state/gameState.js";

export default function ({
  questions,
  allQuestions,
  nextIndex,
  background
}) {

  // ====== STATE ======
  let totalQuestions = allQuestions.length;
  let currentQuestionIndex = 0;
  let settingMenu = null;
  let popup = null;
  let mascotInstance = null;
  let enemyMascotInstance = null;
  let currentBackground = null;

  let correctProgress = 0;
  const REQUIRED_CORRECT = questions.length;
  const MAX_STARS = REQUIRED_CORRECT;

  const div = document.createElement("div");
  div.className = "quiz-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

  // ===== ENEMY BY LEVEL =====
  const ENEMY_BY_LEVEL = {
    basic: "dog",
    level: "bear",
    advance: "tiger",
  };

  // ===== HEART & STAR EFFECT =====
  function applyHeartBeat() {
    div.querySelectorAll(".hearts img, .hearts .heart").forEach(h => {
      h.classList.remove("heart-beat");
      void h.offsetWidth; // restart animation
      h.classList.add("heart-beat");
    });
  }

  function applyStarEffect() {
    const star = div.querySelector(".star-progress img.star-new");
    if (!star) return;

    star.classList.remove("star-beat");
    void star.offsetWidth;
    star.classList.add("star-beat");
  }


  // ===== MASCOT CHAT =====
  function showMascotChat(content) {
    const chatBox = div.querySelector(".mascot-chat");
    if (!chatBox) return;
    chatBox.innerHTML = "";
    chatBox.appendChild(content);
  }

  function showEnemyPopupAuto(message, duration = 3000) {
    return new Promise((resolve) => {
      const popup = Messages({
        type: "enemy",
        message,
        target: "enemy",
      });

      showMascotChat(popup);

      setTimeout(() => {
        popup.remove?.();
        resolve();
      }, duration);
    });
  }

  async function attackAnimation(onDone) {

    mascotInstance.el.style.zIndex = 9000;
    enemyMascotInstance.el.style.zIndex = 8000;

    // 1️⃣ player chạy tới enemy
    await mascotInstance.run({
      from: -50,
      to: 900,       // gần enemy
      duration: 3500,
    });

    // 2️⃣ tấn công
    mascotInstance.attack();

    // ⏳ đợi 1.2s sau khi bắt đầu attack
    await wait(1200);

    if (gameState.attackState >= 2) {
      // 3️⃣ enemy chết
      await enemyMascotInstance.dead();

      // 4️⃣ enemy biến mất
      if (enemyMascotInstance?.el) {
        enemyMascotInstance.el.style.transition =
          "opacity 0.8s ease, transform 0.8s ease";
        enemyMascotInstance.el.style.opacity = "0";
        enemyMascotInstance.el.style.transform = "scale(0.5)";
      }

      // đợi enemy fade xong
      await new Promise(r => setTimeout(r, 800));

      // 5️⃣ hiện popup win game
      div.appendChild(
        ResultPopup({
          isWin: true,
          level: questions[currentQuestionIndex].status,
          correctCount: gameState.correctCount,
          totalQuestions,
          bg: currentBackground,
          onRestart: () => {
            gameState.reset();
            router.navigate(() => LoadingScene());
          },
          onGoHome: () => {
            gameState.reset();
            router.navigate(() => StartScene());
          },
        })
      );

      return;

    } else {
      // 3️⃣ enemy buồn
      await enemyMascotInstance.sad();
      await wait(500);

      // 4️⃣ hiện chatbox enemy 
      if (gameState.attackState < 1) {
        await showEnemyPopupAuto(
          "Hãy đợi đấy,<br>Nupakachi !!!",
          2000
        )
      } else {
        await showEnemyPopupAuto(
          "Bản gâu sẽ còn<br>quay lại!!!",
          2000
        )
      };

      enemyMascotInstance.el.querySelector("img").classList.add("no-flip");

      setTimeout(() => {
        enemyMascotInstance.el.querySelector("img").classList.remove("no-flip");
      }, 3000);

      // 5️⃣ enemy chạy khỏi màn hình
      enemyMascotInstance.run({
        from: 0,
        to: window.innerWidth + 100,
        duration: 3000,
      });

      await wait(600);

      // 6️⃣ player chạy theo
      await mascotInstance.run({
        from: 900,
        to: window.innerWidth + 600,
        duration: 2000,
      });
    }

    mascotInstance.el.style.zIndex = "";
    gameState.attackState++;

    // 6️⃣ qua màn
    onDone && onDone();
  }

  // ================= UTIL =================
  function updateStarProgress() {
    const starWrap = div.querySelector(".star-progress");
    if (!starWrap) return;

    starWrap.innerHTML = "";
    starWrap.appendChild(
      StarBar(MAX_STARS, correctProgress)
    );
  }

  function handleLostHeart() {
    gameState.hearts--;
    div.querySelector(".hearts").innerHTML = "";
    div.querySelector(".hearts").appendChild(HeartBar(3, gameState.hearts));
    applyHeartBeat();

    if (gameState.hearts <= 0) {
      playSound("gameover");

      div.appendChild(
        ResultPopup({
          isWin: false,
          level: questions[currentQuestionIndex].status,
          correctCount: gameState.correctCount,
          totalQuestions,
          bg: currentBackground,
          onRestart: () => {
            gameState.reset();
            router.navigate(() => LoadingScene());
          },
          onGoHome: () => {
            gameState.reset();
            router.navigate(() => StartScene());
          },
        })
      );
      return true;
    }
    return false;
  }

  function handleCorrectProgress() {
    correctProgress++;
    updateStarProgress();
    applyStarEffect();

    if (correctProgress >= REQUIRED_CORRECT) {

      // 👉 ẨN KHUNG CÂU HỎI
      setTimeout(() => {
        hideQuizPanel();

        attackAnimation(() =>
          router.navigate(() =>
            LoadingScene(allQuestions, nextIndex, questions[currentQuestionIndex].status)
          )
        );

      }, 1000);
      return true;
    }
    return false;
  }

  function hideQuizPanel() {
    const panel = div.querySelector(".quiz-panel");
    if (panel) {
      panel.classList.add("quiz-hide");
    }
  }

  function showQuizPanel() {
    const panel = div.querySelector(".quiz-panel");
    if (panel) {
      panel.classList.remove("quiz-hide");
    }
  }

  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ====== RENDER ======
  function render() {

    const q = questions[currentQuestionIndex];

    const enemyName =
      ENEMY_BY_LEVEL[q.status] || "dog"; // fallback nếu thiếu

    // ================= RENDER ANSWERS =================
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

    // ===== FUNCTION QUESTION IMAGE =====

    function renderImg(q) {
      if (!q.img) return "";

      return `
    <div class="question-img">
      <img src="${q.img}" alt="question image">
    </div>
  `;
    }

    // ===== WIN =====
    if (!q) {
      return;
    }

    div.style.backgroundImage = `
  linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
  url("${background.bg}")
`;

    currentBackground = background.bg;

    div.innerHTML = `
      <div class="quiz-content">
        <div class="quiz-top">   
          <div class="hearts"></div>

          <div class="star-progress"></div>

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

          ${renderImg(q)}

          ${renderAnswers(q)}
          </div>

        <div class="mascot-area enemy">
          <div class="enemy-chat"></div>
        </div>
      </div>
    </div>
    `;
    showQuizPanel();
    createEffect(div, background.effect);
    updateStarProgress();

    // ===== PLAYER =====
    const playerArea = div.querySelector(".mascot-area.player");

    if (!mascotInstance) {
      mascotInstance = Mascot({
        mascotName: "cat",
        role: "player",
      });

      // 👇 đặt vị trí ban đầu ngoài mép trái
      mascotInstance.el.style.transform = "translateX(-200px)";
    }

    if (mascotInstance && !playerArea.contains(mascotInstance.el)) {
      playerArea.appendChild(mascotInstance.el);
    }

    if (currentQuestionIndex === 0 && correctProgress === 0) {
      requestAnimationFrame(() => {
        mascotInstance.run({
          from: -200,
          to: 0,
          duration: 1200,
        });
      });
    }

    // ===== ENEMY =====
    const enemyArea = div.querySelector(".mascot-area.enemy");

    if (!enemyMascotInstance || enemyMascotInstance.name !== enemyName) {

      // Xóa enemy cũ nếu có
      if (enemyMascotInstance?.el) {
        enemyMascotInstance.el.remove();
      }

      enemyMascotInstance = Mascot({
        mascotName: enemyName,
        role: "enemy",
      });

      // Lưu tên để so sánh lần sau
      enemyMascotInstance.name = enemyName;
    }

    if (
      enemyMascotInstance &&
      !enemyArea.contains(enemyMascotInstance.el)
    ) {
      enemyArea.appendChild(enemyMascotInstance.el);
    }

    div.querySelector(".hearts").appendChild(
      HeartBar(3, gameState.hearts)
    );

    // ===== SETTINGS =====
    div.querySelector(".setting-btn").onclick = () => {
      playSound("click");

      // Nếu đang mở → đóng
      if (settingMenu) {
        settingMenu.remove();
        settingMenu = null;
        return;
      }

      // ▶ Nếu đang đóng → mở
      settingMenu = SettingMenu({
        onClose: () => {
          settingMenu.remove();
          settingMenu = null;
        },
        onGoStart: () => {
          gameState.reset();
          router.navigate(() => StartScene());
        },
        onReplay: () => {
          gameState.reset();
          router.navigate(() => LoadingScene());
        },
      });

      div.appendChild(settingMenu);
    };

    // ===== ANSWERS =====
    if (q.typeQuestion === 100) {
      div.querySelectorAll(".quiz-answers button").forEach((btn) => {
        btn.onclick = () => {

          const buttons = div.querySelectorAll(".quiz-answers button");
          buttons.forEach((b) => (b.disabled = true));

          const answerIndex = Number(btn.dataset.index);
          const isCorrect = answerIndex === q.correctIndex;

          if (isCorrect) {
            btn.classList.add("correct");
            playSound("correct");
            mascotInstance.happy();
            enemyMascotInstance.sad();
            gameState.correctCount++;
            if (handleCorrectProgress()) return;
            Messages({
              type: "correct",
              message: "Đúng rồi! 🎉",
              target: "player",
            });

            popup = Messages({
              type: "correct",
              message: "Bạn may thôi",
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

            if (handleLostHeart()) return;

            if (handleCorrectProgress()) return;
            Messages({
              type: "wrong",
              message: "Huhu sai rồi",
              target: "player",
            });

            popup = Messages({
              type: "wrong",
              message:
                q.detailedText ||
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
            gameState.correctCount++;
            if (handleCorrectProgress()) return;
            Messages({
              type: "correct",
              message: "Đúng rồi! 🎉",
              target: "player",
            });

            popup = Messages({
              type: "correct",
              message: "Bạn may thôi",
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

            if (handleLostHeart()) return;

            if (handleCorrectProgress()) return;
            Messages({
              type: "wrong",
              message: "Huhu sai rồi",
              target: "player",
            });

            popup = Messages({
              type: "wrong",
              message:
                q.detailedText ||
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
  }

  // ===== FALLING LEAVES =====
  function createEffect(parent, effectType) {
    parent.querySelector(".effects-layer")?.remove();

    if (!effectType || effectType === "none") return;

    const layer = document.createElement("div");
    layer.className = "effects-layer";

    const config = {
      leaf: { count: 18, className: "leaf" },
      rain: { count: 70, className: "rain" },
      yellow: { count: 18, className: "yellow" },
      ember: { count: 35, className: "ember" },
    };

    const { count, className } = config[effectType] || {};

    for (let i = 0; i < count; i++) {
      const item = document.createElement("div");
      item.className = className;

      // vị trí ngang
      item.style.left = Math.random() * 100 + "%";

      // thời gian
      item.style.animationDuration = 3 + Math.random() * 5 + "s";
      item.style.animationDelay = Math.random() * 2 + "s";

      // 🔥 hiệu ứng riêng cho ember
      if (effectType === "ember") {
        const size = 24 + Math.random() * 36;
        item.style.width = size + "px";
        item.style.height = size + "px";

        const lavaStart = window.innerHeight * 0.65;
        const lavaRange = window.innerHeight * 0.2;
        item.style.top = lavaStart + Math.random() * lavaRange + "px";

        item.style.animationDuration = 4 + Math.random() * 4 + "s";
        item.style.animationDelay = Math.random() * 0.1 + "s";
      }

      layer.appendChild(item);
    }

    parent.appendChild(layer);
  }

  if (!questions || questions.length === 0) {
    router.navigate(() => LoadingScene());
    return div;
  }

  render();
  return div;
}