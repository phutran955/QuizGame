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

  function run({ from = -200, to = 1400, duration = 800 } = {}) {
  return new Promise(resolve => {
    stopCurrent();
    currentState = "run";

    // reset vị trí ban đầu
    div.style.position = "absolute";
    div.style.left = from + "px";

    currentAnim = playAnimation({
      img,
      path: `/assets/mascots/${mascotName}/run`,
      loop: true,
      totalFrames: 8,
    });

    // chạy ngang
    div.animate(
      [
        { transform: `translateX(0)` },
        { transform: `translateX(${to - from}px)` },
      ],
      {
        duration,
        easing: "ease-in-out",
        fill: "forwards",
      }
    );

    setTimeout(() => {
      stopCurrent();
      idle();
      resolve();
    }, duration);
  });
}

function attack() {
  return new Promise(resolve => {
    stopCurrent();
    currentState = "attack";

    currentAnim = playAnimation({
      img,
      path: `/assets/mascots/${mascotName}/attack`,
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
    run,
    attack,
    getState: () => currentState,
  };
}
