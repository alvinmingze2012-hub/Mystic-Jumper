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
        this.blocks[this.blocks.length-1].contains = '
