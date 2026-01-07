import { router } from "../router.js";
import StartScene from "./StartScene.js";
import LevelScene from "./LevelScene.js";
import QuizScene from "./QuizScene.js";

export default function ResultScene(isWin, level) {
  const div = document.createElement("div");
  div.className = "result-scene";

  const title = isWin ? "🎉 Chúc mừng bạn!" : "💀 Bạn đã thua!";
  const message = isWin
    ? `Bạn đã hoàn thành Level ${level}`
    : `Bạn đã hết tim ở Level ${level}`;

  div.innerHTML = `
    <h1>${title}</h1>
    <p>${message}</p>

    <div class="result-buttons">
      <button class="restart">Chơi lại</button>
      <button class="levels">Chọn level</button>
      <button class="home">Về Start</button>
    </div>
  `;

  // Chơi lại level
  div.querySelector(".restart").onclick = () => {
    router.navigate(() => QuizScene());
  };

  // Quay về chọn level
  div.querySelector(".levels").onclick = () => {
    router.navigate(LevelScene);
  };

  // Về start
  div.querySelector(".home").onclick = () => {
    router.navigate(StartScene);
  };

  return div;
}
