
export const bgConfig = {
  forest: {
    bg: "assets/images/levels/level1bg.jpg",
    effect: "leaf",
  },
  rain: {
    bg: "assets/images/levels/level2bg.jpg",
    effect: "rain",
  },
  autum: {
    bg: "assets/images/levels/level3bg.jpg",
    effect: "yellow",
  },
  lava: {
    bg: "assets/images/levels/level4bg.jpg",
    effect: "ember",
  },
};

export function randomBackground() {
  const keys = Object.keys(bgConfig);
  const key = keys[Math.floor(Math.random() * keys.length)];

  return {
    id: key,
    bg: bgConfig[key].bg,
    effect: bgConfig[key].effect,
  };
}