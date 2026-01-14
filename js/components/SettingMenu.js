import {
  playSound,
  toggleBackgroundMusic,
  setMusicVolume,
  getMusicVolume,
  isMusicPlaying
} from "./soundManager.js";

export default function SettingMenu({ onClose, onGoStart, onGoLevel, onReplay }) {
  const overlay = document.createElement("div");
  overlay.className = "setting-overlay";

  overlay.innerHTML = `
    <div class="setting-menu">
      <div class="setting-group">
        <label>🎵 Âm lượng nhạc nền</label>
        <input id="music-range" type="range" min="0" max="1" step="0.01">
        </div>
      <div class="setting-buttons">
        
      <button id="btn-start">Về màn hình Start</button>
      <button id="btn-level">Chọn Level</button>
      <button id="btn-replay">Chơi lại Level</button>
      <button id="btn-music"></button>
      <button class="btn-close" id="btn-close">Tiếp tục game</button>
      </div>
    </div>
  `;

  const musicRange = overlay.querySelector("#music-range");
  musicRange.value = getMusicVolume();

  musicRange.oninput = (e) => {
    setMusicVolume(Number(e.target.value));
  };

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

  const btnMusic = overlay.querySelector("#btn-music");

  function updateMusicButton() {
    if (isMusicPlaying()) {
      btnMusic.textContent = "🔇 Tắt nhạc";
    } else {
      btnMusic.textContent = "🎵 Bật nhạc";
    }
  }

  updateMusicButton();

  btnMusic.onclick = () => {
    toggleBackgroundMusic();
    updateMusicButton();
  };


  overlay.querySelector("#btn-close").onclick = () => {
    playSound("click");
    onClose();
  };

  return overlay;
}
