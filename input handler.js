// input.js - Keyboard input handling

const InputHandler = {
    keys: {},
    lastKeys: {},
    
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    },
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        
        // Prevent page scrolling with arrow keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    },
    
    onKeyUp(e) {
        this.keys[e.code] = false;
    },
    
    isKeyDown(code) {
        return this.keys[code] === true;
    },
    
    isKeyPressed(code) {
        return this.keys[code] && !this.lastKeys[code];
    },
    
    isKeyReleased(code) {
        return !this.keys[code] && this.lastKeys[code];
    },
    
    update() {
        // Save current state for next frame
        this.lastKeys = { ...this.keys };
    },
    
    // Get movement direction (-1, 0, 1)
    getHorizontalAxis() {
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) {
            return -1;
        } else if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) {
            return 1;
        }
        return 0;
    },
    
    // Check if jump is pressed
    isJumpPressed() {
        return this.isKeyDown('Space');
    },
    
    // Check if jump was just pressed
    isJumpJustPressed() {
        return this.isKeyPressed('Space');
    },
    
    // Check if run is pressed
    isRunPressed() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    },
    
    // Handle player input
    handlePlayer(player) {
        // Horizontal movement
        let axis = this.getHorizontalAxis();
        let speed = this.isRunPressed() ? GameConstants.RUN_SPEED : GameConstants.MOVE_SPEED;
        
        if (axis !== 0) {
            player.velX += (axis * speed - player.velX) * 0.2;
            player.facingRight = (axis > 0);
        } else {
            // Friction
            player.velX *= GameConstants.FRICTION;
            if (Math.abs(player.velX) < 0.1) player.velX = 0;
        }
        
        // Jump
        if (this.isJumpPressed()) {
            if (!player.jumpPressed) {
                player.jump();
                player.jumpPressed = true;
            }
        } else {
            if (player.jumpPressed) {
                player.releaseJump();
                player.jumpPressed = false;
            }
        }
        
        // Update jump hold time
        if (player.jumpHeld) {
            player.jumpTime--;
            if (player.jumpTime <= 0) {
                player.releaseJump();
            }
        }
    }
};
