export class GameState {
  constructor() {
    this.snake = [];
    this.foods = [];
    this.particles = [];
    this.obstacles = [];
    this.aiSnakes = [];
    
    this.currentAngle = 0;
    this.baseSpeed = 2;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.snakeThickness = 20;
    this.snakeLength = 40;
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
    this.speed = this.baseSpeed * (this.boosting ? 2.5 : 1) * (this.boostTimer > 0 ? 2 : 1);
  }

  incrementScore(points) {
    this.score += points;
  }

  addToSnakeLength(length) {
    this.snakeLength += length;
  }
}