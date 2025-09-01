window.addEventListener('load', main, false);
let camera = null;
let justMouseDown = false;
let distToRegister = 0.05;
//3D versions of 2D variables
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
let xInDataCoord3D = 0;
let yInDataCoord3D = 0;
let zInDataCoord3D = 0;
let pointClicked3DX = Number.MIN_VALUE;
let pointClicked3DY = Number.MIN_VALUE;
let pointClicked3DZ = Number.MIN_VALUE;
let pointClicked3D = 0; //0 represents default state
                         //1 represents inactive control point clicked; color rotation required
                         //-1 represents invisible trace clicked

let line_segs_rep = [
        [0, 0, 0], //purple region
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 1], //green region
        [1, 1, 1],
        [0, 0, 1],
        [1, 0, 0],
        [0, 1, 1], //red region
        [0, 0, 1],
        [0, 1, 0],
        [1, 1, 1],
        [1, 1, 0], //pink region
        [1, 1, 1],
        [1, 0, 0],
        [0, 1, 0]
    ]

// Colors
let FALSE_COLOR = 'rgba(255, 0, 21, 1)';
let TRUE_COLOR = 'rgba(0, 255, 60, 1)';
let LINE_COLOR_ACTIVE = 'rgb(55, 128, 191)';
let LINE_COLOR_INACTIVE = 'rgb(163, 163, 162)'; // CURRENTLY NOT USED
let CONTROL_PT_ACTIVE = 'rgb(240, 146, 5)';
let CONTROL_PT_INACTIVE = 'rgb(55, 128, 191)';
let INCORRECT_COLOR = 'rgba(0, 0, 0, 0.95)';

let initialCameraSet = false;

