#include <iostream>

class Player {
public:
    int x = 100;
    int y = 300;
    int jumpPower = -10;
    int velocityY = 0;
    bool grounded = true;

    void Jump() {
        if (grounded) {
            velocityY = jumpPower;
            grounded = false;
            std::cout << "Player Jumped!" << std::endl;
        }
    }

    void Update() {
        velocityY += 1; // Gravity
        y += velocityY;

        if (y >= 300) {
            y = 300;
            velocityY = 0;
            grounded = true;
        }
    }
};

int main() {
    Player player;

    player.Jump();
    player.Update();

    return 0;
}
