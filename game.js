const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerSize = 50;
const obstacleSize = 50;
const collectibleSize = 30;
const initialSpeed = 5;
const speedIncreaseInterval = 5000; // milliseconds
const moveAmount = 20; // Amount the player moves per control event

let playerX;
let playerY;
let currentSpeed;
let score;
let obstacles;
let collectibles;
let lastSpeedIncreaseTime;
let isGameOver;
let gameStarted = false; // Flag to track if the game has started

// Initialize game state
function initGame() {
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height - playerSize - 10;
    currentSpeed = initialSpeed;
    score = 0;
    obstacles = [];
    collectibles = [];
    lastSpeedIncreaseTime = Date.now();
    isGameOver = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('score').innerText = 'Score: 0';
    document.getElementById('startButton').style.display = 'none';

    createObstacle();
    createCollectible();
}

// Event listener for player controls (keyboard)
function handleKeyboardControls(event) {
    if (!gameStarted) return;
    if (event.code === 'ArrowLeft') {
        playerX -= moveAmount;
    } else if (event.code === 'ArrowRight') {
        playerX += moveAmount;
    }

    // Ensure player stays within canvas bounds
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerSize) playerX = canvas.width - playerSize;
}

// Event listener for touch controls
function handleTouchControls(event) {
    if (!gameStarted) return;
    event.preventDefault(); // Prevent default scrolling behavior
    const touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (touchX < canvas.width / 2) {
        playerX -= moveAmount;
    } else {
        playerX += moveAmount;
    }

    // Ensure player stays within canvas bounds
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerSize) playerX = canvas.width - playerSize;
}

// Event listener for mouse controls
function handleMouseControls(event) {
    if (!gameStarted) return;
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    // Move player based on cursor position
    if (mouseX < canvas.width / 2) {
        playerX -= moveAmount;
    } else {
        playerX += moveAmount;
    }

    // Ensure player stays within canvas bounds
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerSize) playerX = canvas.width - playerSize;
}

// Touch and mouse event listeners
canvas.addEventListener('touchstart', handleTouchControls, false);
canvas.addEventListener('touchmove', handleTouchControls, false);
canvas.addEventListener('mousemove', handleMouseControls, false);
canvas.addEventListener('mousedown', handleMouseControls, false);

// Keyboard event listener
document.addEventListener('keydown', handleKeyboardControls);

// Restart button event listener
document.getElementById('restartButton').addEventListener('click', () => {
    initGame();
    gameStarted = true;
    gameLoop(); // Restart the game loop
});

// Start button event listener
document.getElementById('startButton').addEventListener('click', () => {
    gameStarted = true;
    initGame();
    gameLoop(); // Start the game loop
});

// Create obstacles and collectibles
function createObstacle() {
    const x = Math.random() * (canvas.width - obstacleSize);
    const y = -obstacleSize;
    obstacles.push({ x, y });
}

function createCollectible() {
    const x = Math.random() * (canvas.width - collectibleSize);
    const y = -collectibleSize;
    collectibles.push({ x, y });
}

// Update game state
function update() {
    if (!gameStarted || isGameOver) return;

    const now = Date.now();
    if (now - lastSpeedIncreaseTime > speedIncreaseInterval) {
        currentSpeed += 0.5;
        lastSpeedIncreaseTime = now;
    }

    // Update obstacles and collectibles
    obstacles.forEach(obstacle => {
        obstacle.y += currentSpeed;
        if (obstacle.y > canvas.height) {
            obstacles.shift();
            createObstacle();
        }
    });

    collectibles.forEach(collectible => {
        collectible.y += currentSpeed;
        if (collectible.y > canvas.height) {
            collectibles.shift();
            createCollectible();
        }
    });

    // Check collisions
    obstacles.forEach(obstacle => {
        if (playerX < obstacle.x + obstacleSize &&
            playerX + playerSize > obstacle.x &&
            playerY < obstacle.y + obstacleSize &&
            playerY + playerSize > obstacle.y) {
            gameOver();
        }
    });

    collectibles.forEach((collectible, index) => {
        if (playerX < collectible.x + collectibleSize &&
            playerX + playerSize > collectible.x &&
            playerY < collectible.y + collectibleSize &&
            playerY + playerSize > collectible.y) {
            score += 10;
            collectibles.splice(index, 1);
            createCollectible();
        }
    });

    // Draw everything
    draw();
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Draw obstacles
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacleSize, obstacleSize));

    // Draw collectibles
    ctx.fillStyle = 'green';
    collectibles.forEach(collectible => ctx.fillRect(collectible.x, collectible.y, collectibleSize, collectibleSize));

    // Update score display
    document.getElementById('score').innerText = 'Score: ' + score;
}

// Game over logic
function gameOver() {
    isGameOver = true;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('restartButton').style.display = 'block';
    document.getElementById('finalScore').innerText = score; // Display final score
}

// Game loop
function gameLoop() {
    update();
    if (gameStarted && !isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}
