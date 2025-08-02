export class GameState {
  constructor() {
    this.snake = [];
    this.foods = [];
    this.particles = [];
    this.obstacles = [];
    this.aiSnakes = [];
    
    this.mapWidth = window.innerWidth * 5;
    this.mapHeight = window.innerHeight * 5;
    this.camera = { x: 0, y: 0 };
    
    this.currentAngle = 0;
    this.baseSpeed = 3;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.target = { x: this.mapWidth / 2, y: this.mapHeight / 2 };
    this.snakeThickness = 20;
    this.snakeLength = 10;
    this.hue = 0;
    this.boosting = false;
    this.paused = false;
    
    this.tongueTimer = 0;
    this.blinkTimer = 0;
    this.blinking = false;
    this.mouthTimer = 0;
    this.boostTimer = 0;
    this.shieldTimer = 0;
  }

  reset() {
    this.snake = [];
    this.foods = [];
    this.particles = [];
    this.obstacles = [];
    this.aiSnakes = [];
    this.score = 0;
    this.hue = 0;
    this.currentAngle = 0;
    this.speed = this.baseSpeed;
    this.boosting = false;
    this.paused = false;
    this.tongueTimer = 0;
    this.blinkTimer = 0;
    this.blinking = false;
    this.mouthTimer = 0;
    this.boostTimer = 0;
    this.shieldTimer = 0;
  }

  updateTimers() {
    this.tongueTimer++;
    this.blinkTimer++;
    if (this.blinkTimer > 200) this.blinking = true;
    if (this.blinkTimer > 210) {
      this.blinking = false;
      this.blinkTimer = Math.random() * 100;
    }
    if (this.mouthTimer > 0) this.mouthTimer--;
    if (this.boostTimer > 0) this.boostTimer--;
    if (this.shieldTimer > 0) this.shieldTimer--;
  }

  updateSpeed() {
    this.speed = this.baseSpeed * (this.boosting ? 1.5 : 1) * (this.boostTimer > 0 ? 2 : 1);
  }

  updateCamera(canvas) {
    if (this.snake.length > 0) {
      const head = this.snake[0];
      this.camera.x = head.x - canvas.width / 2;
      this.camera.y = head.y - canvas.height / 2;
      
      this.camera.x = Math.max(0, Math.min(this.mapWidth - canvas.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.mapHeight - canvas.height, this.camera.y));
    }
  }

  incrementScore(points) {
    this.score += points;
  }

  addToSnakeLength(length) {
    this.snakeLength += length;
  }

  getScaledThickness() {
    // Base thickness of 20, grows by 1 pixel for every 10 length units
    const baseThickness = 20;
    const growthRate = 0.1; // 1 pixel per 10 length units
    return baseThickness + (this.snakeLength - 10) * growthRate;
  }
}