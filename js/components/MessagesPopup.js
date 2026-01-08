export default function MessagesPopup({ type, message, onClose }) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = `popup ${type}`;

  popup.innerHTML = `
    <h3>${type === "correct" ? "✅ Đúng rồi!" : "❌ Sai rồi!"}</h3>
    <p>${message}</p>
    <button>OK</button>
  `

  popup.querySelector("button").onclick = () => {
    overlay.remove();
    onClose?.();
  };

  overlay.appendChild(popup);
  return overlay;
}
