function initBoardState(size) {

  var currentBoard = addBumper(makeBoard(size));
  var boardAPIs = {
    stepBoard, blank, tableToBoard
  }

  return boardAPIs;

  function stepBoard() {
    var newBoard = makeBoard(size);
    console.log(currentBoard);

    for (var i = 0; i < size; i++)
      for (var j = 0; j < size; j++) {
        newBoard[i][j][0] = squareStep(currentBoard, [i+1, j+1]);
        if (newBoard[i][j][0] && !currentBoard[i+1][j+1][0]) {
          cellChange(currentBoard, [i+1, j+1], true);
          newBoard[i][j][1] = currentBoard[i+1][j+1][1];
        }
        if (!newBoard[i][j][0] && currentBoard[i+1][j+1][0]) {
          cellChange(currentBoard, [i+1, j+1], false);
          newBoard[i][j][1] = currentBoard[i+1][j+1][1];
        }
      }
    currentBoard = addBumper(newBoard);
    return currentBoard;
  }

  function blank() {
    currentBoard = addBumper(makeBoard(size));
    return currentBoard;
  }

  function tableToBoard(table) {
    var k = 0;
    for (var i = 1; i <= size; i++) {
      for (var j = 1; j <= size; j++) {
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

  function cellChange(currentBoard, spot, birth) {
    var x = spot[0];
    var y = spot[1];
    var result;

    for (var i = x - 1; i <= x + 1; i++) {
      for (var j = y - 1; j <= y + 1; j++) {
        if ( (x == i) && (y == j) ) continue;
        if (birth) {
          currentBoard[i][j][1]++;
        }
        else {
          currentBoard[i][j][1]--;
        }
      }
    }
  }

  function makeBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++)
        row.push([false, 0]);
      board.push(row);
    }
    return board;
  }

  function squareStep(board, square) {
    var x = square[0];
    var y = square[1];
    var alive = board[x][y][0];
    var liveNeighbors = board[x][y][1];  // identifyNeighbors(board, square);

    if ( (liveNeighbors == 3) ||
         ((liveNeighbors == 2) && (alive)) ) return true;
    return false;
  }

  function addBumper(board) {
    var topLeft = board[0][0];
    var topRight = board[0][size-1];
    var bottomLeft = board[size-1][0];
    var bottomRight = board[size-1][size-1];

    var newTop = [];
    newTop.push(bottomRight);
    for (var i = 0; i < size; i++) {
      newTop.push(board[size-1][i]);
    }
    newTop.push(bottomLeft);
    board.unshift(newTop);

    var newBottom = [];
    newBottom.push(topRight);
    for (var i = 0; i < size; i++) {
      newBottom.push(board[1][i]);
    }
    newBottom.push(topLeft);
    board.push(newBottom);

    for (var i = 1; i <= size; i++) {
      board[i].unshift(board[i][size-1]);
      board[i].push(board[i][1]);
    }

    return board;
  }
}

function initTableState(scale) {

  var table = makeTable(boardState.stepBoard());
  document.body.appendChild(table);
  edit(true);

  var tableAPIs = {
    edit, display, table
  }
  return tableAPIs;

  function makeTable(board) {
    len = board.length-2;
    var table = elemClass("table", "playingboard");
    for (var i = 0; i < len; i++) {
      var row = elemClass("tr");
      table.appendChild(row);
      for (var j = 0; j < len; j++) {
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

  function cellSwitch(event) {
    var cell = event.target;
    if (cell.style.backgroundColor == "beige") {
      cell.style.backgroundColor = "gray"
    } else cell.style.backgroundColor = "beige";
  }

  function edit(mayEdit) {
    if (mayEdit) {
      table.addEventListener("click", cellSwitch);
    }
    else {
      table.removeEventListener("click", cellSwitch);
    }
  }

  function display(board) {
    table = makeTable(board);
    var oldTable = document.body.getElementsByClassName("playingboard")[0];
    document.body.replaceChild(table, oldTable);
  }
}

var scale = 7;
var size = 6;
var boardState = initBoardState(size);
var tableState = initTableState(scale);

function step() {
  var board = boardState.stepBoard();
  tableState.display(board);
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
  var board = boardState.blank();
  tableState.display(board);
  tableState.edit(true);
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
    setTimeout(mainLoop, 250);
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
