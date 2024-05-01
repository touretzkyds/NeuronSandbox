
window.addEventListener('load', main, false);
let ranges = [[-0.5, -0.5], [-0.5, 1.5], [1.5, -0.5], [1.5, 1.5]];
let camera = null;
let xInDataCoord = 0;
let yInDataCoord = 0;
let distToRegister = 0.05;
let pointClickedX = Number.MIN_VALUE;
let pointClickedY = Number.MIN_VALUE;
let pointClicked = -1; // 0 = endpoint, 1 = midpoint
let justMouseDown = false;

// Colors
let FALSE_COLOR = 'rgba(255, 0, 21, 1)';
let TRUE_COLOR = 'rgba(0, 255, 60, 1)';
let LINE_COLOR_ACTIVE = 'rgb(55, 128, 191)';
let LINE_COLOR_INACTIVE = 'rgb(163, 163, 162)'; // CURRENTLY NOT USED
let INCORRECT_COLOR = 'rgba(0, 0, 0, 0.95)';

function generateOutputData() {
    let outputTable = document.getElementById('output-table');
    let outputData = Array(outputs.data.length).fill(0);
    for (let i = 1; i < outputTable.rows.length; i++) {
        outputData[i-1] = parseFloat(outputTable.rows[i].cells[1].innerText);

    }
    return outputData;
}

function main() {
    initialize();
    document.getElementById('tester2').on('plotly_relayout', function(eventData) {
        if (eventData['scene.camera']) {
            camera = eventData['scene.camera'];
        }
    });

    const weight1 = document.getElementById("weight1");
    const weight2 = document.getElementById("weight2");
    const threshold = document.getElementById("threshold");

    const weight1_3d = document.getElementById("weight1_3d");
    const weight2_3d = document.getElementById("weight2_3d");
    const weight3_3d = document.getElementById("weight3_3d");
    const threshold_3d = document.getElementById("threshold_3d");

    weight1.addEventListener("input", (event) => {
        run();
    });
    weight2.addEventListener("input", (event) => {
        run();
    });
    threshold.addEventListener("input", (event) => {
        run();
    });
    weight1_3d.addEventListener("input", (event) => {
        run();
    });
    weight2_3d.addEventListener("input", (event) => {
        run();
    });
    weight3_3d.addEventListener("input", (event) => {
        run();
    });
    threshold_3d.addEventListener("input", (event) => {
        run();
    });

}

