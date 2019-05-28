/* jslint browser: true*/
/* global  $*/
$(function() {
    "use strict";
    const dead = "rgb(249, 234, 214)";
    const alive = "rgb(220, 0, 0)";

    const matrix = (function() {
        /**
         * @param {number} size
         * @return {array}
         */
        function makeMatrix(size) {
            const row = new Array(size).fill();
            return new Array(size).fill(row);
        }

        let dataMatrix = makeMatrix(20);
        function data() {
            return dataMatrix;
        }
        function update(matrix) {
            dataMatrix = matrix;
        }
        return {
            data,
            update
        };
    })();

    function copyMatrix(matrix) {
        return matrix.map(row => row.map(col => col));
    }

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
            const coord = cell.querySelector(".coord");
            const arr = coord.textContent.split(" ");
            return arr;
        };

        /**
         * @param {array} cellArray
         * @param {number} alive
         */
        function updateMatrix(cellArray, alive = 1) {
            const row = cellArray[0];
            const col = cellArray[1];
            let nextMatrix = copyMatrix(matrix.data());
            nextMatrix[row][col] = alive;
            matrix.update(nextMatrix);
        }

        pixelCanvas.on("click", "td", function(e) {
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
        pixelCanvas.on("mouseenter", "td", function(e) {
            if (mouseDown) {
                const currentColor = $(e.target).css("background-color");
                if (currentColor === dead) {
                    $(e.target).css("background-color", alive);
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

    function buildMatrix(matrix) {
        matrixNode.children().remove();
        return matrixNode.append(
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
     * @param  {array} dataMatrix
     * @return {undefined}
     */
    function displayMatrix(matrix) {
        // buildMatrix(matrix);
        function fillMatrix(matrix) {
            const td = Array.from(document.querySelectorAll("td"));

            const flatMatrix = matrix.reduce((acc, current) => {
                return acc.concat(current);
            });
            flatMatrix.forEach((el, i) =>
                el === 1
                    ? (td[i].style.backgroundColor = alive)
                    : (td[i].style.backgroundColor = dead)
            );
        }
        fillMatrix(matrix);
    }

    function lifeOrDeath(dataMatrix) {
        const size = dataMatrix[0].length - 1;

        function copyMatrix(matrix) {
            return matrix.map(row => row.map(col => col));
        }
        // check to see if the value is outside the matrix
        // If it is, it appears on the opposite side
        /**
         *
         * @param {number} num
         * @return {number}
         */
        function checkEdge(num) {
            if (num < 0) {
                num = size;
            } else if (num > size) {
                num = 0;
            }
            return num;
        }
        // nextMatrix will be the next state of dataMatrix
        // as determined by the rules
        let nextMatrix = copyMatrix(dataMatrix);
        let i;
        for (i = 0; i <= size; i += 1) {
            let j;
            for (j = 0; j <= size; j += 1) {
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
        //dataMatrix = nextMatrix;
        //displayMatrix(20, 20);
        return nextMatrix;
    }

    function go() {
        const currentMatrix = matrix.data();
        const newMatrix = lifeOrDeath(currentMatrix);
        matrix.update(newMatrix);
        displayMatrix(newMatrix);
    }

    buildMatrix(matrix.data());

    go();

    const ticker = (function() {
        let intervalID;

        /**
         * @param  {boolean} start
         */
        return function ticker(start) {
            if (start) {
                intervalID = setInterval(function() {
                    go();
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
