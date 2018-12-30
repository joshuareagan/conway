

function makeBoard(x) {
  var wholeThing = [];
  for (var i = 0; i < x; i++) {
    var row = [];
    for (var j = 0; j < x; j++)
      row.push(false);
    wholeThing.push(row);
  };
  return wholeThing;
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
  var x = square[0];
  var y = square[1];

  if ( (liveNeighbors == 3) ||
       ((liveNeighbors == 2) && (board[x][y])) ) return true;
  return false;
};

function boardStep(board) {
  var len = board.length;
  var nextBoard = makeBoard(size);
  for (var i = 0; i < len; i++)
    for (var j = 0; j < len; j++)
      nextBoard[i][j] = squareStep(board, [i, j]);
  return nextBoard;
};

function makeAlive(board, square) {
  board[square[0]][square[1]] = true;
  return board;
};

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
  return table;
};

function cellSwitch(event) {
  var cell = event.target;
  if (cell.style.backgroundColor == "beige") {
    cell.style.backgroundColor = "gray"
  } else cell.style.backgroundColor = "beige";
};

function canEditTable() {
  table.addEventListener("click", cellSwitch);
};

function noEditTable() {
  table.removeEventListener("click", cellSwitch);
};

var size = 60;
var scale = 7;
var board = makeBoard(size);
var table = document.body.appendChild(makeTable(board));

canEditTable();

function printBoard(board) {
  var len = board.length;
  for (var i = 0; i < len; i++)
    console.log(board[i]);
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

function step() {
  board = boardStep(board);
  displayNewBoard(board);
};

function reset() {
  board = makeBoard(size);
  displayNewBoard(board);
  canEditTable();
};

function stepButton() {
  var stopped = document.body.getElementsByClassName("stop");
  if (stopped.length > 0) {
    stopButton();
  };
  board = tableRead(table);
  step();
  canEditTable();
};

function resetButton() {
  var stopped = document.body.getElementsByClassName("stop");
  if (stopped.length > 0) {
    stopButton();
  };
  reset();
};

function startButton() {
  var button = document.body.getElementsByClassName("start")[0];
  var newButton = elt("button", "stop");
  newButton.textContent = "Stop";
  newButton.setAttribute("onclick", "stopButton();");
  button.parentNode.replaceChild(newButton, button);
  noEditTable();
  board = tableRead(table);
  mainLoop();
};

function displayNewBoard(board) {
  table = makeTable(board);
  var oldTable = document.body.getElementsByClassName("playingboard")[0];
  document.body.replaceChild(table, oldTable);
};

function mainLoop() {
  var animate = document.body.getElementsByClassName("stop");
  if (animate.length > 0) {
    step();
    setTimeout(mainLoop, 2);
  };
};

function stopButton() {
  var button = document.body.getElementsByClassName("stop")[0];
  var newButton = elt("button", "start");
  newButton.textContent = "Start";
  newButton.setAttribute("onclick", "startButton();");
  button.parentNode.replaceChild(newButton, button);
  canEditTable();
};
