export default function ResultPopup({ isWin, level, onRestart, onGoLevel, onGoHome }) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup result-popup";

  const title = isWin ? "🎉 Chúc mừng bạn!" : "💀 Bạn đã thua!";
  const message = isWin
    ? `Bạn đã hoàn thành Level ${level}`
    : `Bạn đã hết tim ở Level ${level}`;

  popup.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>

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
