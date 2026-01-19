import { router } from "../router.js";
import LevelScene from "./LevelScene.js";
import { playSound, playBackgroundMusic } from "../components/soundManager.js";

export default function StartScene() {
  const div = document.createElement("div");
  div.className = "start-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

  div.innerHTML = `
    <h1 class="start-title">Quiz Game</h1>
    <button class="start-btn">Start</button>
  `;

  div.querySelector(".start-btn").onclick = () => {
    playSound("click");

    playBackgroundMusic();

    router.navigate(LevelScene);
  };

  return div;
}
