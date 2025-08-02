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
    
    // Performance optimization: limit segments drawn based on snake length
    const maxSegments = Math.min(this.gameState.snake.length - 1, 80); // Cap at 80 segments
    const skipFactor = Math.max(1, Math.floor((this.gameState.snake.length - 1) / maxSegments));
    
    // Cache common calculations
    const baseHue = this.gameState.hue % 360;
    const shadowColor = this.gameState.shieldTimer > 0 ? 'cyan' : `hsl(${baseHue},100%,60%)`;
    const shadowBlur = this.gameState.shieldTimer > 0 ? 30 : this.gameState.boosting ? 20 : 10;
    
    // Draw segments with level-of-detail optimization
    for (let i = 0; i < this.gameState.snake.length - 1; i += skipFactor) {
      const current = this.gameState.snake[i];
      const next = this.gameState.snake[Math.min(i + skipFactor, this.gameState.snake.length - 1)];
      
      // Skip segments that are off-screen (frustum culling)
      if (!this.isSegmentVisible(current, next, thickness)) {
        continue;
      }
      
      // Calculate segment angle
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      const perpAngle = angle + Math.PI / 2;
      
      // Simplified 3D effect for long snakes
      const segmentHue = (baseHue + i) % 360;
      
      if (this.gameState.snake.length < 150) {
        // Full 3D rendering for shorter snakes
        this.drawFullSegment3D(current, next, thickness, perpAngle, segmentHue, shadowColor, shadowBlur);
      } else {
        // Simplified rendering for long snakes
        this.drawSimpleSegment3D(current, next, thickness, segmentHue, shadowColor, shadowBlur);
      }
    }
    
    this.ctx.shadowBlur = 0;
  }

  isSegmentVisible(current, next, thickness) {
    const padding = thickness;
    const camera = this.gameState.camera;
    const canvas = this.canvas;
    
    // Check if segment is within screen bounds (with padding)
    const minX = Math.min(current.x, next.x) - padding;
    const maxX = Math.max(current.x, next.x) + padding;
    const minY = Math.min(current.y, next.y) - padding;
    const maxY = Math.max(current.y, next.y) + padding;
    
    return !(maxX < camera.x || minX > camera.x + canvas.width ||
             maxY < camera.y || minY > camera.y + canvas.height);
  }

  drawFullSegment3D(current, next, thickness, perpAngle, segmentHue, shadowColor, shadowBlur) {
    // Full 3D gradient calculation
    const topOffset = thickness * 0.4;
    const topGrad = this.ctx.createLinearGradient(
      current.x - Math.cos(perpAngle) * topOffset,
      current.y - Math.sin(perpAngle) * topOffset,
      current.x + Math.cos(perpAngle) * topOffset,
      current.y + Math.sin(perpAngle) * topOffset
    );
    
    topGrad.addColorStop(0, `hsl(${segmentHue},85%,75%)`);
    topGrad.addColorStop(0.3, `hsl(${segmentHue},90%,65%)`);
    topGrad.addColorStop(0.7, `hsl(${segmentHue},95%,45%)`);
    topGrad.addColorStop(1, `hsl(${segmentHue},100%,25%)`);
    
    // Draw main body
    this.ctx.strokeStyle = topGrad;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = shadowBlur;
    
    this.ctx.beginPath();
    this.ctx.moveTo(current.x, current.y);
    this.ctx.lineTo(next.x, next.y);
    this.ctx.stroke();
    
    // Bottom shadow
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = `hsl(${segmentHue},100%,15%)`;
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

  drawSimpleSegment3D(current, next, thickness, segmentHue, shadowColor, shadowBlur) {
    // Simplified single-color rendering with basic shadow
    this.ctx.strokeStyle = `hsl(${segmentHue},90%,55%)`;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = Math.max(5, shadowBlur * 0.5); // Reduced shadow blur
    
    this.ctx.beginPath();
    this.ctx.moveTo(current.x, current.y);
    this.ctx.lineTo(next.x, next.y);
    this.ctx.stroke();
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
    // Draw based on shape type without rotation
    switch (obstacle.shape) {
      case 'rectangle':
        this.drawRectangle3D(obstacle);
        break;
      case 'circle':
        this.drawCircle3D(obstacle);
        break;
      case 'triangle':
        this.drawTriangle3D(obstacle);
        break;
      case 'hexagon':
        this.drawHexagon3D(obstacle);
        break;
      case 'diamond':
        this.drawDiamond3D(obstacle);
        break;
      default:
        this.drawRectangle3D(obstacle);
    }
  }

  drawRectangle3D(obstacle) {
    const { x, y, w, h } = obstacle;
    const depth = 12;
    
    // Front face gradient
    const topGradient = this.ctx.createLinearGradient(x, y, x + w, y);
    topGradient.addColorStop(0, 'hsl(0,70%,60%)');
    topGradient.addColorStop(1, 'hsl(0,80%,50%)');
    
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(x, y, w, h);
    
    // Right side face
    const rightGradient = this.ctx.createLinearGradient(x + w, y, x + w, y + h);
    rightGradient.addColorStop(0, 'hsl(0,85%,40%)');
    rightGradient.addColorStop(1, 'hsl(0,90%,30%)');
    
    this.ctx.fillStyle = rightGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w, y);
    this.ctx.lineTo(x + w + depth, y - depth);
    this.ctx.lineTo(x + w + depth, y + h - depth);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Top face
    const topIsoGradient = this.ctx.createLinearGradient(x, y, x + w + depth, y - depth);
    topIsoGradient.addColorStop(0, 'hsl(0,75%,65%)');
    topIsoGradient.addColorStop(1, 'hsl(0,80%,55%)');
    
    this.ctx.fillStyle = topIsoGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + depth, y - depth);
    this.ctx.lineTo(x + w + depth, y - depth);
    this.ctx.lineTo(x + w, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawCircle3D(obstacle) {
    const centerX = obstacle.x + obstacle.radius;
    const centerY = obstacle.y + obstacle.radius;
    const radius = obstacle.radius;
    const depth = 10;
    
    // Draw shadow ellipse first
    this.ctx.fillStyle = 'hsl(0,90%,25%)';
    this.ctx.save();
    this.ctx.translate(centerX + depth, centerY - depth);
    this.ctx.scale(1, 0.6);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    
    // Draw main cylinder with gradient
    const radialGrad = this.ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX, centerY, radius
    );
    radialGrad.addColorStop(0, 'hsl(0,70%,70%)');
    radialGrad.addColorStop(0.7, 'hsl(0,80%,50%)');
    radialGrad.addColorStop(1, 'hsl(0,90%,30%)');
    
    this.ctx.fillStyle = radialGrad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawTriangle3D(obstacle) {
    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.w;
    const h = obstacle.h;
    const depth = 8;
    
    // Main triangle face
    const triGrad = this.ctx.createLinearGradient(x, y, x + w, y + h);
    triGrad.addColorStop(0, 'hsl(0,70%,65%)');
    triGrad.addColorStop(1, 'hsl(0,80%,45%)');
    
    this.ctx.fillStyle = triGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y);      // Top point
    this.ctx.lineTo(x, y + h);          // Bottom left
    this.ctx.lineTo(x + w, y + h);      // Bottom right
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right side face
    this.ctx.fillStyle = 'hsl(0,85%,35%)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y);
    this.ctx.lineTo(x + w / 2 + depth, y - depth);
    this.ctx.lineTo(x + w + depth, y + h - depth);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawHexagon3D(obstacle) {
    const centerX = obstacle.x + obstacle.radius;
    const centerY = obstacle.y + obstacle.radius;
    const radius = obstacle.radius;
    const depth = 8;
    
    // Create hexagon points
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    // Main hexagon face
    const hexGrad = this.ctx.createRadialGradient(
      centerX - radius * 0.2, centerY - radius * 0.2, 0,
      centerX, centerY, radius
    );
    hexGrad.addColorStop(0, 'hsl(0,70%,65%)');
    hexGrad.addColorStop(1, 'hsl(0,85%,40%)');
    
    this.ctx.fillStyle = hexGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Side faces (draw a few for 3D effect)
    this.ctx.fillStyle = 'hsl(0,90%,30%)';
    for (let i = 0; i < 3; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 6];
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p1.x + depth, p1.y - depth);
      this.ctx.lineTo(p2.x + depth, p2.y - depth);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  drawDiamond3D(obstacle) {
    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.w;
    const h = obstacle.h;
    const depth = 10;
    
    // Diamond points
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    
    // Main diamond face
    const diamondGrad = this.ctx.createRadialGradient(
      centerX - w * 0.2, centerY - h * 0.2, 0,
      centerX, centerY, Math.max(w, h) / 2
    );
    diamondGrad.addColorStop(0, 'hsl(0,70%,70%)');
    diamondGrad.addColorStop(1, 'hsl(0,85%,40%)');
    
    this.ctx.fillStyle = diamondGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, y);           // Top
    this.ctx.lineTo(x + w, centerY);       // Right
    this.ctx.lineTo(centerX, y + h);       // Bottom
    this.ctx.lineTo(x, centerY);           // Left
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right side face
    this.ctx.fillStyle = 'hsl(0,90%,30%)';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, y);
    this.ctx.lineTo(centerX + depth, y - depth);
    this.ctx.lineTo(x + w + depth, centerY - depth);
    this.ctx.lineTo(x + w, centerY);
    this.ctx.closePath();
    this.ctx.fill();
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