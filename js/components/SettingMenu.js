import { playSound, toggleBackgroundMusic, isBackgroundMusicPlaying } from "./soundManager.js";

export default function SettingMenu({ onClose, onGoStart, onGoLevel, onReplay }) {
  const overlay = document.createElement("div");
  overlay.className = "setting-overlay";

  overlay.innerHTML = `
    <div class="setting-menu">

      <div class="setting-buttons">
      <button id="btn-start">Về màn hình Start</button>
      <button id="btn-level">Chọn Level</button>
      <button id="btn-replay">Chơi lại Level</button>
      <button id="btn-music"></button>
      <button class="btn-close" id="btn-close">Tiếp tục game</button>
      </div>
    </div>
  `;

  const musicBtn = overlay.querySelector("#btn-music");

  function updateMusicText() {
    musicBtn.textContent = isBackgroundMusicPlaying() ? "Tắt nhạc 🔊" : "Bật nhạc 🔇";
  }

  updateMusicText();

  overlay.querySelector("#btn-start").onclick = () => {
    playSound("click");
    onGoStart();
  };

  overlay.querySelector("#btn-level").onclick = () => {
    playSound("click");
    onGoLevel();
  };

  overlay.querySelector("#btn-replay").onclick = () => {
    playSound("click");
    onReplay();
  };

  musicBtn.onclick = () => {
    playSound("click");
    toggleBackgroundMusic();
    updateMusicText();
  };

  overlay.querySelector("#btn-close").onclick = () => {
    playSound("click");
    onClose();
  };

  return overlay;
}
