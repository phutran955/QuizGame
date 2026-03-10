import { router } from "./router.js";
import LoadingScene from "./scenes/LoadingScene.js";
import { playBackgroundMusic } from "./components/soundManager.js";

function startMusic() {
  playBackgroundMusic();

  window.removeEventListener("pointerdown", startMusic);
  window.removeEventListener("keydown", startMusic);
  window.removeEventListener("touchstart", startMusic);
}

window.addEventListener("pointerdown", startMusic);
window.addEventListener("keydown", startMusic);
window.addEventListener("touchstart", startMusic);

router.navigate(LoadingScene);

function scaleApp() {
  const DESIGN_WIDTH = 1720;
  const DESIGN_HEIGHT = 720;

  const scaleX = window.innerWidth / DESIGN_WIDTH;
  const scaleY = window.innerHeight / DESIGN_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const app = document.getElementById("app");
  app.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("resize", scaleApp);
setTimeout(scaleApp, 0);