function createTraces(inputs, outputs, weights, threshold) {
    let inputs3d = [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1],
    ]
    //
    let w1_3d = parseFloat(document.getElementById('weight1_3d').value)
    let w2_3d = parseFloat(document.getElementById('weight2_3d').value)
    let w3_3d = parseFloat(document.getElementById('weight3_3d').value)
    let t_3d = parseFloat(document.getElementById('threshold_3d').value)
    let outputs3d = [0, 0, 0, 0, 0, 0, 0, 1]
    let weights3d = [w1_3d, w2_3d, w3_3d]
    let threshold3d = t_3d

    let calculatedVals3d = calculateInputs3D(inputs3d, outputs3d, weights3d, threshold3d)
    let x = calculatedVals3d[0]
    let y = calculatedVals3d[1]
    let z = calculatedVals3d[2]

    let xTrue = calculatedVals3d[3]
    let yTrue = calculatedVals3d[4]
    let zTrue = calculatedVals3d[5]

    let xFalse = calculatedVals3d[6]
    let yFalse = calculatedVals3d[7]
    let zFalse= calculatedVals3d[8]

    let incorrectX = calculatedVals3d[9]
    let incorrectY = calculatedVals3d[10]
    let incorrectZ = calculatedVals3d[11]


    let trueTrace = {
        x: xTrue, y: yTrue, z: zTrue,
        mode: 'markers',
        marker: {
            color: TRUE_COLOR,
            symbol: 'circle',
            size: 12
        },
        type: 'scatter3d',
        name: 'True',
        showlegend: false
    }

    let falseTrace = {
        x: xFalse, y: yFalse, z: zFalse,
        mode: 'markers',
        marker: {
            color: FALSE_COLOR,
            symbol: 'circle',
            size: 12
        },
        type: 'scatter3d',
        name: 'False',
        showlegend: false
    }

    let incorrect = {
        x: incorrectX,
        y: incorrectY,
        z: incorrectZ,
        mode: "markers",
        marker: {
            color: 'rgba(0, 0, 0,0)',
            size: 20,
            line: {
                color: INCORRECT_COLOR,
                width: 20,
            },
            fillcolor: 'transparent'
        },
        type: 'scatter3d',
        showlegend: false
    }

    let linedata = []
    let point1 = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [0, 1, 1],
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 1],
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]
    let point2 = [
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 1],
        [1, 1, 1],
        [0, 0, 1],
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 1]
    ]

    for (let i = 0; i < 12; i++) {
        let t = {
            x: [point1[i][0], point2[i][0]],
            y: [point1[i][1], point2[i][1]],
            z: [point1[i][2], point2[i][2]],
            type : 'scatter3d',
            line: {
                color: 'black',
                width: 2,
                opacity: 0.5
            },
            marker: {
                size: 0,
                opacity: 0
            },
            hoverinfo: 'skip',
            showlegend: false,

        }
        linedata.push(t)
    }

    let surface = {
        type: 'surface',
        x: x,
        y: y,
        z: z,
        opacity: 0.3,
        showscale: false,
        hoverinfo: 'skip',
    }

    var intensity = [0, 1, 1, 1, 1, 1, 0, 1];
    let test = {
        type: "mesh3d",
        x: [0, 0, 1, 1, 0, 0, 1, 1],
        y: [0, 1, 1, 0, 0, 1, 1, 0],
        z: [0, 0, 0, 0, 1, 1, 1, 1],
        i: [7, 0, 0, 0, 4, 4, 6, 2, 4, 0, 3, 2],
        j: [3, 4, 1, 2, 5, 6, 5, 6, 0, 1, 6, 6],
        k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 3],
        intensity: intensity,
        colorscale: [
            [0, 'rgb(255, 0, 255)'],
            // [0.5, 'rgb(0, 255, 0)'],
            [1, 'rgb(0, 0, 255)']
        ],
        opacity: 0.3,
        showscale: false,
        showlegend: false,
        hoverinfo: 'skip',
    }


    let data2 = linedata.concat([incorrect, surface, trueTrace, falseTrace]);
    let layout2 = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        scene: {
            camera: camera,
            zaxis: {
                automargin: true,
                title: {
                    text: '',
                    standoff: -10,
                },
                range: [-0.5, 1.5],  // Set the z-axis range to control what's displayed
                // tickvals: [0, 1],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,

            },
            xaxis: {
                title: '',
                range: [-0.5, 1.5],
                // tickvals: [0, 1],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
            },
            yaxis: {
                title: '',
                range: [-0.5, 1.5],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
            },
            annotations: [{
                x: 1.25,
                y: 0.5,
                z: 0,
                text: "X",
                font: {
                    color: "black",
                    size: 12
                },
                showarrow :false
            }, {
                x: 0.5,
                y: 1.25,
                z: 0,
                text: "Y",
                font: {
                    color: "black",
                    size: 12
                },
                showarrow :false
            }, {
                x: 1.25,
                y: 0,
                z: 0.5,
                text: "Z",
                font: {
                    color: "black",
                    size: 12
                },
                showarrow :false
            }
            ],
            aspectmode: "cube",
        },
    };

    return [data, layout, data2, layout2];

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
            trueShape += sortedTruePoints[i] + "," + sortedTruePoints[i] + ", "
        }
        trueShape += "L " + sortedTruePoints[i] + "," + sortedTruePoints[i] + ", "
    }
    trueShape += "Z"

    for (let i = 0; i < sortedFalsePoints.length; i++) {
        if (i === 0) {
            falseShape += sortedFalsePoints[i] + "," + sortedFalsePoints[i] + ", "
        }
        falseShape += "L " + sortedFalsePoints[i] + "," + sortedFalsePoints[i] + ", "
    }
    falseShape += "Z"

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
function calculateInputs3D(inputs, outputs, weights, threshold) {
    // generate all unique x and y-values
    let xSet = new Set();
    let ySet = new Set();
    for (let i = 0; i < inputs.length; i++) {
        xSet.add(inputs[i][0]);
        ySet.add(inputs[i][1]);
    }
    let xList = Array.from(xSet);
    let yList = Array.from(ySet);
    xList = [-0.2, 1.2]
    yList = [-0.2, 1.2]

    // ax + by + cz = threshold
    // therefore, z = (threshold - by - ax) / c
    //TODO: bug: weight2 can be 0
    // if weight is 0, set it to 1e-5
    let zValues = []
    for (let i = 0; i < yList.length; i++) {
        let row = []
        for (let j = 0; j < xList.length; j++) {
            let zVal = (threshold - weights[1]*yList[i] - weights[0]*xList[j]) / weights[2];
            if(weights[2] === 0)
                zVal = 0
            row.push(zVal)

        }
        zValues.push(row)
    }


    let incorrectX = []
    let incorrectY = []
    let incorrectZ = []

    let xTrue = [], yTrue  = [], zTrue = [], xFalse  = [], yFalse  = [], zFalse = [];
    for (let i = 0; i < outputs.length; i++) {
        let actualValue = 0;
        if (threshold < (inputs[i][0] * weights[0] + inputs[i][1] * weights[1] + inputs[i][2] * weights[2]))
            actualValue = 1;

        if (outputs[i] === 1) { //true
            xTrue.push(inputs[i][0]);
            yTrue.push(inputs[i][1]);
            zTrue.push(inputs[i][2]);
        } else {
            xFalse.push(inputs[i][0]);
            yFalse.push(inputs[i][1]);
            zFalse.push(inputs[i][2]);
        }

        if (actualValue !== outputs[i]) { //incorrect
            incorrectX.push(inputs[i][0]);
            incorrectY.push(inputs[i][1]);
            incorrectZ.push(inputs[i][2]);
        }
    }



    return [xList, yList, zValues, xTrue, yTrue, zTrue, xFalse, yFalse, zFalse, incorrectX, incorrectY, incorrectZ]

}

