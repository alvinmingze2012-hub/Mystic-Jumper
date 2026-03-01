// game.js - Main game loop and management

const GameManager = {
    canvas: null,
    state: GameState.MENU,
    player: null,
    currentLevel: null,
    
    init() {
        // Get canvas
        this.canvas = document.getElementById('gameCanvas');
        
        // Initialize subsystems
        Renderer.init(this.canvas);
        InputHandler.init();
        UIManager.init();
        AudioManager.init();
        
        // Create player
        this.player = new Player(100, 300);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start with menu
        this.showMenu();
    },
    
    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resetButton').addEventListener('click', () => this.reset());
    },
    
    startGame() {
        this.state = GameState.PLAYING;
        this.player.reset();
        this.player.lives = 3;
        this.player.score = 0;
        this.player.coins = 0;
        this.loadLevel(1, 1);
        UIManager.showLevelStart(1, 1);
        this.gameLoop();
    },
    
    loadLevel(world, stage) {
        this.currentLevel = new Level(world, stage);
        UIManager.updateWorld(world, stage);
        UIManager.updateTime(this.currentLevel.time);
    },
    
    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            document.getElementById('pauseButton').textContent = 'RESUME';
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            document.getElementById('pauseButton').textContent = 'PAUSE';
            this.gameLoop();
        }
    },
    
    reset() {
        this.state = GameState.MENU;
        this.player.reset();
        this.loadLevel(1, 1);
    },
    
    gameLoop() {
        if (this.state !== GameState.PLAYING) return;
        
        // Update
        this.update();
        
        // Render
        Renderer.setCamera(this.player);
        Renderer.render(this.currentLevel, this.player);
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    },
    
    update() {
        // Handle input
        InputHandler.handlePlayer(this.player);
        
        // Update player
        this.player.update();
        
        // Update level
        this.currentLevel.update();
        
        // Check collisions
        CollisionDetector.checkPlatformCollisions(this.player, [
            ...this.currentLevel.platforms,
            ...this.currentLevel.blocks
        ]);
        CollisionDetector.checkEnemyCollisions(this.player, this.currentLevel.enemies);
        CollisionDetector.checkItemCollisions(this.player, this.currentLevel.items);
        
        // Check pipes
        let pipe = CollisionDetector.checkPipeEntrance(this.player, this.currentLevel.pipes);
        if (pipe) {
            this.enterPipe(pipe);
        }
        
        // Check level complete
        if (this.currentLevel.checkComplete(this.player)) {
            this.levelComplete();
        }
        
        // Check game over
        if (this.player.lives <= 0) {
            this.gameOver();
        }
        
        // Update input state
        InputHandler.update();
        
        // Update UI
        UIManager.updatePowerUp(this.getActivePowerUp());
    },
    
    getActivePowerUp() {
        if (this.player.hasStar) return PowerUpType.STAR;
        if (this.player.isBig) return PowerUpType.MUSHROOM;
        return PowerUpType.NONE;
    },
    
    enterPipe(pipe) {
        // Pipe transition animation
        this.state = GameState.PAUSED;
        UIManager.showMessage('PIPE', 1000);
        
        setTimeout(() => {
            // Teleport to new area
            this.player.y = 300;
            this.player.x = pipe.destination || 100;
            this.state = GameState.PLAYING;
        }, 1000);
    },
    
    levelComplete() {
        this.state = GameState.LEVEL_COMPLETE;
        this.player.addScore(this.currentLevel.time * 10);
        UIManager.showCourseClear();
        AudioManager.playSound('levelComplete');
        
        // Award extra life for high score
        if (this.player.score > 100000) {
            this.player.lives++;
        }
        
        // Show completion overlay
        setTimeout(() => {
            if (this.currentLevel.stage === 4) {
                // World complete
                if (this.currentLevel.world === 8) {
                    this.victory();
                } else {
                    this.nextWorld();
                }
            } else {
                this.nextLevel();
            }
        }, 3000);
    },
    
    nextLevel() {
        this.loadLevel(this.currentLevel.world, this.currentLevel.stage + 1);
        this.player.x = 100;
        this.player.y = 300;
        this.state = GameState.PLAYING;
        UIManager.showLevelStart(this.currentLevel.world, this.currentLevel.stage);
    },
    
    nextWorld() {
        this.loadLevel(this.currentLevel.world + 1, 1);
        this.player.x = 100;
        this.player.y = 300;
        this.state = GameState.PLAYING;
        UIManager.showLevelStart(this.currentLevel.world, this.currentLevel.stage);
    },
    
    gameOver() {
        this.state = GameState.GAME_OVER;
        UIManager.showGameOver();
    },
    
    victory() {
        this.state = GameState.VICTORY;
        UIManager.showVictory();
    },
    
    restart() {
        this.startGame();
    }
};

// Initialize game when page loads
window.addEventListener('load', () => {
    GameManager.init();
});
