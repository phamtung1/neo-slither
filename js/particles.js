export class ParticleSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  spawn(x, y, count = 20, color = "0,255,204") {
    for (let i = 0; i < count; i++) {
      this.gameState.particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        alpha: 1,
        radius: Math.random() * 2 + 2,
        color
      });
    }
  }

  update() {
    this.gameState.particles.forEach(particle => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.alpha -= 0.02;
    });
    this.gameState.particles = this.gameState.particles.filter(p => p.alpha > 0);
  }

  draw(ctx, camera) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    this.gameState.particles.forEach(particle => {
      ctx.fillStyle = `rgba(${particle.color},${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}