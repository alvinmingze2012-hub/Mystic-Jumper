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
   
