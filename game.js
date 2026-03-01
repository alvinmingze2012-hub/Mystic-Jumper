// Game constants - Adjusted for Mario-like feel
const GRAVITY = 0.3;           // Reduced gravity for floatier jumps
const JUMP_FORCE = -8;          // Lower jump for better control
const MOVE_SPEED = 3;           // Slower movement speed
const DASH_SPEED = 8;           // Slower dash
const DASH_DURATION = 15;
const DOUBLE_JUMP_DURATION = 40;
const MAX_FALL_SPEED = 10;      // Terminal velocity
const FRICTION = 0.8;           // Ground friction
const AIR_CONTROL = 0.5;        // Reduced air control

// Game state
let canvas, ctx;
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let currentLevel = 1;
let powerUp = null;
let powerUpTimer = 0;
let coinSound = false;
let jumpSound = false;

// Player object - Mario style
let player = {
    x: 100,
    y: 300,
    width: 28,
    height: 36,
    velX: 0,
    velY: 0,
    grounded: false,
    canDoubleJump: false,
    hasDoubleJump: false,
    hasDash: false,
    hasShield: false,
    dashTimer: 0,
    doubleJumpTimer: 0,
    color: '#E63E3E',           // Mario red
    hatColor: '#C41E1E',
    mustacheColor: '#8B4513',
    invincible: false,
    invincibleTimer: 0,
    facingRight: true,
    walkCycle: 0
};

