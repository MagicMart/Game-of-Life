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
    // the grid table
    const PIXELCANVAS = $("#pixel_canvas");

    // determine wether mouse is down or not
    let mouseDown = false;
    PIXELCANVAS.on("mousedown", function() {
        mouseDown = true;
        return false;
    });
    $("body").on("mouseup", function() {
        mouseDown = false;
    });
    // displayMatrix function then call it
    /**
     * @param  {number} rowWidth
     * @param  {number} columnHeight
     * @return {undefined}
     */
    function displayMatrix(rowWidth, columnHeight) {
        "use strict";
        // remove old grid (if any)
        PIXELCANVAS.children().remove();
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
                    str += `<td class="alive">
                    <span class="coord">${text}</span>
                    </td>`;
                } else {
                    str += `<td class="dead">
                    <span class="coord">${text}</span>
                    </td>`;
                }
            }
            str += "</tr>";
        }
        PIXELCANVAS.append(str);
    }
    displayMatrix(20, 20);
    // use split method to grap the class of the clicked cell -
    // which contains the rowWidth and columnHeight number separated by "-".
    const cellCoord = function(cell) {
        "use strict";
        const spanText = cell.querySelector(".coord").textContent;
        const arr = spanText.split(" ");
        return [arr[0], arr[1]];
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

    // paint when a cell is clicked
    PIXELCANVAS.on("click", "td", function(e) {
        const CURRENT_COLOR = $(e.target).css("background-color");

        // current cell will change color

        if (CURRENT_COLOR === "rgba(0, 0, 0, 0)") {
            $(e.target).css("background-color", "rgb(220, 0, 0)");
            updateMatrix(cellCoord(e.target));
        } else {
            $(e.target).css("background-color", "rgba(0, 0, 0, 0)");
            updateMatrix(cellCoord(e.target), 0);
        }
    });
    // paint when mouse held down
    PIXELCANVAS.on("mouseenter", "td", function(e) {
        if (mouseDown) {
            $(e.target).css("background-color", "rgb(220, 0, 0)");
            updateMatrix(cellCoord(e.target));
        }
    });
    // make a copy of an array that has arrays inside it
    /**
     * @param  {array} matrix
     * @return {array}
     */
    function copyMatrix(matrix) {
        "use strict";
        const copy = matrix.map((elem) => {
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
    // life or death?
    /**
     */
    function lifeOrDeath() {
        "use strict";
        // nextArray will be the next state of dataMatrix
        // as determined by the rules
        let nextArray = copyMatrix(dataMatrix);
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
                    nextArray[i][j] = 1;
                } else if (sum !== 2) {
                    nextArray[i][j] = 0;
                }
            }
        }
        dataMatrix = copyMatrix(nextArray);
        displayMatrix(20, 20);
    }
    let tick;
    /**
     * @param  {boolean} start
     */
    function ticker(start) {
        "use strict";
        if (start) {
            tick = setInterval(function() {
                lifeOrDeath();
            }, 300);
        } else {
            clearInterval(tick);
        }
    }

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
