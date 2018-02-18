/*jslint browser: true*/
/*global  $*/
$(function() {
    "use strict";
    let nextArray = [];
    const INITIALIZE_VARIABLES = Array(13).fill(0);
    let [row, column, sum, top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft, tr, position] = INITIALIZE_VARIABLES;
    // make an array of arrays that will (correspond to the grid that the user sees)
    // and fill them with zeroes
    function arrayGrid(ROW, COLUMN) {
        let arr = [];
        let i = 0;
        while (i < ROW) {
            arr[i] = Array(COLUMN).fill(0);
            i += 1;
        }
        return arr;
    }
    let arr = arrayGrid(20, 20);
    //the grid table
    const PIXELCANVAS = $("#pixel_canvas");
    const beginClick = $("#begin");
    beginClick.on("click", function() {
        lifeOrDeath();
    });
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
    function makeGrid(ROW, COLUMN) {
        //remove old grid (if any)
        PIXELCANVAS.children().remove();
        //build grid
        let i2;
        for (i2 = 0; i2 < ROW; i2 += 1) {
            PIXELCANVAS.append("<tr></tr>");
            let i;
            tr = $("tr");
            for (i = 0; i < COLUMN; i += 1) {
                // const tr = $("tr");
                // use the arr array to determine what cells are red. 1 is red(alive). 0 is dead.
                if (arr[i2][i] === 1) {
                    tr.last().append(`<td class="cell-${i2}-${i}- coloured">1</td>`);
                } else {
                    tr.last().append(`<td class="cell-${i2}-${i}- uncoloured">0</td>`);
                }
            }
        }
    }
    makeGrid(20, 20);
    // use split method to grap the class of the clicked cell - which contains the row and column number separated by "-".
    const UPDATEARRAY = (function() {
        let position2;
        let splitPosition;
        return function(e) {
            position2 = $(e.target).attr("class");
            splitPosition = position2.split("-");

            return splitPosition;
        };
    }());
    // paint when a cell is clicked
    PIXELCANVAS.on("click", "td", function(e) {
        const CURRENT_COLOR = $(e.target).css("background-color");

        //current cell will change color

        if (CURRENT_COLOR === "rgba(0, 0, 0, 0)") {
            $(e.target)
                .css("background-color", "rgb(220, 0, 0)")
                .css("color", "rgb(220, 0, 0)")
                .text("1");
            position = UPDATEARRAY(e);
            row = position[1];
            column = position[2];
            arr[row][column] = 1;
            // makeGrid(20,20);
        } else {
            $(e.target)
                .css("background-color", "rgba(0, 0, 0, 0)")
                .css("color", "rgba(0, 0, 0, 0)")
                .text("0");
            position = UPDATEARRAY(e);
            row = position[1];
            column = position[2];
            arr[row][column] = 0;
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
            position = UPDATEARRAY(e);
            row = position[1];
            column = position[2];
            arr[row][column] = 1;
        }
    });
    //make a copy of an array that has arrays inside it
    function copyArray(array) {
        const copy = [];
        const arrayLength = array.length;
        let i;
        for (i = 0; i < arrayLength; i += 1) {
            copy[i] = array[i].slice();
        }
        return copy;
    }
    //life or death?
    function lifeOrDeath() {
        // nextArray will be the next state of arr as determined by the rules
        nextArray = copyArray(arr);
        let i;
        for (i = 0; i <= 19; i += 1) {
            let j;
            for (j = 0; j <= 19; j += 1) {
                //determine the surroundings of the cell (the arr Array). 0 is dead. 1 is alive.
                // if a cell is at the edge, check the opposite side
                top = (i === 0) ? arr[19][j] : arr[i - 1][j];
                topRight =
                    (i === 0 && j === 19) ?
                    arr[19][0] :
                    (i === 0 && j !== 19) ?
                    arr[19][j + 1] :
                    (i !== 0 && j === 19) ? arr[i - 1][0] : arr[i - 1][j + 1];

                right = (j === 19) ? arr[i][0] : arr[i][j + 1];

                bottomRight =
                    (i === 19 && j === 19) ?
                    arr[0][0] :
                    (i !== 19 && j === 19) ?
                    arr[i + 1][0] :
                    (i === 19 && j !== 19) ? arr[0][j + 1] : arr[i + 1][j + 1];

                bottom = (i === 19) ? arr[0][j] : arr[i + 1][j];

                bottomLeft =
                    (i === 19 && j === 0) ?
                    arr[0][19] :
                    (i !== 19 && j === 0) ?
                    arr[i + 1][19] :
                    (i === 19 && j !== 0) ? arr[0][j - 1] : arr[i + 1][j - 1];

                left = (j === 0) ? arr[i][19] : arr[i][j - 1];

                topLeft =
                    (i === 0 && j === 0) ?
                    arr[19][19] :
                    (i !== 0 && j === 0) ?
                    arr[i - 1][19] :
                    (i === 0 && j !== 0) ? arr[19][j - 1] : arr[i - 1][j - 1];
                sum =
                    top +
                    topRight +
                    right +
                    bottomRight +
                    bottom +
                    bottomLeft +
                    left +
                    topLeft;
                // apply the rules of the Conway's game of life. https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

                if (sum === 2) {
                    continue;
                } else if (sum === 3) {
                    nextArray[i][j] = 1;
                } else {
                    nextArray[i][j] = 0;
                }
            }
        }
        arr = copyArray(nextArray);
        makeGrid(20, 20);
    }
});
