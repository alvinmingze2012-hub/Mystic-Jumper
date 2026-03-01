// item.js - Collectible items and power-ups

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 20;
        this.height = 20;
        this.active = true;
        this.collected = false;
        
        // Animation
        this.animation = 0;
        this.bounce = 0;
        
        // Movement
        this.velX = 2;
        this.velY = 0;
        this.gravity = true;
    }
    
    update() {
        if (!this.active) return;
        
        // Animate
        this.animation += 0.1;
        this.bounce = Math.sin(this.animation) * 3;
        
        // Apply gravity if needed
        if (this.gravity) {
            this.velY += GameConstants.GRAVITY;
            this.y += this.velY;
        }
        
        // Move horizontally for mushrooms
        if (this.type === PowerUpType.MUSHROOM) {
            this.x += this.velX;
        }
        
        // Star animation
        if (this.type === PowerUpType.STAR) {
            this.animation += 0.2;
        }
    }
    
    // Item collected
    collect(player) {
        if (this.collected) return;
        
        this.collected = true;
        this.active = false;
        
        switch(this.type) {
            case 'coin':
                player.addCoin();
                AudioManager.playSound('coin');
                break;
                
            case PowerUpType.MUSHROOM:
                player.applyPowerUp(PowerUpType.MUSHROOM);
                AudioManager.playSound('powerup');
                break;
                
            case PowerUpType.STAR:
                player.applyPowerUp(PowerUpType.STAR);
                AudioManager.playSound('star');
                break;
                
            case PowerUpType.FLOWER:
                player.applyPowerUp(PowerUpType.FLOWER);
                break;
        }
    }
}

class Coin extends Item {
    constructor(x, y) {
        super(x, y, 'coin');
        this.width = 16;
        this.height = 16;
        this.gravity = false;
    }
    
    update() {
        super.update();
        // Coins spin and float
        this.y = this.y + Math.sin(this.animation) * 2;
    }
}

class Mushroom extends Item {
    constructor(x, y) {
        super(x, y, PowerUpType.MUSHROOM);
        this.color = '#FF0000';
    }
}

class Star extends Item {
    constructor(x, y) {
        super(x, y, PowerUpType.STAR);
        this.color = '#FFFF00';
        this.gravity = false;
    }
    
    update() {
        super.update();
        // Stars bounce
        this.velY = Math.sin(this.animation) * 3;
        this.y += this.velY;
    }
}

class Flower extends Item {
    constructor(x, y) {
        super(x, y, PowerUpType.FLOWER);
        this.color = '#FF69B4';
        this.gravity = false;
        this.height = 24;
    }
}
