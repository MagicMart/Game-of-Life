// @ts-check

$(function () {
    "use strict";
    const dead = "rgb(255, 255, 255)";
    const alive = "rgb(220, 0, 0)";
    let ticking = false;
    let tickSpeed = 300;
    const beginClick = $("#begin");

    // set initial background colour for tds - dead
    Array.from(document.querySelectorAll("td")).forEach(
        (el) => (el.style.backgroundColor = dead)
    );

    /**
     * @param {Array<Array<number>>} matrix
     * @returns {Array<Array<number>>} a deep copy of the matrix
     */
    function copyMatrix(matrix) {
        return matrix.map((row) => row.slice());
    }

    const matrix = (function () {
        /**
         * @param {number} size
         * @returns {Array<Array<number>>}
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
         * @param {Array<Array<number>>} matrix
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
         * @param {Object} cell event.target
         * @returns {Array<number>} [row, column]
         */
        const cellCoord = function (cell) {
            const coord = cell.querySelector(".coord");
            /**@type {Array<number>} */
            const arr = coord.textContent.split(" ");
            return arr;
        };
        /**
         * @param {Array} param0 matrix cell coordinate
         * @param {number} alive
         */
        function updateMatrix([row, col], alive = 1) {
            let nextMatrix = copyMatrix(matrix.data());
            nextMatrix[row][col] = alive;
            matrix.update(nextMatrix);
        }

        pixelCanvas.on("click", "td", function (e) {
            if (ticking) {
                beginClick.click();
            }
            const currentColor = $(e.target).css("background-color");

            // current cell will change color

            if (currentColor === dead) {
                $(e.target).css("background-color", alive);
                updateMatrix(cellCoord(e.target));
            } else {
                $(e.target).css("background-color", dead);
                updateMatrix(cellCoord(e.target), 0);
            }
        });
        // paint when mouse held down
        pixelCanvas.on("mouseenter", "td", function (e) {
            if (mouseDown) {
                if (ticking) {
                    beginClick.click();
                }
                const currentColor = $(e.target).css("background-color");
                if (currentColor === dead) {
                    $(e.target).css("background-color", alive);
                    updateMatrix(cellCoord(e.target));
                } else {
                    $(e.target).css("background-color", dead);
                    updateMatrix(cellCoord(e.target), 0);
                }
            }
        });
        return pixelCanvas;
    })();

    /**
     * @param {Array<Array<number>>} matrix
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
                            (el, j) =>
                                `<td><span class='coord'>${i} ${j}<span></td>`
                        )
                        .join("") +
                    "</tr>"
            )
        );
    }
    /**
     *
     * @param {Array<Array<number>>} matrix
     */
    function displayMatrix(matrix) {
        const td = Array.from(document.querySelectorAll("td"));
        /**
         * @type {Array<number>}
         */
        const flatMatrix = matrix.reduce((acc, current) => {
            return acc.concat(current);
        });

        flatMatrix.forEach((el, i) =>
            el === 1
                ? (td[i].style.backgroundColor = alive)
                : (td[i].style.backgroundColor = dead)
        );
    }
    /**
     * Applies the rules of the "game of life" to the matrix
     * and returns the new matrix
     * @param {Array<Array<number>>} dataMatrix
     * @returns {Array<Array<number>>}
     */
    function lifeOrDeath(dataMatrix) {
        /**
         * @type {number} the length of a row
         */
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

    buildTable(matrix.data());

    go();

    const ticker = (function () {
        let intervalID;
        return function ticker(startTicking) {
            if (startTicking) {
                intervalID = setInterval(function () {
                    go();
                }, tickSpeed);
            } else {
                clearInterval(intervalID);
            }
        };
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
});
