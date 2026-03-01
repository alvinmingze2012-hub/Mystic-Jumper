// enemy.js - Enemy classes (Goomba, Koopa, etc.)

class Enemy {
    constructor(x, y, type = EnemyType.GOOMBA) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 24;
        this.velX = 1;
        this.velY = 0;
        this.active = true;
        this.squished = false;
        this.squishTimer = 0;
        
        // Type-specific properties
        if (type === EnemyType.KOOPA) {
            this.shell = false;
            this.shellSpeed = 5;
        }
        
        // Animation
        this.walkCycle = 0;
        this.direction = 1; // 1 for right, -1 for left
    }
    
    update() {
        if (!this.active) return;
        
        if (this.squished) {
            this.squishTimer++;
            if (this.squishTimer > 20) {
                this.active = false;
            }
            return;
        }
        
        // Apply gravity
        this.velY += GameConstants.GRAVITY;
        this.y += this.velY;
        
        // Move
        if (this.type === EnemyType.GOOMBA || 
            (this.type === EnemyType.KOOPA && !this.shell)) {
            this.x += this.velX * this.direction;
            this.walkCycle += 0.1;
        }
        
        // Shell behavior
        if (this.type === EnemyType.KOOPA && this.shell) {
            // Shell slides
            this.x += this.velX * this.shellSpeed * this.direction;
        }
    }
    
    // Enemy gets squished
    squish() {
        this.squished = true;
        this.height = 12;
        this.y += 6;
        AudioManager.playSound('stomp');
    }
    
    // Turn into shell (Koopa only)
    shellMode() {
        if (this.type === EnemyType.KOOPA && !this.shell) {
            this.shell = true;
            this.height = 18;
            this.velX = 0;
        }
    }
    
    // Bounce shell
    kickShell() {
        if (this.type === EnemyType.KOOPA && this.shell) {
            this.direction = (this.direction === 1) ? -1 : 1;
            this.velX = 5;
        }
    }
    
    // Check collision with player
    checkPlayerCollision(player) {
        if (!this.active || this.squished) return false;
        
        return CollisionDetector.rectCollision(
            player.x, player.y, player.width, player.height,
            this.x, this.y, this.width, this.height
        );
    }
    
    // Handle player stomp
    stomp(player) {
        if (player.hasStar) {
            // Star kills instantly
            this.active = false;
            player.addScore(GameConstants.ENEMY_SCORE * 2);
            return;
        }
        
        if (this.type === EnemyType.GOOMBA) {
            this.squish();
            player.addScore(GameConstants.ENEMY_SCORE);
            player.velY = GameConstants.JUMP_FORCE * 0.5;
        } else if (this.type === EnemyType.KOOPA) {
            if (!this.shell) {
                this.shellMode();
                player.addScore(GameConstants.ENEMY_SCORE);
                player.velY = GameConstants.JUMP_FORCE * 0.5;
            } else {
                this.kickShell();
            }
        }
    }
}

class PiranhaPlant extends Enemy {
    constructor(x, y, pipe) {
        super(x, y, EnemyType.PIRANHA);
        this.pipe = pipe;
        this.state = 'hiding';
        this.timer = 0;
        this.height = 32;
    }
    
    update() {
        this.timer++;
        
        // Simple AI - pop up and down
        if (this.state === 'hiding' && this.timer > 60) {
            this.state = 'rising';
            this.timer = 0;
        } else if (this.state === 'rising') {
            this.y -= 1;
            if (this.y <= this.pipe.y - 24) {
                this.state = 'visible';
                this.timer = 0;
            }
        } else if (this.state === 'visible' && this.timer > 80) {
            this.state = 'sinking';
            this.timer = 0;
        } else if (this.state === 'sinking') {
            this.y += 1;
            if (this.y >= this.pipe.y) {
                this.state = 'hiding';
                this.timer = 0;
            }
        }
    }
}
