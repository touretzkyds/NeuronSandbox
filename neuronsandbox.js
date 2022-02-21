"use strict";

class Data {
    constructor(inputData) {
        this.update(inputData); //default shape: (2, 4)
    }

    update(inputData) {
        this.rows = inputData.length;
        this.cols = inputData[0].length;
        this.data = inputData;
    }
}

class DataOperator {
    constructor(){
        this.DEFAULT_VALUE = null;
    }

    computeSize(dataObj, demo, addFeature=0, addEg=0){
        if (demo.mode === "binary"){
            if (addFeature !== 0){
                c = dataObj.cols + addFeature;
                r = 2 ** c;
            }
            else if (addEg !== 0){
                c = dataObj.cols + addEg;
            }
        }
        else {
            if (addFeature !== 0){
                c = dataObj.cols + addFeature;
            }
            else if (addEg !== 0){
                r = dataObj.cols + addEg;
            }
        }
        return [r, c]
    }

    changeDims(dataObj, numRows, numCols){
        let data = (new Array((numCols))).fill((new Array(numRows)).fill(this.DEFAULT_VALUE));
        let shape = [data.length, data[0].length];
        dataObj.data = data;
        dataObj.shape = shape;
        dataObj.rows = shape[0];
        dataObj.cols = shape[1];
    }

    addRow(dataObj, n=1, pos){
        console.log('original rows', dataObj.rows);
        row = Array(dataObj.cols, null);
        arr.splice(pos, 0, row);
        console.log('new rows', dataObj.rows);
    }

    removeRow(dataObj, n=1, pos){
        console.log('original rows', dataObj.rows);
        dataObj.data.pop(pos);
        console.log('new rows', dataObj.rows);
    }
    
    addColumn(dataObj, n=1, pos){
        console.log('original cols', dataObj.cols);
        col = Array(dataObj.rows, null);
        // for (r=0; r<dataObj.rows; ++r){
        //     dataObj.
        // }
        console.log('new rows', arr.rows);
    }
    
    removeColumn(arr, n=1, pos){
        console.log('original rows', arr.rows);
        col = Array(nRows, null);
        console.log('new rows', arr.rows);
    }

    removeFeature(){
        console.log('original features', data.features);
        data.numFeat -= 1
        if (demo.mode === "binary"){
            data.numEg = 2**numFeat
            data.features = (new Array((data.numFeat))).fill((new Array(data.numEg)).fill(-1)) //@@@
        }
        else{
            data.features.pop(-1);
        }
        console.log('new features', data.features);
    }

    createBinaryData(dim){
        let arr = new Array(2**dim).fill(new Array(dim).fill(0));
        // console.log(`arr = `, arr);
        // console.log(`dim = ${dim}`);
        for (let i=0; i<arr.length; i++){
            const binaryString = i.toString(2);
            // console.log(binaryString);
            for (let j=binaryString.length-1; j>=0; j--){
                arr[i][binaryString.length-j-1] = Number(binaryString[binaryString.length-j-1]);
            }
        }
    }
    updateData(dataObj, tableObj){
        let table = tableObj.table;
        for (var r = 0, n = table.rows.length; r < n; r++) {
            for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
                var tableCellValue = table.rows[r].cells[c].innerHTML;
                tableCellValue = demo.stringToValidInt(tableCellValue);
                // skip header row of table
                if (r>0){
                    dataObj.data[r-1][c] = tableCellValue;
                }
            }
        }
        tableObj.updateTable(tableObj); // update table to remove any erroneous symbols by user
    }
}

class Table {
    constructor(dataObj, tblId, editable){
        this.tblId = tblId;
        this.dataObj = dataObj;
        this.initializeTable(dataObj, tblId, editable);
    }

    initializeTable(dataObj, tblId, editable){
        let array = dataObj.data;
        let table = document.getElementById(tblId);
        for(var r=0; r<array.length; r++){
            var newRow = table.insertRow(table.length);
            for(var c=0; c<array[r].length; c++){
                var cell = newRow.insertCell(c);
                cell.innerHTML = array[r][c];
                if (editable) {
                    cell.contentEditable = true;
                    cell.rowIdx = r;
                    cell.addEventListener("mouseenter", function(event){
                        display.hoverInput(event.target.rowIdx);
                    });
                    // add event listener to update demo with table changes
                    cell.addEventListener("focusout", function(event){
                        demo.update();
                    });
                }
            }
        }
        this.table = table;
    }

