"use strict";

class Block {
  constructor(x, y, w, h, value) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
  }

  draw() {
    if (this.value) {
      let padding = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.font = (this.w / 2).toString() + "px pacifico";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#57407c";
      ctx.fillRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      ctx.strokeRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      ctx.fillStyle = "white";
      ctx.fillText(this.value.toString(), this.x + this.w / 2, this.y + this.h / 2, width * 0.75);
    }
  }

  collidePoint(x, y) {
    return (
      x > this.x &&
      x < this.x + this.w &&
      y > this.y &&
      y < this.y + this.h
    );
  }

  sendTo(position) {
    moving++;
    let pos = {
      x: position.x,
      y: position.y,
    }
    let vel = {
      x: (this.x - pos.x) / 10,
      y: (this.y - pos.y) / 10,
    }
    let self = this;
    let n = 0;
    let movement = () => {
      drawAll();
      self.x -= vel.x;
      self.y -= vel.y;
      if (n >= 10) {
        self.x = pos.x;
        self.y = pos.y;
        moving--;
      }
      else {
        setTimeout(movement, 15);
        n++;
      }
    };
    setTimeout(movement, 15);
  }
}

function shuffle(array) {
  for (let i = 0; i < array.length; ++i) {
    let newI = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[newI];
    array[newI] = temp;
  }
}

function isValidNeighbor(ind1, ind2) {
  let pos1 = toNested(ind1);
  let pos2 = toNested(ind2);
  let dist1 = Math.abs(pos1[0] - pos2[0]);
  let dist2 = Math.abs(pos1[1] - pos2[1]);
  if (!dist1 || !dist2) {
    if (dist1 === 1 || dist2 === 1) {
      return dist1 !== dist2;
    }
  }
  return false;
}

function toNested(index) {
  return [ index % boardSize, Math.floor(index / boardSize) ];
}

function findZero() {
  for (let i = 0; i < board.length; ++i) {
    if (board[i].value === 0) {
      return i;
    }
  }
}

function win() {
  if (!moving) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000";
    ctx.font = "50px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`You won in ${moves} ${moves === 1 ? "move" : "moves"}!`, width / 2, height / 2);
    setTimeout(() => {
      location.reload();
    }, 2500);
  }
  else {
    setTimeout(win, 150);
  }
}

function drawAll() {
  ctx.clearRect(0, 0, width, height);
  board.forEach(block => {
    block.draw();
  });
}

function update() {
  drawAll();
  if (checkWin()) {
    setTimeout(() => {
      canvas.removeEventListener("click", handleClick);
      setTimeout(win, 1000);
    }, 200);
  }
  document.getElementById("moves").innerHTML = "Moves: " + moves.toString();
}

function checkWin() {
  let noZ = board.slice(0);
  noZ.splice(findZero(), 1);
  for (let i = 1; i < noZ.length; ++i) {
    if (noZ[i].value < noZ[i - 1].value) {
      return false;
    }
  }
  return true;
}

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
let boardSize;
let board;
let moves;
let moving;

function init() {
  moving = 0;
  boardSize = parseInt(document.getElementById("size").value);
  if (boardSize < 2 || boardSize > 5 || isNaN(boardSize)) {
    boardSize = 4;
  }
  board = Array.from(Array(boardSize ** 2).keys());
  moves = 0;
  shuffle(board);
  for (let i = 0; i < board.length; ++i) {
    let pos = toNested(i);
    let w = width / boardSize;
    let h = height / boardSize;
    board[i] = new Block(pos[0] * w, pos[1] * h, w, h, board[i]);
  }
  update();
}

function handleClick(e) {
  if (!moving) {
    let rect = canvas.getBoundingClientRect();
    for (let i = 0; i < board.length; ++i) {
      if (board[i].collidePoint(e.clientX - rect.x, e.clientY - rect.y)) {
        let zIndex = findZero();
        if (isValidNeighbor(i, zIndex)) {
          moves++;
          let tempPos = {
            x: board[i].x,
            y: board[i].y,
          };
          board[i].sendTo(board[zIndex]);
          board[zIndex].sendTo(tempPos);
          let temp = board[i];
          board[i] = board[zIndex];
          board[zIndex] = temp;
        }
        break;
      }
    }
    update();
  }
}

canvas.addEventListener("click", handleClick);

document.getElementById("reset").onclick = init;
init();