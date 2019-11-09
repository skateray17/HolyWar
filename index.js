function rand() {
  return Math.round(Math.random());
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let { x, y } = API.getCurrentPosition();
let enemies = API.getEnemies();
const currentActionCount = API.getActionPointsCount();
const arenaSize = API.getArenaSize();

const dist = (p1, p2) => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

const canMove = (x1, y1, x2 = x, y2 = y, actions = currentActionCount) => {
  return dist({ x: x2, y: y2 }, { x: x1, y: y1 }) <= actions
    && x1 >= 0 && x1 < arenaSize && y1 >= 0 && y1 < arenaSize;
}

const isSavePosition = (x, y) => {
  return !enemies.some(e => canMove(x, y, e.position.x, e.position.y, 3));
}

const enemiesToKill = enemies.filter(e => canMove(e.position.x, e.position.y));

let pos;
// Kill enemy if can kill
if (enemiesToKill.length) {
  const filteredEnemiesToKill = enemiesToKill.filter(e => isSavePosition(e.position.x, e.position.y));
  // try to kill and not to die at the next turn
  if (filteredEnemiesToKill.length) {
    pos = filteredEnemiesToKill[getRandomInt(filteredEnemiesToKill.length - 1)].position;
  } else {
    // kill enemy anyway :)
    pos = enemiesToKill[getRandomInt(enemiesToKill.length - 1)].position;
  }
} else {
  // try to move to the center and not be killed
  let availablePositions = [];
  for (let x1 = x - currentActionCount; x1 <= x + currentActionCount; x1++) {
    for (let y1 = y - currentActionCount; y1 <= y + currentActionCount; y1++) {
      if (canMove(x1, y1)) {
        availablePositions.push({ x: x1, y: y1 });
      }
    }
  }

  let savePositions = availablePositions.filter(e => isSavePosition(e.x, e.y));
  if (savePositions.length) {
    let minDir = Infinity;
    pos = savePositions.reduce((ac, e) => {
      let d = dist(e, { x: arenaSize / 2, y: arenaSize / 2 });
      if (d < minDir) {
        minDir = d;
        return e;
      }
      return ac;
    }, null);
    // if pos is the same do 1-action move (save)
    if (pos.x === x && pos.y === y) {
      let moves = [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }]
        .filter(e => canMove(e.x, e.y)).filter(e => isSavePosition(e.x, e.y));
        if(moves.length) {
          pos = moves[getRandomInt(moves.length - 1)];
        }
    }
  } else {
    // just choose random
    pos = availablePositions[getRandomInt(availablePositions.length - 1)];
  }
}

API.move(pos.x, pos.y);
