"use strict";

class Data {
    constructor(inputData) {
        this.update(inputData); //default shape: (2, 4)
    }

    // update data array
    update(inputData) {
        this.rows = inputData.length || 0;
        this.cols = inputData[0].length || 0;
        this.data = inputData;
    }
}

class DataOperator {
    constructor(){
        this.DEFAULT_VALUE = 10;
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

    insertDataRow(dataObj, n=1, pos){
        const row = Array(dataObj.cols, this.DEFAULT_VALUE);
        dataObj.data.splice(pos, 0, row);
        dataObj.rows++;
    }
    
    removeDataRow(dataObj, n=1, pos){
        dataObj.data.splice(pos, 1);
        dataObj.rows--;
    }
    
    createBinaryData(dim){
        let arr = new Array(2**dim).fill(new Array(dim).fill(0));
        for (let i=0; i<arr.length; i++){
            const binaryString = i.toString(2);
            for (let j=binaryString.length-1; j>=0; j--){
                arr[i][binaryString.length-j-1] = Number(binaryString[binaryString.length-j-1]);
            }
        }
    }

    // update data from table when user changes entry
    updateDataFromTable(dataObj, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        for (var r = 1, n = table.rows.length; r < n; r++) {
            for (var c = 1, m = table.rows[r].cells.length; c < m; c++) { 
                const cell = table.rows[r].cells[c];
                const rawValue = cell.innerHTML;
                const [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
                display.highlighInvalidText(cell, isValid);
                dataObj.data[r-1][c-1] = parsedValue;
            }
        }
        // do not update table, let user see what they have typed wrong (#6)
        // tableObj.updateTable(tableObj); // update table to remove any erroneous symbols by user
    }

    // make editable and update demo on edit
    makeEditable(textbox){ // TODO: Move from dataOp to displayOp
        textbox.contentEditable = true;
        // add event listener to update demo with table changes
        textbox.addEventListener("focusout", function(event){
            demo.update();
        });
        // accept enter and esc keypress in text boxes
        textbox.addEventListener("keydown", function(event){
            if (event.key === "Enter" || event.key === "Escape") {
                textbox.blur(); // focus out of text box
            }
        });
    }

}

// displays and manipulates HTML table, holds data object
class Table {
    constructor(dataObj, tblId, editable){
        this.tblId = tblId;
        this.dataObj = dataObj;
        this.isEditable = editable;
        this.numRows = dataObj.rows;
        this.numCols = dataObj.cols;
        this.rowButtons = null;
        this.initializeTable(dataObj, tblId);
    }

    // initialize table from data array
    // add edit buttons and hover features if table is input table
    initializeTable(dataObj, tblId){
        let array = dataObj.data;
        let table = document.getElementById(tblId);
        for(var r=0; r<array.length; r++){
            var newRow = table.insertRow(table.length);
            // update displayed selections on hover
            this.makeHoverable(newRow);
            for(var c=0; c<array[r].length; c++){
                var cell = newRow.insertCell(c);
                cell.innerHTML = array[r][c];
                if (this.isEditable) {
                    dataOp.makeEditable(cell);
                }
            }
        }
        // on exiting table, display initial values again (#3)
        table.addEventListener("mouseleave", function(event){
            display.hovering = false;
            display.hoverInput(this, "exit");
        });
        this.table = table;
        // add buttons if table is editable ie. input table
        if (this.isEditable) {
            this.createRowButtons();
            this.rowButtons = document.getElementById("row-buttons");
        }
    }

    // show table values hovered over in selection panel
    makeHoverable(row){
        row.addEventListener("mouseenter", function(event){
            display.hovering = true;
            display.hoverInput(this, "enter");
        });
        row.addEventListener("mouseleave", function(event){
            display.hovering = false;
            display.hoverInput(this, "exit");
        });
    }

    // update table from data array
    updateTable(){
        // skip header row of table, start from 1
        for (var r = 1, n = this.numRows + 1; r < n; r++) {
            for (var c = 0, m = this.numCols; c < m; c++) {
                const arrayValue = this.dataObj.data[r-1][c];
                this.table.rows[r].cells[c].innerHTML = arrayValue;
            }
        }
    }

    // create +/- buttons for adding rows to table
    createRowButtons(all=true, r=null){ // TODO: change function to operate on one row at a time
        const content = '<div class="row-buttons-container">' + 
                        '<button class="row-button" onclick="demo.removeRow(this)">–</button>' + 
                        '<button class="row-button" onclick="demo.insertRow(this)">+</button>' + 
                        '</div>';
        if (!all){
            var cell = this.table.rows[r].insertCell(0);
            cell.innerHTML = content;
            return;
        }
        for (var r = 0, n = this.table.rows.length; r < n; r++) {
            // skip header row of table
            if (r>0){
                var cell = this.table.rows[r].insertCell(0);
                cell.innerHTML = content;
            }
        }  
    }

    // insert row at given position and add editable attributes/ cells if reqd.
    insertTableRow(r){
        var newRow = this.table.insertRow(r);
        this.makeHoverable(newRow);
        for (var c = 0; c < this.numCols; c++) { 
            var cell = newRow.insertCell(c);
            cell.innerHTML = 0;
            if (this.isEditable){
                dataOp.makeEditable(cell);
            }
        }
        if (this.isEditable){
            this.createRowButtons(false, r);
        }
        this.numRows++;
    }
    
    removeTableRow(r){
        this.table.deleteRow(r);
        this.numRows--;
    }
}

// perceptron: holds a data object, weights, threshold
class Perceptron {
    constructor(dataObj, weights, threshold){
        this.dataObj = dataObj;
        this.inputData = dataObj.data;
        this.weights = weights;
        this.threshold = threshold;
    }    
    
    // simple float operations give precision problems (#6)
    correctPrecision(val){
        // do arbitrary large num multiplication since precision error occurs at consistent decimal place
        val = Math.round(val * 10000) / 10000;
        return val;
    }

    // compute combination column of output table
    computeAffineOutput(){
        this.affineOutput = new Array(this.dataObj.rows).fill(0);
        for (let r=0; r<this.dataObj.rows; ++r){
            for (let c=0; c<this.dataObj.cols; ++c){
                const prod = this.inputData[r][c] * this.weights[c];
                // simple float operations give precision problems (#6)
                const affineOutput = this.correctPrecision(this.affineOutput[r] + prod);
                this.affineOutput[r] = affineOutput;
                this.outputData[r][0] = affineOutput;
            }
        }
    }
    
    // compute activation column of output table
    computeActivnOutput(activation = "threshold"){
        this.activnOutput = new Array(this.dataObj.rows).fill(0);
        if (activation === "threshold") {
            for (let r=0; r<this.dataObj.rows; ++r){
                const res = (this.affineOutput[r] > this.threshold ? 1 : 0);
                this.activnOutput[r] = res;
                this.outputData[r][1] = res;
            }
        }
    }
    
    computeOutputs(){
        this.outputData = new Array(this.dataObj.rows).fill(0).map(() => new Array(this.dataObj.cols).fill(0));
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
            const cell = document.getElementById(`w${i+1}`);
            const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
            display.highlighInvalidText(cell, isValid);
            this.weights[i] = parsedValue;
        }
    }
    
    updateThreshold(){
        const cell = document.getElementById(`th${1}`);
        const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
        display.highlighInvalidText(cell, isValid);
        this.threshold = parsedValue;
    }
}

class Display {
    constructor(inpObj=null, percepObj=null, outObj=null){
        this.hovering = false;
        this.initializeDisplay();
        
    }

