/* Conway's game of life
 *
 * There are three main sections of the code (plus change).
 * (1) The logic of the game board state, defined in class 
 * Board; (2) the library of preset game states, defined in 
 * class Library; and (3) the UI related functions and APIs,
 * defined in the function initUiState().
 *
 */

var conway = function() {
"use strict";

    // Customizable constants
    const SCALE  =    6;                    // cell size (px)
    const HEIGHT =   70;                    // number of grid rows
    const WIDTH  =  110;                    // number of grid columns
    const RAND   =   30;                    // % of random live cells
    const LIVECOLOR = "darkcyan";           // color of living cells
    const DEADCOLOR = "white";              // color of dead cells

    // classes

    class Square {
        /*
         * This class is for each 'square' or
         * cell of the gameboard. Keeps track of
         * life state (boolean) and # of living
         * neighbors
        */
        constructor(alive, neighbors) {
            this.alive = alive;
            this.neighbors = neighbors;
        }
    }

    class Board {
        /*
         * Class for making an object which stores the
         * current game state. Includes methods for 
         * resetting, updating, and stepping game 
         * state: reset(), update(), and next().
        */
        constructor() {
            this.board = this._makeBoard();
        }

        _makeBoard() {
            /*
             * Make a fresh game board. Each board is 
             * a 2D array. Each value in the array is 
             * a pair of [living, # of living neighbors].
            */
            var board = [];

            for (var i = 0; i < HEIGHT; i++) {
                var row = [];
                for (var j = 0; j < WIDTH; j++) {
                    var square = new Square(false, 0);
                    row.push(square);
                }
                board.push(row);
            }
            return this._addBumper(board);
        }

        _addBumper(board) {
            /*
             * Put a 'bumper' around the 2D array
             * in order to produce toroidal effect.
            */
            var height = HEIGHT;
            var width = WIDTH;
            var topLeft = board[0][0];
            var topRight = board[0][width-1];
            var bottomLeft = board[height-1][0];
            var bottomRight = board[height-1][width-1];

            // top
            var newTop = [];
            newTop.push(bottomRight);
            for (var i = 0; i < width; i++) {
                newTop.push(board[height-1][i]);
            }
            newTop.push(bottomLeft);
            board.unshift(newTop);

            // bottom
            var newBottom = [];
            newBottom.push(topRight);
            for (var i = 0; i < width; i++) {
                newBottom.push(board[1][i]);
            }
            newBottom.push(topLeft);
            board.push(newBottom);

            // sides
            for (var i = 1; i <= height; i++) {
                board[i].unshift(board[i][width-1]);
                board[i].push(board[i][1]);
            }

            return board;
        }

      reset(randomize) {
          /*
           * Reset the board. If randomize is 
           * true, randomly distribute living 
           * cells over the board. Returns an 
           * array of changes.
          */
          var alive, rawRand;
          var changes = [];

          for (var i = 1; i <= HEIGHT; i++) {
              for (var j = 1; j <= WIDTH; j++) {
                  if (randomize) {
                      rawRand = Math.floor((Math.random() * 100) + 1);
                      alive = rawRand > (100 - RAND);
                  }
                  else alive = false;

                  if (alive != this.board[i][j].alive) {
                      this.adjust_n(this.board, [i, j], alive);
                      changes.push([i, j]);
                  }
                  this.board[i][j].alive = alive;
              }
          }
          return changes;
      }

      update(changes) {
          /*
           * Given an array of changes, update
           * the board.
          */
          var len = changes.length;
          var x, y, alive;

          for (var i = 0; i < len; i++) {
              x = changes[i][0];
              y = changes[i][1];
              alive = !this.board[x][y].alive;
              this.board[x][y].alive = alive;
              this._adjust_n(this.board, [x, y], alive);
          }
          return changes;
      }

      _adjust_n(board, [x, y], birth) {
          /*
           * Given a board, a cell, and a boolean,
           * adjust the neighbor count of all 
           * surrounding cells on that board.
          */
          for (var i = x - 1; i <= x + 1; i++) {
              for (var j = y - 1; j <= y + 1; j++) {
                  if ( (x == i) && (y == j) ) continue;
                  if (birth) board[i][j].neighbors++;
                      else board[i][j].neighbors--;
              }
          }
      }

      next() {
          /*
           * Advances the board state by one step.
          */
          var nextBoard = this._makeBoard();
          var neighbors, old_alive, new_alive;
          var changes = [];

          for (var x = 1; x <= HEIGHT; x++) {
              for (var y = 1; y <= WIDTH; y++) {

                  // Copy over # of living neighbors
                  neighbors = this.board[x][y].neighbors;
                  nextBoard[x][y].neighbors += neighbors;

                  // Check whether new cell is living
                  old_alive = this.board[x][y].alive;
                  new_alive = ( (neighbors == 3) ||
                                ((neighbors == 2) && (old_alive)) );
                  nextBoard[x][y].alive = new_alive

                  // If cell changes state, adjust neighbor 
                  // counts and record the change.
                  if (old_alive != new_alive) {
                      this._adjust_n(nextBoard, [x, y], new_alive);
                      changes.push([x, y]);
                  }
              }
          }

          this.board = nextBoard;
          return changes;
        }
    }

    class Library {
        /*
         * This class creates an object with preset
         * board patterns, recorded as an array of living
         * cell locations. The get() method centers the 
         * pattern on the board.
        */
        constructor() {
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
          this.lobster = [[1, 12], [1, 13], [1, 14], [2, 14], [3, 13], [3, 9],
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
        }

      get(pattern) {
          /* 
           * Returns a list of changes corresponding to
           * a requested preset pattern on the gameboard.
           * The pattern is centered.
          */

          // First, find the size of the pattern.
          var maxX = 1;
          var maxY = 1;
          var minX = HEIGHT;
          var minY = WIDTH;
          this[pattern].forEach((point) => {
                                  if (point[0] > maxX) maxX = point[0];
                                  if (point[0] < minX) minX = point[0];
                                  if (point[1] > maxY) maxY = point[1];
                                  if (point[1] < minY) minY = point[1];
                                });

          // Next, center the pattern based on
          // pattern size and return.
          var patternHeight = (maxX - minX) + 1;
          var patternWidth = (maxY - minY) + 1;
          var adjustHeight = Math.floor((HEIGHT - patternHeight) / 2);
          var adjustWidth = Math.floor((WIDTH - patternWidth) / 2);
          return this[pattern].map((point) => {
                                     var x = point[0] + adjustHeight;
                                     var y = point[1] + adjustWidth;
                                     return [x, y];
                                   });
        }
    }

    /*
     * Three objects instantiated: (1) board, for the
     * game board state, (2) library for the library
     * of preset patterns, and (3) uiState for user
     * interface APIs. The latter is returned to expose
     * its APIs.
    */


    var board = new Board();
    var library = new Library();
    var uiState = initUiState();

    return uiState;

    function initUiState() {
        /* 
         * This function produces the object that handles board
         * display (as a table) and user modification to the
         * board.
        */

        // Boolean state: is the game running?
        var running = false;

        const generations = new function() {
            /*
             * Makes an object for tracking, displaying,
             * and modifying the number of generations 
             * since the game started.
            */
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
            /*
             * Makes an object that handles user input.
            */

            // The display is just a table!
            var table = makeTable();
            var placeHolder = document.getElementById("tableGoesHere");
            placeHolder.parentNode.replaceChild(table, placeHolder);
            table.addEventListener("click", add);

            // Use the dropdown to select a preset pattern.
            var dropDown = document.getElementById("select");
            dropDown.addEventListener("input", function(event) {
                                            var pattern = event.target.value;
                                            if (pattern != "null")
                                              displayPattern(pattern);
                                          });

            // Slider controls game speed.
            var speed = 400;
            var slider = document.getElementById("Speed");
            slider.addEventListener("input", function(event) {
                                               var raw = event.target.value;
                                               if (raw == 0) speed = 0;
                                               else {
                                                 speed = 25 *
                                                      Math.pow(2, raw-1);
                                               }
                                             });
            var self = this;
            self.changes = [];
            return { get, add, delay };

            function get() {
                /*
                 * Return all changes made as a result
                 * of the user clicking on the table cells.
                */
                var all = self.changes;
                self.changes = [];
                return all;
            }

            function add(event) {
                /*
                 * User has clicked on a table cell.
                 * Flop the state and reset generation
                 * counter.
                */
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
                /*
                 * Create the HTML table for the game board.
                */
                var table = elemClass("table", "playingboard");
                for (var i = 0; i < HEIGHT; i++) {
                    var row = elemClass("tr");
                    table.appendChild(row);
                    for (var j = 0; j < WIDTH; j++) {
                        var cell = elemClass("td", "cell");
                        cell.style.width = SCALE + "px";
                        cell.style.height = SCALE + "px";
                        cell.style.backgroundColor = DEADCOLOR;
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
            /*
             * When user clicks 'Start', replace that button
             * with a 'Stop' button. And vice versa.
            */
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
            /*
             * Create an object to display updates to
             * the table.
            */

            var cells = document.body.getElementsByClassName("cell");

            return function(changes) {
                /*
                 * Take an array of changes and switch
                 * those cells in the table.
                */
                var len = changes.length;
                var x, y, needle;

                for (var i = 0; i < len ; i++) {
                    x = changes[i][0] - 1;
                    y = changes[i][1] - 1;
                    needle = y + (WIDTH * x);
                    cellSwitch(cells[needle]);
                }
            }
        }

        function displayPattern(pattern) {
            // Display a preset pattern.
            clickReset(false);
            display(board.update(library.get(pattern)));
        }

        function cellSwitch(cell) {
            // Switch a cell's life state in the table.
            if (cell.style.backgroundColor == DEADCOLOR) {
                cell.style.backgroundColor = LIVECOLOR
            }
            else cell.style.backgroundColor = DEADCOLOR;
        }

        // APIs for the buttons of the user interface.
        return { clickStart, clickStop, clickStep, clickReset };

        function clickStart() {
            // Start the game!
            buttonSwitch();
            board.update(userInput.get());
            mainLoop();

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
            // Advance board by one step.
            var changes = board.next();
            if (!changes.length) clickStop();
            else {
                display(changes);
                generations.inc();
            }
        }

        function clickStop() {
            // Stop the game.
            if (running) buttonSwitch();
        }

        function clickStep() {
            clickStop();
            board.update(userInput.get());
            step();
        }

        function clickReset(randomize) {
            // Reset game, maybe randomize it.
            clickStop();
            board.update(userInput.get());
            var changes = board.reset(randomize);
            generations.reset();
            display(changes);
        }
    }
}();
