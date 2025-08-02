# 🐍 Neo Slither - Advanced 3D Snake Game

A modern, feature-rich snake game built with vanilla JavaScript, featuring stunning 3D graphics, AI opponents, and dynamic gameplay mechanics.

![Neo Slither](https://img.shields.io/badge/Game-Neo%20Slither-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Canvas](https://img.shields.io/badge/Canvas-2D%20API-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Features

### 🎨 Visual Excellence
- **3D Cylindrical Snake**: Realistic 3D rendering with gradients, shadows, and lighting effects
- **Dynamic Snake Scaling**: Snake grows thicker as it gets longer for visual progression
- **Isometric 3D Obstacles**: Five different obstacle shapes (rectangles, circles, triangles, hexagons, diamonds)
- **Particle Effects**: Explosion particles, trail effects, and food consumption animations
- **Dynamic Backgrounds**: Animated gradient backgrounds with shifting hues
- **Grid System**: Visual grid overlay for better spatial awareness

### 🤖 AI & Gameplay
- **Intelligent AI Snakes**: Multiple AI opponents with realistic movement and targeting
- **AI Snake Eyes**: Menacing red eyes with blinking animations
- **Collision System**: AI snakes explode when touching player, reducing snake length
- **Risk/Reward Mechanics**: Players can eat AI snakes for bonus points and growth

### 🗺️ World Design
- **Massive Map**: 5x screen size for exploration gameplay
- **Camera System**: Smooth camera following with viewport culling
- **100+ Obstacles**: Varied sizes and shapes for strategic navigation
- **Dynamic Food System**: 400+ food items with power-ups and special effects

### 🎯 Game Mechanics
- **Mouse Controls**: Intuitive mouse steering with boost mechanics
- **Power-ups**: Speed boost (⭐) and shield (🛡️) abilities
- **Length Display**: Real-time snake length tracking
- **Score System**: Points for eating food and AI snakes
- **Pause/Resume**: Automatic pause when window loses focus

### ⚡ Performance
- **Level-of-Detail Rendering**: Automatic quality scaling based on snake length
- **Viewport Culling**: Only renders visible elements
- **Optimized 3D Rendering**: Efficient gradient and shadow calculations
- **Segment Limiting**: Maintains 60fps even with very long snakes

## 🚀 Quick Start

### Prerequisites
- Modern web browser with Canvas 2D support
- Local web server (for ES6 modules)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neo-slither.git
   cd neo-slither
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎮 How to Play

### Controls
- **Mouse Movement**: Steer your snake
- **Mouse Hold**: Boost speed (consumes energy faster)
- **Window Focus**: Game auto-pauses when window loses focus

### Objectives
- **Grow**: Eat food (🍎🍉🍓🍒🍇🍊🥝) to increase length and score
- **Survive**: Avoid collisions with obstacles and AI snake heads
- **Hunt**: Eat AI snakes by touching their bodies for bonus points
- **Explore**: Navigate the large map to find food and avoid dangers

### Power-ups
- **⭐ Speed Boost**: Temporary speed increase
- **🛡️ Shield**: Protection from AI snake collisions

## 🏗️ Architecture

### Modular Design
The game uses a clean, modular architecture with ES6 modules:

```
neo-slither/
├── index.html              # Main HTML file
├── style.css               # Styling and UI
├── slither-smooth.js       # Main game loop and initialization
├── js/
│   ├── gameState.js        # Centralized game state management
│   ├── snake.js            # Player snake logic and physics
│   ├── aiSnakes.js         # AI snake behavior and collision
│   ├── foodSystem.js       # Food spawning and power-ups
│   ├── obstacles.js        # Obstacle generation and management
│   ├── particles.js        # Particle effects system
│   ├── renderer.js         # 3D rendering and visual effects
│   └── inputHandler.js     # Mouse and keyboard input
└── assets/
    ├── eat.mp3             # Food consumption sound
    └── explosion.mp3       # AI snake explosion sound
```

### Key Classes

#### `GameState` - Central State Management
- Snake properties (position, length, angle)
- Game mechanics (score, timers, power-ups)
- Camera positioning and map bounds
- Dynamic snake thickness calculation

#### `Renderer` - 3D Graphics Engine
- **3D Snake Rendering**: Cylindrical segments with lighting
- **Isometric Obstacles**: Multiple shape types with depth
- **Particle Systems**: Visual effects and animations
- **Performance Optimization**: LOD and viewport culling

#### `Snake` - Player Physics
- Smooth movement and turning
- Collision detection with obstacles
- Segment following and spacing
- Boundary constraints

#### `AISnakes` - Artificial Intelligence
- Player-seeking behavior with randomization
- Individual blinking animations
- Explosion mechanics and particle effects
- Dynamic spawning and replacement

## 🎨 Technical Highlights

### 3D Rendering System
- **Cylindrical Snake Body**: Each segment rendered as 3D cylinder
- **Gradient Lighting**: Simulated light source for realistic depth
- **Isometric Obstacles**: True 3D appearance with multiple faces
- **Dynamic Shadows**: Offset shadows for enhanced depth perception

### Performance Optimizations
- **Segment Culling**: Limits rendered segments (max 80)
- **Screen Culling**: Only draws visible elements
- **LOD System**: Simplified rendering for long snakes
- **Cached Calculations**: Reduced redundant computations

### Audio Integration
- **Spatial Audio**: Eating sounds with game events
- **Dynamic Effects**: Explosion sounds for AI collisions
- **Audio Optimization**: Efficient sound object management

## 🛠️ Development

### Code Structure
The game follows modern JavaScript practices:
- **ES6 Modules**: Clean separation of concerns
- **Class-based Architecture**: Object-oriented design
- **Performance First**: Optimized for smooth 60fps gameplay
- **Maintainable Code**: Well-documented and structured

### Adding Features
1. **New Obstacle Shapes**: Add to `obstacles.js` and implement renderer
2. **Power-ups**: Extend `foodSystem.js` with new types
3. **AI Behaviors**: Modify `aiSnakes.js` for different strategies
4. **Visual Effects**: Add new particle types in `particles.js`

## 🎯 Game Balance

### Difficulty Scaling
- **AI Count**: 10 aggressive AI snakes
- **Map Size**: 5x screen size for exploration
- **Obstacle Density**: 100 varied obstacles
- **Food Distribution**: 400 items across map

### Risk/Reward Systems
- **AI Snake Hunting**: High reward (10 points) but requires skill
- **Power-up Rarity**: 10% spawn rate for special abilities
- **Length Penalty**: Losing 5 length units on AI collision

## 📊 Performance Metrics

### Optimizations Achieved
- **60fps Maintained**: Even with 400+ game objects
- **Memory Efficient**: Dynamic object pooling
- **Scalable Rendering**: Performance scales with complexity
- **Responsive Controls**: Sub-16ms input latency

## 🔧 Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Edge 80+

### Required Features
- Canvas 2D API
- ES6 Modules
- Audio API
- RequestAnimationFrame

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript and Canvas 2D API
- Inspired by classic Snake games with modern enhancements
- 3D rendering techniques adapted from isometric game design
- Performance optimizations based on game engine principles

---

**Enjoy playing Neo Slither! 🐍✨**