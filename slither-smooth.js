const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

let snake = [];
let foods = [];
let particles = [];
let obstacles = [];
let aiSnakes = [];

let currentAngle = 0;
let baseSpeed = 2;
let speed = baseSpeed;
let score = 0;
let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const snakeThickness = 20;
let snakeLength = 40;
let hue = 0;
let boosting = false;
let paused = false;

const emojis = ['🍎', '🍉', '🍓', '🍒', '🍇', '🍊', '🥝'];
const powerUpEmojis = [
  { emoji: '⭐', type: 'boost' },
  { emoji: '🛡', type: 'shield' }
];

const eatSound = new Audio('assets/eat.mpg');

let tongueTimer = 0;
let blinkTimer = 0;
let blinking = false;
let mouthTimer = 0;

let boostTimer = 0;
let shieldTimer = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.addEventListener("mousemove", e => {
  target.x = e.clientX;
  target.y = e.clientY;
});
document.addEventListener("mousedown", () => boosting = true);
document.addEventListener("mouseup", () => boosting = false);
window.addEventListener("blur", () => paused = true);
window.addEventListener("focus", () => paused = false);

function spawnFood() {
  const isPowerUp = Math.random() < 0.1;
  let food;
  if (isPowerUp) {
    let p = powerUpEmojis[Math.floor(Math.random() * powerUpEmojis.length)];
    food = {
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      emoji: p.emoji,
      type: p.type,
      hue: Math.random() * 360,
      isPowerUp: true
    };
  } else {
    food = {
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      hue: Math.random() * 360,
      isPowerUp: false
    };
  }
  foods.push(food);
}

function spawnInitialFoods(count = 8) {
  foods = [];
  for (let i = 0; i < count; i++) spawnFood();
}

function spawnObstacles(count = 5) {
  obstacles = [];
  for (let i = 0; i < count; i++) {
    obstacles.push({
      x: Math.random() * (canvas.width - 200) + 100,
      y: Math.random() * (canvas.height - 200) + 100,
      w: 50 + Math.random() * 50,
      h: 50 + Math.random() * 50
    });
  }
}

function spawnAISnakes(count = 3) {
  aiSnakes = [];
  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let body = [];
    let length = 20;
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    for (let j = 0; j < length; j++) body.push({ x, y });
    aiSnakes.push({
      angle, speed: 1.5,
      body, colorHue: Math.random() * 360
    });
  }
}

