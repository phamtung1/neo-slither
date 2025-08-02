export class Obstacles {
  constructor(gameState) {
    this.gameState = gameState;
  }

  spawn(canvas, count = 100) {
    this.gameState.obstacles = [];
    
    // Create variety of obstacle sizes
    const sizeVariants = [
      { min: 60, max: 120, weight: 0.5 },   // Small obstacles (50%)
      { min: 120, max: 200, weight: 0.3 }, // Medium obstacles (30%)  
      { min: 200, max: 300, weight: 0.2 }, // Large obstacles (20%)
    ];

    // Different obstacle shapes with weights
    const shapeTypes = [
      { type: 'rectangle', weight: 0.4 },
      { type: 'circle', weight: 0.25 },
      { type: 'triangle', weight: 0.15 },
      { type: 'hexagon', weight: 0.1 },
      { type: 'diamond', weight: 0.1 }
    ];
    
    for (let i = 0; i < count; i++) {
      // Select size variant based on weighted probability
      let random = Math.random();
      let selectedVariant = sizeVariants[0];
      
      for (const variant of sizeVariants) {
        if (random < variant.weight) {
          selectedVariant = variant;
          break;
        }
        random -= variant.weight;
      }

      // Select shape type
      random = Math.random();
      let selectedShape = shapeTypes[0];
      
      for (const shape of shapeTypes) {
        if (random < shape.weight) {
          selectedShape = shape;
          break;
        }
        random -= shape.weight;
      }
      
      // Generate obstacle with selected size range
      const baseSize = selectedVariant.min + Math.random() * (selectedVariant.max - selectedVariant.min);
      const aspectRatio = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      
      let obstacle = {
        x: 0, y: 0, // Will be set after calculating bounds
        shape: selectedShape.type,
        size: baseSize,
        rotation: Math.random() * Math.PI * 2 // Random rotation for variety
      };

      // Set shape-specific properties
      switch (selectedShape.type) {
        case 'rectangle':
          obstacle.w = baseSize;
          obstacle.h = baseSize * aspectRatio;
          break;
        case 'circle':
          obstacle.radius = baseSize * 0.5;
          obstacle.w = obstacle.radius * 2;
          obstacle.h = obstacle.radius * 2;
          break;
        case 'triangle':
          obstacle.w = baseSize;
          obstacle.h = baseSize * 0.87; // Equilateral triangle height
          break;
        case 'hexagon':
          obstacle.radius = baseSize * 0.5;
          obstacle.w = obstacle.radius * 2;
          obstacle.h = obstacle.radius * 2;
          break;
        case 'diamond':
          obstacle.w = baseSize;
          obstacle.h = baseSize * aspectRatio;
          break;
      }
      
      // Position obstacle within map bounds
      obstacle.x = Math.random() * (this.gameState.mapWidth - obstacle.w - 200) + 100;
      obstacle.y = Math.random() * (this.gameState.mapHeight - obstacle.h - 200) + 100;
      
      this.gameState.obstacles.push(obstacle);
    }
  }
}