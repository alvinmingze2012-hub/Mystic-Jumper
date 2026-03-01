// level.js - Level management and generation

class Level {
    constructor(world, stage) {
        this.world = world;
        this.stage = stage;
        this.name = `${world}-${stage}`;
        this.width = 2000;
        this.height = GameConstants.CANVAS_HEIGHT;
        
        // Level objects
        this.platforms = [];
        this.enemies = [];
        this.items = [];
        this.blocks = [];
        this.pipes = [];
        
        // Level state
        this.time = GameConstants.TIME_LIMIT;
        this.complete = false;
        this.goal = { x: 1800, y: 400, width: 10, height: 100 };
        
        // Generate level based on world and stage
        this.generate();
    }
    
    generate() {
        if (this.world === 1) {
            if (this.stage === 1) {
                this.generateWorld1_1();
            } else if (this.stage === 2) {
                this.generateWorld1_2();
            } else if (this.stage === 3) {
                this.generateWorld1_3();
            } else if (this.stage === 4) {
                this.generateWorld1_4();
            }
        } else if (this.world === 2) {
            this.generateWorld2();
        }
    }
    
    generateWorld1_1() {
        // Ground platforms
        for (let i = 0; i < 20; i++) {
            this.platforms.push(new Platform(i * 100, 440, 100, 40, BlockType.GROUND));
        }
        
        // First hill with bricks
        this.platforms.push(new Platform(300, 380, 100, 20, BlockType.BRICK));
        this.platforms.push(new Platform(400, 340, 100, 20, BlockType.BRICK));
        this.platforms.push(new Platform(500, 300, 100, 20, BlockType.BRICK));
        
        // Question blocks
        this.blocks.push(new Platform(600, 280, 40, 40, BlockType.QUESTION));
        this.blocks[this.blocks.length-1].contains = 'mushroom';
        
        this.blocks.push(new Platform(650, 280, 40, 40, BlockType.QUESTION));
        this.blocks[this.blocks.length-1].contains = 'coin';
        
        // Pipes
        this.pipes.push(new Pipe(800, 400, 60, 80));
        this.pipes.push(new Pipe(1000, 400, 60, 80));
        
        // Enemies
        this.enemies.push(new Enemy(400, 416, EnemyType.GOOMBA));
        this.enemies.push(new Enemy(700, 416, EnemyType.GOOMBA));
        this.enemies.push(new Enemy(900, 416, EnemyType.KOOPA));
        
        // Coins
        for (let i = 0; i < 5; i++) {
            this.items.push(new Coin(320 + i * 30, 360));
        }
        
        // Goal
        this.goal = { x: 1800, y: 360, width: 10, height: 120 };
    }
    
    generateWorld1_2() {
        // Underground level
        for (let i = 0; i < 20; i++) {
            this.platforms.push(new Platform(i * 100, 440, 100, 40, BlockType.GROUND));
        }
        
        // Underground platforms
        let y = 380;
        for (let i = 0; i < 8; i++) {
            this.platforms.push(new Platform(200 + i * 100, y, 80, 20, BlockType.BRICK));
            y -= 30;
        }
        
        // Lots of coins
        for (let i = 0; i < 30; i++) {
            this.items.push(new Coin(250 + i * 25, 300 + Math.sin(i) * 30));
        }
        
        // Enemies
        this.enemies.push(new Enemy(500, 416, EnemyType.GOOMBA));
        this.enemies.push(new Enemy(800, 416, EnemyType.GOOMBA));
        
        // Hidden blocks
        let hidden = new Platform(400, 320, 40, 40, BlockType.HIDDEN);
        hidden.contains = 'star';
        this.blocks.push(hidden);
    }
    
    generateWorld1_3() {
        // Sky level with moving platforms
        for (let i = 0; i < 5; i++) {
            this.platforms.push(new MovingPlatform(200 + i * 300, 300, 100, 20, 50, 2));
        }
        
        // Clouds as platforms
        for (let i = 0; i < 8; i++) {
            this.platforms.push(new Platform(100 + i * 200, 200 + Math.sin(i) * 50, 80, 20, 'cloud'));
        }
        
        // Flying enemies
        this.enemies.push(new Enemy(300, 280, EnemyType.KOOPA));
        this.enemies.push(new Enemy(600, 180, EnemyType.KOOPA));
        
        // Power-ups
        this.items.push(new Mushroom(400, 280));
        this.items.push(new Star(700, 180));
    }
    
    generateWorld1_4() {
        // Castle level
        for (let i = 0; i < 20; i++) {
            this.platforms.push(new Platform(i * 100, 440, 100, 40, BlockType.GROUND));
        }
        
        // Castle platforms
        this.platforms.push(new Platform(500, 300, 200, 20, 'castle'));
        this.platforms.push(new Platform(800, 250, 200, 20, 'castle'));
        
        // Piranha plants
        let pipe1 = new Pipe(300, 400, 60, 80);
        this.pipes.push(pipe1);
        this.enemies.push(new PiranhaPlant(310, 400, pipe1));
        
        // Bowser bridge
        for (let i = 0; i < 10; i++) {
            this.platforms.push(new Platform(1200 + i * 40, 400, 40, 20, 'bridge'));
        }
        
        // Axe to cut bridge
        this.goal = { x: 1600, y: 380, width: 20, height: 40 };
    }
    
    generateWorld2() {
        // Desert level
        // Similar structure with different themes
    }
    
    update() {
        // Update time
        if (GameManager.state === GameState.PLAYING) {
            this.time--;
            if (this.time <= 0) {
                GameManager.player.die();
            }
            UIManager.updateTime(this.time);
        }
        
        // Update objects
        this.enemies.forEach(enemy => enemy.update());
        this.items.forEach(item => item.update());
        this.platforms.forEach(platform => {
            if (platform.update) platform.update();
        });
        
        // Remove inactive enemies
        this.enemies = this.enemies.filter(e => e.active);
        
        // Remove collected items
        this.items = this.items.filter(i => i.active);
    }
    
    // Check if level is complete
    checkComplete(player) {
        if (player.x > this.goal.x - 30) {
            this.complete = true;
            player.addScore(this.time * 10); // Time bonus
            return true;
        }
        return false;
    }
}
