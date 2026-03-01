// collision.js - Collision detection and response

const CollisionDetector = {
    // Rectangle collision
    rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (x1 < x2 + w2 &&
                x1 + w1 > x2 &&
                y1 < y2 + h2 &&
                y1 + h1 > y2);
    },
    
    // Platform collision response
    checkPlatformCollisions(player, platforms) {
        let wasGrounded = player.grounded;
        player.grounded = false;
        
        for (let platform of platforms) {
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                platform.x, platform.y, platform.width, platform.height
            )) {
                this.resolvePlatformCollision(player, platform);
            }
        }
        
        return player.grounded;
    },
    
    // Resolve platform collision
    resolvePlatformCollision(player, platform) {
        // Calculate overlaps
        let overlapTop = (player.y + player.height) - platform.y;
        let overlapBottom = (platform.y + platform.height) - player.y;
        let overlapLeft = (player.x + player.width) - platform.x;
        let overlapRight = (platform.x + platform.width) - player.x;
        
        // Find smallest overlap
        let overlaps = [
            { side: 'top', value: overlapTop },
            { side: 'bottom', value: overlapBottom },
            { side: 'left', value: overlapLeft },
            { side: 'right', value: overlapRight }
        ];
        
        let minOverlap = overlaps.reduce((min, curr) => 
            curr.value < min.value ? curr : min
        );
        
        // Resolve based on smallest overlap
        switch(minOverlap.side) {
            case 'top':
                if (player.velY >= 0) {
                    player.y = platform.y - player.height;
                    player.velY = 0;
                    player.grounded = true;
                }
                break;
                
            case 'bottom':
                if (player.velY <= 0) {
                    player.y = platform.y + platform.height;
                    player.velY = 0;
                    
                    // Hit block from below
                    if (platform.hitFromBelow) {
                        let item = platform.hitFromBelow(player);
                        if (item) {
                            if (item === 'break') {
                                // Remove brick
                                platforms.splice(platforms.indexOf(platform), 1);
                            } else if (item) {
                                // Spawn item
                                LevelManager.currentLevel.items.push(
                                    new Item(item.x, item.y, item.type)
                                );
                            }
                        }
                    }
                }
                break;
                
            case 'left':
                if (player.velX > 0) {
                    player.x = platform.x - player.width;
                    player.velX = 0;
                }
                break;
                
            case 'right':
                if (player.velX < 0) {
                    player.x = platform.x + platform.width;
                    player.velX = 0;
                }
                break;
        }
    },
    
    // Check enemy collisions
    checkEnemyCollisions(player, enemies) {
        for (let enemy of enemies) {
            if (!enemy.active || enemy.squished) continue;
            
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                enemy.x, enemy.y, enemy.width, enemy.height
            )) {
                // Check if player is landing on enemy
                if (player.velY > 0 && player.y + player.height - player.velY <= enemy.y + 5) {
                    // Stomp enemy
                    enemy.stomp(player);
                } else if (player.hasStar) {
                    // Star kills enemy
                    enemy.active = false;
                    player.addScore(GameConstants.ENEMY_SCORE * 2);
                } else {
                    // Player gets hurt
                    player.damage();
                }
            }
        }
    },
    
    // Check item collisions
    checkItemCollisions(player, items) {
        for (let item of items) {
            if (!item.active || item.collected) continue;
            
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                item.x, item.y, item.width, item.height
            )) {
                item.collect(player);
            }
        }
    },
    
    // Check pipe entrance
    checkPipeEntrance(player, pipes) {
        for (let pipe of pipes) {
            if (pipe.canEnter(player, Direction.DOWN)) {
                return pipe;
            }
        }
        return null;
    }
};
