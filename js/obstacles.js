export class Obstacles {
  constructor(gameState) {
    this.gameState = gameState;
  }

  spawn(canvas, count = 25) {
    this.gameState.obstacles = [];
    for (let i = 0; i < count; i++) {
      this.gameState.obstacles.push({
        x: Math.random() * (this.gameState.mapWidth - 200) + 100,
        y: Math.random() * (this.gameState.mapHeight - 200) + 100,
        w: 50 + Math.random() * 50,
        h: 50 + Math.random() * 50
      });
    }
  }
}