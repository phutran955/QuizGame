import { levelConfig } from "../configs/levelConfig.js";


export default function ResultPopup({
  isWin,
  level,
  correctCount,
  totalQuestions,
  bg,
  onRestart,
  onGoLevel,
  onGoHome,
}) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";


  overlay.style.background = `
  linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
  url("${bg}") center / cover no-repeat
`;

  const popup = document.createElement("div");
  popup.className = "popup result-popup";

  const title = isWin ? "🎉 Chúc mừng bạn!" : "💀 Bạn đã thua!";
  const message = isWin
    ? `Bạn đã hoàn thành cấp độ ${level}`
    : `Bạn đã hết tim ở cấp độ ${level}`;

  const mascotName = "cat";

  const correctText = `số câu trả lời đúng: ${correctCount}/${totalQuestions}`;

  // 👉 chỉ 1 ảnh tĩnh
  const mascotImg = mascotName
    ? isWin
      ? `/assets/mascots/${mascotName}/win.png`
      : `/assets/mascots/${mascotName}/lose.png`
    : "";


  popup.innerHTML = `
  <h2>${title}</h2>

  <p class="message">${message} với ${correctText}</p>

  ${mascotImg
      ? `<div class="result-mascot">
           <img src="${mascotImg}" draggable="false" />
         </div>`
      : ""
    }


  <div class="result-buttons">
    <button class="restart">Chơi lại</button>
    <button class="levels">Chọn level</button>
    <button class="home">Về Start</button>
  </div>
`;

  popup.querySelector(".restart").onclick = () => {
    onRestart && onRestart();
    overlay.remove();
  };

  popup.querySelector(".levels").onclick = () => {
    onGoLevel && onGoLevel();
    overlay.remove();
  };

  popup.querySelector(".home").onclick = () => {
    onGoHome && onGoHome();
    overlay.remove();
  };

  overlay.appendChild(popup);
  return overlay;
}