function updatePlotlyData(div, newData, traceNum) {
    // updates plotly div (string), using specific data at a specific trace number
    Plotly.restyle(div, newData, traceNum)
    Plotly.deleteTraces(div, traceNum)
    Plotly.addTraces(div, newData, traceNum)
}

function initialize () {

    // The selected-inputs table will give us all the input header names
    let biasToggleChecked = document.getElementById("biasToggle").checked
    let inputTable = document.getElementById('selected-inputs');
    let start = biasToggleChecked ? 1 : 0;

    let labels = document.getElementsByClassName('slider-label');
    for (let i = start; i < inputTable.rows.length; i++) {
        let row = inputTable.rows[i];
        let cell = row.cells[0];

        labels[i-start].innerText = cell.innerText;
    }
    if (start > 0) {
        labels[labels.length - 1].innerText = "Bias";
    } else {
        labels[labels.length -1].innerText = "Threshold";
    }

    updateValuesDisplayToPlotly();
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
    let data2 = result[2];
    let layout2 = result[3];

    Plotly.newPlot('tester2', data2, layout2);
    Plotly.newPlot('tester', data, layout, {displayModeBar: false}).then(attach);

    let d3 = Plotly.d3;
    let gd = document.getElementById('tester');

    let dragLayer = document.getElementsByClassName('nsewdrag')[0]

    function attach() {
        var xaxis = gd._fullLayout.xaxis;
        var yaxis = gd._fullLayout.yaxis;
        var l = gd._fullLayout.margin.l;
        var t = gd._fullLayout.margin.t;

        gd.addEventListener('mousemove', function(e) {
            let myPlot = document.getElementById('tester')
            let bgrect = document.getElementsByClassName('gridlayer')[0].getBoundingClientRect();
            xInDataCoord = ((e.x - bgrect['x']) / (bgrect['width'])) * (myPlot.layout.xaxis.range[1] - myPlot.layout.xaxis.range[0]) + myPlot.layout.xaxis.range[0];
            yInDataCoord =((e.y - bgrect['y']) / (bgrect['height'])) * (myPlot.layout.yaxis.range[0] - myPlot.layout.yaxis.range[1]) + myPlot.layout.yaxis.range[1];

        });

        //NOTE: mouse is always "heard" first, before plot click
        gd.addEventListener('mousedown', function(evt) {
            let plotlyDiv = document.getElementById('tester')
            if (pointClicked === 0) {
                let coords = checkDist(xInDataCoord, yInDataCoord);
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

                        let slope = (newData.y[1] - newData.y[0])/(newData.x[1] - newData.x[0])
                        let a = -1 * slope
                        let b = 1
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
                        justMouseDown = true;
                        dragLayer.style.cursor = ''
                    }
                }

            }
            else if (pointClicked === 1) {
                let newData = changeLineByMidpoint(plotlyDiv.data, [xInDataCoord, yInDataCoord]);
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
                justMouseDown = true;
                dragLayer.style.cursor = ''

            }


        });

    }

    var myPlot = document.getElementById('tester')

    myPlot.on('plotly_hover', function(data){
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
        if (!justMouseDown) {
            console.log("in plotly_click, clicked on point")
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

        }
        justMouseDown = false;
    });

    console.log(data.find(e => e.nsLine))

}

