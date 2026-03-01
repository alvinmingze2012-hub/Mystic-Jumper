// ui.js - User interface management

const UIManager = {
    elements: {},
    
    init() {
        this.elements = {
            score: document.getElementById('score'),
            coins: document.getElementById('coins'),
            world: document.getElementById('world'),
            lives: document.getElementById('lives'),
            time: document.getElementById('time'),
            powerupName: document.getElementById('powerupName'),
            gameMessage: document.getElementById('gameMessage'),
            overlay: document.getElementById('gameOverlay'),
            overlayTitle: document.getElementById('overlayTitle'),
            overlayMessage: document.getElementById('overlayMessage'),
            overlayButton: document.getElementById('overlayButton'),
            worldNumber: document.getElementById('worldNumber')
        };
        
        // Add event listeners
        this.elements.overlayButton.addEventListener('click', () => this.hideOverlay());
    },
    
    // Update score display (6 digits)
    updateScore(score) {
        this.elements.score.textContent = String(score).padStart(6, '0');
    },
    
    // Update coins display (2 digits)
    updateCoins(coins) {
        this.elements.coins.textContent = String(coins).padStart(2, '0');
    },
    
    // Update world display
    updateWorld(world, stage) {
        this.elements.world.textContent = `${world}-${stage}`;
        this.elements.worldNumber.textContent = `${world}-${stage}`;
    },
    
    // Update lives display
    updateLives(lives) {
        this.elements.lives.textContent = lives;
    },
    
    // Update time display
    updateTime(time) {
        this.elements.time.textContent = String(time).padStart(3, '0');
    },
    
    // Update power-up display
    updatePowerUp(powerUp) {
        let name = 'None';
        let icon = '';
        
        switch(powerUp) {
            case PowerUpType.MUSHROOM:
                name = 'MUSHROOM';
                icon = '🍄';
                break;
            case PowerUpType.STAR:
                name = 'STAR';
                icon = '⭐';
                break;
            case PowerUpType.FLOWER:
                name = 'FLOWER';
                icon = '🌸';
                break;
        }
        
        this.elements.powerupName.textContent = name;
        document.querySelector('.powerup-icon').textContent = icon || '⚡';
    },
    
    // Show game message (e.g., "COURSE CLEAR")
    showMessage(text, duration = 2000) {
        this.elements.gameMessage.textContent = text;
        this.elements.gameMessage.style.display = 'block';
        
        setTimeout(() => {
            this.elements.gameMessage.style.display = 'none';
        }, duration);
    },
    
    // Show overlay (game over, level complete, etc.)
    showOverlay(title, message, buttonText = 'CONTINUE') {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        this.elements.overlayButton.textContent = buttonText;
        this.elements.overlay.style.display = 'flex';
    },
    
    // Hide overlay
    hideOverlay() {
        this.elements.overlay.style.display = 'none';
        
        // Resume game or restart
        if (GameManager.state === GameState.GAME_OVER) {
            GameManager.restart();
        } else if (GameManager.state === GameState.LEVEL_COMPLETE) {
            GameManager.nextLevel();
        }
    },
    
    // Show level start message
    showLevelStart(world, stage) {
        this.showMessage(`WORLD ${world}-${stage}`, 2000);
    },
    
    // Show course clear
    showCourseClear() {
        this.showMessage('COURSE CLEAR!', 3000);
    },
    
    // Show game over
    showGameOver() {
        this.showOverlay('GAME OVER', 'Thanks for playing!', 'TRY AGAIN');
    },
    
    // Show victory
    showVictory() {
        this.showOverlay('VICTORY!', 'You saved the princess!', 'PLAY AGAIN');
    }
};