    updateTable(){
        let table = this.table;
        for (var r = 0, n = table.rows.length; r < n; r++) {
            for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
                // skip header row of table
                if (r>0){
                    const arrayValue = this.dataObj.data[r-1][c];
                    table.rows[r].cells[c].innerHTML = arrayValue;
                }
            }
        }
    }
}

class Perceptron {
    constructor(dataObj, weights, threshold){
        this.numFeats = dataObj.cols;
        this.numEgs = dataObj.rows;
        this.inputData = dataObj.data;
        this.weights = weights;
        this.threshold = threshold;
    }
    
    computeAffineOutput(){
        this.affineOutput = new Array(this.numEgs).fill(0);
        // console.log('feats x egs', this.numFeats, this.numEgs)
        for (let r=0; r<this.numEgs; ++r){
            for (let c=0; c<this.numFeats; ++c){
                const prod = this.inputData[r][c] * this.weights[c];
                // console.log('prod', prod);
                this.affineOutput[r] += prod;
                this.outputData[r][0] += prod;
            }
        }
    }
    
    computeActivnOutput(activation = "threshold"){
        this.activnOutput = new Array(this.numEgs).fill(0);
        if (activation === "threshold") {
            for (let r=0; r<this.numEgs; ++r){
                const res = (this.affineOutput[r] >= this.threshold ? 1 : 0);
                this.activnOutput[r] = res;
                this.outputData[r][1] = res;
            }
        }
    }
    
    computeOutputs(){
        this.outputData = new Array(this.numEgs).fill(0).map(() => new Array(this.numFeats).fill(0));
        this.computeAffineOutput();
        this.computeActivnOutput();
    }

    displayPerceptron(){
        // calc input number
        // compute angle of lines
        // draw circle
        // draw svg from inputs to circle
        // write editable weights on lines
        // draw svg to next output elem id
    }

    updateWeights(){
        for (let i=0; i<demo.weights.length; i++){
            const weight = document.getElementById(`w${i+1}`)
            demo.weights[i] = this.weights[i] = demo.stringToValidInt(weight.innerHTML)
        }
    }
    
    updateThreshold(){
        const threshold = document.getElementById(`th${1}`)
        demo.threshold = this.threshold = demo.stringToValidInt(threshold.innerHTML)
    }
}

class Display {
    constructor(inpObj=null, percepObj=null, outObj=null){
        this.updateDisplay();
    }
    
    displayWeight(wID, idx){
        var weight = document.getElementById(wID)
        weight.innerHTML = `${demo.weights[idx]}`;
        weight.contentEditable = true;
        weight.addEventListener("focusout", function(event){
            demo.update();
        })
    }

    displayThreshold(thID){
        let threshold = document.getElementById(thID);
        threshold.innerHTML = demo.threshold;
        threshold.addEventListener("focusout", function(event){
            demo.update();
        })
    }
    
    displaySelectedInput(){
        var table = document.getElementById("selected-input");
        var cell = table.rows[1].cells[0];
        let strArray = [];
        for (var r=0; r<table.rows.length; r++){
            const str = `${demo.selectedInput[r]} * ${demo.weights[r]}`;
            strArray.push(str);
        }
        cell.innerHTML = strArray.join(" + ")
    }
    
    displaySelectedOutput(){
        var table = document.getElementById("selected-output");
        for (var r=0; r<table.rows.length; r++){
            var cell = table.rows[r].cells[0];
            cell.innerHTML = `y = ${demo.selectedOutput[0]}`
        }
    }
    
    hoverInput(rowIdx){
        demo.selectedInput = demo.inputData[rowIdx];
        demo.selectedOutput = perceptron.outputData[rowIdx];
        this.displaySelectedInput();
        this.displaySelectedOutput();
    }
    
    updateDisplay(){
        demo.weights.map((w, idx) => this.displayWeight(`w${idx+1}`, idx));
        this.displayThreshold("th1");
        this.displaySelectedInput();
        this.displaySelectedOutput();
    }
}

class Demo {
    constructor(){
        // initialize tables for the first time
        this.setDefaultValues();
    }

