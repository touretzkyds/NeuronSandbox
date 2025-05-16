window.addEventListener('load', main, false);
let ranges = [[-0.5, -0.5], [-0.5, 1.5], [1.5, -0.5], [1.5, 1.5]];
let camera = null;
let xInDataCoord = 0;
let yInDataCoord = 0;
let distToRegister = 0.05;
let pointClickedX = Number.MIN_VALUE;
let pointClickedY = Number.MIN_VALUE;
let pointClicked = -1; // 0 = endpoint, 1 = midpoint
// let justMouseDown = false;


let xInDataCoordMP = 0;
let yInDataCoordMP = 0;

// Colors
const FALSE_COLOR = 'rgba(255, 0, 21, 1)';
const TRUE_COLOR = 'rgba(0, 255, 60, 1)';
const LINE_COLOR_ACTIVE = 'rgb(55, 128, 191)';
const INCORRECT_COLOR = 'rgba(0, 0, 0, 0.95)';

function generateOutputData() {
    let outputTable = document.getElementById('output-table');
    let outputData = Array(outputs.data.length).fill(0);
    for (let i = 1; i < outputTable.rows.length; i++) {
        outputData[i-1] = parseFloat(outputTable.rows[i].cells[1].innerText);

    }
    return outputData;
}

function main() {
    initialize2d();

    const weight1 = document.getElementById("weight1");
    const weight2 = document.getElementById("weight2");
    const threshold = document.getElementById("threshold");

    weight1.addEventListener("input", (event) => {
        run();
    });
    weight2.addEventListener("input", (event) => {
        run();
    });
    threshold.addEventListener("input", (event) => {
        run();
    });

}

function list_contains_list(listToCheck, listOfLists) {
    for (let i = 0; i < listOfLists.length; i++) {
        if (list_equals(listToCheck, listOfLists[i])) {
            return true;
        }
    }
    return false;
}

function list_equals(list1, list2) {
    if (list1.length !== list2.length) {
        return false;
    }
    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) {
            return false;
        }
    }
    return true;
}

