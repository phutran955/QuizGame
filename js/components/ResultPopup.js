import { levelConfig } from "../configs/levelConfig.js";

export default function ResultPopup({
  isWin,
  level,
  onRestart,
  onGoLevel,
  onGoHome,
}) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup result-popup";

  const title = isWin ? "🎉 Chúc mừng bạn!" : "💀 Bạn đã thua!";
  const message = isWin
    ? `Bạn đã hoàn thành Level ${level}`
    : `Bạn đã hết tim ở Level ${level}`;

  const mascotName = levelConfig[level]?.mascot;

  // 👉 chỉ 1 ảnh tĩnh
  const mascotImg = mascotName
    ? isWin
      ? `/assets/mascots/${mascotName}/win.png`
      : `/assets/mascots/${mascotName}/lose.png`
    : "";

  popup.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>

    ${
      mascotImg
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