// Platforms - More Mario-like level design
let platforms = [
    // Ground level with hills
    { x: 0, y: 360, width: 200, height: 40, color: '#7B3F00', type: 'ground' },
    { x: 200, y: 340, width: 100, height: 60, color: '#7B3F00', type: 'ground' },
    { x: 300, y: 360, width: 200, height: 40, color: '#7B3F00', type: 'ground' },
    
    // Floating platforms - like Mario
    { x: 550, y: 300, width: 80, height: 20, color: '#B85E0C', type: 'brick' },
    { x: 650, y: 250, width: 80, height: 20, color: '#B85E0C', type: 'brick' },
    { x: 450, y: 200, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
    { x: 250, y: 250, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
    { x: 150, y: 280, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
    
    // Question blocks (special)
    { x: 350, y: 280, width: 40, height: 40, color: '#DAA520', type: 'question', contains: 'mushroom' },
    { x: 500, y: 230, width: 40, height: 40, color: '#DAA520', type: 'question', contains: 'star' },
    
    // Pipes (Mario style)
    { x: 100, y: 320, width: 60, height: 80, color: '#228B22', type: 'pipe' },
    { x: 600, y: 320, width: 60, height: 80, color: '#228B22', type: 'pipe' },
    
    // Bottom boundary
    { x: 0, y: 400, width: 800, height: 40, color: '#5D3A1A', type: 'ground' }
];

// Enemies - Goomba style
let enemies = [
    { x: 200, y: 340, width: 24, height: 24, velX: 1, color: '#8B4513', type: 'goomba', walking: true, squished: false },
    { x: 400, y: 340, width: 24, height: 24, velX: 1.2, color: '#8B4513', type: 'goomba', walking: true, squished: false },
    { x: 580, y: 280, width: 24, height: 24, velX: 1.5, color: '#8B4513', type: 'goomba', walking: true, squished: false },
    { x: 300, y: 230, width: 24, height: 32, velX: 2, color: '#FF4444', type: 'koopa', walking: true, shell: false }
];

// Collectibles - Mario style coins
let collectibles = [
    { x: 130, y: 300, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 180, y: 300, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 280, y: 230, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 330, y: 230, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 480, y: 210, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 530, y: 210, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 },
    { x: 670, y: 230, width: 16, height: 16, color: '#FFD700', type: 'coin', value: 10, animation: 0 }
];

// Power-ups - Mario style
let powerUps = [
    { x: 355, y: 240, width: 24, height: 24, color: '#FF0000', type: 'mushroom', active: true, moving: true, velX: 1 },
    { x: 505, y: 190, width: 24, height: 24, color: '#FFFF00', type: 'star', active: true, moving: false, animation: 0 }
];

// Blocks that can be hit
let blocks = [
    { x: 350, y: 280, width: 40, height: 40, color: '#DAA520', type: 'question', hit: false, contains: 'mushroom' },
    { x: 500, y: 230, width: 40, height: 40, color: '#DAA520', type: 'question', hit: false, contains: 'star' }
];

// Goal - Flag pole like Mario
let goal = {
    x: 750,
    y: 300,
    width: 10,
    height: 100,
    flagX: 750,
    flagY: 300,
    color: '#FFD700'
};

// Camera system
let camera = {
    x: 0,
    y: 0,
    width: 800,
    height: 400,
    follow: function(player) {
        // Smooth camera follow
        let targetX = player.x - this.width / 2 + player.width / 2;
        this.x += (targetX - this.x) * 0.1;
        // Clamp camera
        this.x = Math.max(0, Math.min(this.x, 1600 - this.width));
    }
};

// Input handling
let keys = {};
let lastJumpPress = false;
let jumpHeld = false;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    
    // Keyboard controls with better handling
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            if (!lastJumpPress) {
                // Jump pressed this frame
                if (player.grounded) {
                    jumpSound = true;
                }
            }
            lastJumpPress = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        if (e.key === ' ' || e.key === 'Space') {
            lastJumpPress = false;
            jumpHeld = false;
        }
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
    player.invincible = false;
    player.invincibleTimer = 0;
    player.dashTimer = 0;
    player.doubleJumpTimer = 0;
    player.facingRight = true;
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
    // Update camera
    camera.follow(player);
    
    // Handle player movement - Mario style
    handleMarioInput();
    
    // Apply gravity with terminal velocity
    player.velY += GRAVITY;
    if (player.velY > MAX_FALL_SPEED) {
        player.velY = MAX_FALL_SPEED;
    }
    
    // Update position with collision checks
    updatePosition();
    
    // Check platform collisions
    checkPlatformCollisions();
    
    // Check enemy collisions
    checkEnemyCollisions();
    
    // Check collectibles
    checkCollectibles();
    
    // Check power-ups
    checkPowerUps();
    
    // Check blocks
    checkBlocks();
    
    // Check goal
    checkGoal();
    
    // Update timers
    updateTimers();
    
    // Update enemies
    updateEnemies();
    
    // Update power-ups movement
    updatePowerUps();
    
    // Check boundaries
    if (player.y > canvas.height + 50) {
        loseLife();
    }
    
    // Walk cycle animation
    if (Math.abs(player.velX) > 0.5 && player.grounded) {
        player.walkCycle += 0.1;
    } else {
        player.walkCycle = 0;
    }
}

function handleMarioInput() {
    // Left/Right movement with acceleration and friction
    let targetSpeed = 0;
    
    if (keys['a'] || keys['ArrowLeft']) {
        targetSpeed = -MOVE_SPEED;
        player.facingRight = false;
    } else if (keys['d'] || keys['ArrowRight']) {
        targetSpeed = MOVE_SPEED;
        player.facingRight = true;
    }
    
    // Apply acceleration/deceleration
    if (player.grounded) {
        // Ground movement with friction
        player.velX += (targetSpeed - player.velX) * 0.2;
        if (Math.abs(player.velX) < 0.1 && targetSpeed === 0) {
            player.velX = 0;
        }
    } else {
        // Air control (reduced)
        player.velX += (targetSpeed - player.velX) * AIR_CONTROL * 0.1;
    }
    
    // Jump - Mario style (variable jump height)
    if ((keys[' '] || keys['Space'])) {
        if (!jumpHeld && player.grounded) {
            player.velY = JUMP_FORCE;
            player.grounded = false;
            jumpHeld = true;
        }
    }
    
    // Variable jump height (release jump button to cut jump short)
    if (!(keys[' '] || keys['Space']) && player.velY < 0) {
        player.velY *= 0.5;
    }
    
    // Double jump
    if ((keys[' '] || keys['Space']) && !player.grounded && player.hasDoubleJump && player.doubleJumpTimer > 0 && !jumpHeld) {
        player.velY = JUMP_FORCE * 0.8;
        player.doubleJumpTimer = 0;
        jumpHeld = true;
    }
    
    // Dash (run faster)
    if ((keys['Shift'] || keys['ShiftLeft']) && player.hasDash && player.dashTimer <= 0) {
        player.velX = (player.facingRight ? MOVE_SPEED * 2 : -MOVE_SPEED * 2);
        player.dashTimer = DASH_DURATION;
    }
}

function updatePosition() {
    // Move horizontally with collision checks
    player.x += player.velX;
    
    // Move vertically with collision checks
    player.y += player.velY;
}

function checkPlatformCollisions() {
    let wasGrounded = player.grounded;
    player.grounded = false;
    
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Calculate overlap
            let overlapTop = (player.y + player.height) - platform.y;
            let overlapBottom = (platform.y + platform.height) - player.y;
            let overlapLeft = (player.x + player.width) - platform.x;
            let overlapRight = (platform.x + platform.width) - player.x;
            
            // Find smallest overlap
            let minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);
            
            // Resolve collision based on smallest overlap
            if (minOverlap === overlapTop && player.velY >= 0) {
                // Landing on top
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
            } else if (minOverlap === overlapBottom && player.velY <= 0) {
                // Hitting head
                player.y = platform.y + platform.height;
                player.velY = 0;
                
                // Hit question block from below
                if (platform.type === 'question' && !platform.hit) {
                    hitBlock(platform);
                }
            } else if (minOverlap === overlapLeft) {
                // Hitting left side
                player.x = platform.x - player.width;
                player.velX = 0;
            } else if (minOverlap === overlapRight) {
                // Hitting right side
                player.x = platform.x + platform.width;
                player.velX = 0;
            }
        }
    }
}