function createTraces(inputs, outputs, weights, threshold) {

    // let ranges = [[-0.5, -0.5], [-0.5, 1.5], [1.5, -0.5], [1.5, 1.5]]
    let calculatedVals = calculateInputs(inputs, outputs, weights, threshold, ranges)
    let trueX = calculatedVals[0] // input x-coords that are marked true
    let trueY = calculatedVals[1] // input y-coords that are marked true
    let falseX = calculatedVals[2] // input x-coords that are marked false
    let falseY = calculatedVals[3] // input y-coords that are marked false
    let intersectionX = calculatedVals[4]
    let intersectionY = calculatedVals[5]
    let trueShape = calculatedVals[6]
    let falseShape = calculatedVals[7]
    let incorrectlyTrueX = calculatedVals[8]
    let incorrectlyTrueY = calculatedVals[9]
    let incorrectlyFalseX = calculatedVals[10]
    let incorrectlyFalseY = calculatedVals[11]
    let centerXTrue = calculatedVals[12]
    let centerYTrue = calculatedVals[13]
    let centerXFalse = calculatedVals[14]
    let centerYFalse = calculatedVals[15]
    let intersectionBoundsX = calculatedVals[16]
    let intersectionBoundsY = calculatedVals[17]

    let inputTable = document.getElementById('selected-inputs');
    let start = document.getElementById("biasToggle").checked ? 1 : 0;

    let labels = document.getElementsByClassName('slider-label');
    for (let i = start; i < inputTable.rows.length; i++) {
        let row = inputTable.rows[i];
        let cell = row.cells[0];

        labels[i-start].innerText = cell.innerText;
    }
    if (start > 0) {
        labels[labels.length - 1].innerText = "Bias";
    } else {
        labels[labels.length - 1].innerText = "Threshold";
    }

    let falsePoints = {
        type: 'scatter',
        x: falseX,
        y: falseY,
        mode: 'markers',
        name: 'falsePoints',
        nsPoints: true,
        marker: {
            color: Array(falseX.length).fill(FALSE_COLOR),
            symbol: 'circle',
            size: Array(falseX.length).fill(16)
        },
        customdata: Array(falseX.length).fill([labels[0].innerText, labels[1].innerText]),

        hovertemplate: '%{customdata[0]}: %{x}' +
            '<br>%{customdata[1]}: %{y}' +
            '<br>Desired Output: 0<extra></extra>'
    };
    let truePoints = {
        x: trueX,
        y: trueY,
        mode: 'markers',
        name: 'truePoints',
        nsPoints: true,
        marker: {
            color: Array(trueX.length).fill(TRUE_COLOR),
            symbol: 'circle',
            size: Array(trueX.length).fill(16)
        },

        customdata: Array(trueX.length).fill([labels[0].innerText, labels[1].innerText]),

        hovertemplate: '%{customdata[0]}: %{x}' +
            '<br>%{customdata[1]}: %{y}' +
            '<br>Desired Output: 1<extra></extra>'

    };

    let lineColor = LINE_COLOR_ACTIVE;
    let markerSize = 10;
    let inBounds = true;
    // check if line is within the bounds of the unit square
    if (intersectionX.length === 0 || intersectionY.length === 0) { // out of bounds
        inBounds = false;
        intersectionX = intersectionBoundsX;
        intersectionY = intersectionBoundsY;
        markerSize = 0;
    }
    let line = {
        x: intersectionBoundsX,
        y: intersectionBoundsY,
        nsX: intersectionX,
        nsY: intersectionY,
        type: 'scatter',
        line: {
            color: LINE_COLOR_ACTIVE,
            width: 5
        },
        nsLine: true,
        inBounds: inBounds,
        marker: {
            symbol: Array(intersectionX.length).fill('square'),
            size:  Array(intersectionX.length).fill(2),
            color: Array(intersectionX.length).fill(lineColor),
            opacity: Array(intersectionX.length).fill(1),
        },
        showlegend: false,
        hoverinfo: 'skip'

    }

    let lineEndpoints = {
        x: intersectionX,
        y: intersectionY,
        mode: 'markers',
        type: 'scatter',
        nsLineEndpoint: true,
        inBounds: inBounds, //true
        // text: ["Point 1", "Point 2"],
        // hovertemplate: '<b>%{text}</b>',
        hovertemplate: '(%{x:.2f}, %{y:.2f})<extra></extra>',
        marker: {
            symbol: Array(intersectionX.length).fill('square'),
            size:  Array(intersectionX.length).fill(markerSize),
            color: Array(intersectionX.length).fill(LINE_COLOR_ACTIVE),
            opacity: Array(intersectionX.length).fill(1),
        },
        showlegend: false

    }

    let lineMidpoint = {
        x: [(intersectionX[0] + intersectionX[1])/2],
        y: [(intersectionY[0] + intersectionY[1])/2],
        type: 'marker',
        nsLineMidpoint: true,
        hovertemplate: '(%{x:.2f}, %{y:.2f})<extra></extra>',
        marker: {
            symbol: ['circle'],
            size:  [10],
            color: [LINE_COLOR_ACTIVE],
            opacity: [1],
        },
        showlegend: false
    }

    let incorrectlyTrue = {
        x: incorrectlyTrueX,
        y: incorrectlyTrueY,
        mode: "markers",
        marker: {
            color: Array(incorrectlyTrueX.length).fill('rgba(0, 0, 0,0)'),
            size: Array(incorrectlyTrueX.length).fill(25),
            line: {
                color: Array(incorrectlyTrueX.length).fill(INCORRECT_COLOR),
                width: Array(incorrectlyTrueX.length).fill(5),
            },
            fillcolor: 'transparent'
        },
        showlegend: false,
        hoverinfo: 'skip'
    }
    let incorrectlyFalse = {
        x: incorrectlyFalseX,
        y: incorrectlyFalseY,
        mode: "markers",
        marker: {
            color: Array(incorrectlyFalseX.length).fill('rgba(0, 0, 0,0)'),
            size:Array(incorrectlyFalseX.length).fill(25),
            line: {
                color: Array(incorrectlyFalseX.length).fill(INCORRECT_COLOR),
                width: Array(incorrectlyFalseX.length).fill(5)
            },
            fillcolor: 'transparent'
        },
        showlegend: false,
        hoverinfo: 'skip'
    }
    let plus = {
        x: [centerXTrue],
        y: [centerYTrue],
        mode: "text",
        text: '<b>1</b>',
        textfont: {
            size: 50, // Change the font size
        },

        showlegend: false,
        hoverinfo: 'skip',
    }
    let minus = {
        x: [centerXFalse],
        y: [centerYFalse],
        mode: "text",
        text: '<b>0</b>',
        textfont: {
            size: 50, // Change the font size
        },
        showlegend: false,
        hoverinfo: 'skip',
    }

    let boundsX = {
        x : [1, 1],
        y : [0, 1],
        mode: "line",
        showlegend: false,
        hoverinfo: 'skip',
        line : {
            color: 'black'
        }
    }
    let boundsY = {
        x: [0, 1],
        y : [1, 1],
        mode: "line",
        showlegend: false,
        hoverinfo: 'skip',
        line : {
            color: 'black'
        }
    }

    let invis_traces = []
    // y = 0
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [0],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // fillcolor: 'transparent'
                color: [LINE_COLOR_ACTIVE],
                opacity: [0],
            },
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    // y = 1
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [1],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // fillcolor: 'transparent'
                color: [LINE_COLOR_ACTIVE],
                opacity: [0],
            },
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    // x = 0
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [0],
            y: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // fillcolor: 'transparent'
                color: [LINE_COLOR_ACTIVE],
                opacity: [0],
            },
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    // x = 1
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [1],
            y: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // fillcolor: 'transparent'
                color: [LINE_COLOR_ACTIVE],
                opacity: [0],
            },
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    let data = invis_traces.concat([boundsX, boundsY, line, falsePoints, truePoints, incorrectlyTrue, incorrectlyFalse, plus, minus, lineEndpoints, lineMidpoint,]);

    //console.log(data);

    /*
        Drawing the red/green regions (i.e. shapes attribute in layout).
        Only draw valid regions (don't attempt to draw a green/red region when
        no green/red region exists
    */
    let shapes = [];
    if (trueShape !== 'MZ') // true region exists
        shapes.push(
            {
                type: 'path',
                path: trueShape,
                fillcolor: 'green',
                line: {
                    color: 'green'
                },
                opacity: 0.2, layer: 'below'
            }
        )
    if(falseShape !== 'MZ') // false region exists
        shapes.push(
            {
                type: 'path',
                path: falseShape,
                fillcolor: 'red',
                line: {
                    color: 'red'
                },
                opacity: 0.2, layer: 'below'
            }
        )



    let layout = {
        autosize: false,
        xaxis: {
            title: {
                text: labels[0].innerText,
                standoff: -500
            },
            nticks: 2,
            range: [-0.5, 1.5],
            tickvals: [0, 1],
            fixedrange: true,
            // standoff: 100
        },
        yaxis: {
            title: labels[1].innerText,
            nticks: 2,
            tickcolor: 'rgb(102, 102, 102)',
            ticks: 'outside',
            tickfont: {
                font: {
                    color: 'rgb(102, 102, 102)'
                }
            },
            range: [-0.5, 1.5],
            tickvals: [0, 1],
            fixedrange: true,
            // standoff: 10
        },
        margin: {
            l: 30,
            r: 0,
            t: 0,
            b: 30,
            pad: 0
        },
        width: 500,
        height: 500,
        hovermode: 'closest',
        showlegend: false,
        shapes: shapes,
        doubleClick: false


    };

    return [data, layout, null, null];

}

