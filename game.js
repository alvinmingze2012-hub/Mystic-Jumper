const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    color: "red",
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -10,
    grounded: false
};

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.grounded = true;
    }

    drawPlayer();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && player.grounded) {
        player.velocityY = player.jumpPower;
        player.grounded = false;
    }
});

update();