function hitBlock(block) {
    block.hit = true;
    block.color = '#B8860B'; // Darker gold
    
    // Spawn item from block
    if (block.contains === 'mushroom') {
        powerUps.push({
            x: block.x,
            y: block.y - 24,
            width: 24,
            height: 24,
            color: '#FF0000',
            type: 'mushroom',
            active: true,
            moving: true,
            velX: 2
        });
    } else if (block.contains === 'star') {
        powerUps.push({
            x: block.x,
            y: block.y - 24,
            width: 24,
            height: 24,
            color: '#FFFF00',
            type: 'star',
            active: true,
            moving: true,
            velX: 2
        });
    }
    
    score += 10;
    updateStats();
}

function checkEnemyCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        
        if (enemy.squished) continue;
        
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Check if player lands on enemy (Mario style)
            if (player.velY > 0 && player.y + player.height - player.velY <= enemy.y + 5) {
                // Squish enemy
                if (enemy.type === 'goomba') {
                    enemy.squished = true;
                    score += 100;
                    player.velY = JUMP_FORCE * 0.5; // Bounce
                    
                    // Remove after animation
                    setTimeout(() => {
                        let index = enemies.indexOf(enemy);
                        if (index > -1) enemies.splice(index, 1);
                    }, 200);
                } else if (enemy.type === 'koopa') {
                    enemy.shell = !enemy.shell;
                    enemy.walking = false;
                    enemy.velX = 0;
                    score += 100;
                    player.velY = JUMP_FORCE * 0.5;
                }
            } else if (player.invincible) {
                // Invincible kills enemies
                enemies.splice(i, 1);
                score += 100;
            } else if (!player.invincible) {
                // Player gets hurt
                if (powerUp === 'Mushroom') {
                    // Lose power-up but not life
                    powerUp = null;
                    player.hasDoubleJump = false;
                    player.hasShield = false;
                    player.invincible = true;
                    player.invincibleTimer = 120;
                } else {
                    loseLife();
                }
            }
            
            updateStats();
        }
    }
}

function checkCollectibles() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let item = collectibles[i];
        
        // Animate coin
        item.animation += 0.1;
        
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            if (item.type === 'coin') {
                score += item.value;
                coinSound = true;
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
        case 'mushroom':
            player.hasDoubleJump = true;
            player.doubleJumpTimer = DOUBLE_JUMP_DURATION;
            powerUp = 'Mushroom';
            player.height = 40; // Grow
            break;
        case 'star':
            player.invincible = true;
            player.invincibleTimer = 300;
            powerUp = 'Star';
            break;
        case 'shield':
            player.hasShield = true;
            powerUp = 'Shield';
            break;
    }
    updateStats();
}

function updateTimers() {
    if (player.doubleJumpTimer > 0) {
        player.doubleJumpTimer--;
        if (player.doubleJumpTimer <= 0) {
            player.hasDoubleJump = false;
            powerUp = null;
            player.height = 36; // Shrink back
        }
    }
    
    if (player.dashTimer > 0) {
        player.dashTimer--;
    }
    
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
            if (powerUp === 'Star') {
                powerUp = null;
            }
        }
    }
    
    // Blink when invincible
    if (player.invincible) {
        player.visible = Math.sin(Date.now() * 0.02) > 0;
    } else {
        player.visible = true;
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        if (enemy.walking && !enemy.squished) {
            enemy.x += enemy.velX;
            
            // Simple AI - turn around at edges
            // Check if at platform edge (simplified)
            if (enemy.x < 50 || enemy.x > 750) {
                enemy.velX *= -1;
            }
        }
        
        if (enemy.squished) {
            enemy.height *= 0.5;
            enemy.y += enemy.height;
        }
    }
}

