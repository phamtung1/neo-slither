export class Obstacles {
  constructor(gameState) {
    this.gameState = gameState;
  }

  spawn(canvas, count = 5) {
    this.gameState.obstacles = [];
    for (let i = 0; i < count; i++) {
      this.gameState.obstacles.push({
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100,
        w: 50 + Math.random() * 50,
        h: 50 + Math.random() * 50
      });
    }
  }
}