// player.js - Player character class with Mario physics

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = GameConstants.PLAYER_WIDTH;
        this.height = GameConstants.PLAYER_HEIGHT;
        this.velX = 0;
        this.velY = 0;
        
        // State flags
        this.grounded = false;
        this.facingRight = true;
        this.isBig = false;
        this.hasStar = false;
        this.invincible = false;
        this.dead = false;
        
        // Timers
        this.invincibleTimer = 0;
        this.starTimer = 0;
        this.mushroomTimer = 0;
        
        // Animation
        this.walkCycle = 0;
        this.visible = true;
        this.deathAnimation = 0;
        
        // Stats
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        
        // Jump physics
        this.jumpPressed = false;
        this.jumpHeld = false;
        this.canJump = true;
        this.jumpTime = 0;
    }
    
    // Reset player to initial state
    reset() {
        this.x = 100;
        this.y = 300;
        this.velX = 0;
        this.velY = 0;
        this.isBig = false;
        this.hasStar = false;
        this.invincible = false;
        this.height = GameConstants.PLAYER_HEIGHT;
        this.dead = false;
    }
    
    // Handle jumping with variable height
    jump() {
        if (this.grounded && !this.dead) {
            this.velY = GameConstants.JUMP_FORCE;
            this.grounded = false;
            this.jumpHeld = true;
            this.jumpTime = 10; // Frames to hold jump
            AudioManager.playSound('jump');
        }
    }
    
    // Handle jump release (for variable height)
    releaseJump() {
        if (this.velY < -2) {
            this.velY *= 0.5;
        }
        this.jumpHeld = false;
    }
    
    // Apply power-up
    applyPowerUp(type) {
        switch(type) {
            case PowerUpType.MUSHROOM:
                this.isBig = true;
                this.mushroomTimer = GameConstants.MUSHROOM_DURATION;
                this.height = GameConstants.PLAYER_HEIGHT_BIG;
                AudioManager.playSound('powerup');
                break;
                
            case PowerUpType.STAR:
                this.hasStar = true;
                this.starTimer = GameConstants.STAR_DURATION;
                AudioManager.playSound('star');
                break;
                
            case PowerUpType.FLOWER:
                // Fire flower ability
                this.hasFlower = true;
                break;
        }
    }
    
    // Take damage
    damage() {
        if (this.invincible || this.dead) return;
        
        if (this.hasStar) {
            // Star kills enemies, doesn't hurt player
            return;
        }
        
        if (this.isBig) {
            // Shrink
            this.isBig = false;
            this.height = GameConstants.PLAYER_HEIGHT;
            this.invincible = true;
            this.invincibleTimer = GameConstants.INVINCIBILITY_DURATION;
            AudioManager.playSound('pipe');
        } else {
            // Die
            this.die();
        }
    }
    
    // Player death
    die() {
        this.dead = true;
        this.velY = GameConstants.JUMP_FORCE * 1.5;
        this.velX = 0;
        this.lives--;
        AudioManager.playSound('death');
        
        if (this.lives <= 0) {
            GameManager.gameOver();
        }
    }
    
    // Update player state
    update() {
        if (this.dead) {
            this.deathAnimation++;
            this.y += this.velY;
            if (this.y > GameConstants.CANVAS_HEIGHT + 100) {
                // Respawn after death
                this.reset();
            }
            return;
        }
        
        // Apply gravity with terminal velocity
        this.velY += GameConstants.GRAVITY;
        if (this.velY > GameConstants.MAX_FALL_SPEED) {
            this.velY = GameConstants.MAX_FALL_SPEED;
        }
        
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Update timers
        this.updateTimers();
        
        // Update walk cycle
        if (Math.abs(this.velX) > 0.5 && this.grounded) {
            this.walkCycle += 0.15;
        } else {
            this.walkCycle = 0;
        }
    }
    
    // Update all timers
    updateTimers() {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        if (this.mushroomTimer > 0) {
            this.mushroomTimer--;
            if (this.mushroomTimer <= 0) {
                this.isBig = false;
                this.height = GameConstants.PLAYER_HEIGHT;
            }
        }
        
        if (this.starTimer > 0) {
            this.starTimer--;
            if (this.starTimer <= 0) {
                this.hasStar = false;
            }
        }
        
        // Blink when invincible
        if (this.invincible || this.hasStar) {
            this.visible = Math.sin(Date.now() * 0.02) > 0;
        } else {
            this.visible = true;
        }
    }
    
    // Add to score
    addScore(points) {
        this.score += points;
        if (this.score > 999999) this.score = 999999;
        UIManager.updateScore(this.score);
    }
    
    // Add coin
    addCoin() {
        this.coins++;
        if (this.coins >= 100) {
            this.coins = 0;
            this.lives++;
        }
        this.addScore(GameConstants.COIN_SCORE);
        UIManager.updateCoins(this.coins);
    }
}
