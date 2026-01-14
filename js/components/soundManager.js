const sounds = {
  click: new Audio("/assets/images/sounds/click.mp3"),
  correct: new Audio("/assets/images/sounds/correct.mp3"),
  wrong: new Audio("/assets/images/sounds/wrong.mp3"),
  gameover: new Audio("/assets/images/sounds/gameover.mp3"),
  win: new Audio("/assets/images/sounds/win.mp3"),
};

// preload
Object.values(sounds).forEach(s => {
  s.preload = "auto";
});

// ====== SOUND EFFECT ======
export function playSound(name) {
  if (!sounds[name]) return;

  const s = sounds[name].cloneNode();
  s.volume = 0.7; // âm hiệu ứng cố định
  s.play().catch(() => {});
}

// ====== BACKGROUND MUSIC ======
const bgMusic = new Audio("/assets/images/sounds/soundtrack.mp3");
bgMusic.loop = true;

let musicVolume = 0.4;
let bgStarted = false;

export function playBackgroundMusic() {
  if (bgStarted) return;
  bgStarted = true;
  bgMusic.volume = musicVolume;
  bgMusic.play().catch(() => {});
}

export function toggleBackgroundMusic() {
  if (bgMusic.paused) bgMusic.play();
  else bgMusic.pause();
}

// ====== MUSIC VOLUME ONLY ======
export function setMusicVolume(v) {
  musicVolume = v;
  bgMusic.volume = musicVolume;
}

export function getMusicVolume() {
  return musicVolume;
}

export function isMusicPlaying() {
  return !bgMusic.paused;
}