    setDefaultValues() { 
        this.mode = "regular";
        this.numFeat = 2;
        this.numEg = 4;
        this.inputData = [
            [1, 1],
            [3, -2],
            [3, 4],
            [-2, -5],
        ];
        this.weights = [10,-2];
        this.threshold = 10;
        this.selectedInput = this.inputData[0];
        this.selectedOutput = [3, 0];
    }

    add(type){ //@better name needed in place of 'type'
        if (type="dimension"){
            this.data.numFeat += 1;
            this.data.numEg += (this.mode == "binary") ? this.data.numEg : 0;
            this.data.addFeature();
            this.addColumn('input-table'); //@change to this.display
        }
        else { // ie. type = "example"
            //@add cols button shouldnt be there in binary mode
            if (this.mode == "binary"){
                console.error('Binary mode does not support example addition')
                return
            }
            this.data.numEg += 1;
            this.data.addExample();
            // this.addColumn('input-table'); //@change to this.display
        }
    }

    remove(type){ //@better name needed in place of 'type'
        if (type="dimension"){
            this.data.numFeat -= 1;
            this.data.numEg -= (this.mode == "binary") ? this.data.numEg : 0;
            this.data.addFeature();
            this.deleteColumn('input-table'); //@change to this.display
        }
        else { // ie. type = "example"
            //@add cols button shouldnt be there in binary mode
            if (this.mode == "binary"){
                console.error('Binary mode does not support example addition')
                return
            }
            this.data.numEg -= 1;
            // this.data.addExample();
            this.deleteColumn('input-table'); //@change to this.display
        }
    }

    switchMode(buttonId){
        if (this.mode==="binary"){
            this.mode = "regular";
        }
        else{
            this.mode = "binary";
        }
        console.log('mode set as', this.mode)
    }

    update(){
        dataOp.updateData(inputs, inputTable);
        perceptron.updateWeights();
        perceptron.updateThreshold();
        perceptron.computeOutputs();
        // ineffecient 2 steps, update step needed:
        outputs.update(perceptron.outputData);
        outputTable.updateTable();
        display.updateDisplay();
    }

    stringToValidInt(str){
        return parseInt(str.replace(/(\r\n|\n|\r)/gm, ""));
    }

    async main() {
    }
}

// class DisplayOperator {

//     computeNewSize(){
//         let rows, cols; //initialize within scope of function
//         if (demo.mode == "binary"){
//             rows = 2**(this.numFeat);
//             cols = this.numFeat;
//         }
//         else{
//             rows = this.numEg;
//             cols = this.numFeat;
//         }
//         return rows, cols
//     }

//     // add inputs if user clicks '+' sign
//     resizeTable(tableId, buttonId){
//         const table = document.getElementById("input-table");

//         // add 2^N rows if in binary mode and 1 row if in @@@@ mode
//         let rowsToAdd, colsToAdd; //initialize within scope of function
//         this.numFeat ++; // increase dimensions by 1
//         if (demo.mode == "binary"){
//             rowsToAdd = 2**(this.numFeat) - (2**(this.numFeat-1)); //@@more elegant way?
//             colsToAdd = 1;
//         }
//         else{
//             rowsToAdd = 1;
//             console.log('rowsToAdd', rowsToAdd);
//         }

//         rowsToAdd = this.numEg - table.rows.length + 1 // +1 to exclude table header
//         // colsToAdd = this.numFeat - table.cols.length

//         for (let r=0; r<rowsToAdd; r++){
//             let row = table.insertRow(-1);
//             // create a cell in the new row for every existing column
//             for (let c=0; c<this.numFeat; c++){
//                 let cell = row.insertCell(c);
//                 let input = document.createElement("input");
//                 // add input text fields to cells
//                 // input.type = "text";
//                 // input.className = "textbox";
//                 // cell.appendChild(input);
//             }
    
//         }
//         // for (let i=oldnum; i<2**this.numFeat; i++){
//         //     let row = table.insertRow(-1);
//         //     let cell1 = row.insertCell(0);
//         //     let cell2 = row.insertCell(1);
//         // }
//     }

//     // delete input if user clicks '-' sign
//     // removeInput(){
//     //     const table = document.getElementById("input-table");
//     //     let row = table.deleteRow(-1);
//     //     // for (let i=this.numFeat; i<2**oldnum; i++){
//     //     //     let row = table.deleteRow(-1);
//     //     // }
//     // }
// }

window.onload = function(){
    console.log("window loaded")
}

