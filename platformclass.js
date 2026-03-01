// platform.js - Platform and block classes

class Platform {
    constructor(x, y, width, height, type = BlockType.GROUND) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = this.getColor();
        this.hit = false;
        this.breakable = (type === BlockType.BRICK);
        this.contains = null;
    }
    
    getColor() {
        switch(this.type) {
            case BlockType.GROUND:
                return GameConstants.COLORS.GROUND_BROWN;
            case BlockType.BRICK:
                return GameConstants.COLORS.BRICK_ORANGE;
            case BlockType.QUESTION:
                return GameConstants.COLORS.QUESTION_GOLD;
            case BlockType.PIPE:
                return GameConstants.COLORS.PIPE_GREEN;
            default:
                return '#8B4513';
        }
    }
    
    // Hit from below
    hitFromBelow(player) {
        if (this.hit) return null;
        
        if (this.type === BlockType.QUESTION) {
            this.hit = true;
            this.color = '#B8860B'; // Darker gold
            
            // Spawn item
            return this.spawnItem();
        } else if (this.type === BlockType.BRICK && player.isBig) {
            // Break brick if player is big
            return 'break';
        }
        
        return null;
    }
    
    // Spawn item from question block
    spawnItem() {
        // Random item or coin
        if (Math.random() < 0.7) {
            return {
                type: 'coin',
                x: this.x,
                y: this.y - 20
            };
        } else {
            return {
                type: 'mushroom',
                x: this.x,
                y: this.y - 24
            };
        }
    }
}

class MovingPlatform extends Platform {
    constructor(x, y, width, height, moveRange, speed) {
        super(x, y, width, height, 'moving');
        this.startX = x;
        this.moveRange = moveRange;
        this.speed = speed;
        this.direction = 1;
    }
    
    update() {
        this.x += this.speed * this.direction;
        
        if (this.x > this.startX + this.moveRange || 
            this.x < this.startX - this.moveRange) {
            this.direction *= -1;
        }
    }
}

class Pipe extends Platform {
    constructor(x, y, width, height, destination = null) {
        super(x, y, width, height, BlockType.PIPE);
        this.destination = destination;
        this.occupied = false;
    }
    
    // Check if player can enter pipe
    canEnter(player, direction) {
        // Check if player is aligned with pipe entrance
        if (direction === Direction.DOWN) {
            return (player.x > this.x + 10 && 
                    player.x + player.width < this.x + this.width - 10 &&
                    Math.abs(player.y + player.height - this.y) < 5);
        }
        return false;
    }
}
