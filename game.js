// constants.js - Game constants and configuration

const GameConstants = {
    // Physics constants
    GRAVITY: 0.3,
    JUMP_FORCE: -8,
    MAX_FALL_SPEED: 10,
    MOVE_SPEED: 3,
    RUN_SPEED: 5,
    FRICTION: 0.85,
    AIR_CONTROL: 0.4,
    
    // Power-up timers
    MUSHROOM_DURATION: 600,
    STAR_DURATION: 400,
    INVINCIBILITY_DURATION: 120,
    
    // Level constants
    TIME_LIMIT: 400,
    COIN_SCORE: 100,
    ENEMY_SCORE: 200,
    
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    
    // Player dimensions
    PLAYER_WIDTH: 28,
    PLAYER_HEIGHT: 36,
    PLAYER_WIDTH_BIG: 28,
    PLAYER_HEIGHT_BIG: 48,
    
    // Colors
    COLORS: {
        SKY_BLUE: '#6b8cff',
        CLOUD_WHITE: '#ffffff',
        GROUND_BROWN: '#7b3f00',
        BRICK_ORANGE: '#b85e0c',
        QUESTION_GOLD: '#daa520',
        PIPE_GREEN: '#228b22',
        COIN_YELLOW: '#ffd700',
        GOOMBA_BROWN: '#8b4513',
        KOOPA_RED: '#ff4444'
    }
};

// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory'
};

// Power-up types
const PowerUpType = {
    NONE: 'none',
    MUSHROOM: 'mushroom',
    STAR: 'star',
    FLOWER: 'flower'
};

// Enemy types
const EnemyType = {
    GOOMBA: 'goomba',
    KOOPA: 'koopa',
    PIRANHA: 'piranha',
    BOWSER: 'bowser'
};

// Block types
const BlockType = {
    BRICK: 'brick',
    QUESTION: 'question',
    HIDDEN: 'hidden',
    GROUND: 'ground',
    PIPE: 'pipe'
};

// Direction constants
const Direction = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};