function calculateInputs(inputs, outputs, weights, threshold, ranges) {
    //preliminary step: from the bounds given in ranges, find the max/min X/Y values
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    for (let i = 0; i < ranges.length; i++) {
        minX = Math.min(minX, ranges[i][0])
        minY = Math.min(minY, ranges[i][1])
        maxX = Math.max(maxX, ranges[i][0])
        maxY = Math.max(maxY, ranges[i][1])
    }

    let trueX = []
    let trueY = []
    let falseX = []
    let falseY = []
    for (let i = 0; i < inputs.length; i++) {
        let bool = outputs[i];
        if (bool === 1) {
            trueX.push(inputs[i][0]);
            trueY.push(inputs[i][1]);
        } else {
            falseX.push(inputs[i][0]);
            falseY.push(inputs[i][1]);
        }

    }

    //need to find line endpoints
    let intersections = []
    // ax + by = threshold, [a, b] = weights
    // intersection w/ x = 0
    let y_x0 = threshold/weights[1]
    if (y_x0 <= 1 && y_x0 >= 0) {
        intersections.push([0, y_x0])
    }
    // intersection w/ y = 0
    let x_y0 = threshold/weights[0]
    if (x_y0 <= 1 && x_y0 >= 0) {
        intersections.push([x_y0, 0])
    }
    // intersection w/ x = 1
    let y_x1 = (threshold-weights[0])/weights[1]
    if (y_x1 <= 1 && y_x1 >= 0) {
        intersections.push([1, y_x1])
    }
    // intersection w/ y = 1
    let x_y1 = (threshold-weights[1])/weights[0]
    if (x_y1 <= 1 && x_y1 >= 0) {
        intersections.push([x_y1, 1])
    }

    //in order to mitigate midpoint issue with y=x, ensure there are no duplicates.
    let no_dup_intersections = []
    let visited = []
    if(intersections.length > 2) {
        for(let i=0; i<intersections.length; i++) {
            let cur_elem = intersections[i]
            let cur_elem_normalized = []
            for(let j=0; j<cur_elem.length; j++) {
                cur_elem_normalized.push(Math.abs(cur_elem[j])) //attempting to get rid of the -0 issue
            }
            if(!list_contains_list(cur_elem_normalized, visited)) {
                visited.push(cur_elem_normalized)
                no_dup_intersections.push(cur_elem_normalized)
            }
        }
    }
    if(intersections.length > 2)
        intersections = no_dup_intersections

    // if there are less than 2 intersection points, then it is out of bounds
    // check if there are intersections with the extended axes
    let extended_intersections = []
    if(intersections.length < 2) {
        // counter, which will be used upon the special case where there are more than two
        // extended intersection points
        let intersection_counter = [0, 0, 0, 0]

        // extended x = 0
        let y_x0_ext = threshold/weights[1]
        if((y_x0_ext < 0 || y_x0_ext > 1) && (y_x0_ext > -0.5 && y_x0_ext < 1.5)) {
            extended_intersections.push([0, y_x0_ext])
            intersection_counter[0] = 1
        }
        // extended y = 0
        let x_y0_ext = threshold/weights[0]
        if((x_y0_ext < 0 || x_y0_ext > 1) && (x_y0_ext > -0.5 && x_y0_ext < 1.5)) {
            extended_intersections.push([x_y0_ext, 0])
            intersection_counter[2] = 1
        }
        // extended x = 1
        let y_x1_ext = (threshold-weights[0])/weights[1]
        if ((y_x1_ext < 0 || y_x1_ext > 1) && (y_x1_ext > -0.5 && y_x1_ext < 1.5)) {
            extended_intersections.push([1, y_x1_ext])
            intersection_counter[1] = 1
        }
        // extended y = 1
        let x_y1_ext = (threshold-weights[1])/weights[0]
        if ((x_y1_ext < 0 || x_y1_ext > 1) && (x_y1_ext > -0.5 && x_y1_ext < 1.5)) {
            extended_intersections.push([x_y1_ext, 1])
            intersection_counter[3] = 1
        }

        // if there are more than 2 extended line intersections, there must be 3 extended
        // intersections. We decide to pick the two intersections that intersect the two
        // vertical axes or two horizontal axes, i.e. if we had 3 extended intersections on
        // x=0, x=1, and y=1, we only display the intersections on x=0 and x=1.
        if(extended_intersections.length > 2) {
            if(intersection_counter[0] === 1 && intersection_counter[1] === 1)
                extended_intersections = [[0, y_x0_ext], [1, y_x1_ext]]
            else
                extended_intersections = [[x_y0_ext, 0], [x_y1_ext, 1]]
        }

        //console.log(extended_intersections.length);
        intersections = intersections.concat(extended_intersections)
    }

    let intersectionX = []
    let intersectionY = []
    for (let i = 0; i < intersections.length; i++) {
        intersectionX.push(intersections[i][0])
        intersectionY.push(intersections[i][1])
    }

    // find where line intersects the bounds
    let intersectionsBounds = []
    // ax + by = threshold, [a, b] = weights
    // intersection w/ x = -0.5
    let c = parseFloat(threshold)
    let a = parseFloat(weights[0])
    let b = parseFloat(weights[1])
    let y_x0b = (c+0.5*a)/b
    if (y_x0b <= maxY && y_x0b >= minY) {
        intersectionsBounds.push([minX, y_x0b])
    }
    // intersection w/ y = -0.5
    let x_y0b = (c+0.5*b)/a
    if (x_y0b <= maxX && x_y0b >= minX) {
        intersectionsBounds.push([x_y0b, minY])
    }
    // intersection w/ x = 1.5
    let y_x1b = (c-1.5*a)/b
    if (y_x1b <= maxY && y_x1b >= minY) {
        intersectionsBounds.push([maxX, y_x1b])
    }
    // intersection w/ y = 1
    let x_y1b = (c-1.5*b)/a
    if (x_y1b <= maxX && x_y1b >= minX) {
        intersectionsBounds.push([x_y1b, maxY])
    }


    let intersectionBoundsX = []
    let intersectionBoundsY = []
    for (let i = 0; i < intersectionsBounds.length; i++) {
        intersectionBoundsX.push(intersectionsBounds[i][0])
        intersectionBoundsY.push(intersectionsBounds[i][1])
    }

    let truePoints = [...intersectionsBounds];
    let falsePoints = [...intersectionsBounds];

    // check if the end ranges are in the true or false points
    for (let i = 0; i < ranges.length; i++) {
        if (a * ranges[i][0] + b * ranges[i][1] > c) {
            truePoints.push(ranges[i])
        } else {
            falsePoints.push(ranges[i])
        }
    }

    let incorrectlyTrueX = []
    let incorrectlyTrueY = []
    let incorrectlyFalseX = []
    let incorrectlyFalseY = []
    for (let i = 0; i < inputs.length; i++) {
        if (weights[0] * inputs[i][0] + weights[1] * inputs[i][1] > threshold ) {
            // truePoints.push(inputs[i])
            if (outputs[i] === 0) {
                incorrectlyTrueX.push(inputs[i][0])
                incorrectlyTrueY.push(inputs[i][1])
            }
        }
        else {
            // falsePoints.push(inputs[i])
            if (outputs[i] === 1) {
                incorrectlyFalseX.push(inputs[i][0])
                incorrectlyFalseY.push(inputs[i][1])
            }
        }
    }

    const centerXFalse = falsePoints.reduce((sum, point) => sum + point[0], 0) / falsePoints.length;
    const centerYFalse = falsePoints.reduce((sum, point) => sum + point[1], 0) / falsePoints.length;

    const centerXTrue = truePoints.reduce((sum, point) => sum + point[0], 0) / truePoints.length;
    const centerYTrue = truePoints.reduce((sum, point) => sum + point[1], 0) / truePoints.length;

    function angleToCenterFalse(point) {
        return Math.atan2(point[1] - centerYFalse, point[0] - centerXFalse);
    }
    function angleToCenterTrue(point) {
        return Math.atan2(point[1] - centerYTrue, point[0] - centerXTrue);
    }

    const sortedFalsePoints = falsePoints.sort((a, b) => angleToCenterFalse(a) - angleToCenterFalse(b));
    const sortedTruePoints = truePoints.sort((a, b) => angleToCenterTrue(a) - angleToCenterTrue(b));

    let trueShape = "M"
    let falseShape = "M"

    for (let i = 0; i < sortedTruePoints.length; i++) {
        if (i === 0) {
            trueShape += sortedTruePoints[i] + "," + sortedTruePoints[i] + ", ";
        }
        trueShape += "L " + sortedTruePoints[i] + "," + sortedTruePoints[i] + ", ";
    }
    trueShape += "Z";

    for (let i = 0; i < sortedFalsePoints.length; i++) {
        if (i === 0) {
            falseShape += sortedFalsePoints[i] + "," + sortedFalsePoints[i] + ", ";
        }
        falseShape += "L " + sortedFalsePoints[i] + "," + sortedFalsePoints[i] + ", ";
    }
    falseShape += "Z";

    return [
        trueX, trueY, falseX, falseY,
        intersectionX, intersectionY,
        trueShape, falseShape,
        incorrectlyTrueX, incorrectlyTrueY,
        incorrectlyFalseX, incorrectlyFalseY,
        centerXTrue, centerYTrue,
        centerXFalse, centerYFalse,
        intersectionBoundsX, intersectionBoundsY
    ]

}

