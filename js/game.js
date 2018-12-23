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
    function arrayGrid(rowWidth, columnHeight) {
        const arr = [];
        let i = 0;
        let j = 0;
        while (i < rowWidth) {
            arr[i] = [];
            while (j < columnHeight) {
                arr[i][j] = 0;
                j += 1;
            }
            i += 1;
            j = 0;
        }
        return arr;
    }
    let arr = arrayGrid(20, 20);
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
    // makeGrid function then call it
    /**
     * @param  {number} rowWidth
     * @param  {number} columnHeight
     * @return {undefined}
     */
    function makeGrid(rowWidth, columnHeight) {
        // remove old grid (if any)
        PIXELCANVAS.children().remove();
        // build grid
        let i2;
        let str = "";
        for (i2 = 0; i2 < rowWidth; i2 += 1) {
            str += "<tr>";
            let i;
            for (i = 0; i < columnHeight; i += 1) {
                // use the arr array to determine
                // what cells are red. 1 is red(alive). 0 is dead.
                if (arr[i2][i] === 1) {
                    str += `<td class="cell-${i2}-${i}- coloured">1</td>`;
                } else {
                    str += `<td class="cell-${i2}-${i}- uncoloured">0</td>`;
                }
            }
            str += "</tr>";
        }
        PIXELCANVAS.append(str);
    }
    makeGrid(20, 20);
    // use split method to grap the class of the clicked cell -
    // which contains the rowWidth and columnHeight number separated by "-".
    const updateArray = function(e) {
        const position2 = $(e.target).attr("class");
        const splitPosition = position2.split("-");
        return splitPosition;
    };

    // paint when a cell is clicked
    PIXELCANVAS.on("click", "td", function(e) {
        const CURRENT_COLOR = $(e.target).css("background-color");

        // current cell will change color

        if (CURRENT_COLOR === "rgba(0, 0, 0, 0)") {
            $(e.target)
                .css("background-color", "rgb(220, 0, 0)")
                .css("color", "rgb(220, 0, 0)")
                .text("1");
            const position = updateArray(e);
            const rowWidth = position[1];
            const columnHeight = position[2];
            arr[rowWidth][columnHeight] = 1;
            // makeGrid(20,20);
        } else {
            $(e.target)
                .css("background-color", "rgba(0, 0, 0, 0)")
                .css("color", "rgba(0, 0, 0, 0)")
                .text("0");
            const position = updateArray(e);
            const rowWidth = position[1];
            const columnHeight = position[2];
            arr[rowWidth][columnHeight] = 0;
            // makeGrid(20,20);
        }
    });
    // paint when mouse held down
    PIXELCANVAS.on("mouseenter", "td", function(e) {
        if (mouseDown) {
            $(e.target)
                .css("background-color", "rgb(220, 0, 0)")
                .css("color", "rgb(220, 0, 0)")
                .text("1");
            const position = updateArray(e);
            const rowWidth = position[1];
            const columnHeight = position[2];
            arr[rowWidth][columnHeight] = 1;
        }
    });
    // make a copy of an array that has arrays inside it
    /**
     * @param  {array} arrayToCopy
     * @return {array}
     */
    function copyArray(arrayToCopy) {
        const copy = arrayToCopy.map((elem) => {
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
        // nextArray will be the next state of arr as determined by the rules
        let nextArray = copyArray(arr);
        let i;
        for (i = 0; i <= 19; i += 1) {
            let j;
            for (j = 0; j <= 19; j += 1) {
                // determine the surroundings of the cell (the arr Array).
                // 0 is dead. 1 is alive.
                // if a cell is at the edge, check the opposite side
                const top = arr[checkEdge(i - 1)][j];
                const topRight = arr[checkEdge(i - 1)][checkEdge(j + 1)];

                const right = arr[i][checkEdge(j + 1)];

                const bottomRight = arr[checkEdge(i + 1)][checkEdge(j + 1)];

                const bottom = arr[checkEdge(i + 1)][j];

                const bottomLeft = arr[checkEdge(i + 1)][checkEdge(j - 1)];

                const left = arr[i][checkEdge(j - 1)];

                const topLeft = arr[checkEdge(i - 1)][checkEdge(j - 1)];
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
        arr = copyArray(nextArray);
        makeGrid(20, 20);
    }
    let tick;
    /**
     * @param  {boolean} start
     */
    function ticker(start) {
        if (start) {
            tick = setInterval(function() {
                lifeOrDeath();
            }, 500);
        } else {
            clearInterval(tick);
        }
    }

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
