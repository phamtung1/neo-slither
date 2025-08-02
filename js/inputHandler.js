export class InputHandler {
  constructor(gameState, canvas) {
    this.gameState = gameState;
    this.canvas = canvas;
    this.init();
  }

  init() {
    this.setupMouseEvents();
    this.setupWindowEvents();
    this.setupCanvasResize();
  }

  setupMouseEvents() {
    document.addEventListener("mousemove", (e) => {
      this.gameState.target.x = e.clientX;
      this.gameState.target.y = e.clientY;
    });

    document.addEventListener("mousedown", () => {
      this.gameState.boosting = true;
    });

    document.addEventListener("mouseup", () => {
      this.gameState.boosting = false;
    });
  }

  setupWindowEvents() {
    window.addEventListener("blur", () => {
      this.gameState.paused = true;
    });

    window.addEventListener("focus", () => {
      this.gameState.paused = false;
    });
  }

  setupCanvasResize() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }
}