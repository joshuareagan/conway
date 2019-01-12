/* Conway's game of life
 *
 * Joshua Reagan
 *
 */

var conway = function() {
"use strict";

  // customizable constants
  const scale  =    4;                    // cell size (px)
  const height =   90;                    // number of grid rows
  const width  =  140;                    // number of grid columns
  const rand   =   30;                    // % of random live cells
  const liveColor = "cornflowerblue";     // color of living cells
  const deadColor = "beige";              // color of dead cells

  // game state
  /*
   * `boardState` is the object that stores the game board
   * and contains the core game logic.
   *
   * `uiState` is the object that controls the display
   * of the game board, as well as user input.  A simple 
   * table is used to represent the board.
  */
  const boardState = initBoardState();
  const library = new initLibrary();
  const uiState = initUiState();

  return uiState;

  // Beyond this point are the 2 object `init` functions. 

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
     * `next` updates the board by one turn and
     * produces an updated array of `changes`
     *
     * `reset` erases the game board; if passed 'false', 
     * then to a blank board.  If 'true', then a randomized 
     * board.
     *
     * `tableToBoard` takes input (in the form of a table)
     * and updates the game board state to match the input.
     */
    return { next, reset, update }

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

    function update(arrayUserChanges) {
      var len = arrayUserChanges.length;
      var x, y, alive;
      for (var i = 0; i < len; i++) {
        x = arrayUserChanges[i][0];
        y = arrayUserChanges[i][1];
        alive = !currentBoard[x][y][0];
        currentBoard[x][y][0] = alive;
        adjustNeighborCount(currentBoard, [x, y], alive);
      }

      return arrayUserChanges;
    }

    function next() {
      var nextBoard = addBumper(makeBoard(height, width));
      var alive, neighbors;
      changes = [];

      for (var x = 1; x <= height; x++) {
        for (var y = 1; y <= width; y++) {

          alive = currentBoard[x][y][0];
          neighbors = currentBoard[x][y][1];
          nextBoard[x][y][0] = ( (neighbors == 3) ||
                                 ((neighbors == 2) && (alive)) );
          nextBoard[x][y][1] += neighbors;

          if (alive != nextBoard[x][y][0]) {
            adjustNeighborCount(nextBoard, [x, y], nextBoard[x][y][0]);
            changes.push([x, y]);
          }
        }
      }

      currentBoard = nextBoard;
      return changes;
    }

    function reset(randomize) {
      var alive, rawRand;
      changes = [];

      for (var i = 1; i <= height; i++) {
        for (var j = 1; j <= width; j++) {
          if (randomize) {
            rawRand = Math.floor((Math.random() * 100) + 1);
            alive = rawRand > (100 - rand);
          }
          else alive = false;

          if (alive != currentBoard[i][j][0]) {
            adjustNeighborCount(currentBoard, [i, j], alive);
            changes.push([i, j]);
          }
          currentBoard[i][j][0] = alive;
        }
      }
      return changes;
    }

    function adjustNeighborCount(board, [x, y], birth) {
      for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
          if ( (x == i) && (y == j) ) continue;
          if (birth) board[i][j][1]++;
            else board[i][j][1]--;
        }
      }
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

  function initLibrary() {
    this.glider = [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]];
    this.pulsar = [[1, 2], [1, 4], [1, 6], [2, 1], [2, 3],
                  [2, 5], [2, 7], [3, 2], [3, 4], [3, 6]];
    this.gliderGun = [[3, 1], [3, 2], [4, 1], [4, 2], [3, 10],
                     [3, 11], [4, 9], [4, 11], [5, 9], [5, 10],
                     [1, 24], [1, 25], [2, 23], [2, 25], [3, 23],
                     [3, 24], [1, 35], [1, 36], [2, 35], [2, 36],
                     [5, 17], [5, 18], [6, 17], [6, 19], [7, 17],
                     [13, 25], [14, 25], [13, 26], [15, 26], [13, 27],
                     [8, 36], [9, 36], [10, 36], [8, 37], [9, 38]];
    this.supernova = [[1, 2], [2, 1], [2, 3], [3, 1], [3, 3],
                     [4, 1], [4, 3], [12, 1], [12, 3], [13, 1],
                     [13, 3], [14, 1], [14, 3], [15, 2]];
    this.tumbler = [[1, 2], [1, 3], [1, 5], [1, 6], [2, 2], [2, 3],
                   [2, 5], [2, 6], [3, 3], [3, 5], [4, 1], [4, 3],
                   [4, 5], [4, 7], [5, 1], [5, 3], [5, 5], [5, 7],
                   [6, 1], [6, 2], [6, 6], [6, 7]];
    this.spaceship = [[1, 4], [2, 5], [3, 1], [3, 5], [4, 2],
                     [4, 3], [4, 4], [4, 5]];
    this.ten = [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
               [1, 7], [1, 8], [1, 9], [1, 10]];
    this.toadPusher = [[2, 2], [2, 3], [1, 4], [3, 4], [2, 5], [2, 6],
                      [2, 7], [2, 8], [1, 9], [3, 9], [2, 10], [2, 11],
                      [9, 6], [9, 7], [9, 8], [10, 5], [10, 6], [10, 7],
                      [17, 1], [17, 2], [16, 3], [18, 3], [17, 4],
                      [17, 5], [17, 6], [17, 7], [16, 8], [18, 8],
                      [17, 9], [17, 10]];
    this.puffer = [[1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10],
                  [2, 3], [2, 4], [2, 10], [3, 1], [3, 2], [3, 4],
                  [3, 10], [4, 5], [4, 9], [5, 7], [6, 7], [6, 8],
                  [7, 6], [7, 7], [7, 8], [7, 9], [8, 6], [8, 7],
                  [8, 9], [8, 10], [9, 8], [9, 9]];
    this.bigPuffer = [[1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
                     [2, 2], [2, 8], [3, 8], [4, 7], [18, 1], [17, 2],
                     [17, 3], [17, 4], [17, 5], [17, 6], [18, 6],
                     [19, 6], [20, 5], [10, 6], [10, 7], [9, 8], [9, 9],
                     [10, 9], [11, 10], [8, 10], [8, 11], [8, 12],
                     [8, 13], [8, 14], [8, 15], [9, 15], [10, 15],
                     [11, 14], [12, 12], [13, 12], [13, 13], [14, 11],
                     [14, 12], [14, 13], [14, 14], [15, 11], [15, 12], 
                     [15, 14], [15, 15], [16, 13], [16, 14]];
    this.bigShip = [[1, 12], [1, 13], [1, 14], [2, 14], [3, 13], [3, 9],
                   [3, 10], [4, 9], [4, 10], [5, 13], [5, 14], [6, 12],
                   [6, 13], [7, 11], [7, 14], [9, 12], [10, 12],
                   [11, 11], [11, 10], [11, 9], [9, 9], [10, 8],
                   [11, 7], [12, 6], [13, 6], [14, 7], [16, 8], [16, 9],
                   [17, 9], [18, 10], [18, 11], [19, 11], [20, 13],
                   [21, 14], [21, 15], [20, 16], [19, 17], [18, 18],
                   [18, 16], [17, 16], [16, 16], [15, 17], [15, 18],
                   [13, 20], [13, 22], [14, 21], [14, 22], [15, 21],
                   [16, 20], [17, 23], [17, 24], [18, 23], [18, 24],
                   [14, 24], [13, 25], [13, 26], [14, 26], [15, 26],
                   [16, 1], [15, 2], [15, 3], [16, 4], [16, 5], [17, 6],
                   [19, 3], [19, 7], [20, 7], [20, 8], [21, 4], [21, 2],
                   [22, 1], [22, 2], [23, 6], [24, 8], [25, 5], [25, 6],
                   [26, 5], [26, 11], [25, 12], [24, 12], [23, 11],
                   [22, 11], [21, 10]];

    var self = this;
    this.get = function(pattern) {
      var maxX = 1;
      var maxY = 1;
      var minX = height;
      var minY = width;

      self[pattern].forEach(function(point) {
                        if (point[0] > maxX) maxX = point[0];
                        if (point[0] < minX) minX = point[0];
                        if (point[1] > maxY) maxY = point[1];
                        if (point[1] < minY) minY = point[1];
                      });
      var patternHeight = (maxX - minX) + 1;
      var patternWidth = (maxY - minY) + 1;
      var adjustHeight = Math.floor((height - patternHeight) / 2);
      var adjustWidth = Math.floor((width - patternWidth) / 2);
      return self[pattern].map(function(point) {
                           var x = point[0] + adjustHeight;
                           var y = point[1] + adjustWidth;
                           return [x, y];
                         });
   }
   // return { glider, pulsar, toadPusher, bigShip, gliderGun, ten, puffer, bigPuffer, tumbler, spaceship, supernova, center };
  }

  /* this function produces the object that handles board
   * display (as a table) and user modification to the 
   * board.
   */
  function initUiState() {
    var running = false;

    const generations = new function() {
      var genNode = document.getElementById("Generation");
      var gens = 0;
      this.reset = function() {
        gens = 0;
        genNode.innerHTML = gens;
      }
      this.inc = function() {
        genNode.innerHTML = ++gens;
      }
    }

    const userInput = new function() {
      var table = makeTable();
      var placeHolder = document.getElementById("tableGoesHere");
      placeHolder.parentNode.replaceChild(table, placeHolder);
      table.addEventListener("click", add);

      var dropDown = document.getElementById("select");
      dropDown.addEventListener("input", function(event) {
                                      var pattern = event.target.value;
                                      if (pattern != "null")
                                        displayPattern(pattern);
                                    });

      var speed = 500;
      var slider = document.getElementById("Speed");
      slider.addEventListener("input", function(event) {
                                         speed = event.target.value;
                                       });
      var self = this;
      self.changes = [];
      return { get, add, delay };

      function get() {
        var all = self.changes;
        self.changes = [];
        return all;
      }

      function add(event) {
        if (!running) {
          var y = event.target.cellIndex + 1;
          var x = event.target.parentNode.rowIndex + 1;
          if ( (x) && (y) ) {
            self.changes.push([x, y]);
            var cell = event.target;
            cellSwitch(cell);
            generations.reset();
          }
        }
      }

      function delay() {
        return speed;
      }

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
    }

    const buttonSwitch = new function() {
      var startButton = document.getElementById("Start");
      var stopButton = document.createElement("button");
          stopButton.id = "Stop";
          stopButton.textContent = "Stop";
          stopButton.setAttribute("onclick", "conway.clickStop();");
      return function() {
        if (running) {
          stopButton.parentNode.replaceChild(startButton, stopButton);
        }
        else {
          startButton.parentNode.replaceChild(stopButton, startButton);
        }
        running = !running;
      }
    }

    var display = new function() {
      var cells = document.body.getElementsByClassName("cell");

      return function(changes) {
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

    function displayPattern(pattern) {
      clickReset(false);
      display(boardState.update(library.get(pattern)));
    }

    function cellSwitch(cell) {
      if (cell.style.backgroundColor == deadColor) {
        cell.style.backgroundColor = liveColor
      }
      else cell.style.backgroundColor = deadColor;
    }

    return { clickStart, clickStop, clickStep, clickReset };

    function clickStart() {
      buttonSwitch();
      boardState.update(userInput.get());
      mainLoop();

      // upon "Start" this is the main loop of the program
      function mainLoop() {
        if (running) {
          step();
          setTimeout(function() {
            requestAnimationFrame(mainLoop);
          }, userInput.delay());
        }
      }
    }

    function step() {
      var changes = boardState.next();
      if (!changes.length) clickStop();
        else {
          display(changes);
          generations.inc();
        }
    }

    function clickStop() {
      if (running) buttonSwitch();
    }

    function clickStep() {
      clickStop();
      boardState.update(userInput.get());
      step();
    }

    function clickReset(randomize) {
      clickStop();
      boardState.update(userInput.get());
      var changes = boardState.reset(randomize);
      generations.reset();
      display(changes);
    }
  }
}();
