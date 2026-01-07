import level1 from "../data/level1.js";
import level2 from "../data/level2.js";
import level3 from "../data/level3.js";
import level4 from "../data/level4.js";

const mockDB = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
};

export function mockFetchQuizByLevel(level) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: mockDB[level] || [],
      });
    }, 300);
  });
}