function updatePlotlyData(div, newData, traceNum) {
    // updates plotly div (string), using specific data at a specific trace number
    Plotly.restyle(div, newData, traceNum)
    Plotly.deleteTraces(div, traceNum)
    Plotly.addTraces(div, newData, traceNum)
}

function initialize2d () {

    // The selected-inputs table will give us all the input header names
    let biasToggleChecked = document.getElementById("biasToggle").checked
    let inputTable = document.getElementById('selected-inputs');
    let start = biasToggleChecked ? 1 : 0;

    let weight2 = document.getElementById('weight-2-container');
    weight2.style.display = "flex";

    let labels = document.getElementsByClassName('slider-label');
    for (let i = start; i < inputTable.rows.length; i++) {
        let row = inputTable.rows[i];
        let cell = row.cells[0];

        labels[i-start].innerText = cell.innerText;
    }

    let lastLabel = document.getElementById('threshold-label');

    if (start > 0) {
        lastLabel.innerText = "Bias";
    } else {
        lastLabel.innerText = "Threshold";
    }

    updateValuesDisplayToPlotly2D();
    initAllSliders();
    updateAllSliders();

    let w1 = document.getElementById('weight1').value;
    let w2 = document.getElementById('weight2').value;
    let t =  document.getElementById('threshold').value;


    let weights = [w1, w2];
    let threshold = [t];

    if (biasToggleChecked) {
        threshold = [-t];
    }
    let outputData = generateOutputData();
    let result = createTraces(inputs.data, outputData, weights, threshold);
    let data = result[0];
    let layout = result[1];

    Plotly.newPlot('tester', data, layout, {displayModeBar: false}).then(attach);

    let d3 = Plotly.d3;
    let gd = document.getElementById('tester');

    gd.removeAllListeners("plotly_click");
    gd.removeAllListeners("plotly_hover");
    gd.removeAllListeners("plotly_unhover");
    gd.removeAllListeners("mousemove");
    gd.removeAllListeners("mousedown");

    let dragLayer = document.getElementsByClassName('nsewdrag')[0]

    function attach() {
        var xaxis = gd._fullLayout.xaxis;
        var yaxis = gd._fullLayout.yaxis;
        var l = gd._fullLayout.margin.l;
        var t = gd._fullLayout.margin.t;

        gd.addEventListener('mousemove', function(e) {
            let myPlot = document.getElementById('tester')
            let bgrect = document.getElementsByClassName('gridlayer')[0].getBoundingClientRect();
            //need to get midpoint points to-move from mousemove
            xInDataCoordMP = ((e.x - bgrect['x']) / (bgrect['width'])) * (myPlot.layout.xaxis.range[1] - myPlot.layout.xaxis.range[0]) + myPlot.layout.xaxis.range[0];
            yInDataCoordMP =((e.y - bgrect['y']) / (bgrect['height'])) * (myPlot.layout.yaxis.range[0] - myPlot.layout.yaxis.range[1]) + myPlot.layout.yaxis.range[1];

        });

        //NOTE: mouse is always "heard" first, before plot click
        gd.addEventListener('mousedown', function(evt) {
            if(evt.target.id === 'closeId'){
                return;
            }
            let plotlyDiv = document.getElementById('tester')
            if (pointClicked === 0) {
                //let coords = checkDist(xInDataCoord, yInDataCoord);
                //because we preset the xcoords and ycoords, we don't need to use checkDist
                let coords = [xInDataCoord, yInDataCoord];
                // want to move point
                if (coords[0] !== -1)  {
                    if (isLegalPlacement(plotlyDiv.data, coords)) {
                        // check if we placed point in an illegal place (both points on one of the border axes)

                        let newData = changeLineByEndpoint(plotlyDiv.data, coords); //changes the line based on what loc we pressed on the graph

                        let traceNum = 0;
                        for (let i = 0; i < plotlyDiv.data.length; i++) {
                            if (plotlyDiv.data[i].nsLine)
                                traceNum = i;
                        }

                        let weight1Slider = document.getElementById('weight1');
                        let weight2Slider = document.getElementById('weight2');
                        let thresholdSlider = document.getElementById('threshold');

                        // new weight calculation:
                        // y = mx + b
                        // ax + by = c
                        // by = -ax + c
                        // y = -(a/b)x + c

                        // when we move the line by endpoint, the new weights are calculated by setting a to be
                        // the slope, and setting b to equal 1. And then we perform a normalization to make sure
                        // the absolute value of the weights are between 0 and 1.

                        let slope = (newData.y[1] - newData.y[0])/(newData.x[1] - newData.x[0])
                        let a = -1 * slope
                        let b = 1
                        //special case: if we have a vertical line, we don't want a to be Infinity. This manually
                        //creates a vertical line
                        if(Math.abs(a) === Infinity) {
                            b = 0
                            a = 1
                        }
                        let c = a*newData.x[1] + b*newData.y[1]

                        let o_a = weight1Slider.value
                        let o_b = weight2Slider.value
                        let o_c = thresholdSlider.value

                        // if all of them are opposite signs, then flip signs to original
                        if (
                            (o_a <= 0 && a >= 0 && o_b <= 0 && b >= 0 && o_c <= 0 && c >= 0) ||
                            (o_a >= 0 && a <= 0 && o_b >= 0 && b <= 0 && o_c >= 0 && c <= 0)
                        ) {
                            a *= -1
                            b *= -1
                            c *= -1
                        }

                        let norm = Math.sqrt(a*a + b*b)

                        let roundedA = Math.ceil((a/norm) * 100) / 100;
                        let roundedB = Math.ceil((b/norm) * 100) / 100;
                        let roundedC = Math.ceil((c/norm) * 100) / 100;

                        let newWeights = [roundedA, roundedB];
                        let newThreshold = [roundedC];

                        // update the traces
                        let outputData = generateOutputData();
                        let updated = createTraces(inputs.data, outputData, newWeights, newThreshold)
                        let updatedData = updated[0];
                        let updatedLayout = updated[1];

                        updateValuesPlotlyToDisplay(roundedA, roundedB, roundedC)

                        Plotly.react('tester', updatedData, updatedLayout);
                        data = plotlyDiv.data;
                        pointClicked = -1;
                        dragLayer.style.cursor = ''
                    }
                }

            }
            else if (pointClicked === 1) {
                let newData = changeLineByMidpoint(plotlyDiv.data, [xInDataCoordMP, yInDataCoordMP]);
                updatePlotlyData('tester', newData, 0)

                let weight1Slider = document.getElementById('weight1');
                let weight2Slider = document.getElementById('weight2');
                let thresholdSlider = document.getElementById('threshold');

                let outputData = generateOutputData();
                let updated = createTraces(inputs.data, outputData, [weight1Slider.value, weight2Slider.value], [thresholdSlider.value])

                let updatedData = updated[0];
                let updatedLayout = updated[1];

                // TODO: add throw error statements in case trace numbers are -1 (findIndex did not find)

                let linePoint = {
                    x: [(newData.x[0] + newData.x[1])/2],
                    y: [(newData.y[0] + newData.y[1])/2],
                    type: 'marker',
                    nsLineMidpoint: true,
                    marker: {
                        symbol: ['square'],
                        size:  [10],
                        color: [LINE_COLOR_ACTIVE],
                        opacity: [1],
                    },
                    showlegend: false
                }

                Plotly.react('tester', updatedData, updatedLayout);
                // updatePlotlyData('tester', newData, traceNum)
                // updatePlotlyData('tester', linePoint, traceNumPoint)
                data = plotlyDiv.data;

                pointClicked = -1;
                dragLayer.style.cursor = ''

            }


        });

    }

    var myPlot = document.getElementById('tester')

    myPlot.on('plotly_hover', function(data){
        var point = data.points[0];
        xInDataCoord = point.x;
        yInDataCoord = point.y;
        // console.log(xInDataCoord);
        // console.log(yInDataCoord);

        var pn='',
            tn='',
            colors=[];

        let correctTrace = true;
        let point_data = null;
        for(var i=0; i < data.points.length; i++) {
            pn = data.points[i].pointNumber;
            tn = data.points[i].curveNumber;
            if (!data.points[i].data.nsPoints)
                correctTrace = false;

            colors = data.points[i].data.marker.color;
            sizeC = data.points[i].data.marker.size;
            point_data = data.points[i];
        };
        if (correctTrace) {
            sizeC[pn] = 20

            var update = {'marker':{color: colors, size:sizeC}};
            Plotly.restyle('tester', update, [tn]);
            if (point_data) {
                let string = point_data.data.x[pn].toString() + point_data.data.y[pn].toString()
                let dict = {
                    '00' : 2,
                    '01' : 3,
                    '10' : 4,
                    '11' : 5,
                };
                display.hovering = true;
                let row = document.getElementById("input-table").rows[dict[string]]
                display.hoverInput(row, "input-table", "enter")
            }




        }

    });
    myPlot.on('plotly_unhover', function(data){
        xInDataCoord = -1;
        yInDataCoord = -1;
        var pn='',
            tn='',
            colors=[];
        let correctTrace = true;
        for(var i=0; i < data.points.length; i++){
            pn = data.points[i].pointNumber;
            tn = data.points[i].curveNumber;
            if (!data.points[i].data.nsPoints)
                correctTrace = false;
            colors = data.points[i].data.marker.color;
            sizeC = data.points[i].data.marker.size;
            point_data = data.points[i];
        };
        if (correctTrace) {
            sizeC[pn] = 16

            var update = {'marker':{color: colors, size:sizeC}};
            Plotly.restyle('tester', update, [tn]);

            if (point_data) {
                let string = point_data.data.x[pn].toString() + point_data.data.y[pn].toString()
                let dict = {
                    '00' : 2,
                    '01' : 3,
                    '10' : 4,
                    '11' : 5,
                };
                display.hovering = false;
                let row = document.getElementById("input-table").rows[dict[string]]
                display.hoverInput(row, "input-table", "exit")
            }
        }

    });

    myPlot.on('plotly_click', function(clickedData){
        // console.log("in plotly_click, clicked on point")
        if (pointClicked < 0) {
            dragLayer.style.cursor = 'pointer'
        } else {
            dragLayer.style.cursor = ''
        }
        var pn='',
            tn='',
            colors=[],
            sizeC = [],
            shape = [],
            opacity = [];
        let correctTrace = true;
        for (let i=0; i < clickedData.points.length; i++){
            pn = clickedData.points[i].pointNumber;
            tn = clickedData.points[i].curveNumber;
            if (!clickedData.points[i].data.nsLineEndpoint && !clickedData.points[i].data.nsLineMidpoint)
                correctTrace = false;
            if (pointClicked < 0) { //have not yet hit a point yet
                pointClickedX = clickedData.points[i].x
                pointClickedY = clickedData.points[i].y
                if (clickedData.points[i].data.nsLineEndpoint) {
                    // check if only threshold is editable, if that is the case, not allowed to click endpoints
                    // let allowed = document.getElementById('w1').isContentEditable && document.getElementById('w2').isContentEditable
                    if (clickedData.points[i].data.inBounds) {
                        pointClicked = 0;
                    } else {
                        correctTrace = false;
                    }
                }

                else if (clickedData.points[i].data.nsLineMidpoint)
                    pointClicked = 1;
            }
            else {
                correctTrace = false;
            }
            colors = clickedData.points[i].data.marker.color;
            sizeC = clickedData.points[i].data.marker.size;
            shape = clickedData.points[i].data.marker.symbol;
            opacity = clickedData.points[i].data.marker.opacity;

        };

        if (correctTrace && pointClicked >= 0) {
            colors[pn] = 'yellow';
            sizeC[pn] = 10;
            shape[pn] = 'square';
            opacity[pn] = 1;

            var update = {'marker':{color: colors, size: sizeC, symbol: shape, opacity: opacity}};
            Plotly.restyle('tester', update, [tn]);
        }
    });

    // console.log(data.find(e => e.nsLine))

}

