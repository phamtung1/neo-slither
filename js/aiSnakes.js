export class AISnakes {
  constructor(gameState) {
    this.gameState = gameState;
  }

  spawn(canvas, count = 3) {
    this.gameState.aiSnakes = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const body = [];
      const length = 20;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      
      for (let j = 0; j < length; j++) {
        body.push({ x, y });
      }
      
      this.gameState.aiSnakes.push({
        angle,
        speed: 1.5,
        body,
        colorHue: Math.random() * 360
      });
    }
  }

  update(canvas) {
    this.gameState.aiSnakes.forEach((ai, index) => {
      const head = ai.body[0];
      const playerHead = this.gameState.snake[0];

      const angleToPlayer = Math.atan2(playerHead.y - head.y, playerHead.x - head.x);
      ai.angle += (angleToPlayer - ai.angle) * 0.05 + (Math.random() - 0.5) * 0.05;

      const newHead = {
        x: head.x + Math.cos(ai.angle) * ai.speed,
        y: head.y + Math.sin(ai.angle) * ai.speed
      };

      newHead.x = Math.max(20, Math.min(canvas.width - 20, newHead.x));
      newHead.y = Math.max(20, Math.min(canvas.height - 20, newHead.y));

      ai.body.unshift(newHead);
      while (ai.body.length > 20) ai.body.pop();
    });
  }

  checkCollisions(scoreBoard) {
    this.gameState.aiSnakes.forEach((ai, index) => {
      for (let i = 0; i < ai.body.length; i++) {
        const seg = ai.body[i];
        const dist = Math.hypot(this.gameState.snake[0].x - seg.x, this.gameState.snake[0].y - seg.y);
        if (dist < this.gameState.snakeThickness / 2) {
          this.gameState.incrementScore(10);
          scoreBoard.textContent = "Score: " + this.gameState.score;
          this.gameState.addToSnakeLength(10);
          
          const eatSound = new Audio('assets/eat.mpg');
          eatSound.play();
          
          this.spawnEatParticles(seg.x, seg.y);
          this.gameState.aiSnakes.splice(index, 1);
          this.spawnSingle();
          break;
        }
      }
    });
  }

  spawnSingle() {
    const angle = Math.random() * Math.PI * 2;
    const body = [];
    const length = 20;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    for (let j = 0; j < length; j++) {
      body.push({ x, y });
    }
    
    this.gameState.aiSnakes.push({
      angle,
      speed: 1.5,
      body,
      colorHue: Math.random() * 360
    });
  }

  spawnEatParticles(x, y) {
    for (let i = 0; i < 30; i++) {
      this.gameState.particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        alpha: 1,
        radius: Math.random() * 2 + 2,
        color: "255,215,0"
      });
    }
  }
}