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

class DesiredOutputData {
    constructor(desired) {
        this.update(desired);
    }
    update(inputData) {
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
        var arr = [];
        for (let i=0; i<2**dim; i++){
            arr[i] = [];
            let binaryString = i.toString(2);
            while(binaryString.length < dim) {
                binaryString = "0" + binaryString;
            }
            for( let j = 0; j < binaryString.length; j++ ) {
                arr[i][j] = Number(binaryString.substring(j, j+1));
            }
        }
        return arr;
    }

    // update data from table when user changes entry
    updateDataFromTable(dataObj, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = table == outputTable? 1 : 2;
        let r = start;
        for (let n = table.rows.length; r < n; r++) {
            for (var c = 1, m = table.rows[r].cells.length; c < m; c++) {
                const cell = table.rows[r].cells[c];
                const rawValue = cell.innerHTML;
                const [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
                display.highlightInvalidText(cell, isValid);
                dataObj.data[r-start][c-1] = parsedValue;
            }
        }
        console.log("updateDataFromTable, data = " + dataObj.data);
        // do not update table, let user see what they have typed wrong (#6)
        // tableObj.updateTable(tableObj); // update table to remove any erroneous symbols by user
    }

    updateTableFromData(dataObj, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = table == outputTable? 1 : 2;
        let r = start;
        for (let n = table.rows.length; r < n; r++) {
            for (var c = 1, m = table.rows[r].cells.length; c < m; c++) {
                const cell = table.rows[r].cells[c];
                cell.innerHTML = dataObj.data[r-start][c-1];
            }
        }
        console.log("updateTableFromData, data = " + dataObj.data);
    }

    updateDesiredOutput(dataObj, tableObj) {
        let table = tableObj.table;
        let start = 1;
        let r = start;
        for (let n = table.rows.length; r < n; r++) {
            let c = 2;
            const cell = table.rows[r].cells[c];
            const rawValue = cell.innerHTML;
            const [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
            display.highlightInvalidText(cell, isValid);
            dataObj.data[r-start] = parsedValue;
        }
        console.log("updateDesiredOutput, data = " + dataObj.data);
    }

    // make editable and update demo on edit
    makeEditable(textbox, editable = true){ // TODO: Move from dataOp to displayOp
        textbox.contentEditable = editable;
        // add event listener to update demo with table changes
        textbox.addEventListener("focusout", function(event){
            demo.update(this);
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
            this.makeHoverable(newRow, tblId);
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
            display.hoverInput(this, tblId, "exit");
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
    makeHoverable(row, tblId){
        row.addEventListener("mouseenter", function(event){
            display.hovering = true;
            display.hoverInput(this, tblId, "enter");
        });
        row.addEventListener("mouseleave", function(event){
            display.hovering = false;
            display.hoverInput(this, tblId, "exit");
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
        const content = '<div class="column-buttons-container" >' +
            '<button class="invisible-button button">–</button>' +
            '<button class="row-button button" onclick="demo.removeCol(this)">–</button>' +
            '<button class="row-button button" onclick="demo.insertCol(this)">+</button>' +
            '</div>';
        var newRow = this.table.rows[0];
        if(all)
        {
            newRow = this.table.insertRow(0);
            this.makeHoverable(newRow, "input-table");
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
            //add the additional first column
            let cell = this.table.rows[0].cells[0];
            cell.innerHTML = '<div class="column-buttons-container" id="first-column-button-container">' +
                '<button class="row-button" id="first-col-button" onclick="demo.insertCol(this)">+</button>' +
                '</div>';
        }
    }

    // insert row at given position and add editable attributes/ cells if reqd.
    insertTableRow(r){
        console.log("insertTableRow, trying to add new row at row=" + r);
        var newRow = this.table.insertRow(r);
        this.makeHoverable(newRow, this.tblId);
        for (var c = 0; c < this.numCols; c++) {
            var cell = newRow.insertCell(c);
            cell.innerHTML = 0;
            cell.className = "animation";
            if (this.isEditable){
                dataOp.makeEditable(cell);
            }
        }
        if (this.isEditable){
            this.createRowButtons(false, r);
        }
        this.numRows++;
        //animation
        $(".animation").each(function () {
            $(this).css('animation-delay',0.2 +'s');
            $(this).className="";
        });
    }

    findAvailableVariable()
    {
        let i = 1;
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for(; i < 1024; i++) {
            let found = false;
            for (let c = 1; c < headerCells.length; c++) {
                var headerInput = headerCells[c];
                if (headerInput.id === ("tblinput" + i))
                {
                    found = true;
                    break;
                }
            }
            if(!found)
                return i;
        }
        return -1;
    }

    insertTableCol(c){
        let newCol = this.findAvailableVariable();
        if(newCol < 0 )
            return;
        var th = document.createElement('th'); //column
        th.innerHTML = "<div class=\"input-content\">" + "x<sub>" + newCol + "</sub>" + "</div>";
        th.setAttribute("id", `tblinput${newCol}`);
        dataOp.makeEditable(th);

        // <div class="input-content">x<sub>2</sub></div>
        //this.table.rows[1].appendChild(th);
        this.table.rows[1].insertBefore(th, this.table.rows[1].children[c]);

        //add new variable to the header row
        //var cellHeader = this.table.rows[1].insertCell(this.numCols + 1);
        //cellHeader.innerHTML = "x<sub>" + (this.numCols + 1) + "</sub>";
        //cellHeader.setAttribute("id", `tblinput${this.numCols + 1}`);

        for (var r = 0; r < this.numRows; r++) { //skip column buttons + row headers
            var cell = this.table.rows[r+2].insertCell(c);
            cell.innerHTML = 0;
            cell.className = "animation";
            if (this.isEditable){
                dataOp.makeEditable(cell);
            }
        }
        this.createColumnButtons(false, this.numCols + 1);
        //this.createColumnButtons(false, 0);
        this.numCols++;

        //animation
        $(".animation").each(function () {
            $(this).css('animation-delay',0.2 +'s');
            $(this).className="";
        });

        let cols = []
        display.getHeaderRowVals(cols);
        this.defaultSelectedInput = cols;
    }

    removeTableCol(c){
        // if(c < 1){
        //     return
        // }
        for (var r = 0; r < this.numRows + 2; r++) { //skip column buttons + row headers
            this.table.rows[r]?.deleteCell(c+1);
        }
        this.numCols--;
        let cols = []
        display.getHeaderRowVals(cols);
        this.defaultSelectedInput = cols;
    }

    removeTableRow(r){
        this.table.deleteRow(r);
        this.numRows--;
    }

    showColumn(c, visible=true, editable=true, startingRow = 0) { //output table (desired)
        for (var r = startingRow; r < this.numRows + 1; r++) {
            const cells = this.table.rows[r].cells;
            if(r != 0) {
                dataOp.makeEditable(cells[c], editable);
            }
            cells[c].style.display = visible? "block" : "none";
        }
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
        this.outputData = new Array(this.dataObj.rows).fill(0).map(() => new Array(3).fill(0));
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
        console.log("updating weights: " + demo.weights);
        for (let i=0; i<demo.weights.length; i++){
            const cell = document.getElementById(`w${i+1}`);
            if(cell)
            {
                dataOp.makeEditable(cell);
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
        $( ".weight_label" ).draggable();
        $( ".weight" ).draggable();
        $( ".draggable" ).draggable();
        setupGenerateTruthTable();
        document.getElementById("generateTruthTable").disabled = true;
    }

    displayWeightFromData(wID, idx){
        var weight = document.getElementById(wID);
        if(!weight) {
            var wDiv = document.createElement('div');
            wDiv.id = `weight-${idx+1}`;
            wDiv.innerHTML = `<text fill="black" class="weights">w<sub>${idx+1}</sub> =</text> <text contenteditable="true" onkeypress="if (keyCode == 13) return false;" id="w${idx+1}" fill="black" class="weights"></text>`;
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
        console.log("selected input: " + demo.selectedInput)
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

        var percents = [];
        let interval = 35/demo.selectedInput.length
        var pre = -interval;
        var start = 35;

        if(demo.selectedInput.length == 2)
            percents = [35, 65]
        else if(demo.selectedInput.length == 1)
            percents = [50]
        else {
            for(let i = 0; i < demo.selectedInput.length; i++ ) {
                percents.push(start);
                start += interval;
            }
        }


        for(let i = 0; i < demo.selectedInput.length; i++)
        {
            demo.weight_lines[i] = new LeaderLine(
                LeaderLine.pointAnchor(selections.rows[i].cells[0], {x: '110%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("perceptron1"), {x: '-5%', y: percents[i]+'%'})
            );
            //console.log("making leader lines: " + selections.rows[i].cells[0]);
            demo.weight_lines[i].color = 'black';
            demo.weight_lines[i].path = 'straight';
        }
        $(".draggable").draggable();
        $( ".weight_label" ).draggable();
        $( ".weight" ).draggable();
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

    isInputTable(tblId) {
        return tblId === "input-table";
    }
    // respond to user hovering over table
    hoverInput(row, tblId, mode){
        let rowIdx = row.rowIndex || 0;
        if(!this.isInputTable(tblId)) //output table, convert to corresponding input row index
            rowIdx += 1;
        console.log(`hoverInput tblId=${tblId },input row=${rowIdx}, mode=${mode}`);
        if(rowIdx < 2) //headers, or leave
        {
            this.handleHoverExit();
            return;
        }

        const inputRow = document.querySelector(`#input-table > tbody > tr:nth-child(${rowIdx+1})`)
        //let outputRowIndex = (rowIdx <= 0) ? 1 : rowIdx;
        let outputRowIndex = rowIdx - 1;
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${outputRowIndex + 1})`)
        if (mode === "enter"){
            // update the active inputs and outputs to display in perceptron diagram
            demo.selectedInput = inputs.data[rowIdx-2];
            demo.selectedOutput = outputs.data[rowIdx-2];
            console.log("enter: set demo.selectedInput =" + demo.selectedInput);
            console.log("enter: set demo.selectedOutput =" + demo.selectedOutput);
            // highlight input and output rows corresponding to the hovered input row
            inputRow.style.background = "lightblue";
            outputRow.style.background = "lightblue";
            //console.log("enter: set outputRow =" + outputRow);
        }
        else {
            this.handleHoverExit(inputRow, outputRow);
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
                selections.rows[r].cells[0].innerHTML = `<div class="input-content">${demo.selectedInput[r]}</div>`;
            }
        }
    }

    handleHoverExit(inputRow, outputRow) {
        // reset display panel inputs to user-defined inputs (#11)
        var headerRowVals = [];
        this.getHeaderRowVals(headerRowVals);

        // reset displayed input to header row values
        demo.selectedInput = headerRowVals;
        // reset displayed output to default
        demo.selectedOutput = demo.defaultSelectedOutput;
        //console.log("exit: set demo.selectedInput =" + demo.selectedInput);
        //console.log("exit: set demo.selectedOutput =" + demo.selectedOutput);

        //console.log("exit: set outputRow =" + outputRow);
        if(inputRow)
            inputRow.style.background = "none";
        if(outputRow)
            outputRow.style.background = "none";
        this.updateSelectedInput();
    }

    getHeaderRowVals(headerRowVals) {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (var c = 1; c < headerCells.length; c++) {
            //var headerInput = document.getElementById(`tblinput${c}`);
            var headerInput = headerCells[c];
            //var headerInput = document.querySelector(`#input-table> tbody > tr:nth-child(${2}) > td:nth-child(${c} > div:nth-child(${1}))`);
            if (headerInput.id.startsWith("tblinput"))
                /*if(headerInput.children[0]) {
                    headerRowVals.push(headerInput.children[0].innerHTML);
                }
                else*/
            {
                let headerInputHtml = headerInput.innerHTML;
                if(!headerInputHtml.length) {
                    headerInputHtml = "<br>";
                }
                headerRowVals.push(headerInputHtml);
            }
            else
                console.log("missing input")
        }
    }

    UpdateInputToggle() {
        let checkbox = document.getElementById("InputToggle");
        if (!checkbox.checked) {
            $("#input-table tr:first").hide();
            $("#input-table tr td:nth-child(1)").hide();
            const buttonRows = document.getElementsByClassName("row-buttons-container");
            buttonRows.forEach(element => {
                element.style.display = "none";
            });
            const buttonColumns = document.getElementsByClassName("column-buttons-container");
            buttonColumns.forEach(element => {
                element.style.display = "none";
            });
            document.getElementById("generateTruthTable").disabled = true;
            document.getElementById("output-table").style.marginTop = "0px";
        } else {
            $("#input-table tr:first").show();
            $("#input-table tr td:nth-child(1)").show();
            const buttonRows = document.getElementsByClassName("row-buttons-container");
            buttonRows.forEach(element => {
                element.style.display = "flex";
            });
            const buttonColumns = document.getElementsByClassName("column-buttons-container");
            buttonColumns.forEach(element => {
                element.style.display = "flex";
            });
            document.getElementById("generateTruthTable").disabled = false;
            document.getElementById("output-table").style.marginTop = "50px";
        }
    }

    UpdateOutputToggle()
    {
        let checkbox = document.getElementById("OutputToggle");
        display.showDesiredOutput(checkbox.checked);
        var outputCol = document.getElementById("output-table");
        var n = outputCol.rows.length;

        for(var i = 1; i < n; i++)
        {
            //var tr = outputCol.rows[i];
            let output = outputCol.rows[i].cells[1];
            let desired = outputCol.rows[i].cells[2];
            this.checkDesiredOutput(output, desired);
        }
    }

    checkDesiredOutput(output, desired) {
        const outputInt = parseInt(output.innerHTML, 10);
        const desiredInt = parseInt(desired.innerHTML, 10);

        if (outputInt !== desiredInt) {
            if(document.getElementById("OutputToggle").checked)
                output.style.backgroundColor = "#ffbfcb";
            //output.style.opacity = "0.2";
        } else {
            output.style.removeProperty('background-color');
        }

    }

// update display panel
    updateDisplay(){
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        this.UpdateInputToggle();
        this.UpdateOutputToggle();
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
        const buttonRows = document.getElementsByClassName("row-buttons-container");
        buttonRows.forEach(element => {
            element.style.display = "none";
        });
        const buttonColumns = document.getElementsByClassName("column-buttons-container");
        buttonColumns.forEach(element => {
            element.style.display = "none";
        });
        // show when hovering over table
        /*  tableObj.table.addEventListener("mouseenter", function(event){
              const buttonRows = document.getElementsByClassName("row-buttons-container");
              buttonRows.forEach(element => {
                  element.style.display = "flex";
              });
              const buttonColumns = document.getElementsByClassName("column-buttons-container");
              buttonColumns.forEach(element => {
                  element.style.display = "flex";
              });
              display.updateDisplay();
          });*/
        // hide when hover out
        tableObj.table.addEventListener("mouseleave", function(event){
            /* const buttonRows = document.getElementsByClassName("row-buttons-container");
             buttonRows.forEach(element => {
                 element.style.display = "none";
             });
             const buttonColumns = document.getElementsByClassName("column-buttons-container");
             buttonColumns.forEach(element => {
                 element.style.display = "none";
             });*/
            display.updateDisplay();
        });
    }
    showDesiredOutput (show) {
        outputTable.showColumn(2, show, show);
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
        this.desiredOutput = [1, 0];
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

    insertRowAtIndex(r, needUpdate = false) {
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
        outputTable.removeTableRow(r-1);
        dataOp.removeDataRow(outputs, r);
        demo.update(); //TODO: check if efficient
    }

    removeAllInputDataCols(needUpdate = true) {
        while( inputTable.numCols > 1) {
            inputTable.removeTableCol(1);
        }
        if(needUpdate) demo.update();
    }

    removeAllInputDataRows(needUpdate = true) {
        while( inputTable.numRows > 0) {
            inputTable.removeTableRow(2);
            dataOp.removeDataRow(inputs, 0);
            outputTable.removeTableRow(1);
            dataOp.removeDataRow(outputs, 0);
        }
        if(needUpdate) demo.update();
    }

    insertWeightCol(n) {
        let parentElement = document.getElementById("input-link-text");
        demo.weights.splice(n-1, 0, 0); //add a weight
        var wDiv = document.createElement('div');
        wDiv.id = `weight-${n+1}`;
        wDiv.className = "weight_label";
        wDiv.innerHTML = `<text fill="black" class="weights">w<sub>${n+1}</sub> =</text> <text contenteditable="true" onkeypress="if (keyCode == 13) return false;" id="w${n+1}" fill="black" class="weights">0</text>`;
        parentElement.insertBefore(wDiv, parentElement.children[n-1]);
        const weightText = document.getElementById(`w${n+1}`);
        dataOp.makeEditable(weightText);
        this.updateWeightUI(parentElement);
    }

    updateWeightUI(parentElement) {

        let childCount = parentElement.children.length;
        // if(childCount === 1) {
        //     let child = parentElement.children[0];
        //     let top = 5;
        //     child.style = "top:" + top + "%;";
        //     child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
        // }
        // else {
            let first = 20;
            let last = 70;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "top:" + top + "%;";
                child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
            }

        //}

    }

    removeWeightCol(n) {
        demo.weights.splice(n, 1);
        let parentElement = document.getElementById("input-link-text");
        //let child = document.getElementById(`weight-${n+1}`);
        let child = parentElement.children[n];
        parentElement.removeChild(child);
        this.updateWeightUI(parentElement);
    }
    // add new row at specific location on button click
    insertCol(button){
        if(inputTable.numCols >= 8) {
            alert("Cannot have more than 8 inputs!")
            return;
        }
        const c = this.getColLocation(button);
        inputTable.insertTableCol(c+1);
        dataOp.insertDataCol(inputs, c);
        this.insertWeightCol(c);
        display.handleHoverExit();
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
        display.handleHoverExit();
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
    update(sender = undefined){
        if(sender && sender.tagName === 'TH') //header changed
        {
            //update selected input so it update immediately
            var headerRowVals = [];
            display.getHeaderRowVals(headerRowVals);
            demo.selectedInput = headerRowVals;
        }
        let bEditOutput = false;
        if(sender && sender.closest('table')?.id == "output-table") { //must be the desired output cell, no need to calculate
            console.log("clicked the desired output cell");
            bEditOutput = true;
            display.checkDesiredOutput(sender.previousSibling, sender);
            return;
        }
        dataOp.updateDataFromTable(inputs, inputTable);
        if(document.getElementById("OutputToggle").checked) {
            dataOp.updateDataFromTable(outputs, outputTable);
        }

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

//adding upload/download functionality (#10)
function downloadFile() {
    let dict = {
        "input": demo.inputData,
        "weight": demo.weights,
        "threshold": demo.threshold,
        "desired-output": desiredOutputs
    };
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dict));
    let el = document.getElementById('downloadFile');
    el.setAttribute("href", dataStr);
    el.setAttribute("download", "neuronsandbox.json");
}

async function uploadFile(event)
{

    const file = event.target.files.item(0)
    if(!file) {
        return;
    }
    const text = await file.text();

    demo.removeAllInputDataRows(false);
    demo.removeAllInputDataCols(false);

    let dict = JSON.parse(text);
    demo.inputData = dict["input"];
    let cloneInputData = [...demo.inputData];
    demo.weights = dict["weight"];
    demo.threshold = dict["threshold"];
    desiredOutputs = dict["desired-output"];
    inputs = new Data(demo.inputData);

    for(let c = inputTable.numCols; c < inputs.data[0]?.length;c++) {
        inputTable.insertTableCol(1);
    }

    for (let r = 0, n = inputs.data.length; r < n; r++) {
        inputTable.insertTableRow(2);
        outputTable.insertTableRow(1);
        dataOp.insertDataRow(outputs, 0);
    }

    demo.inputData = dict["input"];
    inputs = new Data(demo.inputData);
    dataOp.updateTableFromData(inputs, inputTable);
    perceptron = new Perceptron(inputs, demo.weights, demo.threshold);
    perceptron.updateWeights();
    // demo.weights.map((w, idx) => {
    //     this.displayWeightFromData(`w${idx+1}`, idx);
    //     const weight = document.getElementById(`w${idx+1}`);
    //     dataOp.makeEditable(weight);
    // });

    demo.update();

}

window.onload = function(){
    console.log("window loaded")
    $("#input-table tr:first").hide();
    $("#input-table tr td:nth-child(1)").hide();
    //$("#OutputButton").hide();
}

// initialize all classes
const demo = new Demo();
let inputs = new Data(demo.inputData);
let desiredOutputs = new Data(demo.desiredOutput);
const dataOp = new DataOperator();
const inputTable = new Table(inputs, "input-table", true);
let perceptron = new Perceptron(inputs, demo.weights, demo.threshold);
perceptron.computeOutputs();
let outputs = new Data(perceptron.outputData);
const outputTable = new Table(outputs, "output-table", false);
dataOp.createBinaryData(2);
perceptron.displayPerceptron();
const display = new Display();
display.updateDisplay();

document.addEventListener("DOMContentLoaded", () => {
    demo.main().catch(e => console.error(e));
});

$('#InputToggle').change(function() { //toggle edit
    display.UpdateInputToggle();
});

$('#OutputToggle').change(function() { //toggle output
    display.UpdateOutputToggle();
});