function findLine(data) {
    return data.find(obj => obj.nsLine);
}

function isLegalPlacement(data, coords) {
    let lineObj = findLine(data)
    if (!lineObj) // there does not exist a line
        return

    let xCoords = lineObj.nsX;
    let yCoords = lineObj.nsY;
    let xFinal = [-1, -1]
    let yFinal = [-1, -1]

    for (let i = 0; i < xCoords.length; i++) {
        if (xCoords[i] === pointClickedX && yCoords[i] === pointClickedY) {
            xFinal[i] = coords[0]
            yFinal[i] = coords[1]
        } else {
            xFinal[i] = xCoords[i]
            yFinal[i] = yCoords[i]
        }
    }

    if(xFinal[0] === xFinal[1] && yFinal[0] === yFinal[1])
        return false;

    // if (xFinal[0] === xFinal[1]) return false;
    // if (yFinal[0] === yFinal[1]) return false;
    return true;
}

function changeLineByMidpoint(data, coords) {

    let weight1Slider = document.getElementById('weight1');
    let weight2Slider = document.getElementById('weight2');
    let thresholdSlider = document.getElementById('threshold');

    // get a and b values in ax + by = c from weight sliders
    let a = parseFloat(weight1Slider.value)
    let b = parseFloat(weight2Slider.value)
    // get c value (threshold) by plugging in x and y values into ax + by = c
    let c = a * coords[0] + b * coords[1]

    let intersections = []

    let inBounds = true;

    if (true) {
        // calculate intersections with the border
        inBounds = false;
        // intersection w/ x = -0.5
        let y_x0b = (c+0.5*a)/b
        if (y_x0b <= 1.5 && y_x0b >= -0.5) {
            intersections.push([-0.5, y_x0b])
        }
        // intersection w/ y = -0.5
        let x_y0b = (c+0.5*b)/a
        if (x_y0b <= 1.5 && x_y0b >= -0.5) {
            intersections.push([x_y0b, -0.5])
        }
        // intersection w/ x = 1.5
        let y_x1b = (c-1.5*a)/b
        if (y_x1b <= 1.5 && y_x1b >= -0.5) {
            intersections.push([1.5, y_x1b])
        }
        // intersection w/ y = 1,5
        let x_y1b = (c-1.5*b)/a
        if (x_y1b <= 1.5 && x_y1b >= -0.5) {
            intersections.push([x_y1b, 1.5])
        }
    }

    //"unzips" the intersection points into a list of x intersections and y intersections
    let intersectionX = []
    let intersectionY = []
    for (let i = 0; i < intersections.length; i++) {
        intersectionX.push(intersections[i][0])
        intersectionY.push(intersections[i][1])
    }

    let lineObj = findLine(data)
    if (inBounds) {
        lineObj.marker.color = Array(intersectionX.length).fill(LINE_COLOR_ACTIVE);
        lineObj.marker.size = Array(intersectionX.length).fill(10);
    }
    else {
        //enter here if moving the midpoint keeps endpoints within the 1x1 square
        //lineObj.marker.color = Array(intersectionX.length).fill('rgb(163, 163, 162)');
        lineObj.marker.size = Array(intersectionX.length).fill(0);
    }

    let roundedA = Math.ceil(a * 100) / 100;
    let roundedB = Math.ceil(b * 100) / 100;
    let roundedC = Math.ceil(c * 100) / 100;

    updateValuesPlotlyToDisplay(roundedA, roundedB, roundedC)

    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, nsX: intersectionX, nsY: intersectionY, x: intersectionX, y:intersectionY, nsLine: true, inBounds: inBounds, hoverinfo: 'skip'}

}
function updateValuesDisplayToPlotly2D() {
    let biasToggleChecked = document.getElementById("biasToggle").checked;
    let biasText = document.getElementById("bias-text");

    let th1 = document.getElementById("th1");
    let w1 = document.getElementById("w1");
    let w2 = document.getElementById("w2");

    let weight1Value = document.getElementById('weight1_val');
    let weight2Value = document.getElementById('weight2_val');
    let thresholdValue = document.getElementById('threshold_val');

    let weight1Slider = document.getElementById('weight1');
    let weight2Slider = document.getElementById('weight2');
    let thresholdSlider = document.getElementById('threshold');

    weight1Slider.value = parseFloat(w1.innerText);
    weight2Slider.value = parseFloat(w2.innerText);
    thresholdSlider.value = parseFloat(th1.innerText);
    weight1Value.innerText = w1.innerText;
    weight2Value.innerText = w2.innerText
    thresholdValue.innerText = th1.innerText;

    if (biasToggleChecked && biasText) {
        thresholdSlider.value = parseFloat(biasText.innerText);
        thresholdValue.innerText = biasText.innerText;

    }

    // updateAllSliders();

}

