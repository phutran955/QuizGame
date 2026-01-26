import { router } from "../router.js";
import LoadingScene from "./LoadingScene.js";
import { playSound } from "../components/soundManager.js";

export let currentLevel = 1;

export default function LevelScene() {
  const div = document.createElement("div");
  div.className = "level-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

  div.innerHTML = `
    <h1 class="level-title">Choose Level</h1>

    <div class="level-list">
      <button class="level-btn level-1" data-level="1">Level 1</button>
      <button class="level-btn level-2" data-level="2">Level 2</button>
      <button class="level-btn level-3" data-level="3">Level 3</button>
      <button class="level-btn level-4" data-level="4">Level 4</button>
    </div>

    <button class="back-btn">Back</button>
  `;

  // chọn level
  div.querySelectorAll("[data-level]").forEach(btn => {
    btn.onclick = () => {
      playSound("click"); 
      currentLevel = Number(btn.dataset.level);
      router.navigate(() => LoadingScene(currentLevel));
    };
  });

  // quay lại start
  div.querySelector(".back-btn").onclick = () => {
    playSound("click"); 
    import("./StartScene.js").then(m => {
      router.navigate(m.default);
    });
  };

  return div;
}
