export default function MessagesPopup({ type, message, onClose, duration = 1500 }) {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  toast.innerHTML = `
    <span>${message}</span>
  `;

 const mascot = document.querySelector(".mascot-area");
(mascot || document.body).appendChild(toast);


  // animate in
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // auto remove
  setTimeout(() => {
    toast.classList.remove("show");

    toast.addEventListener("transitionend", () => {
      toast.remove();
      onClose?.();
    }, { once: true });

  }, duration);

  return toast;
}