function updateValuesPlotlyToDisplay(weight1, weight2, threshold) {
    let biasToggleChecked = document.getElementById("biasToggle").checked;

    let weight1Value = document.getElementById('weight1_val');
    let weight2Value = document.getElementById('weight2_val');
    let thresholdValue = document.getElementById('threshold_val');

    let weight1Slider = document.getElementById('weight1');
    let weight2Slider = document.getElementById('weight2');
    let thresholdSlider = document.getElementById('threshold');

    weight1Slider.value = weight1;
    weight2Slider.value = weight2;
    thresholdSlider.value = threshold;
    weight1Value.innerText = weight1 + "";
    weight2Value.innerText = weight2 + "";
    thresholdValue.innerText = threshold + "";

    let th1 = document.getElementById("th1");
    let bias = document.getElementById("bias-text");
    let w1 = document.getElementById("w1");
    let w2 = document.getElementById("w2");

    if (biasToggleChecked) {
        bias.innerText = thresholdValue.innerText;
    } else {
        th1.innerText = thresholdValue.innerText;
    }

    w1.innerText = weight1Value.innerText;
    w2.innerText = weight2Value.innerText;

    demo.update();
    checkAnswerCorrect();
    perceptron.computeAffineOutput();
}

function changeLineByEndpoint(data, coords) {
    let lineObj = findLine(data) //find current line
    if (!lineObj) //there exists no line
        return

    let xCoords = lineObj.nsX; //two endpoints of the cur line
    let yCoords = lineObj.nsY;
    let xFinal = [-1, -1] //updated endpoints of the line
    let yFinal = [-1, -1]

    for (let i = 0; i < xCoords.length; i++) {
        if (xCoords[i] === pointClickedX && yCoords[i] === pointClickedY) { //if the coord index is the new clicked
            xFinal[i] = coords[0]
            yFinal[i] = coords[1]
        } else {
            xFinal[i] = xCoords[i]
            yFinal[i] = yCoords[i]
        }
    }

    lineObj.marker.color = Array(xCoords.length).fill(LINE_COLOR_ACTIVE)
    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, x: xFinal, y:yFinal, nsLine: true, inBounds: true, hoverinfo: 'skip'}
}

