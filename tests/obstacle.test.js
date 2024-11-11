/**
 * @jest-environment jsdom
 */

import { spawnObstacle, updateObstacles, detectCollision, obstacles } from '/baseGame/obstacle.js';
import { dino } from '/baseGame/dino.js';
import { setGameOver, setPaused, setGameStarted, canvas, ctx, gameSpeed } from '/baseGame/game.js';

// Mocking the global canvas and context
beforeEach(() => {
    global.canvas = {
        width: 800,
        height: 400,
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            drawImage: jest.fn(),
            clearRect: jest.fn(),
        })),
    };
    global.ctx = canvas.getContext('2d');
    
    obstacles.length = 0;  // Clear obstacles array before each test

    // Setting up the player (dino) character mock
    global.dino = {
        x: 50,
        y: canvas.height - 50,
        width: 30,
        height: 30
    };
    
    jest.clearAllMocks();
});

test('obstacle array should be empty initially', () => {
    expect(obstacles.length).toBe(0);
});

test('spawnObstacle should add an obstacle to the obstacles array', () => {
    spawnObstacle();
    expect(obstacles.length).toBe(1);
    expect(obstacles[0].x).toBe(canvas.width);
});

test('spawnObstacle should create obstacles at random heights', () => {
    const initialHeight = obstacles.length;
    for (let i = 0; i < 10; i++) {
        spawnObstacle();
    }
    const heights = obstacles.map(obs => obs.y);
    const uniqueHeights = new Set(heights);
    expect(uniqueHeights.size).toBeGreaterThan(1); // There should be different heights
});

test('updateObstacles should move obstacles to the left', () => {
    spawnObstacle();
    const initialX = obstacles[0].x;
    updateObstacles();
    expect(obstacles[0].x).toBeLessThan(initialX); // Obstacles move left
});

test('obstacles should be removed if they move off-screen', () => {
    spawnObstacle();
    obstacles[0].x = -obstacles[0].width; // Place obstacle off-screen
    updateObstacles();
    expect(obstacles.length).toBe(0); // Obstacle should be removed
});

test('updateObstacles should draw an image for obstacles', () => {
    spawnObstacle();
    updateObstacles();
    expect(ctx.drawImage).toHaveBeenCalled(); // Image should be drawn
});

test('detectCollision should set game over on collision with dino', () => {
    spawnObstacle();
    obstacles[0].x = dino.x;
    obstacles[0].y = dino.y;
    detectCollision();
    expect(setGameOver).toHaveBeenCalledWith(true);
    expect(setPaused).toHaveBeenCalledWith(true);
    expect(setGameStarted).toHaveBeenCalledWith(false);
});

test('detectCollision should not set game over if there is no collision', () => {
    spawnObstacle();
    obstacles[0].x = canvas.width; // Far right, no collision with dino
    detectCollision();
    expect(setGameOver).not.toHaveBeenCalled();
    expect(setPaused).not.toHaveBeenCalled();
    expect(setGameStarted).not.toHaveBeenCalled();
});