    initializeDisplay(){
        // make weights and threshold editable on initialization
        demo.weights.map((w, idx) => {
            this.displayWeightFromData(`w${idx+1}`, idx);
            const weight = document.getElementById(`w${idx+1}`);
            dataOp.makeEditable(weight);
        });
        this.displayThresholdFromData(perceptron);
        const threshold = document.getElementById(`th${1}`);
        dataOp.makeEditable(threshold);
        this.displaySelectedInput();
        this.displaySelectedOutput();
        // edit buttons hover functionality
        this.initializeButtonHover(inputTable);
    }
    
    displayWeightFromData(wID, idx){
        var weight = document.getElementById(wID)
        weight.innerHTML = `${perceptron.weights[idx]}`;
    }

    displayThresholdFromData(percepObj){
        const thID = "th1";
        let threshold = document.getElementById(thID);
        threshold.innerHTML = percepObj.threshold;
    }
    
    // set display panel input
    displaySelectedInput(){
        // got rid of equation below neuron diagram
        // replace variable names in selected inputs display with values on hover (#3)
        const selections = document.getElementById("selected-inputs");
        for (var r=0; r<selections.rows.length; r++){
            if (this.hovering){
                selections.rows[r].cells[0].innerHTML = demo.selectedInput[r];
            }
            else{
                selections.rows[r].cells[0].innerHTML = `x<sub>${r+1}</sub>`;
            }
        }
    }
    