function updatePowerUps() {
    for (let item of powerUps) {
        if (item.moving) {
            item.x += item.velX;
            
            // Bounce off walls
            if (item.x < 0 || item.x + item.width > 800) {
                item.velX *= -1;
            }
            
            // Simple gravity for power-ups
            item.y += 1;
            
            // Floor collision
            if (item.y > 350) {
                item.y = 350;
            }
        }
        
        if (item.type === 'star') {
            item.animation += 0.1;
        }
    }
}

function checkBlocks() {
    for (let i = blocks.length - 1; i >= 0; i--) {
        let block = blocks[i];
        
        // Check if player hits from below
        if (!block.hit &&
            player.x < block.x + block.width &&
            player.x + player.width > block.x &&
            player.y < block.y + block.height &&
            player.y + player.height > block.y &&
            player.velY < 0) {
            
            hitBlock(block);
            blocks.splice(i, 1);
        }
    }
}

function checkGoal() {
    if (player.x > goal.x - 30) {
        // Level complete
        currentLevel++;
        score += 1000;
        
        if (currentLevel <= 4) {
            loadNextLevel();
        } else {
            gameComplete();
        }
        
        updateStats();
    }
}

function loadNextLevel() {
    // Reset player
    resetPlayer();
    
    // Different level configurations based on current level
    if (currentLevel === 2) {
        // Underground level
        platforms = [
            { x: 0, y: 360, width: 800, height: 40, color: '#5D3A1A', type: 'ground' },
            { x: 100, y: 300, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 200, y: 260, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 300, y: 220, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 400, y: 180, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 500, y: 220, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 600, y: 260, width: 60, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 700, y: 300, width: 60, height: 20, color: '#B85E0C', type: 'brick' }
        ];
        
        enemies = [
            { x: 150, y: 340, width: 24, height: 24, velX: 1, color: '#8B4513', type: 'goomba', walking: true, squished: false },
            { x: 350, y: 340, width: 24, height: 24, velX: 1.2, color: '#8B4513', type: 'goomba', walking: true, squished: false },
            { x: 550, y: 340, width: 24, height: 24, velX: 1.5, color: '#8B4513', type: 'goomba', walking: true, squished: false }
        ];
        
        collectibles = [];
        for (let i = 0; i < 20; i++) {
            collectibles.push({
                x: 120 + i * 30,
                y: 340 - Math.sin(i) * 20,
                width: 16,
                height: 16,
                color: '#FFD700',
                type: 'coin',
                value: 10,
                animation: 0
            });
        }
    } else if (currentLevel === 3) {
        // Sky level
        platforms = [
            { x: 0, y: 380, width: 800, height: 20, color: '#5D3A1A', type: 'ground' },
            { x: 150, y: 300, width: 80, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 300, y: 250, width: 80, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 450, y: 200, width: 80, height: 20, color: '#B85E0C', type: 'brick' },
            { x: 600, y: 150, width: 80, height: 20, color: '#B85E0C', type: 'brick' }
        ];
        
        enemies = [
            { x: 180, y: 280, width: 24, height: 24, velX: 1.5, color: '#FF4444', type: 'koopa', walking: true, shell: false },
            { x: 480, y: 180, width: 24, height: 24, velX: 2, color: '#FF4444', type: 'koopa', walking: true, shell: false }
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
        player.invincible = true;
        player.invincibleTimer = 120;
    }
}

function gameOver() {
    gameRunning = false;
    alert(`Game Over! Final Score: ${score}`);
    startGame();
}

function gameComplete() {
    gameRunning = false;
    alert(`Congratulations! You saved the princess! Final Score: ${score}`);
}

function draw() {
    // Clear canvas with camera offset
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, 0);
    
    // Draw background based on level
    drawMarioBackground();
    
    // Draw platforms
    for (let platform of platforms) {
        drawPlatform(platform);
    }
    
    // Draw blocks
    for (let block of blocks) {
        drawBlock(block);
    }
    
    // Draw collectibles
    for (let item of collectibles) {
        drawCoin(item);
    }
    
    // Draw power-ups
    for (let item of powerUps) {
        drawPowerUp(item);
    }
    
    // Draw enemies
    for (let enemy of enemies) {
        drawEnemy(enemy);
    }
    
    // Draw goal (flag pole)
    drawGoal();
    
    // Draw player if visible
    if (player.visible !== false) {
        drawMarioPlayer();
    }
    
    ctx.restore();
    
    // Draw UI elements (not affected by camera)
    drawUI();
}