function main() {
    initialize();
    document.getElementById('tester2').on('plotly_relayout', function(eventData) {
        if (eventData['scene.camera']) {
            camera = eventData['scene.camera'];
        }
    });

    const weight1_3d = document.getElementById("weight1_3d");
    const weight2_3d = document.getElementById("weight2_3d");
    const weight3_3d = document.getElementById("weight3_3d");
    const threshold_3d = document.getElementById("threshold_3d");

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

function genShaded3DRegion(a, b, c, t) {
    const NX = 60, NY = 60, NZ = 60;
    const x = [], y = [], z = [];
    const v1 = [],  // mask for ≤
        v2 = [];  // mask for ≥
    for (let k = 0; k < NZ; k++) {
        for (let j = 0; j < NY; j++) {
            for (let i = 0; i < NX; i++) {
                const xi = (i / (NX - 1)) * 5 - 2.5;  // maps i ∈ [0,NX-1] → [-25,25]
                const yj = (j / (NY - 1)) * 5 - 2.5;
                const zk = (k / (NZ - 1)) * 5 - 2.5;
                x.push(xi);  y.push(yj);  z.push(zk);
                const dot = a*xi + b*yj + c*zk;
                v1.push( dot <= t ? 1 : 0 );
                v2.push( dot >= t ? 1 : 0 );
            }
        }
    }

    // ───── VOLUME TRACE for ≤ ─────
    const volBlue = {
        type: "volume",
        x, y, z, value: v1,
        isomin: 1, isomax: 1,     // only draw voxels == 1
        surface_count: 0,
        opacityscale: [[0, 0],[1,0.8]],
        colorscale: [[0,"lightgreen"],[1,"lightgreen"]],
        slices: { x:{show:false}, y:{show:false}, z:{show:false} }
    };

    // ───── VOLUME TRACE for ≥ ─────
    const volRed = {
        type: "volume",
        x, y, z, value: v2,
        isomin: 1, isomax: 1,
        surface_count: 0,
        opacityscale: [[0, 0],[1,0.8]],
        colorscale: [[0,"lightcoral"],[1,"lightcoral"]],
        slices: { x:{show:false}, y:{show:false}, z:{show:false} }
    };

    return [volBlue, volRed];
}

function genShaded3DRegion_2(a, b, c, t, resolution = 0.1) {
    const redX = [], redY = [], redZ = [];
    const greenX = [], greenY = [], greenZ = [];

    for (let x = -0.2; x <= 1.3; x += resolution) {
        for (let y = -0.2; y <= 1.3; y += resolution) {
            for (let z = -0.2; z <= 1.3; z += resolution) {
                const val = a * x + b * y + c * z;
                if (val <= t) {
                    greenX.push(x); greenY.push(y); greenZ.push(z);
                } else {
                    redX.push(x); redY.push(y); redZ.push(z);
                }
            }
        }
    }

    const greenRegion = {
        type: 'scatter3d',
        mode: 'markers',
        x: greenX,
        y: greenY,
        z: greenZ,
        marker: {
            color: 'green',
            size: 6,
            opacity: 0.08
        },
        hoverinfo: 'skip',
        showlegend: false
    };

    const redRegion = {
        type: 'scatter3d',
        mode: 'markers',
        x: redX,
        y: redY,
        z: redZ,
        marker: {
            color: 'red',
            size: 6,
            opacity: 0.08
        },
        hoverinfo: 'skip',
        showlegend: false
    };

    return [redRegion, greenRegion];
}


function createInvisibleTraces() {
    let invis_traces = []

    //z=0, y=0, x varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [0],
            z: [0],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // fillcolor: 'transparent'
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0

                // //symbol: ['square'],
                // size:  [10],
                color: [LINE_COLOR_ACTIVE],
                // //color: ['rgba(0,0,0,0)'], // fully transparent
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=0, y=1, x varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [1],
            z: [0],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=0, x=0, y varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [0],
            y: [i],
            z: [0],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=0, x=1, y varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [1],
            y: [i],
            z: [0],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=1, y=0, x varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [0],
            z: [1],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=1, y=1, x varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [i],
            y: [1],
            z: [1],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=1, x=0, y varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [0],
            y: [i],
            z: [1],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //z=1, x=1, y varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [1],
            y: [i],
            z: [1],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //x=0, y=0, z varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [0],
            y: [0],
            z: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //x=0, y=1, z varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [0],
            y: [1],
            z: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //x=1, y=0, z varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [1],
            y: [0],
            z: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    //x=1, y=1, z varies
    for(let i= 0; i<1; i+=0.05) { //20 invisible point traces
        let t = {
            x: [1],
            y: [1],
            z: [i],
            marker: {
                // symbol: ['square'],
                size:  [10],
                // color: 'rgba(0, 0, 0, 0)',  // fully transparent color
                // opacity: 0
                color: [LINE_COLOR_ACTIVE],
                opacity: [1],
            },
            type : 'scatter3d',
            nsPlaneControlPt: false,
            hoverinfo: 'none',
            showlegend: false
        }
        invis_traces.push(t);
    }

    return invis_traces
}

function roundAllElements(array) {
    let result = []
    for(let i= 0; i<array.length; i+=1) {
        result.push(parseFloat(array[i].toFixed(2)));
    }
    return result
}

function createTraces(inputs, outputs, weights, threshold) {
    let inBounds = true;
    let markerSize = 10;
    let w1_3d = parseFloat(document.getElementById('weight1_3d').value)
    let w2_3d = parseFloat(document.getElementById('weight2_3d').value)
    let w3_3d = parseFloat(document.getElementById('weight3_3d').value)
    let t_3d = parseFloat(document.getElementById('threshold_3d').value)
    let outputs3d = [0, 0, 0, 0, 0, 0, 0, 1]
    let weights3d = [w1_3d, w2_3d, w3_3d]
    let threshold3d = t_3d

    let calculatedVals3d = calculateInputs3D(inputs3d, outputs3d, weights3d, threshold3d, line_segs_rep)
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

    let controlptX = roundAllElements(calculatedVals3d[12])
    let controlptY = roundAllElements(calculatedVals3d[13])
    let controlptZ = roundAllElements(calculatedVals3d[14])

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
        colorscale: [[0, 'lightgray'], [1, 'lightgray']], // constant color
        opacity: 1.0,
        showscale: false,
        hoverinfo: 'skip',
        hovertemplate: null,
        name: '',
        showlegend: false
    }

    let controlPoints = {
        x: controlptX,
        y: controlptY,
        z: controlptZ,
        mode: 'markers',
        inBounds: true,
        nsPlaneControlPt: true,
        // text: ["Control Point 1", "Control Point 2", "Control Point 3"],
        // hovertemplate: '<b>%{text}</b>',

        marker: {
            symbol: Array(controlptX.length).fill('square'),
            size:  Array(controlptX.length).fill(markerSize),
            color: Array(controlptX.length).fill(CONTROL_PT_ACTIVE),
            opacity: Array(controlptX.length).fill(1),
        },
        // hoverinfo: 'skip',
        type: 'scatter3d',
        nsPoints: true,
        showlegend: false
    }

    let epsilon_invis = 1e-3;

    // creating invisible traces on the 12 edges of the unit cube
    invis_traces = createInvisibleTraces();


    //for debugging purposes:
    //invis_traces = []

    //let data2 = [surface].concat(linedata, [incorrect, trueTrace, falseTrace, controlPoints]);
    // let shaded_regions = generateRegionMeshes(w1_3d, w2_3d, w3_3d, t_3d)
    // let shaded_regions = genShaded3DRegion(w1_3d, w2_3d, w3_3d, t_3d, 0.1);
    let shaded_regions = genShaded3DRegion_2(w1_3d, w2_3d, w3_3d, t_3d);

    let data2 = [surface].concat(linedata, [shaded_regions[0], shaded_regions[1], incorrect, trueTrace, falseTrace, controlPoints]);

    console.log(data2)

    let layout2 = {margin: {
            //TAKEN FROM NEURON SANDBOX CODE
            l: 30,
            r: 0,
            t: 0,
            b: 30,
            pad: 0
            // l: 0,
            // r: 0,
            // b: 0,
            // t: 0
        },
        scene: {
            dragmode: 'orbit',
            camera: camera,
            zaxis: {
                // automargin: true,
                title: {
                    text: '',
                    standoff: -10,
                },
                range: [-2, 3],  // Set the z-axis range to control what's displayed
                // tickvals: [0, 1],
                showgrid: true,
                showticklabels: false,
                showline: false,
                zeroline: false,
                showspikes: false

            },
            xaxis: {
                title: '',
                range: [-2, 3], //[-0.5, 1.5] //EXPAND HERE
                // tickvals: [0, 1],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
                showspikes: false
            },
            yaxis: {
                title: '',
                range: [-2, 3], //working: -2, 3
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
                showspikes: false
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

    if (!initialCameraSet) {
        layout2.scene.camera = {
            eye: {
                x: 0.75,
                y: 0.75,
                z: 0.75
            }
        };
        initialCameraSet = true;
    }

    console.log(data2)
    return [data2, layout2];

}
function calculateInputs3D(inputs, outputs, weights, threshold, line_segs_rep) {
    // generate all unique x and y-values
    let xSet = new Set();
    let ySet = new Set();
    for (let i = 0; i < inputs.length; i++) {
        xSet.add(inputs[i][0]);
        ySet.add(inputs[i][1]);
    }
    let xList = Array.from(xSet);
    let yList = Array.from(ySet);
    xList = [-0.2, 1.3]
    yList = [-0.2, 1.3]


    // generate 2D grid for rectangle
    let xGrid = [
        [xList[0], xList[1]],
        [xList[0], xList[1]],
    ];

    let yGrid = [
        [yList[0], yList[0]],
        [yList[1], yList[1]],
    ];

    let zValues = [];
    for (let i = 0; i < yList.length; i++) {
        let row = [];
        for (let j = 0; j < xList.length; j++) {
            let w0 = weights[0], w1 = weights[1], w2 = weights[2];
            if (w2 === 0) w2 = 1e-5; // prevent divide-by-zero
            let zVal = (threshold - w1 * yList[i] - w0 * xList[j]) / w2;
            row.push(zVal);
        }
        zValues.push(row);
    }

    // // ax + by + cz = threshold
    // // therefore, z = (threshold - by - ax) / c
    // //TODO: bug: weight2 can be 0
    // // if weight is 0, set it to 1e-5
    // let zValues = []
    // for (let i = 0; i < yList.length; i++) {
    //     let row = []
    //     for (let j = 0; j < xList.length; j++) {
    //         let zVal = (threshold - weights[1]*yList[i] - weights[0]*xList[j]) / weights[2];
    //         if(weights[2] === 0)
    //             zVal = 0
    //         row.push(zVal)
    //
    //     }
    //     zValues.push(row)
    // }
    // console.log(zValues)

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

    //GOAL: want to store line segments that INTERSECT the plane. Use these to calc control pts.
    //eqn of the plane: ax + by + cz = threshold
    //want to compare ax + by + cz - threshold w/ (x, y, z) plugged in from diff line seg eps
    //same sign: no intersection--no control pt.
    //diff sign: yes intersection--yes control pt.
    //0: touches plane -- //TODO: code up this case later
    let intersected_segs = [];
    for(let i= 0; i< line_segs_rep.length; i+=4) {
        let seg_start = line_segs_rep[i];
        for(let j=i+1; j<i+4; j++) {
            let seg_end = line_segs_rep[j];
            let seg_start_val = weights[0]*seg_start[0] + weights[1]*seg_start[1] + weights[2]*seg_start[2] - threshold;
            let seg_end_val = weights[0]*seg_end[0] + weights[1]*seg_end[1] + weights[2]*seg_end[2] - threshold;
            if(seg_start_val === 0 || seg_end_val === 0)
                continue; //ignore for now
            else if((seg_start_val > 0 && seg_end_val < 0) || (seg_start_val < 0 && seg_end_val > 0)){ //they are diff signs, so we care about them!
                intersected_segs.push([i, j]);
            }
        }
    }

    let control_points = [];
    let control_pointsX = [];
    let control_pointsY = [];
    let control_pointsZ = [];
    //GOAL: want to find the intersection point (control point)
    for(let i=0; i<intersected_segs.length; i++) {
        let seg_start = line_segs_rep[intersected_segs[i][0]];
        let seg_end = line_segs_rep[intersected_segs[i][1]];
        let var_changed = 0;
        for(let j = 0; j < seg_start.length; j++) {
            if(seg_start[j] - seg_end[j] !== 0) {
                var_changed = j;
                break;
            }
        }
        let var_changed_val = 0;
        if(var_changed == 0) { //x value was changed
            var_changed_val = (threshold - weights[1]*seg_start[1] - weights[2]*seg_start[2])/weights[0];
            control_points.push([var_changed_val, seg_start[1], seg_start[2]]);
            control_pointsX.push(var_changed_val);
            control_pointsY.push(seg_start[1]);
            control_pointsZ.push(seg_start[2]);
        }
        else if(var_changed == 1) { //y value was changed
            var_changed_val = (threshold - weights[0]*seg_start[0] - weights[2]*seg_start[2])/weights[1];
            control_points.push([seg_start[0], var_changed_val, seg_start[2]]);
            control_pointsX.push(seg_start[0]);
            control_pointsY.push(var_changed_val);
            control_pointsZ.push(seg_start[2]);
        }
        else { //z value was changed
            var_changed_val = (threshold - weights[1]*seg_start[1] - weights[0]*seg_start[0])/weights[2];
            control_points.push([seg_start[0], seg_start[1], var_changed_val]);
            control_pointsX.push(seg_start[0]);
            control_pointsY.push(seg_start[1]);
            control_pointsZ.push(var_changed_val);
        }
    }

    return [xGrid, yGrid, zValues, xTrue, yTrue, zTrue, xFalse, yFalse, zFalse, incorrectX, incorrectY, incorrectZ, control_pointsX, control_pointsY, control_pointsZ];

}

function updatePlotlyData(div, newData, traceNum) {
    // updates plotly div (string), using specific data at a specific trace number
    Plotly.restyle(div, newData, traceNum)
    Plotly.deleteTraces(div, traceNum)
    Plotly.addTraces(div, newData, traceNum)
}

function initialize () {
    // let w1 = document.getElementById('weight1').value
    // let w2 = document.getElementById('weight2').value
    // let t = document.getElementById('threshold').value
    // let weights = [w1, w2]
    // let threshold = [t]
    let weights_dummy = [0, 0];
    let threshold_dummy = [1];
    let outputs_dummy = [0, 0, 0 ,0];

    let result = createTraces(inputs3d, outputs_dummy, weights_dummy, threshold_dummy);
    let data2 = result[0];
    let layout2 = result[1];
    initialCameraSet = true;


    Plotly.newPlot('tester2', data2, layout2, {displayModeBar: false}).then(attach_3d);

    //let dragLayer = document.getElementsByClassName('nsewdrag')[0]

    let d3 = Plotly.d3;
    let td = document.getElementById('tester2');

    var myPlot3D = document.getElementById('tester2')
    //console.log("number of traces: " + myPlot3D.data.length);

    //let dragLayer = document.getElementsByClassName('nsewdrag')[0]

    function attach_3d() {
        td.addEventListener('mousedown', function(evt) {
            console.log("in mousedown, move point")
            let plotlyDiv = document.getElementById('tester2')
            if (pointClicked3D === -1) { //invisible trace was pressed; need to move the plane
                // let coords = checkDist3D(xInDataCoord3D, yInDataCoord3D, zInDataCoord3D);
                //let coords = checkDist(xInDataCoord, yInDataCoord);
                //because we preset the xcoords and ycoords, we don't need to use checkDist
                let coords = [xInDataCoord3D, yInDataCoord3D, zInDataCoord3D];
                // want to move point
                if (coords[0] !== -1)  {
                    if (isLegalPlacement_3D(plotlyDiv.data, coords)) {
                        // check if we placed point in an illegal place (both points on one of the border axes)
                        //console.log(plotlyDiv.data)

                        let newPlotly = changePlaneByControlPoint(plotlyDiv.data, coords)
                        let newData = newPlotly[0]
                        let newLayout = newPlotly[1]

                        Plotly.react('tester2', newData, newLayout);
                        data = plotlyDiv.data;
                        pointClicked3D = 0;
                        // justMouseDown = true;
                        // dragLayer.style.cursor = '' 
                    }
                }

            }
        });

    }

    var myPlot3d = document.getElementById('tester2')

    myPlot3d.on('plotly_hover', function(data){
        console.log("in plotly hover")
        var point = data.points[0];
        xInDataCoord3D = point.x;
        yInDataCoord3D = point.y;
        zInDataCoord3D = point.z;
    });

    let isHandlingClick = false;
    myPlot3d.on('plotly_click', function(clickedData) {
        let plotlyDiv = document.getElementById('tester2')
        // rotateControlPtColors(plotlyDiv.data, clickedData)
        console.log("in plotly_click before isHandlingClick")
        if (isHandlingClick) return;
        isHandlingClick = true;
        
        console.log("in plotly_click, clicked on point")
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
            if (!clickedData.points[i].data.nsPlaneControlPt)
                correctTrace = false;
            if (pointClicked3D === 0) { //have not yet hit a point yet
                console.log("reached here")
                pointClicked3DX = clickedData.points[i].x
                pointClicked3DY = clickedData.points[i].y
                pointClicked3DZ = clickedData.points[i].z
                // console.log(clickedData.points[i])
                // let idx = findIndexByPoint(clickedData.points[i])
                if (clickedData.points[i].data.nsPlaneControlPt) {
                    //need to check if we clicked an active control point or an inactive control point
                    //find index of control point
                    let control_pt_index = findIndexByPoint(clickedData.points[i].data, pointClicked3DX, pointClicked3DY, pointClicked3DZ)
                    if(clickedData.points[i].data.marker.color[control_pt_index] === "rgb(240, 146, 5)") //active control point
                    {
                        if (clickedData.points[i].data.inBounds) {
                            pointClicked3D = -1;
                            //add invisible traces when control point is clicked
                            let updatedData = [...plotlyDiv.data];
                            console.log("debug: reach here")
                            let invis_traces = createInvisibleTraces();
                            updatedData.splice(1, 0, ...invis_traces);
                            //console.log(updatedData)
                            
                            //update control point appearance
                            if (correctTrace) {
                                updatedData[updatedData.length - 1].marker.color[pn] = 'yellow';
                                updatedData[updatedData.length - 1].marker.size[pn] = 10;
                                updatedData[updatedData.length - 1].marker.symbol[pn] = 'square';
                                updatedData[updatedData.length - 1].marker.opacity[pn] = 1;
                            }

                            console.log(updatedData);
                            Plotly.react('tester2', updatedData, layout2);
                            // setTimeout(() => {
                            //     Plotly.react('tester2', updatedData, layout2);
                            // }, 50);
                        } else {
                            correctTrace = false;
                        }
                    }
                    else if(clickedData.points[i].data.marker.color[control_pt_index] === 'rgb(55, 128, 191)') //inactive control point; need rotation
                    {
                        let rotated_updatedData = rotateControlPtColors(plotlyDiv.data, clickedData);
                        Plotly.react('tester2', rotated_updatedData, layout2);
                        console.log(rotated_updatedData)
                        console.log(plotlyDiv.data)
                        // setTimeout(() => {
                        //     Plotly.react('tester2', rotated_updatedData, layout2);
                        // }, 50);
                    }
                }
            }
            else if (pointClicked3D === -1) {
                //have already clicked on a control point, you've now clicked on an invisible trace
                //reset the yellow control point to normal color, delete the invisible traces
                let updatedData = [...data2];

                //find index of the yellow control point
                const controlPointsTrace = updatedData[updatedData.length - 1];
                const yellowPointIndex = controlPointsTrace.x.findIndex((x, index) =>
                    x === pointClicked3DX &&
                    controlPointsTrace.y[index] === pointClicked3DY &&
                    controlPointsTrace.z[index] === pointClicked3DZ
                );

                //set to default color
                if (yellowPointIndex !== -1) {
                    updatedData[updatedData.length - 1].marker.color[yellowPointIndex] = LINE_COLOR_ACTIVE;
                    updatedData[updatedData.length - 1].marker.size[yellowPointIndex] = 10;
                    updatedData[updatedData.length - 1].marker.symbol[yellowPointIndex] = 'square';
                    updatedData[updatedData.length - 1].marker.opacity[yellowPointIndex] = 1;
                }

                //console.log(updatedData)
                setTimeout(() => {
                    Plotly.react('tester2', updatedData, layout2);
                }, 50);
                // pointClicked3D = 0;
            }
        }

        //setting a timeout and a flag to ensure plotly_click is not called twice upon Plotly.react
        setTimeout(() => {
            isHandlingClick = false;
        }, 50);
    });

    //console.log(data.find(e => e.nsLine))

}

function findLine(data) {
    return data.find(obj => obj.nsLine);
}

function isLegalPlacement_3D(data, coords) {
    return true;
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

function findUnpickedIdxes(data, picked, num_control_pts) {
    //finds the indexes that are currently not in a given list of picked indicies
    let unpicked_indices = []
    for(let i=0; i<num_control_pts; i++) {
        if(!random_indices.includes(i))
            unpicked_indices.push(i)
    }
    return unpicked_indices
}

function findIndexByPoint(data, x_pt, y_pt, z_pt) {
    let index = data.x.findIndex((x, index) =>
        x === x_pt &&
        data.y[index] === y_pt &&
        data.z[index] === z_pt
    );
    return index;
}

function findActiveControlPts(data) {
    //finds the indices (from plotly data) of currently active (orange) control points
    let activeControlPtIdx = []
    for(let i=0; i<data[data.length-1].marker.color.length; i++) {
        if(data[data.length-1].marker.color[i] === 'rgb(240, 146, 5)')
            activeControlPtIdx.push(i)
    }
    return activeControlPtIdx
}

function findClickedControlPts(data) {
    //finds the indices (from plotly data) of currently clicked (yellow) control point
    let yellowPt = -1;
    for(let i=0; i<data[data.length-1].marker.color.length; i++) {
        if(data[data.length-1].marker.color[i] === 'yellow') {
            yellowPt = i
            break;
        }
    }
    return yellowPt
}

function randInt(n) {
    //generates a random integer from 0 (inclusive) to n (exclusive)
    return Math.floor(Math.random() * n);
}

function rotateControlPtColors(data, clickedData) {
    //SPEC: given current plotly data/state, clicked data will be used to recolor control points
    //REQ: data is plotly data, clickedData is plotly data
    //ENS: updates the plotly display with colored active control points. Active ones are orange, inactive are blue.

    // first, get the locations of the current control points
    let controlPointsTrace = data[(data.length - 1)] //this is the index of the trace containing all control points
    let control_x = controlPointsTrace.x
    let control_y = controlPointsTrace.y
    let control_z = controlPointsTrace.z

    // there should only be one point clicked, so extract that point.
    let control_pt_clicked = clickedData.points[0]
    let clicked_x = control_pt_clicked.x
    let clicked_y = control_pt_clicked.y
    let clicked_z = control_pt_clicked.z

    // ensure that clickedData is indeed a control point; if not, return.
    if(!control_pt_clicked.data.nsPlaneControlPt) return;
    let updatedData = [...data];
    updatedData[updatedData.length - 1] = JSON.parse(JSON.stringify(data[data.length - 1]));

    //we want to turn the clicked control point orange.
    const clickedPointIndex = controlPointsTrace.x.findIndex((x, index) =>
        x === clicked_x &&
        controlPointsTrace.y[index] === clicked_y &&
        controlPointsTrace.z[index] === clicked_z
    );
    if(clickedPointIndex !== -1) {
        updatedData[updatedData.length - 1].marker.color[clickedPointIndex] = CONTROL_PT_ACTIVE;
        updatedData[updatedData.length - 1].marker.size[clickedPointIndex] = 10;
        updatedData[updatedData.length - 1].marker.symbol[clickedPointIndex] = 'square';
        updatedData[updatedData.length - 1].marker.opacity[clickedPointIndex] = 1;
    }
    console.log(controlPointsTrace)
    console.log(controlPointsTrace.x)

    //find currently orange (active) control point indices
    const activeControlPtIdx = findActiveControlPts(data)
    const clickedInActive = activeControlPtIdx.findIndex((x, index) =>
        x === clickedPointIndex
    );
    activeControlPtIdx.splice(activeControlPtIdx.indexOf(clickedInActive), 1);

    //random select an active control point, and turn it blue.
    let random = randInt(activeControlPtIdx.length)
    let random_idx = activeControlPtIdx[random]
    updatedData[updatedData.length - 1].marker.color[random_idx] = CONTROL_PT_INACTIVE;
    updatedData[updatedData.length - 1].marker.size[random_idx] = 10;
    updatedData[updatedData.length - 1].marker.symbol[random_idx] = 'square';
    updatedData[updatedData.length - 1].marker.opacity[random_idx] = 1;

    //return updatedData
    return updatedData
}

function newControlPtColors(data) {
    //SPEC: given currently plotly data/state, chooses three control points to color active, i.e. orange.
    //REQ: data is plotly data
    //ENS: updates the plotly display with colored active control points. Active ones are orange, inactive are blue.

    let updatedData = [...data];
    // first, get the locations of the current control points
    let controlPointsTrace = data[data.length - 1] //this is the index of the trace containing all control points
    let control_x = controlPointsTrace.x
    let control_y = controlPointsTrace.y
    let control_z = controlPointsTrace.z
    let num_control_pts = controlPointsTrace.x.length

    //generate three random indices. These indices will become the "active" control points
    let random_indices = []
    while(random_indices.length < 3) {
        random = randInt(num_control_pts)
        if(!random_indices.includes(random))
            random_indices.push(random)
    }
    //find the other indices that were not picked
    let unpicked_indices = []
    for(let i=0; i<num_control_pts; i++) {
        if(!random_indices.includes(i))
            unpicked_indices.push(i)
    }

    //color the the random control points orange. 
    for(let i=0; i<random_indices.length; i++) {
        let idx = random_indices[i]
        updatedData[updatedData.length - 1].marker.color[idx] = CONTROL_PT_ACTIVE;
        updatedData[updatedData.length - 1].marker.size[idx] = 10;
        updatedData[updatedData.length - 1].marker.symbol[idx] = 'square';
        updatedData[updatedData.length - 1].marker.opacity[idx] = 1;
    }

    //color the other non-selected control points blue.
    for(let i=0; i<unpicked_indices.length; i++) {
        let idx = unpicked_indices[i]
        updatedData[updatedData.length - 1].marker.color[idx] = CONTROL_PT_INACTIVE;
        updatedData[updatedData.length - 1].marker.size[idx] = 10;
        updatedData[updatedData.length - 1].marker.symbol[idx] = 'square';
        updatedData[updatedData.length - 1].marker.opacity[idx] = 1;
    }

    //return updatedData
    return updatedData
}

function findPointByIndex(data, new_data, indices) {
    let coords = []
    let data_x = data[data.length - 1].x
    let data_y = data[data.length - 1].y
    let data_z = data[data.length - 1].z
    for(let i=0; i<indices.length; i++) {
        let cur_idx = indices[i]
        let point = [data_x[cur_idx], data_y[cur_idx], data_z[cur_idx]]
        coords.push(point)
    }

    let new_indices = []
    for(let i=0; i<coords.length; i++) {
        let pointIndex = new_data[new_data.length - 1].x.findIndex((x, index) =>
            x === coords[i][0] &&
            new_data[new_data.length - 1].y[index] === coords[i][1] && //add a delta here
            new_data[new_data.length - 1].z[index] === coords[i][2]
        );
        new_indices.push(pointIndex)
    }
    return new_indices
}

function findIndexofPoint(new_data, point) {
    let new_indices = -1
    for(let i=0; i<new_data[new_data.length - 1].x.length; i++) {
        let pointIndex = new_data[new_data.length - 1].x.findIndex((x, index) =>
            x === point[0] &&
            new_data[new_data.length - 1].y[index] === point[1] &&
            new_data[new_data.length - 1].z[index] === point[2]
        );
        if(pointIndex !== -1) {
            new_indices = pointIndex
            break;
        }
        // new_indices.push(pointIndex)
    }
    return new_indices
}

function updateControlPtColor(data, new_data, coeffs, coords) {
    //SPEC: this function handles the possible control color changes when the plane is moved
    //REQ: data is plotly data, clickedData is clicked control point, flag is a string that is either
    //     increased, decreased, or equal, coeffs are the newly generated coefficients from call to 
    //     changePlaneByThreePoints
    //ENS: updated plotly data that handles control coloring accordingly 

    let updatedData = [...new_data]
    let activeControlPtIdx = findActiveControlPts(data)
    let clickedControlPtIdx = findClickedControlPts(data)

    // for(let i=0; i<activeControlPtIdx.length; i++) {
    //     updatedData[updatedData.length - 1].marker.color[i] = CONTROL_PT_ACTIVE;
    //     updatedData[updatedData.length - 1].marker.size[i] = 10;
    //     updatedData[updatedData.length - 1].marker.symbol[i] = 'square';
    //     updatedData[updatedData.length - 1].marker.opacity[i] = 1;
    // }

    // two unclicked active control points should stay active. So two orange control points stay orange.
    let activeInNew = findPointByIndex(data, new_data, activeControlPtIdx)
    for(let i=0; i<activeInNew.length; i++) {
        let idx = activeInNew[i]
        updatedData[updatedData.length - 1].marker.color[idx] = CONTROL_PT_ACTIVE;
        updatedData[updatedData.length - 1].marker.size[idx] = 10;
        updatedData[updatedData.length - 1].marker.symbol[idx] = 'square';
        updatedData[updatedData.length - 1].marker.opacity[idx] = 1;
    }

    // updatedData[updatedData.length - 1].marker.color[clickedControlPtIdx] = CONTROL_PT_ACTIVE;
    // updatedData[updatedData.length - 1].marker.size[clickedControlPtIdx] = 10;
    // updatedData[updatedData.length - 1].marker.symbol[clickedControlPtIdx] = 'square';
    // updatedData[updatedData.length - 1].marker.opacity[clickedControlPtIdx] = 1;

    //one clicked control point becomes active. So yellow control point turns orange.
    let clickedInNew = findIndexofPoint(new_data, coords)
    for(let i=0; i<clickedInNew.length; i++) {
        let idx = clickedInNew[i]
        updatedData[updatedData.length - 1].marker.color[idx] = CONTROL_PT_ACTIVE;
        updatedData[updatedData.length - 1].marker.size[idx] = 10;
        updatedData[updatedData.length - 1].marker.symbol[idx] = 'square';
        updatedData[updatedData.length - 1].marker.opacity[idx] = 1;
    }

    //all other control points (if any) become inactive. So all other control points are blue.
    let num_control_pts = findNumControlPoints(coeffs)
    for(let i=0; i<num_control_pts; i++) {
        if(!activeControlPtIdx.includes(i) && clickedControlPtIdx !== i) {
            updatedData[updatedData.length - 1].marker.color[i] = CONTROL_PT_INACTIVE;
            updatedData[updatedData.length - 1].marker.size[i] = 10;
            updatedData[updatedData.length - 1].marker.symbol[i] = 'square';
            updatedData[updatedData.length - 1].marker.opacity[i] = 1;
        }
    }

    return updatedData
}

function findNumControlPoints(coeffs) {
    //GOAL: want to store line segments that INTERSECT the plane. Use these to calc control pts.
    //eqn of the plane: ax + by + cz = threshold
    //want to compare ax + by + cz - threshold w/ (x, y, z) plugged in from diff line seg eps
    //same sign: no intersection--no control pt.
    //diff sign: yes intersection--yes control pt.
    //0: touches plane -- //TODO: code up this case later
    let intersected_segs = [];
    for(let i= 0; i< line_segs_rep.length; i+=4) {
        let seg_start = line_segs_rep[i];
        for(let j=i+1; j<i+4; j++) {
            let seg_end = line_segs_rep[j];
            let seg_start_val = coeffs[0]*seg_start[0] + coeffs[1]*seg_start[1] + coeffs[2]*seg_start[2] - coeffs[3];
            let seg_end_val = coeffs[0]*seg_end[0] + coeffs[1]*seg_end[1] + coeffs[2]*seg_end[2] - coeffs[3];
            if(seg_start_val === 0 || seg_end_val === 0)
                continue; //ignore for now
            else if((seg_start_val > 0 && seg_end_val < 0) || (seg_start_val < 0 && seg_end_val > 0)){ //they are diff signs, so we care about them!
                intersected_segs.push([i, j]);
            }
        }
    }

    return intersected_segs.length
}

function changePlaneByThreePoints(data, activeControlPtIdx, coords) {
    //SPEC: given original points and new points, generates a new (normalized) equation of a plane
    //REQ: activeControlPtIdx.length === 3,
    //     clickedData is an invis trace, data contains plotly data
    //ENS: returns [a, b, c, t] for plane ax + by + c = t. This describes the new plane.
    //     All coefficients are in range [-5, 5]
    
    // get the control points trace
    let controlPointsTrace = data[data.length - 1];
    
    // get coordinates of the two active control points
    let p1 = [
        controlPointsTrace.x[activeControlPtIdx[0]],
        controlPointsTrace.y[activeControlPtIdx[0]],
        controlPointsTrace.z[activeControlPtIdx[0]]
    ];
    let p2 = [
        controlPointsTrace.x[activeControlPtIdx[1]],
        controlPointsTrace.y[activeControlPtIdx[1]],
        controlPointsTrace.z[activeControlPtIdx[1]]
    ];
    
    // get coordinates of the clicked point (from invisible trace)
    let p3 = [
        coords[0],
        coords[1],
        coords[2]
    ];
    
    // calculate two vectors in the plane
    let v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    let v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    
    // calculate normal vector using cross product
    let a = v1[1] * v2[2] - v1[2] * v2[1];
    let b = v1[2] * v2[0] - v1[0] * v2[2];
    let c = v1[0] * v2[1] - v1[1] * v2[0];

    // normalize the normal vector
    let norm = Math.sqrt(a*a + b*b + c*c);
    if (norm === 0) norm = 1; // avoid divide-by-zero
    a /= norm;
    b /= norm;
    c /= norm;

    // calculate t (plane: ax + by + cz = t)
    let t = a * p1[0] + b * p1[1] + c * p1[2];

    // rescale all coefficients so max(|a,b,c,t|) = 5
    let maxVal = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(t));
    let scale = maxVal === 0 ? 1 : 5 / maxVal;

    a *= scale;
    b *= scale;
    c *= scale;
    t *= scale;

    // a = Math.round(a * 100) / 100;
    // b = Math.round(b * 100) / 100;
    // c = Math.round(c * 100) / 100;
    // t = Math.round(t * 100) / 100;

    return [a, b, c, t];
}

function changePlaneByControlPoint(data, coords) {
    /* SPEC: this function is called when the user clicks on a control point and has clicked on an invisible
        trace, expecting that the plane will now move.
        if 3 control points: the function simply moves the plane from yellow control point
            to new clickedData (invis trace)
        if >3 control points: the function moves the plane based on 3 ACTIVE control points. Handles new
            control point coloring accordingly, by calls to helper functions.
    */
    //REQ: data is plotly data, coords contains the click (x, y, z) coordinates 
    //ENS: returns [data, layout]
    let w1_3d = parseFloat(document.getElementById('weight1_3d').value)
    let w2_3d = parseFloat(document.getElementById('weight2_3d').value)
    let w3_3d = parseFloat(document.getElementById('weight3_3d').value)
    let t_3d = parseFloat(document.getElementById('threshold_3d').value)
    let original_coeffs = [w1_3d, w2_3d, w3_3d, t_3d]

    // find number of control points originally
    let prev_num_control_pts = findNumControlPoints(original_coeffs) 

    // get the indices of the unclicked, ACTIVE control points
    let activeControlPtIdx = findActiveControlPts(data)

    //find index of clicked (yellow) control point
    let yellowPt = findClickedControlPts(data)

    // calls changeLineByThreePoints using the unclicked, active control points, and invis trace location.
    // this should return the new coefficients.
    let new_coeffs = changePlaneByThreePoints(data, activeControlPtIdx, coords)
    let new_weights = [new_coeffs[0], new_coeffs[1], new_coeffs[2]]
    let new_threshold = new_coeffs[3]
    let dummy_outputs = [1, 1, 0, 0];

    // update the sliders
    updateValuesPlotlyToDisplay(new_coeffs[0], new_coeffs[1], new_coeffs[2], new_coeffs[3])

    let new_plotly = createTraces(inputs3d, dummy_outputs, new_weights, new_threshold)
    let new_data = new_plotly[0] 
    let new_layout = new_plotly[1]

    // update the control point colors. All unmoved active control points (two at all times) will stay active.
    // the moved control point will be active. All other control points will be inactive.
    let updatedData = updateControlPtColor(data, new_data, new_coeffs, roundAllElements(coords))

    return [updatedData, new_layout]
}

function updateValuesPlotlyToDisplay(weight1, weight2, weight3, threshold) {
    let weight1_3d = document.getElementById("weight1_3d");
    let weight2_3d = document.getElementById("weight2_3d");
    let weight3_3d = document.getElementById("weight3_3d");
    let threshold_3d = document.getElementById("threshold_3d");

    weight1_3d.value = weight1;
    weight1_3d.nextElementSibling.value = weight1.toFixed(2);
    weight2_3d.value = weight2;
    weight2_3d.nextElementSibling.value = weight2.toFixed(2);
    weight3_3d.value = weight3;
    weight3_3d.nextElementSibling.value = weight3.toFixed(2);
    threshold_3d.value = threshold;
    threshold_3d.nextElementSibling.value = threshold.toFixed(2);

    // document.querySelector("label[for='weight1_3d']").textContent = weight1 + "";
    // document.querySelector("label[for='weight2_3d']").textContent = weight2 + "";
    // document.querySelector("label[for='weight3_3d']").textContent = weight3 + "";
    // document.querySelector("label[for='threshold_3d']").textContent = threshold + "";

    // weight1_3d.innerText = weight1 + "";
    // weight2_3d.innerText = weight2 + "";
    // weight2_3d.innerText = weight3 + "";
    // threshold_3d.innerText = threshold + "";
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

    // get endpoints of line
    // intersection w/ x = 0
    let y_x0 = c/b
    if (y_x0 <= 1 && y_x0 >= 0) {
        intersections.push([0, y_x0])
    }
    // intersection w/ y = 0
    let x_y0 = c/a
    if (x_y0 <= 1 && x_y0 >= 0) {
        intersections.push([x_y0, 0])
    }
    // intersection w/ x = 1
    let y_x1 = (c-a)/b
    if (y_x1 <= 1 && y_x1 >= 0) {
        intersections.push([1, y_x1])
    }
    // intersection w/ y = 1
    let x_y1 = (c-b)/a
    if (x_y1 <= 1 && x_y1 >= 0) {
        intersections.push([x_y1, 1])
    }

    if (intersections.length === 0) {
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


    // update the values in sliders

    let weight1Value = document.getElementById('weight1_val');
    let weight2Value = document.getElementById('weight2_val');
    let thresholdValue = document.getElementById('threshold_val');

    let roundedA = Math.ceil(a * 100) / 100;
    let roundedB = Math.ceil(b * 100) / 100;
    let roundedC = Math.ceil(c * 100) / 100;

    weight1Slider.value = roundedA;
    weight2Slider.value = roundedB;
    thresholdSlider.value = roundedC;
    weight1Value.innerText = roundedA + "";
    weight2Value.innerText = roundedB + "";
    weight3Value.innerText = roundedC + "";

    return {type: lineObj.type, line: lineObj.line, marker: lineObj.marker, x: intersectionX, y:intersectionY, nsLine: true, inBounds: inBounds, hoverinfo: 'skip'}

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

function checkDist3D(x, y, z) {
    let dX0 =  Math.abs(x);
    let dX1 =  Math.abs(x-1);
    let dY0 = Math.abs(y);
    let dY1 = Math.abs(y-1);
    let dZ0 = Math.abs(z);
    let dZ1 =  Math.abs(z-1);

    if (dX0 < distToRegister && dZ0 < distToRegister) {         //purple
        return [0, y, 0];
    } else if (dY0 < distToRegister && dZ0 < distToRegister) {
        return [x, 0, 0];
    } else if (dX1 < distToRegister && dZ0 < distToRegister) {
        return [1, y, 0];
    } else if (dY1 < distToRegister && dZ0 < distToRegister) {
        return [x, 1, 0];
    } else if (dX1 < distToRegister && dY0 < distToRegister) {  //green
        return [1, 0, z];
    } else if (dX1 < distToRegister && dY1 < distToRegister) {
        return [1, 1, z];
    } else if (dX0 < distToRegister && dY1 < distToRegister) {
        return [0, 1, z];
    } else if (dX0 < distToRegister && dY0 < distToRegister) {
        return [0, 0, z];
    } else if (dY0 < distToRegister && dZ1 < distToRegister) {  //red
        return [x, 0, 1];
    } else if (dX1 < distToRegister && dZ1 < distToRegister) {
        return [1, y, 1];
    } else if (dY1 < distToRegister && dZ1 < distToRegister) {
        return [x, 1, 1];
    } else if (dX0 < distToRegister && dZ1 < distToRegister) {
        return [0, y, 1];
    }

    return [-1, -1, -1]; //too far from each line segment
}

function run () {
    // let inputs = [
    //     [0, 0],
    //     [0, 1],
    //     [1, 0],
    //     [1, 1]
    // ]
    // let outputs = [0, 0, 0, 1]
    // let w1 = document.getElementById('weight1').value;
    // let w2 = document.getElementById('weight2').value;
    // let t = document.getElementById('threshold').value;
    let dummy_weights = [0, 0];
    let dummy_threshold = [1];
    let dummy_outputs = [1, 1, 0, 0];

    let result = createTraces(inputs3d, dummy_outputs, dummy_weights, dummy_threshold);
    let data2 = result[0];
    let layout2 = result[1];

    Plotly.react('tester2', data2, layout2);
}

function reverseSign() {

    let weight1Slider = document.getElementById('weight1');
    let weight2Slider = document.getElementById('weight2');
    let thresholdSlider = document.getElementById('threshold');


    let weights = [-1 * weight1Slider.value, -1 * weight2Slider.value]
    let threshold = [-1 * thresholdSlider.value]

    let updated = createTraces(inputs, outputs, weights, threshold)
    let updatedData = updated[0];
    let updatedLayout = updated[1];

    Plotly.react('tester', updatedData, updatedLayout);

    // update the values in sliders + text
    let weight1Value = document.getElementById('weight1_val');
    let weight2Value = document.getElementById('weight2_val');
    let thresholdValue = document.getElementById('threshold_val');


    weight1Slider.value = weights[0] ;
    weight2Slider.value = weights[1];
    thresholdSlider.value = threshold[0] ;
    weight1Value.innerText = weights[0] + "";
    weight2Value.innerText= weights[1] + "";
    thresholdValue.innerText = threshold[0] + "";
}