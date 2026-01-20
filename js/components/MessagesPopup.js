export default function MessagesPopup({ type, message, target = "player", onClose, duration = 1500 }) {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type} ${target}`;

  toast.innerHTML = `
    <span>${message}</span>
  `;

  const mascot =
    target === "enemy" 
    ? document.querySelector(".mascot-enemy") 
    : document.querySelector(".mascot-area");
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
