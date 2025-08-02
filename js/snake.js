export class Snake {
  constructor(gameState) {
    this.gameState = gameState;
  }

  init() {
    this.gameState.snake = [];
    for (let i = 0; i < this.gameState.snakeLength; i++) {
      this.gameState.snake.push({ 
        x: this.gameState.mapWidth / 2, 
        y: this.gameState.mapHeight / 2 
      });
    }
  }

  update(canvas) {
    const head = this.gameState.snake[0];
    const dx = this.gameState.target.x - head.x;
    const dy = this.gameState.target.y - head.y;
    const targetAngle = Math.atan2(dy, dx);
    
    let diff = targetAngle - this.gameState.currentAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    this.gameState.currentAngle += diff * 0.1;

    this.gameState.updateSpeed();

    const newHead = {
      x: head.x + Math.cos(this.gameState.currentAngle) * this.gameState.speed,
      y: head.y + Math.sin(this.gameState.currentAngle) * this.gameState.speed
    };

    newHead.x = Math.max(20, Math.min(this.gameState.mapWidth - 20, newHead.x));
    newHead.y = Math.max(20, Math.min(this.gameState.mapHeight - 20, newHead.y));

    this.gameState.snake.unshift(newHead);

    this.handleObstacleCollisions(newHead);
    this.updateSegments();
    
    while (this.gameState.snake.length > this.gameState.snakeLength * 4) {
      this.gameState.snake.pop();
    }

    if (Math.random() < 0.3) {
      this.spawnTrailParticles(newHead.x, newHead.y);
    }
  }

  handleObstacleCollisions(newHead) {
    this.gameState.obstacles.forEach(obstacle => {
      if (newHead.x > obstacle.x && newHead.x < obstacle.x + obstacle.w &&
          newHead.y > obstacle.y && newHead.y < obstacle.y + obstacle.h) {
        const left = Math.abs(newHead.x - obstacle.x);
        const right = Math.abs(newHead.x - (obstacle.x + obstacle.w));
        const top = Math.abs(newHead.y - obstacle.y);
        const bottom = Math.abs(newHead.y - (obstacle.y + obstacle.h));
        const min = Math.min(left, right, top, bottom);

        if (min === left) {
          newHead.x = obstacle.x - 1;
        } else if (min === right) {
          newHead.x = obstacle.x + obstacle.w + 1;
        } else if (min === top) {
          newHead.y = obstacle.y - 1;
        } else if (min === bottom) {
          newHead.y = obstacle.y + obstacle.h + 1;
        }
      }
    });
  }

  updateSegments() {
    for (let i = 1; i < this.gameState.snake.length; i++) {
      const prev = this.gameState.snake[i - 1];
      const curr = this.gameState.snake[i];
      const dist = Math.hypot(prev.x - curr.x, prev.y - curr.y);
      if (dist > this.gameState.snakeThickness / 2) {
        curr.x += (prev.x - curr.x) * 0.2;
        curr.y += (prev.y - curr.y) * 0.2;
      }
    }
  }

  spawnTrailParticles(x, y) {
    this.gameState.particles.push({
      x, y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      alpha: 1,
      radius: Math.random() * 2 + 2,
      color: "0,255,204"
    });
  }

  getHead() {
    return this.gameState.snake[0];
  }

  getLength() {
    return this.gameState.snake.length;
  }
}