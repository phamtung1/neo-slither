export class Renderer {
  constructor(canvas, ctx, gameState) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gameState = gameState;
  }

  drawBackground() {
    this.gameState.hue += 0.5;
    const grad = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 100,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
    grad.addColorStop(0, `hsl(${this.gameState.hue % 360},60%,10%)`);
    grad.addColorStop(1, `hsl(${(this.gameState.hue + 60) % 360},60%,5%)`);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSnake() {
    if (this.gameState.snake.length < 2) return;
    
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    const grad = this.ctx.createLinearGradient(
      this.gameState.snake[0].x, this.gameState.snake[0].y,
      this.gameState.snake[this.gameState.snake.length - 1].x,
      this.gameState.snake[this.gameState.snake.length - 1].y
    );
    grad.addColorStop(0, `hsl(${(this.gameState.hue) % 360},100%,60%)`);
    grad.addColorStop(1, `hsl(${(this.gameState.hue + 100) % 360},100%,40%)`);

    this.ctx.strokeStyle = grad;
    this.ctx.lineWidth = this.gameState.snakeThickness;
    this.ctx.shadowColor = this.gameState.shieldTimer > 0 ? 'cyan' : `hsl(${(this.gameState.hue) % 360},100%,60%)`;
    this.ctx.shadowBlur = this.gameState.shieldTimer > 0 ? 40 : this.gameState.boosting ? 25 : 15;

    this.ctx.beginPath();
    this.ctx.moveTo(this.gameState.snake[0].x, this.gameState.snake[0].y);
    for (let i = 1; i < this.gameState.snake.length; i++) {
      this.ctx.lineTo(this.gameState.snake[i].x, this.gameState.snake[i].y);
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    this.drawSnakeHead();
  }

  drawSnakeHead() {
    const head = this.gameState.snake[0];

    if (this.gameState.mouthTimer > 0) {
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(
        head.x + Math.cos(this.gameState.currentAngle) * this.gameState.snakeThickness / 1.8,
        head.y + Math.sin(this.gameState.currentAngle) * this.gameState.snakeThickness / 1.8,
        4, 0, Math.PI * 2
      );
      this.ctx.fill();
    }

    this.drawTongue(head);
    this.drawEyes(head);
  }

  drawTongue(head) {
    if (this.gameState.tongueTimer % 60 < 30) {
      const tx = head.x + Math.cos(this.gameState.currentAngle) * this.gameState.snakeThickness / 1.5;
      const ty = head.y + Math.sin(this.gameState.currentAngle) * this.gameState.snakeThickness / 1.5;
      
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(tx, ty);
      this.ctx.lineTo(
        tx + Math.cos(this.gameState.currentAngle) * 10,
        ty + Math.sin(this.gameState.currentAngle) * 10
      );
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(
        tx + Math.cos(this.gameState.currentAngle) * 10,
        ty + Math.sin(this.gameState.currentAngle) * 10
      );
      this.ctx.lineTo(
        tx + Math.cos(this.gameState.currentAngle + 0.3) * 12,
        ty + Math.sin(this.gameState.currentAngle + 0.3) * 12
      );
      this.ctx.moveTo(
        tx + Math.cos(this.gameState.currentAngle) * 10,
        ty + Math.sin(this.gameState.currentAngle) * 10
      );
      this.ctx.lineTo(
        tx + Math.cos(this.gameState.currentAngle - 0.3) * 12,
        ty + Math.sin(this.gameState.currentAngle - 0.3) * 12
      );
      this.ctx.stroke();
    }
  }

  drawEyes(head) {
    const eyeOffsetX = Math.cos(this.gameState.currentAngle + Math.PI / 2) * this.gameState.snakeThickness / 2.5;
    const eyeOffsetY = Math.sin(this.gameState.currentAngle + Math.PI / 2) * this.gameState.snakeThickness / 2.5;

    [[eyeOffsetX, eyeOffsetY], [-eyeOffsetX, -eyeOffsetY]].forEach(offset => {
      if (this.gameState.blinking) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(head.x + offset[0] - 2, head.y + offset[1] - 1, 4, 2);
      } else {
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(head.x + offset[0], head.y + offset[1], 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(head.x + offset[0] + 1, head.y + offset[1], 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  drawObstacles() {
    this.ctx.fillStyle = "rgba(200,0,0,0.8)";
    this.gameState.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    });
  }

  drawFoods() {
    this.gameState.foods.forEach(food => {
      this.ctx.font = food.isPowerUp ? "32px serif" : "24px serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = `hsl(${food.hue},100%,${food.isPowerUp ? '80%' : '60%'})`;
      this.ctx.shadowBlur = food.isPowerUp ? 30 : 20;
      this.ctx.fillText(food.emoji, food.x, food.y);
      this.ctx.shadowBlur = 0;
    });
  }

  drawAISnakes() {
    this.gameState.aiSnakes.forEach(ai => {
      this.ctx.strokeStyle = `hsl(${ai.colorHue},100%,50%)`;
      this.ctx.lineWidth = this.gameState.snakeThickness * 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(ai.body[0].x, ai.body[0].y);
      for (let i = 1; i < ai.body.length; i++) {
        this.ctx.lineTo(ai.body[i].x, ai.body[i].y);
      }
      this.ctx.stroke();
    });
  }

  drawPauseScreen() {
    if (this.gameState.paused) {
      this.ctx.fillStyle = "rgba(255,255,255,0.8)";
      this.ctx.font = "bold 48px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Paused", this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  render(particleSystem) {
    this.drawBackground();
    this.drawObstacles();
    this.drawFoods();
    this.drawAISnakes();
    this.drawSnake();
    particleSystem.draw(this.ctx);
    this.drawPauseScreen();
  }
}