function drawMarioBackground() {
    // Sky gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    if (currentLevel === 1) {
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#98D8C8');
    } else if (currentLevel === 2) {
        gradient.addColorStop(0, '#2A2A2A'); // Dark underground
        gradient.addColorStop(1, '#1A1A1A');
    } else if (currentLevel === 3) {
        gradient.addColorStop(0, '#87CEEB'); // Sky with clouds
        gradient.addColorStop(1, '#B0E0E6');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(camera.x, 0, camera.x + camera.width, canvas.height);
    
    // Draw clouds
    if (currentLevel !== 2) {
        drawClouds();
    }
    
    // Draw hills in background
    drawHills();
}

function drawHills() {
    ctx.fillStyle = '#7CB371';
    ctx.beginPath();
    ctx.arc(camera.x + 200, 350, 80, 0, Math.PI, true);
    ctx.fill();
    
    ctx.fillStyle = '#6B8E23';
    ctx.beginPath();
    ctx.arc(camera.x + 500, 350, 100, 0, Math.PI, true);
    ctx.fill();
}

function drawPlatform(platform) {
    if (platform.x + platform.width < camera.x || platform.x > camera.x + camera.width) {
        return; // Skip if outside camera view
    }
    
    // Draw main platform
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add details based on type
    if (platform.type === 'brick') {
        // Brick pattern
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Brick lines
        ctx.beginPath();
        ctx.moveTo(platform.x, platform.y + platform.height/2);
        ctx.lineTo(platform.x + platform.width, platform.y + platform.height/2);
        ctx.stroke();
    } else if (platform.type === 'pipe') {
        // Pipe highlight
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(platform.x + 5, platform.y - 10, platform.width - 10, 10);
        
        // Pipe rim
        ctx.fillStyle = '#006400';
        ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
    } else if (platform.type === 'ground') {
        // Grass top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    }
}

function drawBlock(block) {
    if (block.x + block.width < camera.x || block.x > camera.x + camera.width) {
        return;
    }
    
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    
    // Question mark
    if (block.type === 'question' && !block.hit) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('?', block.x + 10, block.y + 30);
    }
    
    // Outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
}

function drawCoin(coin) {
    if (coin.x + coin.width < camera.x || coin.x > camera.x + camera.width) {
        return;
    }
    
    ctx.save();
    ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2 + Math.sin(coin.animation) * 3);
    
    // Coin
    ctx.fillStyle = coin.color;
    ctx.beginPath();
    ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawPowerUp(powerUp) {
    if (powerUp.x + powerUp.width < camera.x || powerUp.x > camera.x + camera.width) {
        return;
    }
    
    if (powerUp.type === 'mushroom') {
        // Mushroom cap
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2 - 2, powerUp.width/2, 0, Math.PI, true);
        ctx.fill();
        
        // Mushroom stem
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(powerUp.x + powerUp.width/2 - 3, powerUp.y + powerUp.height/2, 6, powerUp.height/2);
        
        // Spots
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2 - 4, powerUp.y + powerUp.height/2 - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2 + 4, powerUp.y + powerUp.height/2 - 4, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (powerUp.type === 'star') {
        // Animated star
        ctx.save();
        ctx.translate(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
        ctx.rotate(powerUp.animation);
        
        ctx.fillStyle = powerUp.color;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * 72) * Math.PI / 180);
            ctx.fillRect(0, -powerUp.height/2, 4, powerUp.height);
            ctx.restore();
        }
        
        ctx.restore();
    }
}

