import { router } from "../router.js";
import { quizService } from "../services/quizService.js";
import { randomBackground } from "../configs/backgrounds.js";
import QuizScene from "./QuizScene.js";

export default function LoadingScene(allQuestions = null, startIndex = 0, level = null) {

  const div = document.createElement("div");
  div.className = "loading-scene";
  div.style.width = "1720px";
  div.style.height = "720px";

  const background = randomBackground();

  div.style.background = `
    linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
    url("${background.bg}") center / cover no-repeat
  `;

  div.innerHTML = `
    <div class="loading-box">
      <p>Đang tải câu hỏi...</p>
      <div class="loading-bar">
        <div class="loading-fill">
          <div class="loading-sprite"></div>
        </div>
      </div>
      <p class="loading-percent">0%</p>
    </div>
  `;

  // ===== UI =====
  const fill = div.querySelector(".loading-fill");
  const percentText = div.querySelector(".loading-percent");
  const sprite = div.querySelector(".loading-sprite");

  sprite.style.backgroundImage =
    `url("/assets/mascots/cat/win.png")`;

  let fakeProgress = 0;
  const fakeTimer = setInterval(() => {
    fakeProgress += 10;
    if (fakeProgress > 90) fakeProgress = 90;
    fill.style.width = fakeProgress + "%";
    percentText.innerText = fakeProgress + "%";
  }, 200);

  async function load() {
    try {
      // 🔹 Chỉ fetch DB 1 lần
      if (!allQuestions) {
        allQuestions = await quizService.getQuestions();
      }

      // 🔹 2. gom tất cả ảnh cần preload
      const UI_IMAGES = [
        "/assets/images/decor/autumnleaf.png",
        "/assets/images/decor/unmute-button.png",
        "/assets/images/decor/mute-button.png",
        "/assets/images/decor/continue-button.png",
        "/assets/images/decor/embers.png",
        "/assets/images/decor/home-button.png",
        "/assets/images/decor/leaf.png",
        "/assets/images/decor/menu_BG.png",
        "/assets/images/decor/rain.png",
        "/assets/images/decor/restart-button.png",
        "/assets/images/decor/Result_BG_2.png",
        "/assets/images/levels/level1bg.jpg",
        "/assets/images/levels/level2bg.jpg",
        "/assets/images/levels/level3bg.jpg",
        "/assets/images/levels/level4bg.jpg",
        "/assets/images/tops/heart.png",
        "/assets/images/tops/heartblank.png",
        "/assets/images/tops/menu.png",
        "/assets/images/tops/Star.png",
        "/assets/images/tops/Starblank.png"
      ];

      const animationImages = buildAllAnimations();

      const questionImages = allQuestions
        .map(q => q.img)
        .filter(Boolean);

      const allImages = [
        ...UI_IMAGES,
        ...questionImages,
        ...animationImages
      ];

      // 🔹 3. preload + update progress thật
      clearInterval(fakeTimer);

      await preloadImages(allImages, (loaded, total) => {
        const realPercent = Math.floor((loaded / total) * 100);

        // 👉 lấy max giữa fake và real
        const percent = Math.max(fakeProgress, realPercent);

        fill.style.width = percent + "%";
        percentText.innerText = percent + "%";
      });

      clearInterval(fakeTimer);
      fill.style.width = "100%";
      percentText.innerText = "100%";
      await new Promise((r) => setTimeout(r, 300));

      if (!allQuestions || allQuestions.length === 0) {
        showError("⚠️ Không có câu hỏi");
        return;
      }

      // 🔹 CẮT CÂU CHO 3 MÀN
      const batch = allQuestions.slice(startIndex, startIndex + allQuestions.length / 3);

      router.navigate(() =>
        QuizScene({
          questions: batch,
          allQuestions,
          nextIndex: startIndex + allQuestions.length / 3,
          background,
        })
      );
    } catch (err) {
      console.error(err);
      showError("❌ Lỗi tải dữ liệu");
    }
  }

  const ANIM_COUNTS = {
    attack: 13,
    dead: 10,
    happy: 10,
    idle: 10,
    run: 8,
    sad: 10
  };

  const CHARACTERS = ["bear", "cat", "dog", "tiger"];

  function buildAllAnimations(basePath = "/assets/mascots") {
    const urls = [];

    for (const char of CHARACTERS) {
      for (const anim in ANIM_COUNTS) {

        const frameCount = ANIM_COUNTS[anim];

        for (let i = 1; i <= frameCount; i++) {
          urls.push(`${basePath}/${char}/${anim}/${i}.png`);
        }

      }
    }

    return urls;
  }
  function preloadImages(urls, onProgress) {
    let loaded = 0;
    const total = urls.length;

    return Promise.all(
      urls.map(src => {
        return new Promise(resolve => {
          const img = new Image();
          img.src = src;

          img.onload = img.onerror = () => {
            loaded++;
            if (onProgress) {
              onProgress(loaded, total);
            }
            resolve();
          };
        });
      })
    );
  }

  function showError(message) {
    clearInterval(fakeTimer);
    div.innerHTML = `
      <div class="error-popup">
        <p>${message}</p>
        <button id="back">Về trang chủ</button>
      </div>
    `;

    div.querySelector("#back").onclick = () =>
      router.navigate(() => window.location.href = "https://www.lmo.edu.vn/student/lesson-detail/72");
  }

  load();
  return div;
}
