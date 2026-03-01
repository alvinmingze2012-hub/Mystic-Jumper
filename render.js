// renderer.js - Game rendering system

const Renderer = {
    ctx: null,
    camera: { x: 0, y: 0 },
    
    init(canvas) {
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    },
    
    // Set camera position
    setCamera(player) {
        // Center camera on player
        let targetX = player.x - GameConstants.CANVAS_WIDTH / 2 + player.width / 2;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        
        // Clamp camera
        let level = LevelManager.currentLevel;
        if (level) {
            this.camera.x = Math.max(0, Math.min(this.camera.x, level.width - GameConstants.CANVAS_WIDTH));
        }
    },
    
    // Render everything
    render(level, player) {
        this.clearScreen();
        this.saveContext();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, 0);
        
        // Draw in order (background to foreground)
        this.drawBackground();
        this.drawPlatforms(level.platforms);
        this.drawPipes(level.pipes);
        this.drawItems(level.items);
        this.drawEnemies(level.enemies);
        this.drawGoal(level.goal);
        this.drawPlayer(player);
        
        this.restoreContext();
        
        // Draw UI (not affected by camera)
        this.drawUI(player);
    },
    
    clearScreen() {
        this.ctx.clearRect(this.camera.x, 0, GameConstants.CANVAS_WIDTH, GameConstants.CANVAS_HEIGHT);
    },
    
    saveContext() {
        this.ctx.save();
    },
    
    restoreContext() {
        this.ctx.restore();
    },
    
    drawBackground() {
        // Sky gradient
        let gradient = this.ctx.createLinearGradient(0, 0, 0, GameConstants.CANVAS_HEIGHT);
        gradient.addColorStop(0, GameConstants.COLORS.SKY_BLUE);
        gradient.addColorStop(1, '#98D8C8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.camera.x, 0, GameConstants.CANVAS_WIDTH, GameConstants.CANVAS_HEIGHT);
        
        // Draw clouds
        this.drawClouds();
    },
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Cloud positions relative to camera
        let cloudX = this.camera.x + 100;
        this.drawCloud(cloudX, 80, 30);
        this.drawCloud(cloudX + 300, 120, 40);
        this.drawCloud(cloudX + 600, 60, 25);
    },
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    drawPlatforms(platforms) {
        platforms.forEach(platform => {
            if (platform.x + platform.width < this.camera.x || 
                platform.x > this.camera.x + GameConstants.CANVAS_WIDTH) {
                return; // Skip if outside camera
            }
            
            this.drawPlatform(platform);
        });
    },
    
    drawPlatform(platform) {
        // Main block
        this.ctx.fillStyle = platform.color;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Details based on type
        if (platform.type === BlockType.BRICK) {
            this.drawBrickDetails(platform);
        } else if (platform.type === BlockType.QUESTION && !platform.hit) {
            this.drawQuestionBlock(platform);
        } else if (platform.type === BlockType.GROUND) {
            this.drawGroundDetails(platform);
        }
    },
    
    drawBrickDetails(platform) {
        this.ctx.strokeStyle = '#5D3A1A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Brick lines
        this.ctx.beginPath();
        this.ctx.moveTo(platform.x, platform.y + platform.height/2);
        this.ctx.lineTo(platform.x + platform.width, platform.y + platform.height/2);
        this.ctx.stroke();
    },
    
    drawQuestionBlock(platform) {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Question mark
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px "Press Start 2P"';
        this.ctx.fillText('?', platform.x + 10, platform.y + 30);
    },
    
    drawGroundDetails(platform) {
        // Grass top
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(platform.x, platform.y, platform.width, 5);
    },
    
    drawPipes(pipes) {
        pipes.forEach(pipe => {
            if (pipe.x + pipe.width < this.camera.x || 
                pipe.x > this.camera.x + GameConstants.CANVAS_WIDTH) {
                return;
            }
            
            this.drawPipe(pipe);
        });
    },
    
    drawPipe(pipe) {
        // Pipe body
        this.ctx.fillStyle = GameConstants.COLORS.PIPE_GREEN;
        this.ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        // Pipe rim
        this.ctx.fillStyle = '#006400';
        this.ctx.fillRect(pipe.x - 5, pipe.y - 10, pipe.width + 10, 10);
        
        // Pipe highlight
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(pipe.x + 5, pipe.y - 5, pipe.width - 10, 5);
    },
    
    drawItems(items) {
        items.forEach(item => {
            if (item.x + item.width < this.camera.x || 
                item.x > this.camera.x + GameConstants.CANVAS_WIDTH) {
                return;
            }
            
            this.drawItem(item);
        });
    },
    
    drawItem(item) {
        if (item.type === 'coin') {
            this.drawCoin(item);
        } else if (item.type === PowerUpType.MUSHROOM) {
            this.drawMushroom(item);
        } else if (item.type === PowerUpType.STAR) {
            this.drawStar(item);
        } else if (item.type === PowerUpType.FLOWER) {
            this.drawFlower(item);
        }
    },
    
    drawCoin(coin) {
        this.ctx.save();
        this.ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
        this.ctx.rotate(coin.animation * 0.1);
        
        // Coin
        this.ctx.fillStyle = GameConstants.COLORS.COIN_YELLOW;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shine
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(-3, -3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    drawMushroom(mushroom) {
        // Cap
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(mushroom.x + mushroom.width/2, mushroom.y + mushroom.height/2 - 2, 
                    mushroom.width/2, 0, Math.PI, true);
        this.ctx.fill();
        
        // Stem
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(mushroom.x + mushroom.width/2 - 3, mushroom.y + mushroom.height/2, 
                         6, mushroom.height/2);
        
        // Spots
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(mushroom.x + 5, mushroom.y + 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(mushroom.x + 15, mushroom.y + 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    drawStar(star) {
        this.ctx.save();
        this.ctx.translate(star.x + star.width/2, star.y + star.height/2);
        this.ctx.rotate(star.animation);
        
        this.ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.rotate((i * 72) * Math.PI / 180);
            this.ctx.fillRect(0, -star.height/2, 4, star.height);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    },
    
    drawFlower(flower) {
        // Stem
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(flower.x + 8, flower.y, 4, 20);
        
        // Flower head
        this.ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.arc(flower.x + 10 + Math.cos(i) * 6, 
                        flower.y - 5 + Math.sin(i) * 6, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Center
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(flower.x + 10, flower.y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            if (enemy.x + enemy.width < this.camera.x || 
                enemy.x > this.camera.x + GameConstants.CANVAS_WIDTH) {
                return;
            }
            
            this.drawEnemy(enemy);
        });
    },
    
    drawEnemy(enemy) {
        if (enemy.type === EnemyType.GOOMBA) {
            this.drawGoomba(enemy);
        } else if (enemy.type === EnemyType.KOOPA) {
            this.drawKoopa(enemy);
        } else if (enemy.type === EnemyType.PIRANHA) {
            this.drawPiranha(enemy);
        }
    },
    
    drawGoomba(goomba) {
        if (goomba.squished) {
            // Squished
            this.ctx.fillStyle = GameConstants.COLORS.GOOMBA_BROWN;
            this.ctx.fillRect(goomba.x, goomba.y + 6, goomba.width, 6);
        } else {
            // Body
            this.ctx.fillStyle = GameConstants.COLORS.GOOMBA_BROWN;
            this.ctx.beginPath();
            this.ctx.ellipse(goomba.x + goomba.width/2, goomba.y + goomba.height/2,
                           goomba.width/2, goomba.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(goomba.x + 6, goomba.y + 6, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(goomba.x + 16, goomba.y + 6, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Feet
            this.ctx.fillStyle = '#5D3A1A';
            this.ctx.fillRect(goomba.x + 4, goomba.y + goomba.height - 2, 4, 2);
            this.ctx.fillRect(goomba.x + 14, goomba.y + goomba.height - 2, 4, 2);
        }
    },
    
    drawKoopa(koopa) {
        if (koopa.shell) {
            // Shell
            this.ctx.fillStyle = GameConstants.COLORS.KOOPA_RED;
            this.ctx.fillRect(koopa.x, koopa.y, koopa.width, koopa.height);
            
            // Shell pattern
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(koopa.x + koopa.width/2, koopa.y + koopa.height/2, 6, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Body
            this.ctx.fillStyle = GameConstants.COLORS.KOOPA_RED;
            this.ctx.fillRect(koopa.x, koopa.y, koopa.width, koopa.height);
            
            // Head
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(koopa.x + 6, koopa.y - 6, 12, 8);
            
            // Eyes
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(koopa.x + 8, koopa.y - 4, 2, 2);
            this.ctx.fillRect(koopa.x + 14, koopa.y - 4, 2, 2);
        }
    },
    
    drawPiranha(piranha) {
        // Head
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(piranha.x, piranha.y, piranha.width, piranha.height);
        
        // Teeth
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(piranha.x + 4, piranha.y + 4, 2, 2);
        this.ctx.fillRect(piranha.x + 12, piranha.y + 4, 2, 2);
    },
    
    drawGoal(goal) {
        // Flag pole
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
        
        // Flag
        if (!LevelManager.currentLevel.complete) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.moveTo(goal.x + goal.width, goal.y + 20);
            this.ctx.lineTo(goal.x + goal.width + 40, goal.y + 40);
            this.ctx.lineTo(goal.x + goal.width, goal.y + 60);
            this.ctx.fill();
        }
        
        // Flag ball
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(goal.x + goal.width/2, goal.y - 5, 8, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    drawPlayer(player) {
        if (!player.visible) return;
        
        this.ctx.save();
        
        // Flip if facing left
        if (!player.facingRight) {
            this.ctx.translate(player.x + player.width, player.y);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(player.x, player.y);
        }
        
        if (player.isBig) {
            this.drawBigMario(player);
        } else {
            this.drawSmallMario(player);
        }
        
        this.ctx.restore();
    },
    
    drawSmallMario(player) {
        // Hat
        this.ctx.fillStyle = '#C41E1E';
        this.ctx.fillRect(4, -6, 20, 8);
        
        // Hat brim
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(2, 2, 24, 3);
        
        // Overalls
        this.ctx.fillStyle = '#0000CD';
        this.ctx.fillRect(4, 10, 6, 20);
        this.ctx.fillRect(18, 10, 6, 20);
        
        // Shirt
        this.ctx.fillStyle = '#E63E3E';
        this.ctx.fillRect(4, 4, 20, 24);
        
        // Mustache
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(8, 14, 4, 2);
        this.ctx.fillRect(16, 14, 4, 2);
        
        // Eyes
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(8, 8, 4, 4);
        this.ctx.fillRect(16, 8, 4, 4);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(9, 9, 2, 2);
        this.ctx.fillRect(17, 9, 2, 2);
        
        // Legs with walk animation
        this.ctx.fillStyle = '#8B4513';
        if (Math.abs(player.velX) > 0.5 && player.grounded) {
            if (Math.sin(player.walkCycle) > 0) {
                this.ctx.fillRect(8, 28, 4, 8);
                this.ctx.fillRect(16, 32, 4, 4);
            } else {
                this.ctx.fillRect(8, 32, 4, 4);
                this.ctx.fillRect(16, 28, 4, 8);
            }
        } else {
            this.ctx.fillRect(8, 32, 4, 4);
            this.ctx.fillRect(16, 32, 4, 4);
        }
    },
    
    drawBigMario(player) {
        // Hat
        this.ctx.fillStyle = '#C41E1E';
        this.ctx.fillRect(4, -8, 20, 10);
        
        // Hat brim
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(2, 2, 24, 4);
        
        // Overalls
        this.ctx.fillStyle = '#0000CD';
        this.ctx.fillRect(4, 12, 6, 28);
        this.ctx.fillRect(18, 12, 6, 28);
        
        // Shirt
        this.ctx.fillStyle = '#E63E3E';
        this.ctx.fillRect(4, 4, 20, 36);
        
        // Mustache
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(8, 18, 4, 2);
        this.ctx.fillRect(16, 18, 4, 2);
        
        // Eyes
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(8, 10, 4, 4);
        this.ctx.fillRect(16, 10, 4, 4);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(9, 11, 2, 2);
        this.ctx.fillRect(17, 11, 2, 2);
        
        // Legs
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(8, 40, 4, 8);
        this.ctx.fillRect(16, 40, 4, 8);
    },
    
    drawUI(player) {
        // Reset transform for UI
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Power-up indicator
        if (player.hasStar) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.fillRect(10, 50, 200, 30);
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.font = '12px "Press Start 2P"';
            this.ctx.fillText('STAR POWER!', 20, 70);
        }
        
        // Lives display
        for (let i = 0; i < player.lives; i++) {
            this.drawSmallMarioUI(700 + i * 30, 20);
        }
    },
    
    drawSmallMarioUI(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(0.5, 0.5);
        
        // Mini Mario for lives display
        this.ctx.fillStyle = '#E63E3E';
        this.ctx.fillRect(0, 0, 14, 18);
        this.ctx.fillStyle = '#0000CD';
        this.ctx.fillRect(2, 4, 2, 10);
        this.ctx.fillRect(10, 4, 2, 10);
        
        this.ctx.restore();
    }
};
