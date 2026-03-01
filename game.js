const player = document.getElementById("player");
const enemy = document.getElementById("enemy");

let playerBottom = 20;
let velocity = 0;
let gravity = 0.6;
let isJumping = false;

// Jump
document.addEventListener("keydown", function(e) {
    if (e.code === "Space" && !isJumping) {
        velocity = 12;
        isJumping = true;
    }
});

function update() {

    // Gravity
    velocity -= gravity;
    playerBottom += velocity;

    if (playerBottom <= 20) {
        playerBottom = 20;
        velocity = 0;
        isJumping = false;
    }

    player.style.bottom = playerBottom + "px";

    // Enemy movement
    let enemyLeft = parseInt(enemy.style.left);
    enemyLeft -= 2;
    if (enemyLeft < 0) enemyLeft = 800;
    enemy.style.left = enemyLeft + "px";

    // Collision
    if (enemyLeft < 140 && enemyLeft > 80 && playerBottom <= 60) {
        alert("Game Over!");
        playerBottom = 20;
    }

    requestAnimationFrame(update);
}

update();