function findLine(data) {
    return data.find(obj => obj.nsLine);
}

function isLegalPlacement(data, coords) {
    let lineObj = findLine(data)
    if (!lineObj) // there does not exist a line
        return

    let xCoords = lineObj.x;
    let yCoords = lineObj.y
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

    if (xFinal[0] === xFinal[1]) return false;
    if (yFinal[0] === yFinal[1]) return false;
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
        inBounds = false;
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
        //lineObj.marker.color = Array(intersectionX.length).fill('rgb(163, 163, 162)');
        lineObj.marker.size = Array(intersectionX.length).fill(0);
    }

    let roundedA = Math.ceil(a * 100) / 100;
    let roundedB = Math.ceil(b * 100) / 100;
    let roundedC = Math.ceil(c * 100) / 100;

    updateValuesPlotlyToDisplay(roundedA, roundedB, roundedC)

    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, nsX: intersectionX, nsY: intersectionY, x: intersectionX, y:intersectionY, nsLine: true, inBounds: inBounds, hoverinfo: 'skip'}

}
function updateValuesDisplayToPlotly() {
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
    // IMPORTANT: CURRENTLY ONLY 2D
    // TODO: make into 3D later

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
    let lineObj = findLine(data)
    if (!lineObj) //there exists no line
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

    lineObj.marker.color = Array(xCoords.length).fill(LINE_COLOR_ACTIVE)
    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, x: xFinal, y:yFinal, nsLine: true, inBounds: true, hoverinfo: 'skip'}
}

function checkDist(x, y) {
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

function run () {
    let w1 = document.getElementById('weight1').value;
    let w2 = document.getElementById('weight2').value;
    let t = document.getElementById('threshold').value;
    let weights = [w1, w2];
    let threshold = [t];

    updateValuesPlotlyToDisplay(w1, w2, t)

    let biasToggleChecked = document.getElementById('biasToggle').checked
    if (biasToggleChecked)
        threshold = [-t]

    let outputData = generateOutputData();
    let result = createTraces(inputs.data, outputData, weights, threshold);
    let data = result[0];
    let layout = result[1];
    let data2 = result[2];
    let layout2 = result[3];



    Plotly.react('tester2', data2, layout2);
    Plotly.react('tester', data, layout);
}

function reverseSign() {

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

    // Calculate the position for the value display
    var sliderWidth = slider.offsetWidth === 0? 300 : slider.offsetWidth;
    var newLeft = (((10 * value) / 100)) * sliderWidth + 130;
    if (value > 0) {
        newLeft = (((10 * value) / 100)) * sliderWidth + 130;
    }
    sliderValueDisplay.style.left = newLeft + 'px';
}

function updateAllSliders() {
    let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    let colorBars = document.getElementsByClassName("color-bar");
    let sliderValueDisplays = document.getElementsByClassName("slider-value");

    for (let i = 0; i < sliders.length; i++) {
        updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);

    }
}

function initAllSliders() {
    let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    let colorBars = document.getElementsByClassName("color-bar");
    let sliderValueDisplays = document.getElementsByClassName("slider-value");

    for (let i = 0; i < sliders.length; i++) {
        sliders[i].oninput = function() {
            updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);
        };
    }

}