function spawnParticles(x, y, count = 20, color = "0,255,204") {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      alpha: 1,
      radius: Math.random() * 2 + 2,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy; p.alpha -= 0.02;
  });
  particles = particles.filter(p => p.alpha > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateFoods() {
  foods.forEach(food => {
    let head = snake[0];
    let dist = Math.hypot(food.x - head.x, food.y - head.y);
    if (dist < 100) {
      let angleAway = Math.atan2(food.y - head.y, food.x - head.x);
      food.dx += Math.cos(angleAway) * 0.1;
      food.dy += Math.sin(angleAway) * 0.1;
    }
    food.x += food.dx;
    food.y += food.dy;
    if (food.x < 20 || food.x > canvas.width - 20) food.dx *= -1;
    if (food.y < 20 || food.y > canvas.height - 20) food.dy *= -1;
  });
}

function initSnake() {
  snake = [];
  for (let i = 0; i < snakeLength; i++) {
    snake.push({ x: canvas.width / 2, y: canvas.height / 2 });
  }
}

function drawBackground() {
  hue += 0.5;
  const grad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 100,
    canvas.width / 2, canvas.height / 2, canvas.width
  );
  grad.addColorStop(0, `hsl(${hue % 360},60%,10%)`);
  grad.addColorStop(1, `hsl(${(hue + 60) % 360},60%,5%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  if (snake.length < 2) return;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  let grad = ctx.createLinearGradient(snake[0].x, snake[0].y, snake[snake.length - 1].x, snake[snake.length - 1].y);
  grad.addColorStop(0, `hsl(${(hue) % 360},100%,60%)`);
  grad.addColorStop(1, `hsl(${(hue + 100) % 360},100%,40%)`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = snakeThickness;
  ctx.shadowColor = shieldTimer > 0 ? 'cyan' : `hsl(${(hue) % 360},100%,60%)`;
  ctx.shadowBlur = shieldTimer > 0 ? 40 : boosting ? 25 : 15;

  ctx.beginPath();
  ctx.moveTo(snake[0].x, snake[0].y);
  for (let i = 1; i < snake.length; i++) {
    ctx.lineTo(snake[i].x, snake[i].y);
  }
  ctx.stroke();

  ctx.shadowBlur = 0;

  let head = snake[0];

  if (mouthTimer > 0) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(head.x + Math.cos(currentAngle) * snakeThickness / 1.8,
      head.y + Math.sin(currentAngle) * snakeThickness / 1.8, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tongueTimer % 60 < 30) {
    let tx = head.x + Math.cos(currentAngle) * snakeThickness / 1.5;
    let ty = head.y + Math.sin(currentAngle) * snakeThickness / 1.5;
    ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(currentAngle) * 10, ty + Math.sin(currentAngle) * 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + Math.cos(currentAngle) * 10, ty + Math.sin(currentAngle) * 10);
    ctx.lineTo(tx + Math.cos(currentAngle + 0.3) * 12, ty + Math.sin(currentAngle + 0.3) * 12);
    ctx.moveTo(tx + Math.cos(currentAngle) * 10, ty + Math.sin(currentAngle) * 10);
    ctx.lineTo(tx + Math.cos(currentAngle - 0.3) * 12, ty + Math.sin(currentAngle - 0.3) * 12);
    ctx.stroke();
  }

  const eyeOffsetX = Math.cos(currentAngle + Math.PI / 2) * snakeThickness / 2.5;
  const eyeOffsetY = Math.sin(currentAngle + Math.PI / 2) * snakeThickness / 2.5;

  [[eyeOffsetX, eyeOffsetY], [-eyeOffsetX, -eyeOffsetY]].forEach(offset => {
    if (blinking) {
      ctx.fillStyle = 'black';
      ctx.fillRect(head.x + offset[0] - 2, head.y + offset[1] - 1, 4, 2);
    } else {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(head.x + offset[0], head.y + offset[1], 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(head.x + offset[0] + 1, head.y + offset[1], 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function gameLoop() {
  if (!paused) {
    tongueTimer++; blinkTimer++;
    if (blinkTimer > 200) blinking = true;
    if (blinkTimer > 210) { blinking = false; blinkTimer = Math.random() * 100; }
    if (mouthTimer > 0) mouthTimer--;
    if (boostTimer > 0) boostTimer--;
    if (shieldTimer > 0) shieldTimer--;

    updateFoods();

    let head = snake[0];
    let dx = target.x - head.x;
    let dy = target.y - head.y;
    let targetAngle = Math.atan2(dy, dx);
    let diff = targetAngle - currentAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    currentAngle += diff * 0.1;

    speed = baseSpeed * (boosting ? 2.5 : 1) * (boostTimer > 0 ? 2 : 1);

    let newHead = {
      x: head.x + Math.cos(currentAngle) * speed,
      y: head.y + Math.sin(currentAngle) * speed
    };
    snake.unshift(newHead);

    obstacles.forEach(o => {
      if (newHead.x > o.x && newHead.x < o.x + o.w &&
        newHead.y > o.y && newHead.y < o.y + o.h) {
        const left = Math.abs(newHead.x - o.x);
        const right = Math.abs(newHead.x - (o.x + o.w));
        const top = Math.abs(newHead.y - o.y);
        const bottom = Math.abs(newHead.y - (o.y + o.h));
        const min = Math.min(left, right, top, bottom);

        if (min === left) {
          newHead.x = o.x - 1;
        } else if (min === right) {
          newHead.x = o.x + o.w + 1;
        } else if (min === top) {
          newHead.y = o.y - 1;
        } else if (min === bottom) {
          newHead.y = o.y + o.h + 1;
        }
      }
    });



    while (snake.length > snakeLength * 4) snake.pop();

    for (let i = 1; i < snake.length; i++) {
      let prev = snake[i - 1]; let curr = snake[i];
      let dist = Math.hypot(prev.x - curr.x, prev.y - curr.y);
      if (dist > snakeThickness / 2) {
        curr.x += (prev.x - curr.x) * 0.2;
        curr.y += (prev.y - curr.y) * 0.2;
      }
    }

    if (Math.random() < 0.3) spawnParticles(newHead.x, newHead.y, 1, "0,255,204");

    foods.forEach((food, index) => {
      let dist = Math.hypot(newHead.x - food.x, newHead.y - food.y);
      if (dist < 25) {
        score += food.isPowerUp ? 5 : 1;
        scoreBoard.textContent = "Score:" + score;
        snakeLength += food.isPowerUp ? 10 : 2;
        eatSound.play();
        mouthTimer = 10;
        if (food.isPowerUp) {
          if (food.type === 'boost') boostTimer = 200;
          else if (food.type === 'shield') shieldTimer = 300;
        }
        spawnParticles(food.x, food.y, 20, "255,99,71");
        foods.splice(index, 1); spawnFood();
      }
    });

    aiSnakes.forEach((ai, index) => {
      let head = ai.body[0];
      let playerHead = snake[0];

      // angle toward player snake
      let angleToPlayer = Math.atan2(playerHead.y - head.y, playerHead.x - head.x);

      // mix angle: some randomness so they look alive
      ai.angle += (angleToPlayer - ai.angle) * 0.05 + (Math.random() - 0.5) * 0.05;

      let newHead = {
        x: head.x + Math.cos(ai.angle) * ai.speed,
        y: head.y + Math.sin(ai.angle) * ai.speed
      };

      // keep AI snakes inside canvas (optional)
      newHead.x = Math.max(20, Math.min(canvas.width - 20, newHead.x));
      newHead.y = Math.max(20, Math.min(canvas.height - 20, newHead.y));

      ai.body.unshift(newHead);
      while (ai.body.length > 20) ai.body.pop();

      // draw AI snake
      ctx.strokeStyle = `hsl(${ai.colorHue},100%,50%)`;
      ctx.lineWidth = snakeThickness * 0.7;
      ctx.beginPath();
      ctx.moveTo(ai.body[0].x, ai.body[0].y);
      for (let i = 1; i < ai.body.length; i++) {
        ctx.lineTo(ai.body[i].x, ai.body[i].y);
      }
      ctx.stroke();
    });

    aiSnakes.forEach((ai, index) => {
      for (let i = 0; i < ai.body.length; i++) {
        let seg = ai.body[i];
        let dist = Math.hypot(snake[0].x - seg.x, snake[0].y - seg.y);
        if (dist < snakeThickness / 2) {
          // eat!
          score += 10;
          scoreBoard.textContent = "Score: " + score;
          snakeLength += 10;
          eatSound.play();
          spawnParticles(seg.x, seg.y, 30, "255,215,0");
          aiSnakes.splice(index, 1); // remove eaten AI snake
          spawnAISnakes(1);         // spawn new one to keep game alive
          break;
        }
      }
    });


    updateParticles();
  }

  drawBackground();

  ctx.fillStyle = "rgba(200,0,0,0.8)";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  foods.forEach(food => {
    ctx.font = food.isPowerUp ? "32px serif" : "24px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = `hsl(${food.hue},100%,${food.isPowerUp ? '80%' : '60%'})`;
    ctx.shadowBlur = food.isPowerUp ? 30 : 20;
    ctx.fillText(food.emoji, food.x, food.y);
    ctx.shadowBlur = 0;
  });

  aiSnakes.forEach(ai => {
    ctx.strokeStyle = `hsl(${ai.colorHue},100%,50%)`;
    ctx.lineWidth = snakeThickness * 0.7;
    ctx.beginPath();
    ctx.moveTo(ai.body[0].x, ai.body[0].y);
    for (let i = 1; i < ai.body.length; i++) {
      ctx.lineTo(ai.body[i].x, ai.body[i].y);
    }
    ctx.stroke();
  });

  drawSnake();
  drawParticles();

  if (paused) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(gameLoop);
}

spawnInitialFoods(8);
spawnObstacles();
spawnAISnakes();
initSnake();
gameLoop();
