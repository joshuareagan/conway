function makeBoard(x) {
  var b = [];
  for (var i = 0; i < x; i++) {
    var row = [];
    for (var j = 0; j < x; j++)
      row.push(false);
    b.push(row);
  };
  return b;
};

function printBoard(board) {
  var len = board.length;
  for (var i = 0; i < len; i++)
    console.log(board[i]);
};

function identifyNeighbors(board, square) {

  var last = board.length - 1;
  var neighbors = [];
  var x = square[0];
  var y = square[1];

  if (x == 0) {
    if (y == 0) {
      neighbors.push(board[last][last]);
      neighbors.push(board[last][0]);
      neighbors.push(board[0][last]);
      neighbors.push(board[last][1]);
      neighbors.push(board[1][last]);
    }
    else if (y == last) {
      neighbors.push(board[last][0]);
      neighbors.push(board[last][last]);
      neighbors.push(board[0][0]);
      neighbors.push(board[last][last - 1]);
      neighbors.push(board[1][0]);
    }
    else {
      neighbors.push(board[last][y + 1]);
      neighbors.push(board[last][y]);
      neighbors.push(board[last][y - 1]);
    };
  };

  if (x == last) {
    if (y == 0) {
      neighbors.push(board[last][last]);
      neighbors.push(board[0][0]);
      neighbors.push(board[0][last]);
      neighbors.push(board[last - 1][last]);
      neighbors.push(board[0][1]);
    }
    else if (y == last) {
      neighbors.push(board[last][0]);
      neighbors.push(board[0][last]);
      neighbors.push(board[0][0]);
      neighbors.push(board[0][last - 1]);
      neighbors.push(board[last - 1][0]);
    }
    else {
      neighbors.push(board[0][y + 1]);
      neighbors.push(board[0][y]);
      neighbors.push(board[0][y - 1]);
    };
  };

  if ((y == 0) && ((x != 0) && (x != last))) {
    neighbors.push(board[x + 1][last]);
    neighbors.push(board[x][last]);
    neighbors.push(board[x - 1][last]);
  };

  if ((y == last) && ((x != 0) && (x != last))) {
    neighbors.push(board[x + 1][0]);
    neighbors.push(board[x][0]);
    neighbors.push(board[x - 1][0]);
  };

  if (x == 0) var xMin = 0;
    else var xMin = x - 1;
  if (x == last) var xMax = last;
    else var xMax = x + 1;
  if (y == 0) var yMin = 0;
    else var yMin = y - 1;
  if (y == last) var yMax = last;
    else var yMax = y + 1;

  for (var i = xMin; i <= xMax; i++)
    for (var j = yMin; j <= yMax; j++)
      neighbors.push(board[i][j]);

  var liveNeighbors = 0

    for (var i = 0; i < 9; i++)
      if (neighbors[i] == true) liveNeighbors++;

  if (board[x][y] == true) liveNeighbors--;
  return liveNeighbors;
};

function squareStep(board, square) {
  var liveNeighbors = identifyNeighbors(board, square);

  if ((liveNeighbors == 3) ||
     ((liveNeighbors == 2) && (board[square[0]][square[1]]))) return true;
  return false;
};

function boardStep(board) {
  var len = board.length;
  var nextBoard = makeBoard(len);
  for (var i = 0; i < len; i++)
    for (var j = 0; j < len; j++)
      nextBoard[i][j] = squareStep(board, [i, j]);
  return nextBoard;
};

function makeAlive(board, square) {
  board[square[0]][square[1]] = true;
  return board;
};

var size = 100;
var scale = 5;

board = makeBoard(size);
lastTime = null;

function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
};

function makeTable(board) {
  len = board.length;
  var table = elt("table", "playingboard");
  for (var i = 0; i < len; i++) {
    var row = elt("tr");
    table.appendChild(row);
    for (var j = 0; j < len; j++) {
      var cell = elt("td", "cell");
      cell.style.width = scale + "px";
      cell.style.height = scale + "px";
      if (board[i][j]) cell.style.backgroundColor = "gray";
        else cell.style.backgroundColor = "beige";
      table.childNodes[i].appendChild(cell);
    };
  };
  table.addEventListener("click", function(event) {
    var cell = event.target;
    if (cell.style.backgroundColor == "beige") {
      cell.style.backgroundColor = "gray"
    } else cell.style.backgroundColor = "beige";
  });
  return table;
};

function tableRead(table) {
  var nextBoard = makeBoard(size);
  var k = 0;
  for (var i = 0; i < size; i++)
    for (var j = 0; j < size; j++) {
      var cell = document.body.getElementsByClassName("cell")[k];
      if (cell.style.backgroundColor == "beige") nextBoard[i][j] = false;
        else nextBoard[i][j] = true;
      k++;
    };
  return nextBoard;
};

var table = document.body.appendChild(makeTable(board));

function step(board) {
  board = tableRead(table);
  board = boardStep(board);
  var table = makeTable(board);
  var oldTable = document.body.getElementsByClassName("playingboard")[0];
  document.body.replaceChild(table, oldTable);
  return board;
};

function reset(board) {
  board = makeBoard(size);
  var table = makeTable(board);
  var oldTable = document.body.getElementsByClassName("playingboard")[0];
  document.body.replaceChild(table, oldTable);
  return board;
};

function start() {
  var button = document.body.getElementsByClassName("start")[0];
  var newButton = elt("button", "stop");
  newButton.textContent = "Stop";
  newButton.setAttribute("onclick", "stop();");
  button.parentNode.replaceChild(newButton, button);
  mainLoop()
};

function mainLoop(time) {
  var animate = document.body.getElementsByClassName("stop");
  if (animate.length > 0) {
    if (time > (lastTime + 300)) {
      board = step(board);
      lastTime = time;
    };
    requestAnimationFrame(mainLoop);
  };
};

function stop() {
  var button = document.body.getElementsByClassName("stop")[0];
  var newButton = elt("button", "start");
  newButton.textContent = "Start";
  newButton.setAttribute("onclick", "start();");
  button.parentNode.replaceChild(newButton, button);
};