    // set display panel output
    displaySelectedOutput(){
        // replace variable names in selected output display with values on hover (#3)
        var table = document.getElementById("selected-output");
        for (var r=0; r<table.rows.length; r++){
            var cell = table.rows[r].cells[0];
            if (this.hovering){
                cell.innerHTML = `${demo.selectedOutput[1]}`
            }
            else{
                cell.innerHTML = 'y'
            }
        }
    }
    
    // respond to user hovering over table
    hoverInput(row, mode){
        const rowIdx = row.rowIndex || 0; // default to 0
        // update the active inputs and outputs to display in perceptron diagram
        demo.selectedInput = inputs.data[rowIdx-1];
        demo.selectedOutput = outputs.data[rowIdx-1];
        this.displaySelectedInput();
        this.displaySelectedOutput();
        // highlight output row corresponding to the hovered input row
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${rowIdx+1})`)
        const buttonCell = document.getElementById(`button${rowIdx}`);
        if (mode === "enter"){
            outputRow.style.background = "lightblue";
        }
        else {
            const buttons = document.getElementsByClassName("shown");
            outputRow.style.background = "none";
        }
    }
    
    // update selected perceptron inputs display
    updateDisplay(){
        this.displaySelectedInput();
        this.displaySelectedOutput();
    }

    //highlight invalid inputs, reset as soon as they are valid (#6)
    highlighInvalidText(cell, isValid){
        if (!isValid){
            cell.style.backgroundColor = "pink";
        }
        else{
            cell.style.removeProperty('background-color');
        }
    }

    initializeButtonHover(tableObj){
        // hide all at initialization
        const buttons = document.getElementsByClassName("row-buttons-container");
            buttons.forEach(element => {
                element.style.display = "none";
        });
        // show when hovering over table
        tableObj.table.addEventListener("mouseenter", function(event){
            const buttons = document.getElementsByClassName("row-buttons-container");
            buttons.forEach(element => {
                element.style.display = "flex";
            });
        });
        // hide when hover out
        tableObj.table.addEventListener("mouseleave", function(event){
            const buttons = document.getElementsByClassName("row-buttons-container");
            buttons.forEach(element => {
                element.style.display = "none";
            });
        });
    }
}

class Demo {
    constructor(){
        // initialize parameters for the first time
        this.setDefaultValues();
    }

    // initial default values for demo
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
        this.weights = [1,-2];
        this.threshold = 1;
        this.selectedInput = this.inputData[0];
        this.selectedOutput = [3, 0];
    }

    // calculate row to insert at, from html button address
    getRowLocation(button){
        return button.parentNode.parentNode.parentNode.rowIndex + 1;
    }

    // add new row at specific location on button click
    insertRow(button){
        const r = this.getRowLocation(button);
        inputTable.insertTableRow(r);
        dataOp.insertDataRow(inputs, r);
        outputTable.insertTableRow(r);
        dataOp.insertDataRow(outputs, r);
        demo.update(); //TODO: check if efficient
    }

    // remove row at specific location on button click
    removeRow(button){
        const r = this.getRowLocation(button) - 1;
        inputTable.removeTableRow(r);
        dataOp.removeDataRow(inputs, r);
        outputTable.removeTableRow(r);
        dataOp.removeDataRow(outputs, r);
        demo.update(); //TODO: check if efficient
    }

    // switch between binary and regular mode
    switchMode(buttonId){
        if (this.mode==="binary"){
            this.mode = "regular";
        }
        else{
            this.mode = "binary";
        }
        console.log('mode set as', this.mode)
    }

    // update entire demo 
    update(){
        dataOp.updateDataFromTable(inputs, inputTable);
        perceptron.updateWeights();
        perceptron.updateThreshold();
        perceptron.computeOutputs();
        // TODO: ineffecient 2 steps, update step needed:
        outputs.update(perceptron.outputData);
        outputTable.updateTable();
        display.updateDisplay();
    }

    // convert to valid inputs for processing and keep track of invalid parts of input
    stringToValidFloat(str){
        var float = parseFloat(str.replace(/(\r\n|\n|\r)/gm, "")); // allow floating point numbers (#6)
        if (isNaN(float)){
            float = 0; // convert NaN to 0 (#6)
        }
        const isValid = (str == float)
        return [float, isValid];
    }

    async main() {
    }
}

window.onload = function(){
    console.log("window loaded")
}

// initialize all classes
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