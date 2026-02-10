export const gameState = {
  hearts: 3,
  correctCount: 0,
  attackState: 0,

  reset() {
    this.hearts = 3;
    this.correctCount = 0;
    this.attackState = 0;
  }
};
