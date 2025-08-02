export class AISnakes {
  constructor(gameState) {
    this.gameState = gameState;
    this.explosionSound = new Audio('assets/explosion.mp3');
  }

  spawn(canvas, count = 10) {
    this.gameState.aiSnakes = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const body = [];
      const length = 20;
      const x = Math.random() * this.gameState.mapWidth;
      const y = Math.random() * this.gameState.mapHeight;
      
      for (let j = 0; j < length; j++) {
        body.push({ x, y });
      }
      
      this.gameState.aiSnakes.push({
        angle,
        speed: 1.5,
        body,
        colorHue: Math.random() * 360,
        blinkTimer: Math.random() * 200,
        blinking: false
      });
    }
  }

  update(canvas) {
    this.gameState.aiSnakes.forEach((ai, index) => {
      const head = ai.body[0];
      const playerHead = this.gameState.snake[0];

      // Update blinking
      ai.blinkTimer++;
      if (ai.blinkTimer > 200) ai.blinking = true;
      if (ai.blinkTimer > 210) {
        ai.blinking = false;
        ai.blinkTimer = Math.random() * 100;
      }

      const angleToPlayer = Math.atan2(playerHead.y - head.y, playerHead.x - head.x);
      ai.angle += (angleToPlayer - ai.angle) * 0.05 + (Math.random() - 0.5) * 0.05;

      const newHead = {
        x: head.x + Math.cos(ai.angle) * ai.speed,
        y: head.y + Math.sin(ai.angle) * ai.speed
      };

      newHead.x = Math.max(20, Math.min(this.gameState.mapWidth - 20, newHead.x));
      newHead.y = Math.max(20, Math.min(this.gameState.mapHeight - 20, newHead.y));

      ai.body.unshift(newHead);
      while (ai.body.length > 20) ai.body.pop();
    });
  }

  checkCollisions(scoreBoard, lengthDisplay) {
    const playerHead = this.gameState.snake[0];
    
    this.gameState.aiSnakes.forEach((ai, aiIndex) => {
      // Check if player eats AI snake
      for (let i = 0; i < ai.body.length; i++) {
        const seg = ai.body[i];
        const dist = Math.hypot(playerHead.x - seg.x, playerHead.y - seg.y);
        if (dist < this.gameState.getScaledThickness() / 2) {
          this.gameState.incrementScore(10);
          scoreBoard.textContent = "Score: " + this.gameState.score;
          this.gameState.addToSnakeLength(10);
          lengthDisplay.textContent = "Length: " + this.gameState.snakeLength;
          
          const eatSound = new Audio('assets/eat.mp3');
          eatSound.play();
          
          this.spawnEatParticles(seg.x, seg.y);
          this.gameState.aiSnakes.splice(aiIndex, 1);
          this.spawnSingle();
          break;
        }
      }
      
      // Check if AI snake touches player's body (except head)
      const aiHead = ai.body[0];
      for (let i = 1; i < this.gameState.snake.length; i++) {
        const playerSeg = this.gameState.snake[i];
        const dist = Math.hypot(aiHead.x - playerSeg.x, aiHead.y - playerSeg.y);
        if (dist < this.gameState.getScaledThickness() / 2) {
          // AI snake explodes
          this.explosionSound.play();
          this.spawnExplosionParticles(aiHead.x, aiHead.y);
          this.gameState.aiSnakes.splice(aiIndex, 1);
          
          // Player gets shorter
          const shortenAmount = Math.min(5, this.gameState.snakeLength - 10);
          this.gameState.snakeLength -= shortenAmount;
          lengthDisplay.textContent = "Length: " + this.gameState.snakeLength;
          
          // Remove snake segments
          const removeSegments = Math.min(shortenAmount * 2, this.gameState.snake.length - 2);
          for (let j = 0; j < removeSegments; j++) {
            this.gameState.snake.pop();
          }
          
          // Spawn new AI snake to replace exploded one
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
    const x = Math.random() * this.gameState.mapWidth;
    const y = Math.random() * this.gameState.mapHeight;
    
    for (let j = 0; j < length; j++) {
      body.push({ x, y });
    }
    
    this.gameState.aiSnakes.push({
      angle,
      speed: 1.5,
      body,
      colorHue: Math.random() * 360,
      blinkTimer: Math.random() * 200,
      blinking: false
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

  spawnExplosionParticles(x, y) {
    for (let i = 0; i < 50; i++) {
      this.gameState.particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        alpha: 1,
        radius: Math.random() * 4 + 3,
        color: Math.random() < 0.5 ? "255,100,100" : "255,200,0"
      });
    }
  }
}