/* Conway's game of life
 *
 * Joshua Reagan
 *
 */

var conway = function() {
"use strict";

  // customizable values
  const scale  =   6;                     // cell size (px)
  const height =  65;                     // number of grid rows
  const width  =  90;                     // number of grid columns
  const liveColor = "cornflowerblue";     // color of living cells
  const deadColor = "beige";              // color of dead cells

  // game state
  /*
   * `boardState` is the object that stores the game board
   * and contains the core game logic.
   *
   * `tableState` is the object that controls the display
   * of the game board, as well as user input.  A simple 
   * table is used.
   *
   * `buttonState` is an object that controls which UI tools
   * (buttons and slider) are available to the user and what 
   * their state is.
   */
  var boardState = initBoardState();
  var tableState = initTableState();
  var buttonState = new initButtonState();
    
  // APIs to be used by buttons from conway.html
  return { clickStart, clickStop, clickStep, clickReset };

  function clickStart() {
    buttonState.startButtonIn(false);
    tableState.edit(false);
    boardState.tableToBoard(tableState.table);
    mainLoop();

    // upon "Start" this is the main loop of the program
    function mainLoop() {
      if (buttonState.running) {
        setTimeout(function() {
          requestAnimationFrame(mainLoop);
          step();
        }, buttonState.delay);
      }
    }
  }

  function step() {
    var changes = boardState.stepBoard();
    if ( buttonState.running && !changes.length ) {
      clickStop();
    }
    tableState.display(changes);
  }

  function clickStop() {
    buttonState.startButtonIn(true);
    tableState.edit(true);
  }

  function clickStep() {
    if (buttonState.running) clickStop();
    boardState.tableToBoard(tableState.table);
    step();
  }

  function clickReset() {
    if (buttonState.running) clickStop();
    boardState.blank();
    tableState.blank();
  }

  // Beyond this point are the 3 object `init` functions. 

  /* this function creates the object used to maintain
   * core game data state.
   */
  function initBoardState() {

    // core game data state
    /*
     * `currentBoard` is a 2D array of the game board. 
     * Each cell has data for (i) whether it's alive,
     * and (ii) how many live neighbors it has.
     *
     * `changes` is an array of changes from the last 
     * update to the board.
     */
    var currentBoard = addBumper(makeBoard(height, width));
    var changes;
   
    // methods for modifying core game data state
    /*
     * `stepBoard` updates the board by one turn and
     * produces an updated array of `changes`
     *
     * `blank` erases the game board.
     *
     * `tableToBoard` takes input (in the form of a table)
     * and updates the game board state to match the input.
     */
    return { stepBoard, blank, tableToBoard }

    function stepBoard() {
      var nextBoard = addBumper(makeBoard(height, width));
      changes = [];

      for (var i = 1; i <= height; i++) {
        for (var j = 1; j <= width; j++) {
          squareStep(currentBoard, nextBoard, [i, j]);
        }
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
      var cells = document.body.getElementsByClassName("cell"); 
   
      for (var i = 1; i <= height; i++) {
        for (var j = 1; j <= width; j++) {
          var cell = cells[k];
          var liveCell = (cell.style.backgroundColor == liveColor);

          if (liveCell != currentBoard[i][j][0]) {
            adjustNeighborCount(currentBoard, [i, j], liveCell);
          }

          currentBoard[i][j][0] = liveCell;
          k++;
        }
      }
      return currentBoard;
    }

    function adjustNeighborCount(board, spot, birth) {
      var x = spot[0];
      var y = spot[1];

      for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
          if ( (x == i) && (y == j) ) continue;
          if (birth) board[i][j][1]++;
            else board[i][j][1]--;
        }
      }
      return board;
    }

    function makeBoard(height, width) {
      var board = [];

      for (var i = 0; i < height; i++) {
        var row = [];
        for (var j = 0; j < width; j++) {
          row.push([false, 0]);
        }
        board.push(row);
      }
      return board;
    }

    function squareStep(lastBoard, nextBoard, spot) {
      var x = spot[0];
      var y = spot[1];
      var alive = lastBoard[x][y][0];
      var neighbors = lastBoard[x][y][1];

      nextBoard[x][y][0] = ( (neighbors == 3) ||
                             ((neighbors == 2) && (alive)) );
      nextBoard[x][y][1] += neighbors;

      if (alive != nextBoard[x][y][0]) {
        adjustNeighborCount(nextBoard, spot, nextBoard[x][y][0]);
        changes.push(spot);
      }

      return nextBoard;
    }

    /* `addBumper` adds a layer of cells around the whole 
     * board to make the board 'toroidal' -- i.e., when cells
     * 'reach' the edge, they travel to the to the opposite 
     * side like in the game pac-man.
     */ 
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

  /* this function produces the object that handles board
   * display (as a table) and user modification to the 
   * board.
   */
  function initTableState() {
    var table = makeTable();
    var cells = document.body.getElementsByClassName("cell");
    document.body.appendChild(table);
    edit(true);

    // methods for modifying table state
    /*
     * `edit` controls whether the user may modify
     * the table state by clicking cells with the mouse.
     *
     * `display` takes an array of changes and modifies
     * the table to display the new game board state.
     *
     * `table` is exposed so that it can be used to modify 
     * the core game state, in response to user changes.
     *
     * `blank` erases the table, making it blank.
     */
    return { edit, display, table, blank }

    function makeTable() {
      var table = elemClass("table", "playingboard");
      for (var i = 0; i < height; i++) {
        var row = elemClass("tr");
        table.appendChild(row);
        for (var j = 0; j < width; j++) {
          var cell = elemClass("td", "cell");
          cell.style.width = scale + "px";
          cell.style.height = scale + "px";
          cell.style.backgroundColor = deadColor;
          table.childNodes[i].appendChild(cell);
        }
      }
      return table;

      function elemClass(name, className) {
        var elem = document.createElement(name);
        if (className) elem.className = className;
        return elem;
      }
    }

    function blank() {
      var newTable = makeTable();
      table.parentNode.replaceChild(newTable, table);
      table = newTable;
      edit(true);
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

    function cellSwitch(cell) {
      if (cell.style.backgroundColor == deadColor) {
        cell.style.backgroundColor = liveColor
      } else cell.style.backgroundColor = deadColor;
    }

    function edit(mayEdit) {
      if (mayEdit) {
        table.addEventListener("click", _clickCellSwitch);
      }
      else {
        table.removeEventListener("click", _clickCellSwitch);
      }
    } 

    function _clickCellSwitch(event) {
      var cell = event.target;
      cellSwitch(cell);
    }
  }

  /* This function produces the object that governs "button 
   * state", i.e., which of the two buttons is visible: "Start"
   * or "Stop".
   */
  function initButtonState() {
    // button state APIs
    /* `this.running` is a boolean -- is the game running?
     *
     * `this.delay` determines game speed. The delay is 
     * measured in ms. delay is controlled by a range 
     * slider.
     *
     * `startButtonIn` is a method that takes a boolean. 
     *  Which button should be visible?
     */
    this.running = false;
    var slider = document.getElementById("Speed");
    this.delay = slider.value;
    var myself = this;
    slider.addEventListener("input", function() {
                                       myself.delay = slider.value;
                                     });

    var startButton = document.getElementById("Start");
    var stopButton = document.createElement("button");
    stopButton.id = "Stop";
    stopButton.textContent = "Stop";
    stopButton.setAttribute("onclick", "conway.clickStop();");

    this.startButtonIn = function(a) {
      this.running = !a;
      if (a) {
        stopButton.parentNode.replaceChild(startButton, stopButton);
      }
      else {
        startButton.parentNode.replaceChild(stopButton, startButton);
      }
    }
  }
}();
