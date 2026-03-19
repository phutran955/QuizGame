import {
  playSound,
  setMusicVolume,
  getMusicVolume
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

      <button id="btn-replay" class="btn-replay"></button>
      <button id="btn-level" class="btn-level"></button>
      <button class="btn-close" id="btn-close"></button>
      </div>
    </div>
  `;

  const musicRange = overlay.querySelector("#music-range");
  musicRange.value = getMusicVolume();

  musicRange.oninput = (e) => {
    setMusicVolume(Number(e.target.value));
  };

  overlay.querySelector("#btn-level").onclick = () => {
    playSound("click");
    onGoLevel();
  };

  overlay.querySelector("#btn-replay").onclick = () => {
    playSound("click");
    onReplay();
  };

  overlay.querySelector("#btn-close").onclick = () => {
    playSound("click");
    onClose();
  };

  return overlay;
}
