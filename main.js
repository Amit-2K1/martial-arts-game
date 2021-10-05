let canvas = document.getElementById("my-canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

//Loading Background Image
let backgroundImage = document.createElement("img");
backgroundImage.src = "images/background.jpg";

//Left Player
let players = [
  {
    name: "leftPlayer",
    health: 100,
    width: 500,
    height: 500,
    action: "idle",
    winner: false,
    x: 0,
    y: 0,
    newX: 0,
    newY: 0,
    dx: 30,
    images: {
      idle: [],
      forward: [],
      backward: [],
      block: [],
      kick: [],
      punch: [],
    },
  },

  //Right Player
  {
    name: "rightPlayer",
    health: 100,
    width: 450,
    height: 500,
    action: "idle",
    winner: false,
    x: 450,
    y: 0,
    newX: 450,
    newY: 0,
    dx: 30,
    images: {
      idle: [],
      forward: [],
      backward: [],
      block: [],
      kick: [],
      punch: [],
    },
  },
];

let loadImage = (src, callback) => {
  let img = document.createElement("img");
  img.onload = () => callback(img);
  img.src = src;
};

//Getting Image Path
let imagePath = (frameNumber, player, animation) => {
  return "images/" + player + "/" + animation + "/" + frameNumber + ".png";
};

//Number of frames in each animation
let frames = {
  idle: [1, 2, 3, 4, 5, 6, 7, 8],
  forward: [1, 2, 3, 4, 5, 6],
  backward: [1, 2, 3, 4, 5, 6],
  block: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  kick: [1, 2, 3, 4, 5, 6, 7],
  punch: [1, 2, 3, 4, 5, 6, 7],
};

//Different Animation For Player
let animations = ["idle", "forward", "backward", "block", "kick", "punch"];

//Loads Animation Frames
let init = (callback) => {
  let imagesToLoad = 0;

  players.forEach((player) => {
    animations.forEach((animation) => {
      let animationFrames = frames[animation];
      imagesToLoad += animationFrames.length;

      animationFrames.forEach((frameNumber) => {
        let path = imagePath(frameNumber, player.name, animation);
        loadImage(path, (image) => {
          player.images[animation].push(image);
          imagesToLoad--;

          if (imagesToLoad === 0) {
            callback();
          }
        });
      });
    });
  });
};

let drawPlayer = (player, frameNumber) => {
  ctx.drawImage(
    player.images[player.action][frameNumber],
    player.x,
    player.y,
    player.width,
    player.height
  );
};

let drawHealthBar = (x, y, width, height) => {
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.fillRect(x, y, width, height);
};

//Perform Animation
let animate = (players, callback) => {
  let player0NoOfFrames = players[0].images[players[0].action].length;
  let player1NoOfFrames = players[1].images[players[1].action].length;

  let maxNoOfFrames = Math.max(player0NoOfFrames, player1NoOfFrames);
  let frameNumbers = [];
  for (i = 0; i < maxNoOfFrames; i++) frameNumbers.push(i);

  frameNumbers.forEach((frameNumber) => {
    setTimeout(() => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); //Clearing Canvas
      ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight); //Drawing Background
      drawHealthBar(10, 10, players[0].health * 4, 20);
      drawHealthBar(490, 10, players[1].health * 4, 20);

      //Drawing Left Players
      if (frameNumber >= player0NoOfFrames) {
        players[0].action = "idle";
        drawPlayer(players[0], maxNoOfFrames - frameNumber);
      } else {
        drawPlayer(players[0], frameNumber);
      }

      //Drawing Right Player
      if (frameNumber >= player1NoOfFrames) {
        players[1].action = "idle";
        drawPlayer(players[1], maxNoOfFrames - frameNumber);
      } else drawPlayer(players[1], frameNumber);
    }, frameNumber * 100);
  });

  //Changing player position
  players[0].x = players[0].newX;
  players[1].x = players[1].newX;

  setTimeout(callback, maxNoOfFrames * 100);
};

//Listen Left Player Command
function player0KeyListener(player0QueuedAnimation) {
  document.addEventListener("keyup", (event) => {
    const code = event.code;

    switch (code) {
      case "KeyD": {
        player0QueuedAnimation.push("forward");
        players[0].newX += players[0].dx;
        if (players[0].x > canvasWidth - 400) players[0].newX = 540;
        break;
      }

      case "KeyA": {
        player0QueuedAnimation.push("backward");
        players[0].newX -= players[0].dx;
        if (players[0].newX < 0) players[0].newX = 0;
        break;
      }

      case "ControlLeft": {
        player0QueuedAnimation.push("block");
        break;
      }

      case "KeyW": {
        player0QueuedAnimation.push("punch");
        break;
      }

      case "KeyS": {
        player0QueuedAnimation.push("kick");
        break;
      }

      default: {
      }
    }
  });
}

//Listen Right Player Command
function player1KeyListener(player1QueuedAnimation) {
  document.addEventListener("keyup", (event) => {
    const code = event.code;

    switch (code) {
      case "ArrowLeft": {
        player1QueuedAnimation.push("forward");
        players[1].newX -= players[1].dx;
        if (players[1].x < -50) players[1].newX = -50;
        break;
      }

      case "ArrowRight": {
        player1QueuedAnimation.push("backward");
        players[1].newX += players[1].dx;
        if (players[1].x > canvasWidth - 460) players[1].newX = 450;
        break;
      }

      case "ControlRight": {
        player1QueuedAnimation.push("block");
        break;
      }

      case "ArrowUp": {
        player1QueuedAnimation.push("punch");
        break;
      }

      case "ArrowDown": {
        player1QueuedAnimation.push("kick");
        break;
      }

      default: {
      }
    }
  });
}

function collisonDetection() {
  player0Left = players[0].x;
  player0Right = player0Left + players[0].width;

  player1Left = players[1].x;
  player1Right = player1Left + players[1].width;

  if (
    (players[0].action === "punch" || players[0].action === "kick") &&
    players[0] !== "block"
  ) {
    if (player0Right >= player1Left) {
      players[1].health -= 10;
    }
  }

  if (
    (players[1].action === "punch" || players[1].action === "kick") &&
    players[1] !== "block"
  ) {
    if (player1Left <= player0Right) {
      players[0].health -= 10;
    }
  }
}

function isGameOver() {
  if (players[0].health <= 0) {
    players[1].winner = true;
    return true;
  }

  if (players[1].health <= 0) {
    players[0].winner = true;
    return true;
  }

  return false;
}

init(() => {
  let player0QueuedAnimation = [];
  let player1QueuedAnimation = [];

  let gameOver = false;

  let gameLoop = () => {
    if (player0QueuedAnimation.length === 0) {
      players[0].action = "idle";
    } else {
      players[0].action = player0QueuedAnimation.shift();
    }

    if (player1QueuedAnimation.length === 0) {
      players[1].action = "idle";
    } else {
      players[1].action = player1QueuedAnimation.shift();
    }

    gameOver = isGameOver();

    if (!gameOver) {
      collisonDetection();

      animate(players, gameLoop);
    } else {
      ctx.font = "50px Arial";
      ctx.textAlign = "center";
      if (players[0].winner) {
        ctx.fillText("LEFT PLAYER WINS!", canvasWidth / 2, canvasHeight / 2);
      }

      if (players[1].winner) {
        ctx.fillText("RIGHT PLAYER WINS!", canvasWidth / 2, canvasHeight / 2);
      }
    }
  };

  player0KeyListener(player0QueuedAnimation);
  player1KeyListener(player1QueuedAnimation);

  gameLoop();
});