function checkDist(x, y) {
    if((x > 1 + distToRegister) || (x < 0 - distToRegister) || (y > 1 + distToRegister) || (y < 0 - distToRegister))
        return [-1, -1];
    let dX0 =  Math.abs(x);
    let dX1 =  Math.abs(x-1);
    let dY0 = Math.abs(y);
    let dY1 = Math.abs(y-1);

    if (dX0 < distToRegister) {
        return [0, y];
    } else if (dX1 < distToRegister) {
        return [1, y];
    } else if (dY0 < distToRegister) {
        return [x, 0];
    } else if (dY1 < distToRegister) {
        return [x, 1];
    }
    else {
        return [-1, -1]
    }

}

function run2d () {
    let w1 = document.getElementById('weight1').value;
    let w2 = document.getElementById('weight2').value;
    let t = document.getElementById('threshold').value;
    let weights = [w1, w2];
    let threshold = [t];

    updateValuesPlotlyToDisplay(w1, w2, t);

    let biasToggleChecked = document.getElementById('biasToggle').checked;
    if (biasToggleChecked)
        threshold = [-t];

    let outputData = generateOutputData();
    let result = createTraces(inputs.data, outputData, weights, threshold);
    let data = result[0];
    let layout = result[1];


    Plotly.react('tester', data, layout);
}

function reverseSign() {
    let numInputs = document.getElementById('input-table').rows[0].cells.length - 1;

    if (numInputs === 2) {
        reverseSign2d();
    } else if (numInputs === 1) {
        reverseSign1d();
    }
}
function reverseSign2d() {

    let weight1Slider = document.getElementById('weight1');
    let weight2Slider = document.getElementById('weight2');
    let thresholdSlider = document.getElementById('threshold');


    let weights = [-1 * weight1Slider.value, -1 * weight2Slider.value]
    let threshold = [-1 * thresholdSlider.value]

    let outputData = generateOutputData();
    let updated = createTraces(inputs.data, outputData, weights, threshold)
    let updatedData = updated[0];
    let updatedLayout = updated[1];

    Plotly.react('tester', updatedData, updatedLayout);

    updateValuesPlotlyToDisplay(weights[0], weights[1], threshold[0])
}


async function performTrainStep() {
    //note: currently does not support 3d
    let desiredOutputs = []
    let outputTable = document.getElementById("output-table")

    for (let i = 1; i < outputTable.rows.length; i++) {
        desiredOutputs.push(parseInt(outputTable.rows[i].cells[DESIRED_OUTPUT_COLUMN].innerText));
    }

    let editableList = getEditableList();
    let hintProvider = new hintprovider([...perceptron.weights].concat(perceptron.threshold), perceptron.inputData, desiredOutputs, editableList);

    // Indices of editable parameters
    let editableIndices = [];
    for (let i = 0; i < editableList.length; i++) {
        if (editableList[i]) editableIndices.push(i);
    }

    let updatedParams = hintProvider.runOneTrainingStep(editableIndices);

    if (updatedParams) {
        // save old label positions
        const ids = ["weight1", "weight2", "threshold"];
        const previousPositions = {};
        ids.forEach(id => {
            const span = document.getElementById(id + "_val");
            previousPositions[id] = span?.getBoundingClientRect()?.left || 0;
        });

        // apply the updated weights and threshold
        perceptron.weights = updatedParams.slice(0, updatedParams.length - 1);
        console.log(perceptron.weights);
        perceptron.threshold = updatedParams[updatedParams.length - 1]
        console.log(perceptron.threshold);

        console.log("performed one training step")

        updateSlidersFromParams([perceptron.weights[0], perceptron.weights[1], perceptron.threshold])

        // wait for DOM to update
        await new Promise(r => setTimeout(r, 100));

        // compare new positions and insert arrows
        ids.forEach(id => {
            const valSpan = document.getElementById(id + "_val");
            const arrowSpan = document.getElementById(id + "_arrow");
            const displayGroup = document.getElementById(id + "_display_group");

            const newLeft = valSpan.getBoundingClientRect().left;
            const prevLeft = previousPositions[id];
            const delta = newLeft - prevLeft;
            const color = valSpan.style.color || "black";

            arrowSpan.style.color = color;
            arrowSpan.style.opacity = "1";
            // arrowSpan.textContent = Math.abs(delta) >= 1 ? (delta < 0 ? "←" : "→") : "•";
            //
            // displayGroup.style.opacity = "1"

            // Add updated content and insert in correct place
            if (Math.abs(delta) >= 1) {
                arrowSpan.textContent = delta < 0 ? "←" : "→";
                if (delta < 0) {
                    // insert before value
                    displayGroup.insertBefore(arrowSpan, valSpan);
                } else {
                    // insert after value
                    displayGroup.insertBefore(arrowSpan, valSpan.nextSibling);
                }
            } else {
                arrowSpan.textContent = "•";
                displayGroup.insertBefore(arrowSpan, valSpan.nextSibling); // dot always right
            }

            // let arrow = document.getElementById(id + "_arrow");
            // if (!arrow) {
            //     arrow = document.createElement("span");
            //     arrow.id = id + "_arrow";
            //     arrow.style.transition = "opacity 0.3s ease";
            //     arrow.style.opacity = "0";
            //     arrow.style.fontSize = "14px";
            //     arrow.style.margin = "0 5px";
            //     arrow.style.verticalAlign = "middle";
            //     group.insertBefore(arrow, delta < 0 ? span : span.nextSibling);
            // } else {
            //     // Move the arrow to the right place
            //     arrow.remove();
            //     group.insertBefore(arrow, delta < 0 ? span : span.nextSibling);
            // }
            //
            // arrow.textContent = delta < 0 ? "←" : "→";
            // arrow.style.color = color;
            //
            // // Trigger fade-in
            // requestAnimationFrame(() => {
            //     arrow.style.opacity = "1";
            // });
        });


        //update plotly graph
        let outputData = generateOutputData();
        let updated = createTraces(inputs.data, outputData, perceptron.weights, [perceptron.threshold]);

        let updatedData = updated[0];
        let updatedLayout = updated[1];
        Plotly.react('tester', updatedData, updatedLayout);
        updateValuesPlotlyToDisplay(perceptron.weights[0].toFixed(2), perceptron.weights[1].toFixed(2), perceptron.threshold.toFixed(2))

        display.outputLine.position();
        demo.weightLines.forEach(w => w.position());
        if (demo.biasLine) demo.biasLine.position();
    } else {
        console.log("no train needed")
    }
}

