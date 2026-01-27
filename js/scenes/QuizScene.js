import { router } from "../router.js";
import ResultPopup from "../components/ResultPopup.js";
import SettingMenu from "../components/SettingMenu.js";
import HeartBar from "../components/HeartBar.js";
import Messages from "../components/MessagesPopup.js";
import Mascot from "../components/Mascot/Mascot.js";
import StartScene from "./StartScene.js";
import LoadingScene from "./LoadingScene.js";
import { playSound } from "../components/soundManager.js";

export default function ({
  questions,
  allQuestions,
  nextIndex,
  background
}) {

  // ====== STATE ======
  let totalQuestions = questions.length;
  let currentQuestionIndex = 0;
  let correctCount = 0;
  let hearts = 3;
  let settingMenu = null;
  let popup = null;
  let mascotInstance = null;
  let enemyMascotInstance = null;

  let correctProgress = 0;
  const REQUIRED_CORRECT = questions.length;

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

  // ================= UTIL =================
  function updateCorrectProgress() {
    const percent = (correctProgress / REQUIRED_CORRECT) * 100;
    div.querySelector(".correct-fill").style.width = percent + "%";
    div.querySelector(".correct-text").innerText =
      `${correctProgress} / ${REQUIRED_CORRECT}`;
  }

  function handleCorrectProgress() {
    correctProgress++;
    updateCorrectProgress();

    if (correctProgress >= REQUIRED_CORRECT) {
      router.navigate(() =>
        LoadingScene(allQuestions, nextIndex)
      );
      return true;
    }

    return false;
  }


  // ====== RENDER ======
  function render() {

    const q = questions[currentQuestionIndex];

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

    // ===== WIN =====
    if (!q) {
      return;
    }

    div.style.backgroundImage = `
  linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
  url("${background.bg}")
`;

    div.innerHTML = `
      <div class="quiz-content">
        <div class="quiz-top">   
          <div class="hearts"></div>

          <div class="correct-progress">
           <div class="correct-fill"></div>
           <span class="correct-text"></span>
          </div>

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
    createEffect(div, background.effect);
    updateCorrectProgress();

    // ===== PLAYER =====
    const playerArea = div.querySelector(".mascot-area.player");

    if (!mascotInstance) {
      mascotInstance = Mascot({
        mascotName: "cat",
        role: "player",
      });
    }

    if (mascotInstance && !playerArea.contains(mascotInstance.el)) {
      playerArea.appendChild(mascotInstance.el);
    }

    // ===== ENEMY =====
    const enemyArea = div.querySelector(".mascot-area.enemy");

    if (!enemyMascotInstance) {
      enemyMascotInstance = Mascot({
        mascotName: "dog",
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
        return;
      }

      // ▶ Nếu đang đóng → mở
      settingMenu = SettingMenu({
        onClose: () => {
          settingMenu.remove();
          settingMenu = null;
        },
        onGoStart: () => router.navigate(() => StartScene()),
        onReplay: () => router.navigate(() => LoadingScene()),
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
            correctCount++;
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

            hearts--;
            div.querySelector(".hearts").innerHTML = "";
            div.querySelector(".hearts").appendChild(HeartBar(3, hearts));
            applyHeartBeat();

            if (hearts <= 0) {
              playSound("gameover");
              div.appendChild(
                ResultPopup({
                  isWin: false,
                  correctCount,
                  totalQuestions,
                  onRestart: () => router.navigate(() => LoadingScene()),
                  onGoHome: () => router.navigate(() => StartScene()),
                })
              );
              return;
            }
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
            correctCount++;
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

            hearts--;
            div.querySelector(".hearts").innerHTML = "";
            div.querySelector(".hearts").appendChild(HeartBar(3, hearts));
            applyHeartBeat();

            if (hearts <= 0) {
              playSound("gameover");

              div.appendChild(
                ResultPopup({
                  isWin: false,
                  correctCount,
                  totalQuestions,
                  onRestart: () => router.navigate(() => LoadingScene()),
                  onGoHome: () => router.navigate(() => StartScene()),
                })
              );
              return;
            }
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