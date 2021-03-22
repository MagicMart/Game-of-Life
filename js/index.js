// @ts-check

"use strict";
const deadRGB = "rgb(255, 255, 255)";
const aliveRGB = "rgb(220, 0, 0)";
let ticking = false;
let tickSpeed = 300;
const beginClick = $("#begin");

/**@typedef {(0 |1)[][]} Matrix */

/**
 * @param {Matrix} matrix
 * @returns {Matrix} a deep copy of the matrix
 */
function copyMatrix(matrix) {
    return matrix.map((row) => row.slice());
}

const matrix = (function () {
    /**
     * @param {number} size
     * @returns {Matrix}
     */
    function makeMatrix(size) {
        const row = new Array(size).fill(0);
        return new Array(size).fill(row);
    }

    let dataMatrix = makeMatrix(20);

    /** Returns the current state of the matrix */
    function data() {
        return dataMatrix;
    }
    /**
     *
     * @param {Matrix} matrix
     */
    function update(matrix) {
        dataMatrix = matrix;
        return dataMatrix;
    }
    return {
        data,
        update,
    };
})();

// the matrix
const matrixNode = (function () {
    const pixelCanvas = $("#pixel_canvas");
    let mouseDown;
    pixelCanvas.on("mousedown", function () {
        mouseDown = true;
        return false;
    });
    $("body").on("mouseup", function () {
        mouseDown = false;
    });

    /**
     * Grabs the text content from the hidden span element:
     * the coordinate of the table cell clicked on.
     * @param {HTMLTableCellElement} cell event.target
     * @returns {string[]} [row, column]
     */
    const cellCoord = function (cell) {
        const coord = cell.querySelector(".coord");
        const arr = coord.textContent.split(" ");
        return arr;
    };
    /**
     * @param {string[]} param0 matrix cell coordinate
     * @param {"alive" | "dead"} state
     */
    function updateMatrix([row, col], state) {
        let nextMatrix = copyMatrix(matrix.data());
        nextMatrix[row][col] = state === "alive" ? 1 : 0;
        matrix.update(nextMatrix);
    }

    pixelCanvas.on("click", "td", function (event) {
        const target = event.target;
        if (ticking) {
            beginClick.trigger("click");
        }
        const currentColor = $(target).css("background-color");

        // current cell will change color

        if (currentColor === deadRGB) {
            $(target).css("background-color", aliveRGB);
            updateMatrix(cellCoord(target), "alive");
        } else {
            $(target).css("background-color", deadRGB);
            updateMatrix(cellCoord(target), "dead");
        }
    });
    // paint when mouse held down
    pixelCanvas.on("mouseenter", "td", function (event) {
        const target = event.target;
        if (mouseDown) {
            if (ticking) {
                beginClick.trigger("click");
            }
            const currentColor = $(target).css("background-color");
            if (currentColor === deadRGB) {
                $(target).css("background-color", aliveRGB);
                updateMatrix(cellCoord(target), "alive");
            } else {
                $(target).css("background-color", deadRGB);
                updateMatrix(cellCoord(target), "dead");
            }
        }
    });
    return pixelCanvas;
})();

/**
 * @param {Matrix} matrix
 */
function buildTable(matrix) {
    matrixNode.children().remove();
    return matrixNode.append(
        // @ts-ignore
        matrix.map(
            (row, i) =>
                "<tr>" +
                row
                    .map(
                        (_el, j) =>
                            `<td><span class='coord'>${i} ${j}<span></td>`
                    )
                    .join("") +
                "</tr>"
        )
    );
}

/**
 * @param {Matrix} matrix
 */
function displayMatrix(matrix) {
    const td = Array.from($("td"));
    /**
     * @type {(0 | 1)[]}
     */
    const flatMatrix = matrix.reduce((acc, current) => {
        return acc.concat(current);
    });

    flatMatrix.forEach((el, i) =>
        el === 1
            ? (td[i].style.backgroundColor = aliveRGB)
            : (td[i].style.backgroundColor = deadRGB)
    );
}
/**
 * Applies the rules of the "game of life" to the matrix
 * and returns the new matrix
 * @param {Matrix} dataMatrix
 * @returns {Matrix} the new matrix
 */
function lifeOrDeath(dataMatrix) {
    const size = dataMatrix[0].length - 1;

    /**check to see if the row or column coordinate
     * is outside the matrix. If it is,
     * it evaluates to the opposite side of the matrix
     * @param {number} num
     * @returns {number} size or 0 or original number
     */
    function checkEdge(num) {
        if (num < 0) {
            num = size;
        } else if (num > size) {
            num = 0;
        }
        return num;
    }

    /**nextMatrix will be the next state of dataMatrix
    as determined by the rules */
    const nextMatrix = dataMatrix.map((row, i) => {
        return row.map((current, j) => {
            /** sum is the sum of values in the surrounding cells
             * (in clockwise order)
             */
            const sum =
                dataMatrix[checkEdge(i - 1)][j] +
                dataMatrix[checkEdge(i - 1)][checkEdge(j + 1)] +
                dataMatrix[i][checkEdge(j + 1)] +
                dataMatrix[checkEdge(i + 1)][checkEdge(j + 1)] +
                dataMatrix[checkEdge(i + 1)][j] +
                dataMatrix[checkEdge(i + 1)][checkEdge(j - 1)] +
                dataMatrix[i][checkEdge(j - 1)] +
                dataMatrix[checkEdge(i - 1)][checkEdge(j - 1)];

            // apply the rules of the Conway's game of life.
            // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

            if (sum === 3) {
                return 1;
            } else if (sum === 2) {
                return current;
            } else {
                return 0;
            }
        });
    });

    return nextMatrix;
}

function go() {
    displayMatrix(matrix.update(lifeOrDeath(matrix.data())));
}

(function () { 
    buildTable(matrix.data());
    go() 
})();

const ticker = (function () {
    let intervalID;
    /**
     * @param {boolean} startTicking 
     */
    function ticker(startTicking) {
        if (startTicking) {
            intervalID = setInterval(function () {
                go();
            }, tickSpeed);
        } else {
            clearInterval(intervalID);
        }
    };
    return ticker;
})();

beginClick.on("click", function () {
    ticking = !ticking;
    if (ticking) {
        $("#begin").css("background-color", "red").val("Stop");
    } else {
        $("#begin").css("background-color", "green").val("Start");
    }
    ticker(ticking);
});

$("#myRange").on(
    "change",
    /**
     * @param {Object} event
     */
    (event) => {
        const sliderValue = Number(event.target.value);
        if (ticking) {
            ticker(false);
            tickSpeed = 600 - sliderValue;
            ticker(true);
        } else {
            tickSpeed = 600 - sliderValue;
        }
    }
);
