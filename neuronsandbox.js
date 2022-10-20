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
        const row = Array(dataObj.cols).fill(0);
        dataObj.data.splice(n, 0, row);
        dataObj.rows++;
    }

    removeDataRow(dataObj, n=1, pos){
        dataObj.data.splice(n, 1);
        dataObj.rows--;
    }

    insertDataCol(dataObj, n=1, pos){
        const cols = Array(dataObj.rows).fill(0);
        for(let r = 0; r < dataObj.data.length; r++) {
            dataObj.data[r].splice(n, 0, cols[r]);
            //dataObj.weights[r].splice(n,0,0);
        }
        dataObj.cols++;
    }

    removeDataCol(dataObj, n=1, pos){
        for(var r = 0; r < dataObj.data.length; r++) {
            dataObj.data[r].splice(n, 1);
            //dataObj.weights[r].splice(n, 1);
        }
        dataObj.cols--;
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
        for (var r = 2, n = table.rows.length; r < n; r++) {
            for (var c = 1, m = table.rows[r].cells.length; c < m; c++) {
                const cell = table.rows[r].cells[c];
                const rawValue = cell.innerHTML;
                const [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
                display.highlightInvalidText(cell, isValid);
                dataObj.data[r-2][c-1] = parsedValue;

            }
        }
        console.log("updateDataFromTable, data = " + dataObj.data);
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
        //setupGenerateTruthTable();
    }

    // initialize table from data array
    // add edit buttons and hover features if table is input table
    initializeTable(dataObj, tblId){
        let table = document.getElementById(tblId);
        // allow user to edit input table header (#11)
        for (var c=1; c<table.rows[0].cells.length; c++){
            const headerCell = table.rows[0].cells[c];
            dataOp.makeEditable(headerCell);
        }
        // add data rows to table
        let array = dataObj.data;
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
            display.hoverInput(this, "input-table", "exit");
        });
        this.table = table;
        // add buttons if table is editable ie. input table
        if (this.isEditable) {
            this.createRowButtons();
            this.createColumnButtons();
            this.rowButtons = document.getElementById("row-buttons");
        }
    }

    // show table values hovered over in selection panel
    makeHoverable(row){
        row.addEventListener("mouseenter", function(event){
            display.hovering = true;
            display.hoverInput(this, "input-table", "enter");
        });
        row.addEventListener("mouseleave", function(event){
            display.hovering = false;
            display.hoverInput(this, "input-table", "exit");
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
            '<button class="button" onclick="demo.removeRow(this)">–</button>' +
            '<button class="button" onclick="demo.insertRow(this)">+</button>' +
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

    createColumnButtons(all=true, c=null){ // TODO: change function to operate on one col at a time
        const content = '<div class="row-buttons-container">' +
            '<button class="button" onclick="demo.removeCol(this)">–</button>' +
            '<button class="button" onclick="demo.insertCol(this)">+</button>' +
            '</div>';
        var newRow = this.table.rows[0];
        if(all)
        {
            newRow = this.table.insertRow(0);
            this.makeHoverable(newRow);
            newRow.insertCell(0);
        }


        if (c){
            var cell = this.table.rows[0].insertCell(c);
            cell.innerHTML = content;
            return;
        }
        else
        {
            for(let j = 1; j <= this.numCols; j++)
            {
                let cell = this.table.rows[0].insertCell(j);
                cell.innerHTML = content;
            }
        }
    }

    // insert row at given position and add editable attributes/ cells if reqd.
    insertTableRow(r){
        console.log("insertTableRow, trying to add new row at row=" + r);
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

    insertTableCol(c){
        var th = document.createElement('th'); //column
        th.innerHTML = "<div class=\"input-content\">" + "x<sub>" + (this.numCols + 1) + "</sub>" + "</div>";
        th.setAttribute("id", `tblinput${this.numCols + 1}`);

        // <div class="input-content">x<sub>2</sub></div>
        this.table.rows[1].appendChild(th);


        //add new variable to the header row
        //var cellHeader = this.table.rows[1].insertCell(this.numCols + 1);
        //cellHeader.innerHTML = "x<sub>" + (this.numCols + 1) + "</sub>";
        //cellHeader.setAttribute("id", `tblinput${this.numCols + 1}`);
        //TODO row headers dark blue

        for (var r = 0; r < this.numRows; r++) { //skip column buttons + row headers
            var cell = this.table.rows[r+2].insertCell(c);
            cell.innerHTML = 0;
            if (this.isEditable){
                dataOp.makeEditable(cell);
            }
        }
        this.createColumnButtons(false, this.numCols + 1);
        this.numCols++;

        let cols = []
        for(let i = 0; i < this.numCols; i++)
        {
            cols.push(`x<sub>${i+1}</sub>`);
        }
        this.defaultSelectedInput = cols;
    }

    removeTableCol(c){
        // if(c < 1){
        //     return
        // }
        for (var r = 0; r < this.numRows + 2; r++) { //skip column buttons + row headers
            this.table.rows[r].deleteCell(c+1);
        }
        this.numCols--;
        let cols = []
        for(let i = 0; i < this.numCols; i++)
        {
            cols.push(`x<sub>${i+1}</sub>`);
        }
        this.defaultSelectedInput = cols;
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
        this.outputData = new Array(this.dataObj.rows).fill(0).map(() => new Array(2).fill(0));
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
            if(cell)
            {
                const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
                display.highlightInvalidText(cell, isValid);
                this.weights[i] = parsedValue;
            }
        }
    }

    updateThreshold(){
        const cell = document.getElementById(`th${1}`);
        const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
        display.highlightInvalidText(cell, isValid);
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
        //TODO make arrows here?

        demo.weights.map((w, idx) => {
            this.displayWeightFromData(`w${idx+1}`, idx);
            const weight = document.getElementById(`w${idx+1}`);
            dataOp.makeEditable(weight);
        });
        this.displayThresholdFromData(perceptron);
        const threshold = document.getElementById(`th${1}`);
        dataOp.makeEditable(threshold);
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        // edit buttons hover functionality
        this.initializeButtonHover(inputTable);
    }

    displayWeightFromData(wID, idx){
        var weight = document.getElementById(wID);
        if(!weight) {
            var wDiv = document.createElement('div');
            wDiv.id = `weight-${idx+1}`;
            wDiv.innerHTML = `<text fill="black" class="weights">w<sub>${idx+1}</sub> =</text> <text contenteditable="true" id="w${idx+1}" fill="black" class="weights"></text>`;
            document.getElementById("input-link-text").appendChild(wDiv);
            weight = document.getElementById(wID);
        }
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
        //console.log("displaySelectedInput, selections = " + selections.outerHTML);
        for (var r=0; r<selections.rows.length; r++){
            selections.rows[r].cells[0].innerHTML = demo.selectedInput[r];
        }
    }

    updateSelectedInput()
    {
        if(!demo.selectedInput)
            return;
        let selections = document.getElementById("selected-inputs");
        selections.innerHTML = "";
        for(let i = 0; i < demo.selectedInput.length; i++)
        {
            let newRow = selections.insertRow(i);
            let newCell = newRow.insertCell(0);
            newCell.innerHTML = `<div class=\"input-content\">${demo.selectedInput[i]}</div>`;
        }
        //removes lines when not hovered
        demo.weight_lines.forEach(line => line.remove());
        //empties lines array
        demo.weight_lines = []

        //TODO: somehow add "percentages" so arrows will not point to same place
        var diff = 0;
        for(let i = 0; i < demo.selectedInput.length; i++)
        {
            diff += 20
            demo.weight_lines[i] = new LeaderLine(
                LeaderLine.pointAnchor(selections.rows[i].cells[0], {x: '110%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("perceptron1"), {x: '-5%', y: '50%'})
            );
            demo.weight_lines[i].path = 'straight';
        }


    }

    // set display panel output
    displaySelectedOutput(){
        // replace variable names in selected output display with values on hover (#3)
        var table = document.getElementById("selected-output");
        //console.log("displaySelectedOutput, selections = " + table.outerHTML);
        //console.log("displaySelectedOutput, selectedOutput = " + demo.selectedOutput);
        for (var r=0; r<table.rows.length; r++){
            var cell = table.rows[r].cells[0];
            cell.innerHTML = `${demo.selectedOutput[1]}`;
        }
    }

    // respond to user hovering over table
    hoverInput(row, tblId, mode){
        const rowIdx = row.rowIndex || 0;
        console.log("hoverInput row=" + rowIdx);
        const inputRow = document.querySelector(`#input-table > tbody > tr:nth-child(${rowIdx+1})`)
        let outputRowIndex = (rowIdx <= 0) ? 1 : rowIdx;
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${outputRowIndex})`)
        if (mode === "enter"){
            // update the active inputs and outputs to display in perceptron diagram
            demo.selectedInput = inputs.data[rowIdx-2];
            demo.selectedOutput = outputs.data[rowIdx-2];
            //console.log("enter: set demo.selectedInput =" + demo.selectedInput);
            //console.log("enter: set demo.selectedOutput =" + demo.selectedOutput);
            // highlight input and output rows corresponding to the hovered input row
            inputRow.style.background = "lightblue";
            outputRow.style.background = "lightblue";
            //console.log("enter: set outputRow =" + outputRow);
        }
        else {
            // reset display panel inputs to user-defined inputs (#11)
            const headerCells = document.getElementById(tblId).rows[1].cells;
            var headerRowVals = [];
            for (var c=1; c<headerCells.length; c++){
                headerRowVals.push(document.getElementById(`tblinput${c}`).innerHTML);
            }

            // reset displayed input to header row values
            demo.selectedInput = headerRowVals;
            // reset displayed output to default
            demo.selectedOutput = demo.defaultSelectedOutput;
            //console.log("exit: set demo.selectedInput =" + demo.selectedInput);
            //console.log("exit: set demo.selectedOutput =" + demo.selectedOutput);

            //console.log("exit: set outputRow =" + outputRow);
            inputRow.style.background = "none";
            outputRow.style.background = "none";
        }
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();

        //removes lines when not hovered
        demo.lines.forEach(line => line.remove());
        //empties lines array
        demo.lines = []

        const selections = document.getElementById("selected-inputs");
        //demo.selectedInput = demo.inputData[rowIdx];
        //demo.selectedOutput = perceptron.outputData[rowIdx];
        for (var r=0; r<selections.rows.length; r++) {
            if (this.hovering){
                //console.log(selections.rows[r].cells[0].children);

                selections.rows[r].cells[0].innerHTML = `<div class="input-content">${demo.selectedInput[r]}</div>`;
                console.log(demo.selectedInput[r])
                //draws line
                demo.lines[r] = new LeaderLine(
                    LeaderLine.pointAnchor(inputRow.children[r+1], {x: '70%', y: '50%'}),
                    LeaderLine.pointAnchor(selections.rows[r].cells[0], {x: '10%', y: '50%'}),
                    {dash: {animation: true}}
                );
                demo.lines[r].setOptions({startSocket: 'right', endSocket: 'left'});
            }
            else{
                selections.rows[r].cells[0].innerHTML = `<div class="input-content">x<sub>${r+1}</sub></div>`;
            }
        }
    }

    // update display panel
    updateDisplay(){
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
    }

    //highlight invalid inputs, reset as soon as they are valid (#6)
    highlightInvalidText(cell, isValid){
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
        this.defaultSelectedInput = [`x<sub>1</sub>`, `x<sub>2</sub>`];
        this.defaultSelectedOutput = ["activation", "y"];
        this.selectedInput = this.defaultSelectedInput;
        this.selectedOutput = this.defaultSelectedOutput;
        this.lines = [];
        this.weight_lines = [];
    }

    // calculate row to insert at, from html button address
    getRowLocation(button){
        return button.parentNode.parentNode.parentNode.rowIndex + 1;
    }

    getColLocation(button){
        return button.parentNode.parentNode.cellIndex;
    }

    // add new row at specific location on button click
    insertRow(button){
        const r = this.getRowLocation(button);
        inputTable.insertTableRow(r);
        dataOp.insertDataRow(inputs, r-2);
        outputTable.insertTableRow(r-1);
        dataOp.insertDataRow(outputs, r-2);
        demo.update(); //TODO: check if efficient
    }

    insertRowByIndex(r, needUpdate = false) {
        inputTable.insertTableRow(r);
        dataOp.insertDataRow(inputs, r-2);
        outputTable.insertTableRow(r-1);
        dataOp.insertDataRow(outputs, r-2);
        if(needUpdate)
            demo.update();
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

    removeAllInputDataRows(needUpdate = true) {
        for( let r = 0; r < inputTable.numRows; r++) {
            inputTable.removeTableRow(r);
            dataOp.removeDataRow(inputs, r);
            outputTable.removeTableRow(r);
            dataOp.removeDataRow(outputs, r);
        }
        if(needUpdate) demo.update();
    }

    insertWeightCol(n) {
        let parentElement = document.getElementById("input-link-text");
        demo.weights.splice(n, 0, 0); //add a weight
        var wDiv = document.createElement('div');
        wDiv.id = `weight-${n+1}`;
        wDiv.className = "weight_label";
        wDiv.innerHTML = `<text fill="black" class="weights">w<sub>${n+1}</sub> =</text> <text contenteditable="true" id="w${n+1}" fill="black" class="weights">0</text>`;
        parentElement.insertBefore(wDiv, parentElement.children[n+1]);
        const weightText = document.getElementById(`w${n+1}`);
        dataOp.makeEditable(weightText);
        this.updateWeightUI(parentElement);
    }

    updateWeightUI(parentElement) {
        let childCount = parentElement.children.length;
        let first = 20;
        let last = 70;
        let interval = (last - first) / (childCount - 1);
        for (let i = 0; i < parentElement.children.length; i++) {
            let child = parentElement.children[i];
            let top = Math.floor(first + i * interval);
            child.style = "top:" + top + "%;";
            child.innerHTML = `<text fill="black" class="weights">w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" fill="black" class="weights">${demo.weights[i]}</text>`;
        }
    }

    removeWeightCol(n) {
        demo.weights.splice(n, 1);
        let parentElement = document.getElementById("input-link-text");
        let child = document.getElementById(`weight-${n+1}`);
        if(child)
            parentElement.removeChild(child);
        this.updateWeightUI(parentElement);
    }
    // add new row at specific location on button click
    insertCol(button){
        const c = this.getColLocation(button);
        inputTable.insertTableCol(c+1);
        dataOp.insertDataCol(inputs, c);
        this.insertWeightCol(c);
        demo.update(); //TODO: check if efficient
    }


    // remove row at specific location on button click
    removeCol(button){
        const c = this.getColLocation(button) - 1;
        if(inputTable.numCols <= 1)
        {
            alert("Cannot remove all inputs!")
            return;
        }
        inputTable.removeTableCol(c);
        dataOp.removeDataCol(inputs, c);
        this.removeWeightCol(c);
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
const outputs = new Data(perceptron.outputData);
const outputTable = new Table(outputs, "output-table", false);
dataOp.createBinaryData(2);
perceptron.displayPerceptron();
const display = new Display();

document.addEventListener("DOMContentLoaded", () => {
    demo.main().catch(e => console.error(e));
});