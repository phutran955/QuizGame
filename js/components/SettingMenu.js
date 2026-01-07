export default function SettingMenu({ onClose, onGoStart, onGoLevel, onReplay }) {
  const overlay = document.createElement("div");
  overlay.className = "setting-overlay";

  overlay.innerHTML = `
    <div class="setting-menu">
      <h3>⚙️ Cài đặt</h3>

      <button id="btn-start">🏠 Về màn hình Start</button>
      <button id="btn-level">📚 Chọn Level</button>
      <button id="btn-replay">🔄 Chơi lại Level</button>

      <button id="btn-close">❌ Đóng</button>
    </div>
  `;

  overlay.querySelector("#btn-start").onclick = onGoStart;
  overlay.querySelector("#btn-level").onclick = onGoLevel;
  overlay.querySelector("#btn-replay").onclick = onReplay;
  overlay.querySelector("#btn-close").onclick = onClose;

  return overlay;
}
