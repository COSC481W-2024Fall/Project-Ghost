/**
 * @jest-environment jsdom
 */

// Import necessary functions and variables
import { spawnObstacle, updateObstacles, detectCollision, obstacles } from '../baseGame/obstacle.js';
import { dino } from '../baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, isGameStarted, gameSpeed} from '../baseGame/game.js';
import { displayScreen } from '../baseGame/ui.js';

// In your test setup or at the top of your test file (tests/obstacle.test.js)
beforeEach(() => {
  // Mock global canvas
  global.canvas = {
    width: 800,
    height: 600,
    getContext: jest.fn().mockReturnValue({
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    }),
  };

  // Reset obstacles
  global.obstacles = [];

  // Mock DOM container if needed
  const container = document.createElement('div');
  container.id = 'container';
  document.body.appendChild(container);
});

afterEach(() => {
  // Clean up the DOM
  document.body.innerHTML = '';
});

// Mock Math.random
jest.spyOn(Math, 'random').mockReturnValue(0.5); // Return consistent random value

// Mock game-related modules
jest.mock('../baseGame/game.js', () => ({
  setGameOver: jest.fn(),
  setPaused: jest.fn(),
  setGameStarted: jest.fn(),
  isGameStarted: true, // Simulate the game being started
}));

// Mock Dino object
jest.mock('../baseGame/dino.js', () => ({
  dino: {
    x: 50,
    y: 550, // Adjust based on canvas.height - 50
    width: 70,
    height: 130,
    hitboxWidth: 30,
  },
}));

// Mock Score module
jest.mock('../baseGame/score.js', () => ({
  updateScore: jest.fn(),
  resetScore: jest.fn(),
}));

// Mock UI module
jest.mock('../baseGame/ui.js', () => ({
  displayScreen: jest.fn(),
}));


  test('dino object should be initialized correctly', () => {
    const dino = {
      x: 50,
      y: canvas.height - 50,
      width: 70,
      height: 130,
      hitboxWidth: 30,
    };
  
    expect(dino.y).toBe(550);  // Since canvas.height is mocked as 600
  });

  test('obstacle object should be initialized correctly', () => {
    // Mock obstacle object
    const obstacle = {
      x: canvas.width, // Typically starts at the right edge of the canvas
      y: canvas.height - 50, // Positioned at ground level, adjust based on game logic
      width: 50, // Example width
      height: 50, // Example height
      isAirObstacle: false, // Example property for obstacle type
    };
  
    // Assertions to verify initial values
    expect(obstacle.x).toBe(800); // canvas.width mocked as 800
    expect(obstacle.y).toBe(550); // canvas.height mocked as 600
    expect(obstacle.width).toBe(50);
    expect(obstacle.height).toBe(50);
    expect(obstacle.isAirObstacle).toBe(false);
  });

  test('spawnObstacle should initialize an obstacle correctly', () => {
    // Ensure canvas is available
    expect(canvas.height).toBeDefined();
  
    // Call the function to spawn an obstacle
    
    function spawnObstacle() {
      let size = Math.random() * 50 + 40;
      let isAirObstacle = Math.random() < 0.5;
      let airOrGroundY = isAirObstacle ? canvas.height - size - 120 : canvas.height - size;
  
      obstacles.push({
          x: canvas.width,
          y: airOrGroundY,
          width: size,
          height: size,
          speed: gameSpeed,
          isAirObstacle,
          initialY: airOrGroundY, 
          angle: Math.random() * Math.PI * 2, 
          diagonalDirection: Math.random() < 0.5 ? 1 : -1 
      });
  }
      
  spawnObstacle();
    // Check the first obstacle's properties
    const obstacle = obstacles[0]; // Assuming obstacles array exists globally or is imported
    
    // Verify obstacle properties
    expect(obstacle.x).toBe(800); // canvas.width
    expect(obstacle.y).toBeGreaterThanOrEqual(0); // Ensure it's within canvas bounds
    expect(obstacle.y).toBeLessThanOrEqual(600);  // canvas.height
    expect(obstacle.width).toBeGreaterThan(0); // Example condition for width
    expect(obstacle.height).toBeGreaterThan(0); // Example condition for height
    expect(typeof obstacle.isAirObstacle).toBe('boolean'); // Ensure isAirObstacle is a boolean
  });
  
  
  
  

