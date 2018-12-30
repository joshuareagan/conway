function initBoardState(height, width) {

  var currentBoard = addBumper(makeBoard(height, width));
  var changes = [];
  var boardAPIs = {
    stepBoard, blank, tableToBoard
  }

  return boardAPIs;

  function stepBoard() {
    var nextBoard = addBumper(makeBoard(height, width));
    changes = [];

    for (var i = 1; i <= height; i++)
      for (var j = 1; j <= width; j++) {
        squareStep(currentBoard, nextBoard, [i, j]);
      }

    currentBoard = nextBoard;
    return changes;
  }

  function blank() {
    currentBoard = addBumper(makeBoard(height, width));
    return currentBoard;
  }

  function tableToBoard(table) {
    var k = 0;
    for (var i = 1; i <= height; i++) {
      for (var j = 1; j <= width; j++) {
        var cell = document.body.getElementsByClassName("cell")[k];
        if (cell.style.backgroundColor == "beige") {
          if (currentBoard[i][j][0]) cellChange(currentBoard, [i, j], false);
          currentBoard[i][j][0] = false;
        }
        else {
          if (!currentBoard[i][j][0]) cellChange(currentBoard, [i, j], true)
          currentBoard[i][j][0] = true;
        }
        k++;
      }
    }
    return currentBoard;
  }

  function cellChange(board, spot, birth) {
    var x = spot[0];
    var y = spot[1];

    for (var i = x - 1; i <= x + 1; i++) {
      for (var j = y - 1; j <= y + 1; j++) {
        if ( (x == i) && (y == j) ) continue;
        if (birth) {
          board[i][j][1]++;
        }
        else {
          board[i][j][1]--;
        }
      }
    }
    return board;
  }

  function makeBoard(height, width) {
    var board = [];
    for (var i = 0; i < height; i++) {
      var row = [];
      for (var j = 0; j < width; j++)
        row.push([false, 0]);
      board.push(row);
    }
    return board;
  }

  function squareStep(lastBoard, nextBoard, spot) {
    var x = spot[0];
    var y = spot[1];
    var alive = lastBoard[x][y][0];
    var liveNeighbors = lastBoard[x][y][1];
    nextBoard[x][y][1] += lastBoard[x][y][1];

    if ( (liveNeighbors == 3) ||
         ((liveNeighbors == 2) && (alive)) ) {
      if (!alive) {
        cellChange(nextBoard, spot, true);
        changes.push(spot);
      } 
      nextBoard[x][y][0] = true;  
    }
    else {
      if (alive) {
        cellChange(nextBoard, spot, false);
        changes.push(spot);
      }
      nextBoard[x][y][0] = false;
    }
  return nextBoard;
  }

  function addBumper(board) {
    var topLeft = board[0][0];
    var topRight = board[0][width-1];
    var bottomLeft = board[height-1][0];
    var bottomRight = board[height-1][width-1];

    var newTop = [];
    newTop.push(bottomRight);
    for (var i = 0; i < width; i++) {
      newTop.push(board[height-1][i]);
    }
    newTop.push(bottomLeft);
    board.unshift(newTop);

    var newBottom = [];
    newBottom.push(topRight);
    for (var i = 0; i < width; i++) {
      newBottom.push(board[1][i]);
    }
    newBottom.push(topLeft);
    board.push(newBottom);

    for (var i = 1; i <= height; i++) {
      board[i].unshift(board[i][width-1]);
      board[i].push(board[i][1]);
    }

    return board;
  }
}

function initTableState(scale) {

  var table = makeTable(boardState.blank());
  document.body.appendChild(table);
  edit(true);
  var cells = document.body.getElementsByClassName("cell");

  var tableAPIs = {
    edit, display, table, blank
  }
  return tableAPIs;

  function makeTable(board) {
    var table = elemClass("table", "playingboard");
    for (var i = 0; i < height; i++) {
      var row = elemClass("tr");
      table.appendChild(row);
      for (var j = 0; j < width; j++) {
        var cell = elemClass("td", "cell");
        cell.style.width = scale + "px";
        cell.style.height = scale + "px";
        if (board[i+1][j+1][0]) cell.style.backgroundColor = "gray";
          else cell.style.backgroundColor = "beige";
        table.childNodes[i].appendChild(cell);
      }
    }
    return table;
  }

  function blank() {
    newTable = makeTable(boardState.blank());
    table.parentNode.replaceChild(newTable, table);
    table = newTable;
    edit(true);
    cells = document.body.getElementsByClassName("cell");
  }

  function clickCellSwitch(event) {
    var cell = event.target;
    cellSwitch(cell);
  }

  function cellSwitch(cell) {
    if (cell.style.backgroundColor == "beige") {
      cell.style.backgroundColor = "gray"
    } else cell.style.backgroundColor = "beige";
  }

  function edit(mayEdit) {
    if (mayEdit) {
      table.addEventListener("click", clickCellSwitch);
    }
    else {
      table.removeEventListener("click", clickCellSwitch);
    }
  }

  function display(changes) {
    var len = changes.length;
    var x, y, needle;

    for (var i = 0; i < len ; i++) {
      x = changes[i][0] - 1;
      y = changes[i][1] - 1;
      needle = y + (width * x);
      cellSwitch(cells[needle]);
    }
  }
}

var scale = 7;
// var size = 60;
var height = 20;
var width = 30;
var delay = 300;
var boardState = initBoardState(height, width);
var tableState = initTableState(scale);

function step() {
  var changes = boardState.stepBoard();
  tableState.display(changes);
}

function stepButton() {
  var stopped = document.body.getElementsByClassName("stop");
  if (stopped.length > 0) {
    stopButton();
  }
  boardState.tableToBoard(tableState.table);
  step();
  tableState.edit(true);
}

function resetButton() {
  var stopped = document.body.getElementsByClassName("stop");
  if (stopped.length > 0) {
    stopButton();
  }
  tableState.blank();
}

function startButton() {
  var button = document.body.getElementsByClassName("start")[0];
  var newButton = elemClass("button", "stop");
  newButton.textContent = "Stop";
  newButton.setAttribute("onclick", "stopButton();");
  button.parentNode.replaceChild(newButton, button);
  tableState.edit(false);
  boardState.tableToBoard(tableState.table);
  mainLoop();
}

function mainLoop() {
  var animate = document.body.getElementsByClassName("stop");
  if (animate.length > 0) {
    step();
    setTimeout(mainLoop, delay);
  }
}

function stopButton() {
  var button = document.body.getElementsByClassName("stop")[0];
  var newButton = elemClass("button", "start");
  newButton.textContent = "Start";
  newButton.setAttribute("onclick", "startButton();");
  button.parentNode.replaceChild(newButton, button);
  tableState.edit(true);
}

  function elemClass(name, className) {
    var elem = document.createElement(name);
    if (className) elem.className = className;
    return elem;
  }