const demo = new Demo();
const inputs = new Data(demo.inputData);
const dataOp = new DataOperator();
const inputTable = new Table(inputs, "input-table", true);
const perceptron = new Perceptron(inputs, demo.weights, demo.threshold);
perceptron.computeOutputs();
let outputs = new Data(perceptron.outputData);
let outputTable = new Table(outputs, "output-table", false);
dataOp.createBinaryData(2);
perceptron.displayPerceptron();
const display = new Display();

document.addEventListener("DOMContentLoaded", () => {
    demo.main().catch(e => console.error(e));
});


// test code for auto update of data - array on table change 
// document.querySelectorAll('#input-table td')
// .forEach(e => e.addEventListener("click", function() {
//     // Here, `this` refers to the element the event was hooked on
//     console.log("clicked")
//     dataOp.updateData(inputs, inputTable);
//     perceptron.computeOutputs()
// }));


// test code for pixi render of perceptron display
// // 1. Create a Pixi renderer and define size and a background color
// var renderer = PIXI.autoDetectRenderer(500, 400, {
	
//     // create transparent canvas
//     transparent: true,
    
//     // smoothout the edges of our graphics
//     antialias: true,
    
//   });
   
//   // 2. Append canvas element to the body
//   document.body.appendChild(renderer.view);
   
//   // 3. Create a container that will hold your scene
//   var stage = new PIXI.Container();
  
//   var n = 4
  
//   for(var i=0; i<n; i++){
//     // 4a. Create a line
//     var l1 = new PIXI.Graphics();
//     // Define line style = stroke
//     // width, color, alpha
//     l1.lineStyle(3, "0xD5402B", 1);
//     // Define line position - this aligns the top left corner of an element
//     l1.position.x = 400;
//     l1.position.y = 90*i + 50;
//     // Define pivot to the center of the element = transformOrigin
//     // l1.pivot.set(0,340);
//     // l1.rotation = 0.785398; // in radiants - use google to convert degrees to radiants
//     // Draw line
//     l1.moveTo(30,50);
//     l1.lineTo(-300, -100);
//     stage.addChild(l1);
//   }
  
//   // 4b. Create a circle
//   var circle = new PIXI.Graphics();
//   // define outline = stroke
//   circle.lineStyle(3, 0x91CF46, 1);
//   //circle.beginFill(0x709FE9, 0.5);
//   // draw circle (x, y, radius)
//   circle.drawCircle(renderer.width / 2,renderer.height / 2,100);
//   stage.addChild(circle);
  
  
//   // add stage to the canvas
//   render();
//   function render(){
//       renderer.render(stage);
//   }


// test code for perceptron
// class Perceptron {
//     computeOutput(){
//         this.affineCombination()
//         let output_statement = this.activation()
//         document.getElementById("output-statement").innerText = output_statement;
//     }
    
//     affineCombination(){
//         this.combination = 0
//         for (let i=1;i<=this.inputSize; i++){
//             // get input
//             let input = document.getElementById(`x${i}`).value;
//             // get weight
//             let weight = document.getElementById(`w${i}`).value;
//             //linear combination: w*x
//             let w_x = input * weight
//             this.combination += w_x
//         }
//     }
    
//     activation(){
//         this.threshold = document.getElementById("threshold").value
//         if (this.combination > this.threshold) {
//             document.getElementById("output-button").innerText = this.combination;
//             return (`Will fire at given inputs to give output ${this.combination}`)
//         }
//         else {
//             document.getElementById("output-button").innerText = 0;
//             return (`Won't fire`)
//         }
//     }
// }

// test code for table
// // create a table using number of dimensions and mode set by user
// createTable(inputDims, mode="binary", numEgs=4) {
//     const numCols = inputDims;
//     // set number of rows depending on mode @make shorthand and concise (@can remove numCols?)
//     const numRows = (mode=="binary") ? 2**numCols : numEgs;
    
//     // create table using number of rows and columns

//     const head = document.head,
//     inputTable = document.createElement('table');
//     inputTable.id = "input-table"
//     for (let r=0; r<numRows; r++) {
//         const row = inputTable.insertRow();
//         for (let c=0; c<numCols; c++) {
//             let cell = row.insertCell();
//             let input = row.appendChild(document.createElement("input"));
//             input.type = "text";
//             cell.appendChild(input);
//         }
//     }
//     head.appendChild(inputTable);
// }

