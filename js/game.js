/* jslint browser: true*/
/* global  $*/
$(function() {
    "use strict";
    // make an array of arrays that will
    // (correspond to the grid that the user sees)
    // and fill them with zeroes
    /**
     * @param {number} rowWidth
     * @param {number} columnHeight
     * @return {array}
     */
    function makeMatrix(size) {
        const matrix = [];
        let i = 0;
        let j = 0;
        while (i < size) {
            matrix[i] = [];
            while (j < size) {
                matrix[i][j] = 0;
                j += 1;
            }
            i += 1;
            j = 0;
        }
        return matrix;
    }
    let dataMatrix = makeMatrix(20);

    // the matrix
    const matrixNode = (function() {
        const pixelCanvas = $("#pixel_canvas");
        let mouseDown;
        pixelCanvas.on("mousedown", function() {
            mouseDown = true;
            return false;
        });
        $("body").on("mouseup", function() {
            mouseDown = false;
        });

        const cellCoord = function(cell) {
            "use strict";
            const coord = cell.querySelector(".coord");
            const arr = coord.textContent.split(" ");
            return arr;
        };

        // position is a classList split at "-"
        // position[1] is row. position[2] is column
        /**
         * @param {array} cellArray
         * @param {number} alive
         */
        function updateMatrix(cellArray, alive = 1) {
            const rowWidth = cellArray[0];
            const columnHeight = cellArray[1];
            dataMatrix[rowWidth][columnHeight] = alive;
        }

        pixelCanvas.on("click", "td", function(e) {
            const currentColor = $(e.target).css("background-color");

            // current cell will change color

            if (currentColor === "rgba(0, 0, 0, 0)") {
                $(e.target).css("background-color", "rgb(220, 0, 0)");
                updateMatrix(cellCoord(e.target));
            } else {
                $(e.target).css("background-color", "rgba(0, 0, 0, 0)");
                updateMatrix(cellCoord(e.target), 0);
            }
        });
        // paint when mouse held down
        pixelCanvas.on("mouseenter", "td", function(e) {
            if (mouseDown) {
                const currentColor = $(e.target).css("background-color");
                if (currentColor === "rgba(0, 0, 0, 0)") {
                    $(e.target).css("background-color", "rgb(220, 0, 0)");
                    updateMatrix(cellCoord(e.target));
                }
                // erase
                // else {
                //     $(e.target).css("background-color", "rgba(0, 0, 0, 0)");
                //     updateMatrix(cellCoord(e.target), 0);
                // }
            }
        });
        return pixelCanvas;
    })();

    // displayMatrix
    /**
     * @param  {number} rowWidth
     * @param  {number} columnHeight
     * @return {undefined}
     */
    function displayMatrix(rowWidth, columnHeight) {
        "use strict";
        // remove old grid (if any)
        matrixNode.children().remove();
        // build grid
        let i2;
        let str = "";
        for (i2 = 0; i2 < rowWidth; i2 += 1) {
            str += "<tr>";
            let i;
            for (i = 0; i < columnHeight; i += 1) {
                // use the dataMatrix array to determine
                // what cells are red. 1 is red(alive). 0 is dead.
                let text = i2 + " " + i;
                if (dataMatrix[i2][i] === 1) {
                    str += "<td class=\"alive\">";
                    str += "<span class=\"coord\">" + text + "</span>";
                    str += "</td>";
                } else {
                    str += "<td class=\"dead\">";
                    str += "<span class=\"coord\">" + text + "</span>";
                    str += "</td>";
                }
            }
            str += "</tr>";
        }
        matrixNode.append(str);
    }
    displayMatrix(20, 20);
    // use split method to grap the class of the clicked cell -
    // which contains the rowWidth and columnHeight number separated by "-".

    // life or death?
    /**
     */
    function lifeOrDeath() {
        "use strict";
        // make a copy of an array that has arrays inside it
        /**
         * @param  {array} matrix
         * @return {array}
         */
        function copyMatrix(matrix) {
            "use strict";
            const copy = matrix.map(elem => {
                return [...elem];
            });
            return copy;
        }
        // check to see if the value is outside the matrix
        // If it is, it appears on the opposite side
        /**
         *
         * @param {number} num
         * @return {number}
         */
        function checkEdge(num) {
            "use strict";
            if (num < 0) {
                num = 19;
            } else if (num > 19) {
                num = 0;
            }
            return num;
        }
        // nextMatrix will be the next state of dataMatrix
        // as determined by the rules
        let nextMatrix = copyMatrix(dataMatrix);
        let i;
        for (i = 0; i <= 19; i += 1) {
            let j;
            for (j = 0; j <= 19; j += 1) {
                // determine the surroundings of the cell
                // (the dataMatrix Array).
                // 0 is dead. 1 is alive.
                // if a cell is at the edge, check the opposite side
                const top = dataMatrix[checkEdge(i - 1)][j];
                const topRight = dataMatrix[checkEdge(i - 1)][checkEdge(j + 1)];

                const right = dataMatrix[i][checkEdge(j + 1)];

                const bottomRight =
                    dataMatrix[checkEdge(i + 1)][checkEdge(j + 1)];

                const bottom = dataMatrix[checkEdge(i + 1)][j];

                const bottomLeft =
                    dataMatrix[checkEdge(i + 1)][checkEdge(j - 1)];

                const left = dataMatrix[i][checkEdge(j - 1)];

                const topLeft = dataMatrix[checkEdge(i - 1)][checkEdge(j - 1)];

                const sum =
                    top +
                    topRight +
                    right +
                    bottomRight +
                    bottom +
                    bottomLeft +
                    left +
                    topLeft;

                // apply the rules of the Conway's game of life.
                // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

                if (sum === 3) {
                    nextMatrix[i][j] = 1;
                } else if (sum !== 2) {
                    nextMatrix[i][j] = 0;
                }
            }
        }
        dataMatrix = copyMatrix(nextMatrix);
        displayMatrix(20, 20);
    }

    const ticker = (function() {
        let intervalID;
        /**
         * @param  {boolean} start
         */
        return function ticker(start) {
            "use strict";
            if (start) {
                intervalID = setInterval(function() {
                    lifeOrDeath();
                }, 300);
            } else {
                clearInterval(intervalID);
            }
        };
    })();

    const beginClick = $("#begin");
    beginClick.on(
        "click",
        (function() {
            "use strict";
            let start = false;
            return function() {
                start = start ? false : true;
                if (start) {
                    $("#begin")
                        .css("background-color", "red")
                        .val("Stop");
                } else {
                    $("#begin")
                        .css("background-color", "green")
                        .val("Start");
                }
                ticker(start);
            };
        })()
    );
});