function drawEnemy(enemy) {
    if (enemy.x + enemy.width < camera.x || enemy.x > camera.x + camera.width) {
        return;
    }
    
    if (enemy.type === 'goomba') {
        if (!enemy.squished) {
            // Body
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 - 4, enemy.y + enemy.height/2 - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 4, enemy.y + enemy.height/2 - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 - 4 + (enemy.velX * 0.5), enemy.y + enemy.height/2 - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 4 + (enemy.velX * 0.5), enemy.y + enemy.height/2 - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Feet
            ctx.fillStyle = '#5D3A1A';
            ctx.fillRect(enemy.x + 4, enemy.y + enemy.height - 4, 5, 4);
            ctx.fillRect(enemy.x + 14, enemy.y + enemy.height - 4, 5, 4);
        } else {
            // Squished goomba
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y + enemy.height/2, enemy.width, enemy.height/2);
        }
    } else if (enemy.type === 'koopa') {
        // Shell or walking
        ctx.fillStyle = enemy.color;
        if (enemy.shell) {
            // Shell (spinning)
            ctx.save();
            ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            ctx.rotate(Date.now() * 0.01);
            ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
            ctx.restore();
        } else {
            // Body
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Head
            ctx.fillRect(enemy.x + 8, enemy.y - 8, 8, 8);
        }
    }
}

function drawGoal() {
    // Flag pole
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    
    // Flag
    if (player.x < goal.x - 50) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(goal.x + goal.width, goal.y + 20);
        ctx.lineTo(goal.x + goal.width + 40, goal.y + 40);
        ctx.lineTo(goal.x + goal.width, goal.y + 60);
        ctx.fill();
    }
    
    // Flag ball
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(goal.x + goal.width/2, goal.y - 5, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawMarioPlayer() {
    if (player.x + player.width < camera.x || player.x > camera.x + camera.width) {
        return;
    }
    
    ctx.save();
    
    // Flash if invincible
    if (player.invincible && Math.sin(Date.now() * 0.01) < 0) {
        ctx.restore();
        return;
    }
    
    // Draw based on facing direction
    if (!player.facingRight) {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
    } else {
        ctx.translate(player.x, player.y);
    }
    
    // Hat
    ctx.fillStyle = player.hatColor;
    ctx.fillRect(2, -8, player.width - 4, 10);
    
    // Hat brim
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(0, 0, player.width, 4);
    
    // Overall straps
    ctx.fillStyle = '#0000CD';
    ctx.fillRect(4, 8, 6, player.height - 8);
    ctx.fillRect(player.width - 10, 8, 6, player.height - 8);
    
    // Shirt
    ctx.fillStyle = player.color;
    ctx.fillRect(4, 4, player.width - 8, player.height - 8);
    
    // Mustache
    ctx.fillStyle = player.mustacheColor;
    ctx.fillRect(8, 16, 4, 2);
    ctx.fillRect(player.width - 12, 16, 4, 2);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, 10, 4, 4);
    ctx.fillRect(player.width - 12, 10, 4, 4);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 11, 2, 2);
    ctx.fillRect(player.width - 11, 11, 2, 2);
    
    // Walk animation
    if (Math.abs(player.velX) > 0.5 && player.grounded) {
        // Moving legs
        ctx.fillStyle = '#8B4513';
        if (Math.sin(player.walkCycle) > 0) {
            ctx.fillRect(8, player.height - 8, 4, 8);
            ctx.fillRect(player.width - 12, player.height - 12, 4, 8);
        } else {
            ctx.fillRect(8, player.height - 12, 4, 8);
            ctx.fillRect(player.width - 12, player.height - 8, 4, 8);
        }
    } else {
        // Standing legs
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, player.height - 8, 4, 8);
        ctx.fillRect(player.width - 12, player.height - 8, 4, 8);
    }
    
    ctx.restore();
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(camera.x + 150, 80, 30, 0, Math.PI * 2);
    ctx.arc(camera.x + 180, 70, 25, 0, Math.PI * 2);
    ctx.arc(camera.x + 210, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 2
    ctx.beginPath();
    ctx.arc(camera.x + 450, 120, 35, 0, Math.PI * 2);
    ctx.arc(camera.x + 485, 110, 30, 0, Math.PI * 2);
    ctx.arc(camera.x + 520, 120, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 3
    ctx.beginPath();
    ctx.arc(camera.x + 650, 60, 25, 0, Math.PI * 2);
    ctx.arc(camera.x + 675, 50, 20, 0, Math.PI * 2);
    ctx.arc(camera.x + 700, 60, 25, 0, Math.PI * 2);
    ctx.fill();
}

function drawUI() {
    // Score and lives UI (fixed position)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`MARIO ${score}`, 20, 40);
    ctx.fillText(`×${lives}`, 150, 40);
    
    ctx.restore();
}
