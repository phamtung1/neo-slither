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
    
    this.drawGrid();
    this.drawMapBorder();
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    
    const gridSize = 100;
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= this.gameState.mapWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.gameState.mapHeight);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.gameState.mapHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.gameState.mapWidth, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawMapBorder() {
    this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(
      -this.gameState.camera.x,
      -this.gameState.camera.y,
      this.gameState.mapWidth,
      this.gameState.mapHeight
    );
  }

  drawSnake() {
    if (this.gameState.snake.length < 2) return;
    
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    
    this.draw3DSnakeSegments();
    this.drawSnakeHead();
    this.ctx.restore();
  }

  draw3DSnakeSegments() {
    const thickness = this.gameState.getScaledThickness();
    
    // Draw each segment as a 3D cylinder
    for (let i = 0; i < this.gameState.snake.length - 1; i++) {
      const current = this.gameState.snake[i];
      const next = this.gameState.snake[i + 1];
      
      // Calculate segment angle
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      const perpAngle = angle + Math.PI / 2;
      
      // Calculate 3D effect offsets
      const topOffset = thickness * 0.4;
      const bottomOffset = thickness * 0.5;
      
      // Top highlight (light source from top-left)
      const topGrad = this.ctx.createLinearGradient(
        current.x - Math.cos(perpAngle) * topOffset,
        current.y - Math.sin(perpAngle) * topOffset,
        current.x + Math.cos(perpAngle) * topOffset,
        current.y + Math.sin(perpAngle) * topOffset
      );
      
      const baseHue = (this.gameState.hue + i * 2) % 360;
      topGrad.addColorStop(0, `hsl(${baseHue},85%,75%)`); // Bright highlight
      topGrad.addColorStop(0.3, `hsl(${baseHue},90%,65%)`); // Main color
      topGrad.addColorStop(0.7, `hsl(${baseHue},95%,45%)`); // Mid tone
      topGrad.addColorStop(1, `hsl(${baseHue},100%,25%)`); // Dark shadow
      
      // Draw main body with 3D gradient
      this.ctx.strokeStyle = topGrad;
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // Add subtle glow
      this.ctx.shadowColor = this.gameState.shieldTimer > 0 ? 'cyan' : `hsl(${baseHue},100%,60%)`;
      this.ctx.shadowBlur = this.gameState.shieldTimer > 0 ? 30 : this.gameState.boosting ? 20 : 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(current.x, current.y);
      this.ctx.lineTo(next.x, next.y);
      this.ctx.stroke();
      
      // Draw darker bottom shadow for depth
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = `hsl(${baseHue},100%,15%)`;
      this.ctx.lineWidth = thickness * 0.3;
      this.ctx.globalAlpha = 0.4;
      
      this.ctx.beginPath();
      this.ctx.moveTo(
        current.x + Math.cos(perpAngle) * (thickness * 0.25),
        current.y + Math.sin(perpAngle) * (thickness * 0.25)
      );
      this.ctx.lineTo(
        next.x + Math.cos(perpAngle) * (thickness * 0.25),
        next.y + Math.sin(perpAngle) * (thickness * 0.25)
      );
      this.ctx.stroke();
      
      this.ctx.globalAlpha = 1;
    }
    
    this.ctx.shadowBlur = 0;
  }

  drawSnakeHead() {
    const head = this.gameState.snake[0];
    const thickness = this.gameState.getScaledThickness();
    
    // Draw 3D head sphere
    this.draw3DHead(head, thickness);

    if (this.gameState.mouthTimer > 0) {
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(
        head.x + Math.cos(this.gameState.currentAngle) * thickness / 1.8,
        head.y + Math.sin(this.gameState.currentAngle) * thickness / 1.8,
        4, 0, Math.PI * 2
      );
      this.ctx.fill();
    }

    this.drawTongue(head);
    this.drawEyes(head);
  }

  draw3DHead(head, thickness) {
    const radius = thickness * 0.7;
    
    // Create radial gradient for 3D sphere effect
    const headGradient = this.ctx.createRadialGradient(
      head.x - radius * 0.3, head.y - radius * 0.3, 0, // Light source offset
      head.x, head.y, radius
    );
    
    const baseHue = this.gameState.hue % 360;
    headGradient.addColorStop(0, `hsl(${baseHue},85%,85%)`); // Bright highlight
    headGradient.addColorStop(0.3, `hsl(${baseHue},90%,70%)`); // Main color
    headGradient.addColorStop(0.7, `hsl(${baseHue},95%,50%)`); // Mid tone
    headGradient.addColorStop(1, `hsl(${baseHue},100%,25%)`); // Dark edge
    
    // Draw main head sphere
    this.ctx.fillStyle = headGradient;
    this.ctx.shadowColor = this.gameState.shieldTimer > 0 ? 'cyan' : `hsl(${baseHue},100%,60%)`;
    this.ctx.shadowBlur = this.gameState.shieldTimer > 0 ? 25 : this.gameState.boosting ? 15 : 8;
    
    this.ctx.beginPath();
    this.ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add subtle bottom shadow for more depth
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = `hsl(${baseHue},100%,15%)`;
    this.ctx.globalAlpha = 0.3;
    
    this.ctx.beginPath();
    this.ctx.arc(head.x + radius * 0.1, head.y + radius * 0.3, radius * 0.8, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
  }

  drawTongue(head) {
    if (this.gameState.tongueTimer % 60 < 30) {
      const tx = head.x + Math.cos(this.gameState.currentAngle) * this.gameState.getScaledThickness() / 1.5;
      const ty = head.y + Math.sin(this.gameState.currentAngle) * this.gameState.getScaledThickness() / 1.5;
      
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
    const eyeOffsetX = Math.cos(this.gameState.currentAngle + Math.PI / 2) * this.gameState.getScaledThickness() / 2.5;
    const eyeOffsetY = Math.sin(this.gameState.currentAngle + Math.PI / 2) * this.gameState.getScaledThickness() / 2.5;

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
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    this.gameState.obstacles.forEach(obstacle => {
      this.draw3DObstacle(obstacle);
    });
    this.ctx.restore();
  }

  draw3DObstacle(obstacle) {
    const { x, y, w, h } = obstacle;
    const depth = 12; // 3D depth effect
    
    // Draw top face (brightest)
    const topGradient = this.ctx.createLinearGradient(x, y, x + w, y);
    topGradient.addColorStop(0, 'hsl(0,70%,60%)'); // Light red
    topGradient.addColorStop(1, 'hsl(0,80%,50%)'); // Medium red
    
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(x, y, w, h);
    
    // Draw right side face (medium brightness)
    const rightGradient = this.ctx.createLinearGradient(x + w, y, x + w, y + h);
    rightGradient.addColorStop(0, 'hsl(0,85%,40%)'); // Medium-dark red
    rightGradient.addColorStop(1, 'hsl(0,90%,30%)'); // Darker red
    
    this.ctx.fillStyle = rightGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w, y);
    this.ctx.lineTo(x + w + depth, y - depth);
    this.ctx.lineTo(x + w + depth, y + h - depth);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw top face (isometric view)
    const topIsoGradient = this.ctx.createLinearGradient(x, y, x + w + depth, y - depth);
    topIsoGradient.addColorStop(0, 'hsl(0,75%,65%)'); // Brightest
    topIsoGradient.addColorStop(1, 'hsl(0,80%,55%)'); // Light red
    
    this.ctx.fillStyle = topIsoGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + depth, y - depth);
    this.ctx.lineTo(x + w + depth, y - depth);
    this.ctx.lineTo(x + w, y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add subtle glow/shadow
    this.ctx.shadowColor = 'rgba(150,0,0,0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;
    
    // Redraw front face with shadow
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(x, y, w, h);
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Add edge highlights for more definition
    this.ctx.strokeStyle = 'hsl(0,60%,70%)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, w, h);
    
    // Highlight edges of 3D faces
    this.ctx.strokeStyle = 'hsl(0,50%,45%)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + w, y);
    this.ctx.lineTo(x + w + depth, y - depth);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + depth, y - depth);
    this.ctx.stroke();
  }

  drawFoods() {
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    this.gameState.foods.forEach(food => {
      this.ctx.font = food.isPowerUp ? "28px serif" : "18px serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = `hsl(${food.hue},100%,${food.isPowerUp ? '80%' : '60%'})`;
      this.ctx.shadowBlur = food.isPowerUp ? 30 : 20;
      this.ctx.fillText(food.emoji, food.x, food.y);
      this.ctx.shadowBlur = 0;
    });
    this.ctx.restore();
  }

  drawAISnakes() {
    this.ctx.save();
    this.ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    this.gameState.aiSnakes.forEach(ai => {
      this.draw3DAISnake(ai);
      this.drawAISnakeHead(ai);
    });
    this.ctx.restore();
  }

  draw3DAISnake(ai) {
    const thickness = this.gameState.getScaledThickness() * 0.7;
    
    // Draw each AI snake segment with 3D effect
    for (let i = 0; i < ai.body.length - 1; i++) {
      const current = ai.body[i];
      const next = ai.body[i + 1];
      
      // Calculate segment angle
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      const perpAngle = angle + Math.PI / 2;
      
      // Create 3D gradient for AI snake
      const aiGrad = this.ctx.createLinearGradient(
        current.x - Math.cos(perpAngle) * thickness * 0.4,
        current.y - Math.sin(perpAngle) * thickness * 0.4,
        current.x + Math.cos(perpAngle) * thickness * 0.4,
        current.y + Math.sin(perpAngle) * thickness * 0.4
      );
      
      aiGrad.addColorStop(0, `hsl(${ai.colorHue},85%,70%)`); // Highlight
      aiGrad.addColorStop(0.3, `hsl(${ai.colorHue},90%,55%)`); // Main color
      aiGrad.addColorStop(0.7, `hsl(${ai.colorHue},95%,35%)`); // Mid tone
      aiGrad.addColorStop(1, `hsl(${ai.colorHue},100%,20%)`); // Shadow
      
      // Draw main body
      this.ctx.strokeStyle = aiGrad;
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = `hsl(${ai.colorHue},100%,50%)`;
      this.ctx.shadowBlur = 8;
      
      this.ctx.beginPath();
      this.ctx.moveTo(current.x, current.y);
      this.ctx.lineTo(next.x, next.y);
      this.ctx.stroke();
      
      // Draw bottom shadow
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = `hsl(${ai.colorHue},100%,15%)`;
      this.ctx.lineWidth = thickness * 0.3;
      this.ctx.globalAlpha = 0.4;
      
      this.ctx.beginPath();
      this.ctx.moveTo(
        current.x + Math.cos(perpAngle) * (thickness * 0.2),
        current.y + Math.sin(perpAngle) * (thickness * 0.2)
      );
      this.ctx.lineTo(
        next.x + Math.cos(perpAngle) * (thickness * 0.2),
        next.y + Math.sin(perpAngle) * (thickness * 0.2)
      );
      this.ctx.stroke();
      
      this.ctx.globalAlpha = 1;
    }
  }

  drawAISnakeHead(ai) {
    const head = ai.body[0];
    const thickness = this.gameState.getScaledThickness() * 0.7;
    
    // Calculate eye positions
    const eyeOffsetX = Math.cos(ai.angle + Math.PI / 2) * thickness / 2.5;
    const eyeOffsetY = Math.sin(ai.angle + Math.PI / 2) * thickness / 2.5;
    
    // Draw menacing red eyes
    [[eyeOffsetX, eyeOffsetY], [-eyeOffsetX, -eyeOffsetY]].forEach(offset => {
      if (ai.blinking) {
        // Closed eyes - angry slits
        this.ctx.fillStyle = 'darkred';
        this.ctx.fillRect(head.x + offset[0] - 3, head.y + offset[1] - 1, 6, 2);
      } else {
        // Open eyes - glowing red
        this.ctx.fillStyle = 'red';
        this.ctx.shadowColor = 'red';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(head.x + offset[0], head.y + offset[1], 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils - black centers
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(head.x + offset[0] + 1, head.y + offset[1], 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
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
    particleSystem.draw(this.ctx, this.gameState.camera);
    this.drawPauseScreen();
  }
}