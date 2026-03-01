// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const DASH_SPEED = 15;
const DASH_DURATION = 20;
const DOUBLE_JUMP_DURATION = 30;

// Game state
let canvas, ctx;
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let currentLevel = 1;
let powerUp = null;
let powerUpTimer = 0;

// Player object
let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 40,
    velX: 0,
    velY: 0,
    grounded: false,
    canDoubleJump: false,
    hasDoubleJump: false,
    hasDash: false,
    hasShield: false,
    dashTimer: 0,
    doubleJumpTimer: 0,
    color: '#FF6B6B'
};

// Platforms
let platforms = [
    { x: 0, y: 350, width: 200, height: 20, color: '#8B4513' },
    { x: 250, y: 300, width: 150, height: 20, color: '#8B4513' },
    { x: 450, y: 250, width: 150, height: 20, color: '#8B4513' },
    { x: 650, y: 200, width: 150, height: 20, color: '#8B4513' },
    { x: 0, y: 380, width: 800, height: 20, color: '#654321' } // Ground
];

// Enemies
let enemies = [
    { x: 300, y: 280, width: 25, height: 25, velX: 2, color: '#FF4444', type: 'walker' },
    { x: 500, y: 230, width: 25, height: 25, velX: 3, color: '#FF4444', type: 'walker' },
    { x: 700, y: 180, width: 30, height: 30, velX: 0, color: '#FF0000', type: 'stationary' }
];

// Collectibles
let collectibles = [
    { x: 150, y: 330, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 },
    { x: 300, y: 280, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 },
    { x: 500, y: 230, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 },
    { x: 700, y: 180, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 }
];

// Power-ups
let powerUps = [
    { x: 200, y: 330, width: 25, height: 25, color: '#00FF00', type: 'doubleJump', active: true },
    { x: 400, y: 280, width: 25, height: 25, color: '#0000FF', type: 'dash', active: true },
    { x: 600, y: 230, width: 25, height: 25, color: '#FF00FF', type: 'shield', active: true }
];

// Goal
let goal = {
    x: 750,
    y: 150,
    width: 30,
    height: 50,
    color: '#FFD700'
};

// Input handling
let keys = {};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Initial draw
    draw();
});

function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    lives = 3;
    currentLevel = 1;
    resetPlayer();
    updateStats();
    gameLoop();
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseButton').textContent = gamePaused ? 'Resume' : 'Pause';
    }
}

function resetPlayer() {
    player.x = 100;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    player.hasDoubleJump = false;
    player.hasDash = false;
    player.hasShield = false;
    player.dashTimer = 0;
    player.doubleJumpTimer = 0;
    powerUp = null;
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('powerUp').textContent = powerUp ? powerUp : 'No Power-Up';
}

function gameLoop() {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        update();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Handle player movement
    handleInput();
    
    // Apply gravity
    player.velY += GRAVITY;
    
    // Update position
    player.x += player.velX;
    player.y += player.velY;
    
    // Check platform collisions
    checkPlatformCollisions();
    
    // Check enemy collisions
    checkEnemyCollisions();
    
    // Check collectibles
    checkCollectibles();
    
    // Check power-ups
    checkPowerUps();
    
    // Check goal
    checkGoal();
    
    // Update power-up timers
    updatePowerUpTimers();
    
    // Update enemies
    updateEnemies();
    
    // Check boundaries
    if (player.y > canvas.height) {
        loseLife();
    }
}

function handleInput() {
    // Left/Right movement
    if (keys['a'] || keys['ArrowLeft']) {
        player.velX = -MOVE_SPEED;
    } else if (keys['d'] || keys['ArrowRight']) {
        player.velX = MOVE_SPEED;
    } else {
        player.velX = 0;
    }
    
    // Jump
    if ((keys[' '] || keys['Space']) && player.grounded) {
        player.velY = JUMP_FORCE;
        player.grounded = false;
    }
    
    // Double jump
    if ((keys[' '] || keys['Space']) && !player.grounded && player.hasDoubleJump && player.doubleJumpTimer > 0) {
        player.velY = JUMP_FORCE;
        player.doubleJumpTimer = 0;
    }
    
    // Dash
    if ((keys['Shift'] || keys['ShiftLeft']) && player.hasDash && player.dashTimer <= 0) {
        player.velX = (player.velX > 0 ? DASH_SPEED : -DASH_SPEED);
        player.dashTimer = DASH_DURATION;
    }
}

function checkPlatformCollisions() {
    player.grounded = false;
    
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Collision from top
            if (player.velY > 0 && player.y + player.height - player.velY <= platform.y) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
            // Collision from bottom
            else if (player.velY < 0 && player.y - player.velY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velY = 0;
            }
            // Side collisions
            else {
                if (player.velX > 0) {
                    player.x = platform.x - player.width;
                } else if (player.velX < 0) {
                    player.x = platform.x + platform.width;
                }
            }
        }
    }
}

function checkEnemyCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Check if player lands on enemy
            if (player.velY > 0 && player.y + player.height - player.velY <= enemy.y) {
                enemies.splice(i, 1);
                score += 50;
                player.velY = JUMP_FORCE / 2;
            } else if (player.hasShield) {
                // Shield protects from enemy
                enemies.splice(i, 1);
                score += 25;
            } else {
                loseLife();
            }
            
            updateStats();
        }
    }
}

function checkCollectibles() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let item = collectibles[i];
        
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            if (item.type === 'coin') {
                score += item.value;
            }
            
            collectibles.splice(i, 1);
            updateStats();
        }
    }
}

function checkPowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let item = powerUps[i];
        
        if (item.active &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            activatePowerUp(item.type);
            powerUps.splice(i, 1);
        }
    }
}

