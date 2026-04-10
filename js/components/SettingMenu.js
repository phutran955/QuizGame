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

      <div class="setting-buttons">

      <button id="btn-replay" class="btn-replay"></button>
      <button id="btn-level" class="btn-level"></button>
      <button class="btn-close" id="btn-close"></button>
      </div>
    </div>
  `;

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
