// ===== SOUND EFFECTS =====
const sounds = {
  click: new Audio("/assets/images/sounds/click.mp3"),
  correct: new Audio("/assets/images/sounds/correct.mp3"),
  wrong: new Audio("/assets/images/sounds/wrong.mp3"),
  gameover: new Audio("/assets/images/sounds/gameover.mp3"),
  win: new Audio("/assets/images/sounds/win.mp3"),
};

// preload
Object.values(sounds).forEach((s) => {
  s.preload = "auto";
});

// phát sound effect (clone để bấm nhanh không bị ngắt)
export function playSound(name) {
  if (!sounds[name]) return;
  const s = sounds[name].cloneNode();
  s.volume = 0.7;
  s.play().catch(() => {});
}

// ===== BACKGROUND MUSIC =====
const bgMusic = new Audio("/assets/images/sounds/soundtrack.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.15;

let bgStarted = false;

// phát nhạc nền (chỉ gọi 1 lần khi vào game)
export function playBackgroundMusic() {
  if (bgStarted) return;
  bgStarted = true;
  bgMusic.play().catch(() => {});
}

// dừng nhạc nền (nếu cần reset)
export function stopBackgroundMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  bgStarted = false;
}

// bật / tắt nhạc
export function toggleBackgroundMusic() {
  if (bgMusic.paused) bgMusic.play();
  else bgMusic.pause();
}

// kiểm tra trạng thái (dùng cho setting menu)
export function isBackgroundMusicPlaying() {
  return !bgMusic.paused;
}
