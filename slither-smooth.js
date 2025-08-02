import { GameState } from './js/gameState.js';
import { Snake } from './js/snake.js';
import { FoodSystem } from './js/foodSystem.js';
import { AISnakes } from './js/aiSnakes.js';
import { ParticleSystem } from './js/particles.js';
import { Renderer } from './js/renderer.js';
import { InputHandler } from './js/inputHandler.js';
import { Obstacles } from './js/obstacles.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

const gameState = new GameState();
const snake = new Snake(gameState);
const foodSystem = new FoodSystem(gameState);
const aiSnakes = new AISnakes(gameState);
const particleSystem = new ParticleSystem(gameState);
const renderer = new Renderer(canvas, ctx, gameState);
const inputHandler = new InputHandler(gameState, canvas);
const obstacles = new Obstacles(gameState);


function gameLoop() {
  if (!gameState.paused) {
    gameState.updateTimers();
    
    foodSystem.update(canvas);
    snake.update(canvas);
    aiSnakes.update(canvas);
    
    foodSystem.checkCollisions(canvas, scoreBoard);
    aiSnakes.checkCollisions(scoreBoard);
    
    particleSystem.update();
  }

  renderer.render(particleSystem);
  requestAnimationFrame(gameLoop);
}

foodSystem.spawnInitialFoods(canvas, 8);
obstacles.spawn(canvas);
aiSnakes.spawn(canvas);
snake.init();
gameLoop();
