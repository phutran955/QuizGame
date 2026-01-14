import { router } from "./router.js";
import StartScene from "./scenes/StartScene.js";

router.navigate(StartScene);

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
