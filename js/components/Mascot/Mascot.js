import { playAnimation } from "./animator.js";

export default function Mascot({
  mascotName,
  role = "player",
}) {
  const div = document.createElement("div");
  div.className = `mascot mascot-${role}`;

  const img = document.createElement("img");
  img.draggable = false;

  if (role === "enemy") {
    img.style.transform = "scaleX(-1)";
  }

  div.appendChild(img);

  let currentAnim = null;
  let currentState = "idle";

  function stopCurrent() {
    if (currentAnim) currentAnim.stop();
    currentAnim = null;
  }

  function idle() {
    stopCurrent();
    currentState = "idle";

    currentAnim = playAnimation({
      img,
      path: `/assets/mascots/${mascotName}/idle`,
      loop: true,
    });
  }

  function happy() {
    return new Promise(resolve => {
      stopCurrent();
      currentState = "happy";

      currentAnim = playAnimation({
        img,
        path: `/assets/mascots/${mascotName}/happy`,
        loop: false,
        onEnd: () => {
          idle();
          resolve();
        },
      });
    });
  }

  function sad() {
    return new Promise(resolve => {
      stopCurrent();
      currentState = "sad";

      currentAnim = playAnimation({
        img,
        path: `/assets/mascots/${mascotName}/sad`,
        loop: false,
        onEnd: () => {
          idle();
          resolve();
        },
      });
    });
  }

  idle();

  return {
    el: div,
    role,
    idle,
    happy,
    sad,
    getState: () => currentState,
  };
}
