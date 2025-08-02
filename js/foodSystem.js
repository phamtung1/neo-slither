export class FoodSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.emojis = ['🍎', '🍉', '🍓', '🍒', '🍇', '🍊', '🥝'];
    this.powerUpEmojis = [
      { emoji: '⭐', type: 'boost' },
      { emoji: '🛡', type: 'shield' }
    ];
    this.eatSound = new Audio('assets/eat.mpg');
  }

  spawnFood(canvas) {
    const isPowerUp = Math.random() < 0.1;
    let food;
    
    if (isPowerUp) {
      const powerUp = this.powerUpEmojis[Math.floor(Math.random() * this.powerUpEmojis.length)];
      food = {
        x: Math.random() * (this.gameState.mapWidth - 40) + 20,
        y: Math.random() * (this.gameState.mapHeight - 40) + 20,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        emoji: powerUp.emoji,
        type: powerUp.type,
        hue: Math.random() * 360,
        isPowerUp: true
      };
    } else {
      food = {
        x: Math.random() * (this.gameState.mapWidth - 40) + 20,
        y: Math.random() * (this.gameState.mapHeight - 40) + 20,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)],
        hue: Math.random() * 360,
        isPowerUp: false
      };
    }
    this.gameState.foods.push(food);
  }

  spawnInitialFoods(canvas, count = 40) {
    this.gameState.foods = [];
    for (let i = 0; i < count; i++) {
      this.spawnFood(canvas);
    }
  }

  update(canvas) {
    this.gameState.foods.forEach(food => {
      const head = this.gameState.snake[0];
      const dist = Math.hypot(food.x - head.x, food.y - head.y);
      
      if (dist < 100) {
        const angleAway = Math.atan2(food.y - head.y, food.x - head.x);
        food.dx += Math.cos(angleAway) * 0.1;
        food.dy += Math.sin(angleAway) * 0.1;
      }
      
      food.x += food.dx;
      food.y += food.dy;
      
      if (food.x < 20 || food.x > this.gameState.mapWidth - 20) food.dx *= -1;
      if (food.y < 20 || food.y > this.gameState.mapHeight - 20) food.dy *= -1;
    });
  }

  checkCollisions(canvas, scoreBoard) {
    const head = this.gameState.snake[0];
    
    this.gameState.foods.forEach((food, index) => {
      const dist = Math.hypot(head.x - food.x, head.y - food.y);
      if (dist < 25) {
        this.gameState.incrementScore(food.isPowerUp ? 5 : 1);
        scoreBoard.textContent = "Score:" + this.gameState.score;
        this.gameState.addToSnakeLength(food.isPowerUp ? 10 : 2);
        
        this.eatSound.play();
        this.gameState.mouthTimer = 10;
        
        if (food.isPowerUp) {
          if (food.type === 'boost') this.gameState.boostTimer = 200;
          else if (food.type === 'shield') this.gameState.shieldTimer = 300;
        }
        
        this.spawnEatParticles(food.x, food.y);
        this.gameState.foods.splice(index, 1);
        this.spawnFood(canvas);
      }
    });
  }

  spawnEatParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      this.gameState.particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        alpha: 1,
        radius: Math.random() * 2 + 2,
        color: "255,99,71"
      });
    }
  }
}