function updateSlidersFromParams(newParams, numInputs = 2) {
    let sliders = document.getElementsByClassName("slider-plotly");
    let colorBars = document.getElementsByClassName("color-bar");
    let sliderValueDisplays = document.getElementsByClassName("slider-value");

    for (let i = 0; i < numInputs; i++) {
        sliders[i].value = newParams[i];
        updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);
    }

    let thresholdSlider = document.getElementById("threshold");
    let thresholdBar = document.getElementById("colorBar3");
    let thresholdDisplay = document.getElementById("threshold_val");

    thresholdSlider.value = newParams[numInputs];
    updateSlider(thresholdSlider, thresholdBar, thresholdDisplay);


}


function updateSlider(slider, colorBar, sliderValueDisplay) {
    var value = parseFloat(slider.value);
    var percentage = Math.abs(value * 10); // Scale the percentage for 200-unit range

    // Update color bar
    if (value >= 0) {
        colorBar.style.left = '50%';
        colorBar.style.right = (50 - percentage) + '%';
        colorBar.style.backgroundColor = value === 0 ? 'blue' : 'black'; // Black for positive, blue for zero
    } else {
        colorBar.style.right = '50%';
        colorBar.style.left = (50 - percentage) + '%';
        colorBar.style.backgroundColor = 'red'; // Red for negative
    }

    // Update slider value and color
    sliderValueDisplay.textContent = value;
    sliderValueDisplay.style.color = value === 0 ? 'blue' : (value > 0 ? 'black' : 'red');

    // move value display (above slider thumb)
    let displayGroup = document.getElementById(slider.id + "_display_group");
    let indicatorGroup = document.getElementById(slider.id + "_indicator");

    const sliderWidth = slider.offsetWidth || 300;
    const trackLeftOffset = slider.offsetLeft || 0;
    const newLeft = ((value + 5) / 10) * sliderWidth + trackLeftOffset;

    displayGroup.style.left = `${newLeft}px`;
    indicatorGroup.style.left = `${newLeft}px`; // move arrow/dot too

    // // Calculate the position for the value display
    // var sliderWidth = slider.offsetWidth === 0? 300 : slider.offsetWidth;
    // var newLeft = (((10 * value) / 100)) * sliderWidth + 130;
    // if (value > 0) {
    //     newLeft = (((10 * value) / 100)) * sliderWidth + 130;
    // }
    // sliderValueDisplay.style.left = newLeft + 'px';
}

function updateAllSliders(numInputs = 2) {
    let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    let colorBars = document.getElementsByClassName("color-bar");
    let sliderValueDisplays = document.getElementsByClassName("slider-value");

    for (let i = 0; i < numInputs; i++) {
        updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);

    }

    let lastSlider = document.getElementById('threshold');
    let lastColorBar = document.getElementById('colorBar3');
    let lastValueDisplay = document.getElementById('threshold_val');
    updateSlider(lastSlider, lastColorBar, lastValueDisplay);
}

function initAllSliders(numInputs= 2) {
    let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    let colorBars = document.getElementsByClassName("color-bar");
    let sliderValueDisplays = document.getElementsByClassName("slider-value");

    for (let i = 0; i < numInputs; i++) {
        sliders[i].oninput = function() {
            updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);
        };
    }

    let lastSlider = document.getElementById('threshold');
    let lastColorBar = document.getElementById('colorBar3');
    let lastValueDisplay = document.getElementById('threshold_val');
    lastSlider.oninput = function() {
        updateSlider(lastSlider, lastColorBar, lastValueDisplay);
    }

}

function initialize() {

    let numInputs = document.getElementById('input-table').rows[0].cells.length - 1;
    //console.log(numInputs);
    let errorText = document.getElementById('plotly-error');
    let plotlyDiv = document.getElementById('plotly-div');
    let sliders = document.getElementsByClassName('plotly-slider-class');

    if (numInputs === 2) {
        errorText.style.display =  "none";
        plotlyDiv.style.display = "block";
        for (let i = 0; i < sliders.length; i++) {
            sliders[i].style.display = "flex";
        }
        initialize2d();
        document.getElementById('tester').style.display = "block";
        document.getElementById('plotly-1d').style.display = "none";
    }
    else if (numInputs === 1) {
        errorText.style.display =  "none";
        plotlyDiv.style.display = "block";
        for (let i = 0; i < sliders.length; i++) {
            sliders[i].style.display = "flex";
        }
        initialize1d();
        document.getElementById('tester').style.display = "none";
        document.getElementById('plotly-1d').style.display = "block";
    }
    else if (numInputs >= 3) {
        errorText.style.display =  "block";
        plotlyDiv.style.display = "none";

        for (let i = 0; i < sliders.length; i++) {
            sliders[i].style.display = "none";
        }
        demo.activationLines?.forEach(line => line.remove());
        demo.activationLines = [];
    }


    // deciding which plotly 1d/2d/3d to set as visible

}

function run() {
    let numInputs = document.getElementById('input-table').rows[0].cells.length - 1;

    if (numInputs === 2) {
        run2d();
    }
    else if (numInputs === 1) {
        run1d();

    }
}