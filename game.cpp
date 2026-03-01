#include <iostream>
#include <vector>
#include <string>
#include <memory>

// Note: This is a structural representation of how the game would be organized in C++
// For actual implementation, you would need a graphics library like SFML or SDL

class GameObject {
protected:
    float x, y;
    float width, height;
    std::string textureID;
    
public:
    GameObject(float x, float y, float w, float h) 
        : x(x), y(y), width(w), height(h) {}
    
    virtual void update(float deltaTime) = 0;
    virtual void render() = 0;
    virtual ~GameObject() = default;
    
    // Collision detection
    bool checkCollision(const GameObject& other) const {
        return (x < other.x + other.width &&
                x + width > other.x &&
                y < other.y + other.height &&
                y + height > other.y);
    }
};

class Player : public GameObject {
private:
    float velocityX, velocityY;
    bool grounded;
    bool hasDoubleJump;
    bool hasDash;
    bool hasShield;
    int lives;
    int score;
    float dashTimer;
    float doubleJumpTimer;
    
public:
    Player(float startX, float startY) 
        : GameObject(startX, startY, 30, 40),
          velocityX(0), velocityY(0), grounded(false),
          hasDoubleJump(false), hasDash(false), hasShield(false),
          lives(3), score(0), dashTimer(0), doubleJumpTimer(0) {}
    
    void update(float deltaTime) override {
        // Apply gravity
        const float GRAVITY = 500.0f; // pixels per second squared
        velocityY += GRAVITY * deltaTime;
        
        // Update position
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;
        
        // Update timers
        if (dashTimer > 0) dashTimer -= deltaTime;
        if (doubleJumpTimer > 0) doubleJumpTimer -= deltaTime;
    }
    
    void render() override {
        // Rendering would be handled by graphics library
        std::cout << "Rendering player at (" << x << ", " << y << ")\n";
    }
    
    void jump() {
        if (grounded) {
            velocityY = -300.0f; // Jump force
            grounded = false;
        } else if (hasDoubleJump && doubleJumpTimer > 0) {
            velocityY = -300.0f;
            doubleJumpTimer = 0;
        }
    }
    
    void moveLeft() { velocityX = -200.0f; }
    void moveRight() { velocityX = 200.0f; }
    void stop() { velocityX = 0; }
    
    void dash() {
        if (hasDash && dashTimer <= 0) {
            velocityX = (velocityX > 0) ? 500.0f : -500.0f;
            dashTimer = 0.5f; // Dash duration in seconds
        }
    }
    
    void loseLife() { 
        lives--; 
        if (lives <= 0) {
            // Game over
            std::cout << "Game Over!\n";
        }
    }
    
    void addScore(int points) { score += points; }
    int getScore() const { return score; }
    int getLives() const { return lives; }
};

class Platform : public GameObject {
private:
    std::string material;
    
public:
    Platform(float x, float y, float w, float h, const std::string& mat)
        : GameObject(x, y, w, h), material(mat) {}
    
    void update(float deltaTime) override {
        // Platforms are static, no update needed
    }
    
    void render() override {
        std::cout << "Rendering " << material << " platform\n";
    }
};

class Enemy : public GameObject {
private:
    float velocityX;
    std::string enemyType;
    bool movingRight;
    
public:
    Enemy(float x, float y, float w, float h, const std::string& type)
        : GameObject(x, y, w, h), 
          velocityX(100.0f), enemyType(type), movingRight(true) {}
    
    void update(float deltaTime) override {
        if (enemyType == "walker") {
            // Move back and forth
            if (movingRight) {
                x += velocityX * deltaTime;
            } else {
                x -= velocityX * deltaTime;
            }
            
            // Simple boundary detection (would need platform awareness)
            if (x > 700) movingRight = false;
            if (x < 100) movingRight = true;
        }
    }
    
    void render() override {
        std::cout << "Rendering enemy at (" << x << ", " << y << ")\n";
    }
};

class Collectible : public GameObject {
private:
    std::string itemType;
    int value;
    
public:
    Collectible(float x, float y, float w, float h, const std::string& type, int val)
        : GameObject(x, y, w, h), itemType(type), value(val) {}
    
    void update(float deltaTime) override {
        // Add floating animation
        y += sin(deltaTime) * 10.0f;
    }
    
    void render() override {
        std::cout << "Rendering " << itemType << " collectible\n";
    }
    
    int getValue() const { return value; }
    std::string getType() const { return itemType; }
};

class Level {
private:
    std::string name;
    std::vector<std::unique_ptr<GameObject>> objects;
    std::unique_ptr<Player> player;
    float levelWidth, levelHeight;
    bool levelComplete;
    
public:
    Level(const std::string& levelName) 
        : name(levelName), levelWidth(800), levelHeight(600), levelComplete(false) {
        initializeLevel();
    }
    
    void initializeLevel() {
        // Create player
        player = std::make_unique<Player>(100.0f, 300.0f);
        
        // Create platforms based on level name
        if (name == "Enchanted Forest") {
            objects.push_back(std::make_unique<Platform>(0, 550, 200, 20, "wood"));
            objects.push_back(std::make_unique<Platform>(250, 500, 150, 20, "wood"));
            objects.push_back(std::make_unique<Platform>(450, 450, 150, 20, "wood"));
        } else if (name == "Crystal Caverns") {
            objects.push_back(std::make_unique<Platform>(0, 550, 200, 20, "stone"));
            objects.push_back(std::make_unique<Platform>(250, 500, 150, 20, "crystal"));
            objects.push_back(std::make_unique<Platform>(450, 400, 150, 20, "crystal"));
        }
        
        // Add ground platform
        objects.push_back(std::make_unique<Platform>(0, 580, 800, 20, "ground"));
        
        // Add enemies
        objects.push_back(std::make_unique<Enemy>(300, 480, 25, 25, "walker"));
        
        // Add collectibles
        objects.push_back(std::make_unique<Collectible>(150, 530, 20, 20, "coin", 10));
    }
    
    void update(float deltaTime) {
        player->update(deltaTime);
        
        for (auto& obj : objects) {
            obj->update(deltaTime);
        }
        
        // Check collisions
        checkCollisions();
        
        // Check if level is complete
        if (player->getX() > levelWidth - 100) {
            levelComplete = true;
        }
    }
    
    void checkColl
