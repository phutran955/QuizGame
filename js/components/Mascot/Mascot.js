import { playAnimation } from "./animator.js";

export default function Mascot({ mascotName }) {
  const div = document.createElement("div");
  div.className = "mascot";

  const img = document.createElement("img");
  img.draggable = false;

  div.appendChild(img);

  let currentAnim = null;

  function play(type, loop = true) {
    if (currentAnim) currentAnim.stop();

    currentAnim = playAnimation({
      img,
      path: `/assets/mascots/${mascotName}/${type}`,
      fps: 6,
      loop,
    });
  }

  // mặc định idle
  play("idle");

  return {
    el: div,
    idle: () => play("idle"),
    happy: () => play("happy", false),
    sad: () => play("sad", false),
  };
}
