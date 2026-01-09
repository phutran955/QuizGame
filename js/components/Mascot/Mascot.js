import { playAnimation } from "./animator.js";

export default function Mascot({ mascotName }) {
  const div = document.createElement("div");
  div.className = "mascot";

  const img = document.createElement("img");
  img.draggable = false;
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

  function sad() {
    if (currentState === "sad") return;

    stopCurrent();
    currentState = "sad";

    currentAnim = playAnimation({
      img,
      path: `/assets/mascots/${mascotName}/sad`,
      loop: false,
      onEnd: () => {
        idle(); // quay lại idle NGAY khi sad kết thúc
      },
    });
  }

  // start mặc định
  idle();

  return {
    el: div,
    idle,
    sad,
    getState: () => currentState,
  };
}
