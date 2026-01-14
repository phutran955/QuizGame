import { router } from "./router.js";
import StartScene from "./scenes/StartScene.js";

router.navigate(StartScene);

function setRealVH() {
  const vh = window.visualViewport
    ? window.visualViewport.height * 0.01
    : window.innerHeight * 0.01;

  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setRealVH();
window.addEventListener("resize", setRealVH);
window.visualViewport?.addEventListener("resize", setRealVH);
