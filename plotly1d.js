window.addEventListener('load', main1d, false);
let ranges1d = [[-0.5, -0.5], [-0.5, 1.5], [1.5, -0.5], [1.5, 1.5]];
// let ranges1d = [[0, 0], [0, 1], [1, 0], [1, 1]];

function main1d() {
    // clear all event listeners on all sliders
    let sliders = document.getElementsByClassName('slider-plotly');

    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        let newElem = slider.cloneNode(true);
        slider.parentNode.replaceChild(newElem, slider);
    }

    initialize1d();

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

function createTraces1d(inputs, outputs, weights, threshold) {

    let calculatedVals = calculateInputs1d(inputs, outputs, weights, threshold, ranges1d)

    let trueX = calculatedVals[0];
    let trueY = calculatedVals[1];
    let falseX = calculatedVals[2];
    let falseY = calculatedVals[3];
    let intersectionX = calculatedVals[4];
    let intersectionY = calculatedVals[5];
    let incorrectlyTrueX = calculatedVals[6];
    let incorrectlyTrueY = calculatedVals[7];
    let incorrectlyFalseX = calculatedVals[8];
    let incorrectlyFalseY = calculatedVals[9];
    let centerXTrue = calculatedVals[10];
    let centerYTrue = calculatedVals[11];
    let centerXFalse = calculatedVals[12];
    let centerYFalse = calculatedVals[13];
    let trueShape = calculatedVals[14];
    let falseShape = calculatedVals[15];

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
            '<br>Desired Output: 1<extra></extra>'

    };

    let lineColor = LINE_COLOR_ACTIVE;
    let markerSize = 10;
    let inBounds = true;

    let line = {
        x: intersectionX,
        y: intersectionY,
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

    let lineMidpoint = {
        x: [(intersectionX[0] + intersectionX[1])/2],
        y: [(intersectionY[0] + intersectionY[1])/2],
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

    let customticks = {
        x: [0, 1],
        y: [0, 0],
        mode: "text",
        text: '<b>0</b>',
        textfont: {
            size: 50, // Change the font size
        },
        showlegend: false,
        hoverinfo: 'skip',
    }


    let data = [line, lineMidpoint, falsePoints, truePoints, incorrectlyTrue, incorrectlyFalse, plus, minus];

    let layout = {
        autosize: false,
        xaxis: {
            zeroline: false,
            showgrid: false,
            // showline: false,
            title: {
                text: labels[0].innerText,
                standoff: -500
            },
            nticks: 2, // Disable default ticks
            range: [-0.5, 1.5],
            tickvals: [0, 1],
            ticks: 'inside',
            // tickfont: {
            //     color: 'rgb(255, 255, 255)',
            // },
            fixedrange: true,
            // standoff: 100
        },
        yaxis: {
            title: '',
            nticks: 2,
            tickfont: {
                color: 'rgb(255, 255, 255)',
            },
            tickvals: [0, 0.0001], // requires two tickmarks in order to properly calculate width of plotly window
            range: [-0.5, 0.5],
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
        height: 300,
        hovermode: 'closest',
        showlegend: false,
        shapes: [
            {
                type: 'path',
                path: trueShape,
                fillcolor: 'green',
                line: {
                    color: 'green'
                },
                opacity: 0.2, layer: 'below'
            },
            {
                type: 'path',
                path: falseShape,
                fillcolor: 'red',
                line: {
                    color: 'red'
                },
                opacity: 0.2, layer: 'below'
            },
        ],
        doubleClick: false,
    };

    return [data, layout, null, null];

}

function calculateInputs1d(inputs, outputs, weights, threshold, ranges) {
    //preliminary step: from the bounds given in ranges, find the max/min X/Y values
    console.log(inputs)
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
            trueY.push(0);
        } else {
            falseX.push(inputs[i][0]);
            falseY.push(0);
        }

    }

    //need to find line endpoints
    // in the 1d case, we only care about the intersection w/ y = 0 and y = 1
    let intersections = []
    let intersectionsShape = []
    // intersection w/ y = 0
    let x_y0 = threshold/weights[0]
    if (x_y0 <= 1.5 && x_y0 >= -0.5) {
        intersections.push([x_y0, -0.1])
        intersectionsShape.push([x_y0, -0.016])
    }

    // intersection w/ y = 1
    let x_y1 = threshold/weights[0]
    if (x_y1 <= 1.5 && x_y1 >= -0.5) {
        intersections.push([x_y1, 0.1])
        intersectionsShape.push([x_y1, 0.016])
    }

    let intersectionX = []
    let intersectionY = []
    for (let i = 0; i < intersections.length; i++) {
        intersectionX.push(intersections[i][0])
        intersectionY.push(intersections[i][1])
    }


    let c = parseFloat(threshold)
    let a = parseFloat(weights[0])

    let truePoints = [...intersectionsShape];
    let falsePoints = [...intersectionsShape];

    // check if the end ranges are in the true or false points
    let rangesForShape = [[-0.5, -0.016], [-0.5, 0.016], [1.5, -0.016], [1.5, 0.016]];
    for (let i = 0; i < rangesForShape.length; i++) {
        if (a * rangesForShape[i][0] > c) {
            truePoints.push(rangesForShape[i])
        } else {
            falsePoints.push(rangesForShape[i])
        }
    }

    let incorrectlyTrueX = []
    let incorrectlyTrueY = []
    let incorrectlyFalseX = []
    let incorrectlyFalseY = []
    for (let i = 0; i < inputs.length; i++) {
        if (weights[0] * inputs[i][0] > threshold ) {
            // truePoints.push(inputs[i])
            if (outputs[i] === 0) {
                incorrectlyTrueX.push(inputs[i][0])
                incorrectlyTrueY.push(0)
            }
        }
        else {
            // falsePoints.push(inputs[i])
            if (outputs[i] === 1) {
                incorrectlyFalseX.push(inputs[i][0])
                incorrectlyFalseY.push(0)
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
        incorrectlyTrueX, incorrectlyTrueY,
        incorrectlyFalseX, incorrectlyFalseY,
        centerXTrue, (centerYTrue + 0.2),
        centerXFalse, (centerYFalse + 0.2),
        trueShape, falseShape,
    ]

}

function updatePlotlyData(div, newData, traceNum) {
    // updates plotly div (string), using specific data at a specific trace number
    Plotly.restyle(div, newData, traceNum)
    Plotly.deleteTraces(div, traceNum)
    Plotly.addTraces(div, newData, traceNum)
}

function initialize1d() {

    // The selected-inputs table will give us all the input header names
    let biasToggleChecked = document.getElementById("biasToggle").checked
    let inputTable = document.getElementById('selected-inputs');
    let start = biasToggleChecked ? 1 : 0;

    //make plotly weight 2 container invisible
    let weight2 = document.getElementById('weight-2-container');
    weight2.style.display = "none";

    //relabel weight 1
    let weightLabel = document.getElementById('weight1-label');
    let cell = inputTable.rows[start].cells[0];
    weightLabel.innerText = cell.innerText;

    //depending on bias/threshold mode, change label of last slider
    let lastLabel = document.getElementById('threshold-label');

    if (start > 0) {
        lastLabel.innerText = "Bias";
    } else {
        lastLabel.innerText = "Threshold";
    }

    updateValuesDisplayToPlotly1d();
    initAllSliders(1);
    updateAllSliders(1);

    let w1 = document.getElementById('weight1').value;
    let t =  document.getElementById('threshold').value;

    let weights = [w1];
    let threshold = [t];

    if (biasToggleChecked) {
        threshold = [-t];
    }
    let outputData = generateOutputData();
    let result = createTraces1d(inputs.data, outputData, weights, threshold);
    let data = result[0];
    let layout = result[1];

    Plotly.newPlot('plotly-1d', data, layout, {displayModeBar: false}).then(attach);

    let d3 = Plotly.d3;
    let gd = document.getElementById('plotly-1d');

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
            let myPlot = document.getElementById('plotly-1d');
            let bgrect = document.getElementsByClassName('gridlayer')[1].getBoundingClientRect();
            xInDataCoord = ((e.x - bgrect['x']) / (bgrect['width'])) * (myPlot.layout.xaxis.range[1] - myPlot.layout.xaxis.range[0]) + myPlot.layout.xaxis.range[0];
            yInDataCoord = ((e.y - bgrect['y']) / (bgrect['height'])) * (myPlot.layout.yaxis.range[0] - myPlot.layout.yaxis.range[1]) + myPlot.layout.yaxis.range[1];

        });

        //NOTE: mouse is always "heard" first, before plot click
        gd.addEventListener('mousedown', function(evt) {
            let plotlyDiv = document.getElementById('plotly-1d');
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
                        let updated = createTraces1d(inputs.data, outputData, newWeights, newThreshold)
                        let updatedData = updated[0];
                        let updatedLayout = updated[1];

                        updateValuesPlotlyToDisplay1d(roundedA, roundedB, roundedC)

                        Plotly.react('plotly-1d', updatedData, updatedLayout);
                        data = plotlyDiv.data;
                        pointClicked = -1;
                        justMouseDown = true;
                        dragLayer.style.cursor = ''
                    }
                }

            }
            else if (pointClicked === 1) {
                let newData = changeLineByMidpoint1d(plotlyDiv.data, [xInDataCoord, yInDataCoord]);
                updatePlotlyData('plotly-1d', newData, 0)

                let weight1Slider = document.getElementById('weight1');
                // let weight2Slider = document.getElementById('weight2');
                let thresholdSlider = document.getElementById('threshold');

                let outputData = generateOutputData();
                let updated = createTraces1d(inputs.data, outputData, [weight1Slider.value], [thresholdSlider.value])

                let updatedData = updated[0];
                let updatedLayout = updated[1];

                // TODO: add throw error statements in case trace numbers are -1 (findIndex did not find)

                Plotly.react('plotly-1d', updatedData, updatedLayout);
                // updatePlotlyData('plotly-1d', newData, traceNum)
                // updatePlotlyData('plotly-1d', linePoint, traceNumPoint)
                data = plotlyDiv.data;

                pointClicked = -1;
                justMouseDown = true;
                dragLayer.style.cursor = ''

            }


        });

    }

    var myPlot = document.getElementById('plotly-1d')

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
            Plotly.restyle('plotly-1d', update, [tn]);
            if (point_data) {
                let string = point_data.data.x[pn].toString()
                let dict = {
                    '0' : 2,
                    '1' : 3,
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
            Plotly.restyle('plotly-1d', update, [tn]);

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
                Plotly.restyle('plotly-1d', update, [tn]);
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

function changeLineByMidpoint1d(data, coords) {
    // get a and b values in ax = c from weight sliders
    // coords[0] = c / curr_a c = curr_a * coor
    let a = document.getElementById('weight1').value
    // get c value (threshold) by plugging in x and y values into ax + by = c
    let c = coords[0] * a;

    let intersections = []

    let inBounds = true;

    if (true) {
        inBounds = false;
        // intersection w/ y = 0
        let x_y0 = c/a
        if (x_y0 <= 1.5 && x_y0 >= -0.5) {
            intersections.push([x_y0, -0.5])
        }

        // intersection w/ y = 1
        let x_y1 = c/a
        if (x_y1 <= 1.5 && x_y1 >= -0.5) {
            intersections.push([x_y1, 1.5])
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
    let roundedC = Math.ceil(c * 100) / 100;

    updateValuesPlotlyToDisplay1d(roundedA, roundedC)

    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, nsX: intersectionX, nsY: intersectionY, x: intersectionX, y:intersectionY, nsLine: true, inBounds: inBounds, hoverinfo: 'skip'}

}
function updateValuesDisplayToPlotly1d() {
    let biasToggleChecked = document.getElementById("biasToggle").checked;
    let biasText = document.getElementById("bias-text");

    let th1 = document.getElementById("th1");
    let w1 = document.getElementById("w1");

    let weight1Value = document.getElementById('weight1_val');
    let thresholdValue = document.getElementById('threshold_val');

    let weight1Slider = document.getElementById('weight1');
    let thresholdSlider = document.getElementById('threshold');

    weight1Slider.value = parseFloat(w1.innerText);
    thresholdSlider.value = parseFloat(th1.innerText);
    weight1Value.innerText = w1.innerText;
    thresholdValue.innerText = th1.innerText;

    if (biasToggleChecked && biasText) {
        thresholdSlider.value = parseFloat(biasText.innerText);
        thresholdValue.innerText = biasText.innerText;

    }

}

function updateValuesPlotlyToDisplay1d(weight1, threshold) {

    let biasToggleChecked = document.getElementById("biasToggle").checked;

    let weight1Value = document.getElementById('weight1_val');
    let thresholdValue = document.getElementById('threshold_val');

    let weight1Slider = document.getElementById('weight1');
    let thresholdSlider = document.getElementById('threshold');

    weight1Slider.value = weight1;
    thresholdSlider.value = threshold;
    weight1Value.innerText = weight1 + "";
    thresholdValue.innerText = threshold + "";

    let th1 = document.getElementById("th1");
    let bias = document.getElementById("bias-text");
    let w1 = document.getElementById("w1");

    if (biasToggleChecked) {
        bias.innerText = thresholdValue.innerText;
    } else {
        th1.innerText = thresholdValue.innerText;
    }

    w1.innerText = weight1Value.innerText;

    demo.update();
    checkAnswerCorrect();
    perceptron.computeAffineOutput();
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

function run1d () {
    let w1 = document.getElementById('weight1').value;
    let t = document.getElementById('threshold').value;
    let weights = [w1];
    let threshold = [t];

    updateValuesPlotlyToDisplay1d(w1, t)

    let biasToggleChecked = document.getElementById('biasToggle').checked
    if (biasToggleChecked)
        threshold = [-t]

    let outputData = generateOutputData();
    let result = createTraces1d(inputs.data, outputData, weights, threshold);
    let data = result[0];
    let layout = result[1];

    Plotly.react('plotly-1d', data, layout);
}

function reverseSign1d() {

    let weight1Slider = document.getElementById('weight1');
    let thresholdSlider = document.getElementById('threshold');


    let weights = [-1 * weight1Slider.value]
    let threshold = [-1 * thresholdSlider.value]

    let outputData = generateOutputData();
    let updated = createTraces1d(inputs.data, outputData, weights, threshold)
    let updatedData = updated[0];
    let updatedLayout = updated[1];

    Plotly.react('plotly-1d', updatedData, updatedLayout);

    updateValuesPlotlyToDisplay1d(weights[0], threshold[0])
}