function activatePowerUp(type) {
    switch(type) {
        case 'doubleJump':
            player.hasDoubleJump = true;
            player.doubleJumpTimer = DOUBLE_JUMP_DURATION;
            powerUp = 'Double Jump';
            break;
        case 'dash':
            player.hasDash = true;
            powerUp = 'Dash';
            break;
        case 'shield':
            player.hasShield = true;
            powerUp = 'Shield';
            break;
    }
    updateStats();
}

function updatePowerUpTimers() {
    if (player.doubleJumpTimer > 0) {
        player.doubleJumpTimer--;
        if (player.doubleJumpTimer <= 0) {
            player.hasDoubleJump = false;
            powerUp = null;
        }
    }
    
    if (player.dashTimer > 0) {
        player.dashTimer--;
        if (player.dashTimer <= 0) {
            // Dash effect ends
        }
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        if (enemy.type === 'walker') {
            enemy.x += enemy.velX;
            
            // Reverse direction at boundaries
            if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
                enemy.velX *= -1;
            }
        }
    }
}

function checkGoal() {
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        
        // Level complete
        currentLevel++;
        score += 100;
        
        if (currentLevel <= 3) {
            loadNextLevel();
        } else {
            gameComplete();
        }
        
        updateStats();
    }
}

function loadNextLevel() {
    // Reset level based on current level
    resetPlayer();
    
    // Different level configurations
    if (currentLevel === 2) {
        // Crystal Caverns
        platforms = [
            { x: 0, y: 350, width: 200, height: 20, color: '#8B4513' },
            { x: 250, y: 300, width: 150, height: 20, color: '#8B4513' },
            { x: 450, y: 250, width: 150, height: 20, color: '#8B4513' },
            { x: 650, y: 200, width: 150, height: 20, color: '#8B4513' },
            { x: 0, y: 380, width: 800, height: 20, color: '#654321' }
        ];
        
        enemies = [
            { x: 300, y: 280, width: 25, height: 25, velX: 3, color: '#FF4444', type: 'walker' },
            { x: 500, y: 230, width: 25, height: 25, velX: 4, color: '#FF4444', type: 'walker' }
        ];
        
        collectibles = [
            { x: 150, y: 330, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 },
            { x: 300, y: 280, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 10 },
            { x: 500, y: 230, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 20 }
        ];
    } else if (currentLevel === 3) {
        // Sky Fortress
        platforms = [
            { x: 0, y: 350, width: 200, height: 20, color: '#8B4513' },
            { x: 250, y: 300, width: 150, height: 20, color: '#8B4513' },
            { x: 450, y: 200, width: 150, height: 20, color: '#8B4513' },
            { x: 650, y: 150, width: 150, height: 20, color: '#8B4513' },
            { x: 0, y: 380, width: 800, height: 20, color: '#654321' }
        ];
        
        enemies = [
            { x: 300, y: 280, width: 25, height: 25, velX: 4, color: '#FF4444', type: 'walker' },
            { x: 500, y: 180, width: 25, height: 25, velX: 5, color: '#FF4444', type: 'walker' }
        ];
        
        collectibles = [
            { x: 150, y: 330, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 20 },
            { x: 300, y: 280, width: 20, height: 20, color: '#FFD700', type: 'coin', value: 20 }
        ];
    }
}

function loseLife() {
    lives--;
    updateStats();
    
    if (lives <= 0) {
        gameOver();
    } else {
        resetPlayer();
    }
}

function gameOver() {
    gameRunning = false;
    alert(`Game Over! Final Score: ${score}`);
    startGame();
}

function gameComplete() {
    gameRunning = false;
    alert(`Congratulations! You completed the game! Final Score: ${score}`);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background based on level
    drawBackground();
    
    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add texture
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Draw collectibles
    for (let item of collectibles) {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(item.x + item.width/2 - 3, item.y + item.height/2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw power-ups
    for (let item of powerUps) {
        if (item.active) {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.width, item.height);
            
            // Add glow effect
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(item.x, item.y, item.width, item.height);
        }
    }
    
    // Draw enemies
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 15, enemy.y + 5, 5, 5);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 7, enemy.y + 7, 3, 3);
        ctx.fillRect(enemy.x + 17, enemy.y + 7, 3, 3);
    }
    
    // Draw goal
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    
    // Draw flag on goal
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(goal.x + goal.width, goal.y);
    ctx.lineTo(goal.x + goal.width + 20, goal.y + 10);
    ctx.lineTo(goal.x + goal.width, goal.y + 20);
    ctx.fill();
    
    // Draw player with power-up effects
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 7, player.y + 7, 3, 3);
    ctx.fillRect(player.x + 22, player.y + 7, 3, 3);
    
    // Draw power-up effects on player
    if (player.hasShield) {
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, 25, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    if (player.hasDoubleJump && player.doubleJumpTimer > 0) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawBackground() {
    // Sky gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    if (currentLevel === 1) {
        // Enchanted Forest
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8C8');
    } else if (currentLevel === 2) {
        // Crystal Caverns
        gradient.addColorStop(0, '#4A4A4A');
        gradient.addColorStop(1, '#2A2A2A');
    } else if (currentLevel === 3) {
        // Sky Fortress
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#B0E0E6');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds or stars based on level
    if (currentLevel === 1 || currentLevel === 3) {
        drawClouds();
    } else {
        drawStars();
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(200, 50, 30, 0, Math.PI * 2);
    ctx.arc(230, 40, 25, 0, Math.PI * 2);
    ctx.arc(260, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(500, 100, 35, 0, Math.PI * 2);
    ctx.arc(535, 90, 30, 0, Math.PI * 2);
    ctx.arc(570, 100, 35, 0, Math.PI * 2);
    ctx.fill();
}

function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 30, 50 + Math.sin(i) * 20, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
