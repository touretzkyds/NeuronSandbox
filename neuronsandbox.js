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
        for(let r = 0; r < dataObj.data.length; r++) {
            dataObj.data[r].splice(n, 1);
            //dataObj.weights[r].splice(n, 1);
        }
        dataObj.cols--;
    }

    createBinaryData(dim) {
        let binaryArray = [];
        for (let i = 0; i < 2**dim; i++){
            binaryArray[i] = [];
            let binaryString = i.toString(2);
            while(binaryString.length < dim) {
                binaryString = "0" + binaryString;
            }
            for(let j = 0; j < binaryString.length; j++ ) {
                binaryArray[i][j] = Number(binaryString.substring(j, j+1));
            }
        }
        return binaryArray;
    }

    // update data from table when user changes entry
    updateDataFromTable(dataObj, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = (table.id === 'output-table')? 1 : 2;
        let startCol = (table.id === 'output-table')? 0 : 1;
        let row = start;
        for (let n = table.rows.length; row < n; row++) {
            for (let c = startCol, m = table.rows[row].cells.length; c < m; c++) {
                const cell = table.rows[row].cells[c];
                const rawValue = cell.innerText;
                let [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
                if(table.id === 'output-table' && c === 2 && (parsedValue !== 1 || parsedValue !== 0) ) {
                    isValid = false;
                }
                display.highlightInvalidText(cell, isValid);
                dataObj.data[row-start][c-startCol] = parsedValue;
            }
        }
        //console.log("updateDataFromTable, data = " + dataObj.data);
        // do not update table, let user see what they have typed wrong (#6)
    }

    updateTableFromData(dataObj, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = table === outputTable? 1 : 2;
        //let row = start;
        for (let row = start; row < table.rows.length; row++) {
            for (let c = 1 ; c < table.rows[row].cells.length; c++) {
                const cell = table.rows[row].cells[c];
                //cell.innerHTML = `<span>`+dataObj.data[row-start][c-1]+`</span>`;
                cell.innerText = dataObj.data[row-start][c-1];
            }
        }
        //console.log("updateTableFromData, data = " + dataObj.data);
    }

    updateTableFromDesired(desiredOutput, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = 1;
        //let row = start;
        for(let row = start; row < table.rows.length; row++) {
            const cell = table.rows[row].cells[2];
            cell.innerText = desiredOutput.data[row-1];
        }
    }

    // updateDesiredOutput(dataObj, tableObj) {
    //     let table = tableObj.table;
    //     let start = 1;
    //     let r = start;
    //     for (let n = table.rows.length; r < n; r++) {
    //         let c = 2;
    //         const cell = table.rows[r].cells[c];
    //         const rawValue = cell.innerHTML;
    //         const [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
    //         display.highlightInvalidText(cell, isValid);
    //         dataObj[r-start] = parsedValue;
    //     }
    //     console.log("updateDesiredOutput, data = " + dataObj);
    // }

    // make editable and update demo on edit
    makeEditable(textbox, editable = true){ // TODO: Move from dataOp to displayOp
        textbox.contentEditable = editable;

        let text;
        if (!textbox.classList.contains("edit-handler")) {
            textbox.classList.add("edit-handler")
            textbox.addEventListener("focusout", function(event){
                demo.update(this);
                console.log("changed!")
                display.checkForSuccess()
                text = textbox.innerText
                if(text && this?.tagName !== 'TH' && this.parentNode?.tagName !== 'TH') {
                    textbox.innerHTML = `<span class="editable-border">` + text + `</span>`
                }

            });
            // textbox.addEventListener("input", function(event) {
            //     let target = event.target,
            //         position = target.selectionStart; // Capture initial position
            //
            //     text = textbox.innerText
            //     if(text && this?.tagName !== 'TH' && this.parentNode?.tagName !== 'TH') {
            //         textbox.innerHTML = `<span class="editable-border">` + text + `</span>`
            //     }
            //
            //
            //     target.value = target.value.replace(/\s/g, '');  // This triggers the cursor to move.
            //
            //     target.selectionEnd = position;
            //
            // })
            textbox.addEventListener("keydown", function(event){
                if (event.keyCode === 13 || event.keyCode === 27) {
                    textbox.blur(); // focus out of text box
                    demo.update(this);

                }
            });
        }
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
    initializeTable(dataObj, tblId) {
        let table = document.getElementById(tblId);
        // allow user to edit input table header (#11)
        for (let c=1; c<table.rows[0].cells.length; c++){
            const headerCell = table.rows[0].cells[c];
            dataOp.makeEditable(headerCell);
        }
        // add data rows to table
        let array = dataObj.data;
        for(let r=0; r<array.length; r++) {
            let newRow = table.insertRow(table.length);
            // update displayed selections on hover
            this.makeHoverable(newRow, tblId);
            for(let c=0; c<array[r].length; c++) {
                let cell = newRow.insertCell(c);
                cell.innerHTML = `<span>`+array[r][c]+`</span>`;
                if (this.isEditable) {
                    dataOp.makeEditable(cell);
                }
            }
        }
        // on exiting table, display initial values again (#3)
        table.addEventListener("mouseleave", function(event) {
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
    makeHoverable(row, tblId) {
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
    updateTable() {
        // skip header row of table, start from 1
        for (let r = 1, n = this.numRows + 1; r < n; r++) {
            for (let c = 0, m = this.numCols; c < m; c++) {
                const arrayValue = this.dataObj.data[r-1][c];
                this.table.rows[r].cells[c].innerText = arrayValue;
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
            let cell = this.table.rows[r].insertCell(0);
            cell.innerHTML = content;
            return;
        }
        for (let r = 0, n = this.table.rows.length; r < n; r++) {
            // skip header row of table
            if (r>0){
                let cell = this.table.rows[r].insertCell(0);
                cell.innerHTML = content;
            }
        }
    }

    //create +/- buttons for adding columns to input table
    createColumnButtons(all=true, columnNum=null){ // TODO: change function to operate on one col at a time
        const content = '<div class="column-buttons-container" >' +
            '<button class="invisible-button button">–</button>' +
            '<button class="row-button button" onclick="demo.removeCol(this)">–</button>' +
            '<button class="row-button button" onclick="demo.insertCol(this)">+</button>' +
            '</div>';
        let newRow = this.table.rows[0];
        if(all)
        {
            newRow = this.table.insertRow(0);
            this.makeHoverable(newRow, "input-table");
            newRow.insertCell(0);
        }

        if (columnNum){
            let cell = this.table.rows[0].insertCell(columnNum);
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

    // insert row at given position and add editable attributes/ cells if required.
    insertTableRow(r, makeEditable = true){

        if(document.getElementById("BinaryToggle").checked)
            makeEditable = false
        else
            makeEditable = true
        //console.log("insertTableRow, trying to add new row at row=" + r);
        let newRow = this.table.insertRow(r);
        this.makeHoverable(newRow, this.tblId);
        for (let c = 0; c < this.numCols; c++) {
            let cell = newRow.insertCell(c);
            cell.innerHTML = `<span>0</span>`
            //cell.innerText = 0;
            cell.classList.add("animation");
            if (this.isEditable && makeEditable){
                dataOp.makeEditable(cell);
            }
            else {
                cell.contentEditable = false;
            }
        }
        if (this.isEditable){
            this.createRowButtons(false, r);
        }
        this.numRows++;
        //animation
        $(".animation").each(function () {
            let style = $(this).attr('style');
            if(style)
            {
                style += '; animation-delay: 0.2s;'
                $(this).attr('style',style);
            }
            else
                $(this).css('animation-delay',0.2 +'s');
            $(this).classList?.remove("animation");
        });
        display.createInputTableEditBorder()
    }

    //finds available indices for variables
    findAvailableIndex()
    {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        let index = -1;
        let nameIndex = -1;
        for(let i = 1; i < 10; i++) {
            let foundIndex = false;
            let foundNameIndex = false;
            for (let c = 1; c < headerCells.length; c++) {
                let headerInput = headerCells[c];
                if (headerInput.id === ("tblinput" + i))
                {
                    foundIndex = true;
                }
                let match = headerInput.innerText.match(/\d$/);
                if(match && match[0] === (''+i)) {
                    foundNameIndex = true;
                }
            }
            if(index < 0 && !foundIndex) {
                index = i;
            }
            if(nameIndex < 0 && !foundNameIndex) {
                nameIndex = i;
            }

            if(index > 0 && nameIndex > 0 )
            {
                return [index, nameIndex];
            }
        }
        return [-1, -1];
    }

    insertTableCol(c){
        let makeEditable = true

        if(document.getElementById("BinaryToggle").checked)
            makeEditable = false

        let tuple = this.findAvailableIndex();
        let newCol  = tuple[0];
        let newNameIndex = tuple[1];
        if (newCol < 0 || newNameIndex < 0)
            return;
        let th = document.createElement('th'); //column
        th.innerHTML = "<div class=\"input-content\">" + "x<sub>" + newNameIndex + "</sub>" + "</div>";
        th.setAttribute("id", `tblinput${newCol}`);
        dataOp.makeEditable(th);

        this.table.rows[1].insertBefore(th, this.table.rows[1].children[c]);

        for (let r = 0; r < this.numRows; r++) { //skip column buttons + row headers
            let cell = this.table.rows[r+2].insertCell(c);
            cell.innerHTML = `<span>0</span>`
            cell.innerText = 0;
            cell.classList.add("animation");
            if (this.isEditable){
                dataOp.makeEditable(cell);
            }
        }
        this.createColumnButtons(false, this.numCols + 1);
        //this.createColumnButtons(false, 0);
        this.numCols++;
        //animation
        $(".animation").each(function () {
            let style = $(this).attr('style');
            if(style)
            {
                style += '; animation-delay: 0.2s;'
                $(this).attr('style',style);
            }
            else
                $(this).css('animation-delay',0.2 +'s');
            $(this).classList?.remove("animation");
        });

        let cols = []
        display.getHeaderRowVals(cols);
        this.defaultSelectedInput = cols;
        display.createInputTableEditBorder()
    }

    removeTableCol(c){
        // if(c < 1){
        //     return
        // }
        for (let r = 0; r < this.numRows + 2; r++) { //skip column buttons + row headers
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

    showColumn(columnNum, visible=true, editable=true, startingRow = 0) { //output table (desired)
        for (let r = startingRow; r < this.numRows + 1; r++) {
            const cells = this.table.rows[r].cells;
            if(r !== 0) {
                dataOp.makeEditable(cells[columnNum], editable);
            }
            cells[columnNum].style.display = visible? "block" : "none";
        }
    }
}

// perceptron: holds a data object, weights, threshold
class Perceptron {
    constructor(dataObj, weights, threshold) {
        this.dataObj = dataObj;
        this.inputData = dataObj.data;
        this.weights = weights;
        this.threshold = threshold;
    }

    // simple float operations give precision problems (#6)
    correctPrecision(val) {
        // do arbitrary large num multiplication since precision error occurs at consistent decimal place
        val = Math.round(val * 10000) / 10000;
        return val;
    }

    // compute combination column of output table
    computeAffineOutput() {
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

    setWeightsUI() {
        for (let i = 0; i < demo.weights.length; i++){
            const cell = document.getElementById(`w${i+1}`);
            if(cell) {
                cell.innerHTML = this.weights[i];
            }
        }
    }
    updateWeightsFromUI(){
        for (let i=0; i<demo.weights.length; i++){
            const cell = document.getElementById(`w${i+1}`);
            if(cell) {
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
        this.outputLine = new LeaderLine(
            LeaderLine.pointAnchor(document.getElementById("perceptron1"), {x: '99%', y: '50%'}),
            LeaderLine.pointAnchor(document.getElementById("seloutput"), {x: '-50%', y: 50+'%'})
        );
        this.outputLine.color = 'black';
        this.outputLine.path = 'straight';
        this.outputLine.position();
        this.createOutputTableColors();
        this.createInputTableEditBorder();
    }

    createOutputTableColors() {
        const outputTable = document.getElementById("output-table");
        let n = outputTable.rows.length;
        for (let i = 1; i < n; i++) {
            let tr = outputTable.rows[i];
            let td1 = tr.cells[0];
            let td2 = tr.cells[1];
            td1.style.fontWeight = 'normal';

            td2.style.fontWeight = 'bold';
            if(td2.style.background !== '#ffbfcb') //error
                td2.style.background = '#f8ffcf'
            //td2.classList.add("bold-td");


        }
    }

    createInputTableEditBorder() {
        const inputTable = document.getElementById("input-table")

        let checkbox = document.getElementById("BinaryToggle");
        let editable = false
        if(!checkbox.checked)
            editable = true
        let n = inputTable.rows.length;
        for (let i = 2; i < n; i++) {
            let tr = inputTable.rows[i];
            for(let j = 1; j < tr.cells.length; j++) {
                let textbox = tr.cells[j]
                //textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                if(editable) {
                    if(textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.add("editable-border")
                }
                else {
                    if(textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.remove("editable-border")
                }

            }
        }


    }

    createOutputTableEditBorder() {
        const outputTable = document.getElementById("output-table")

        let checkbox = document.getElementById("BinaryToggle");
        let editable = false
        if(!checkbox.checked)
            editable = true
        let n = outputTable.rows.length;
        for (let i = 1; i < n; i++) {
            let tr = outputTable.rows[i];
            let textbox = tr.cells[2]
            if(editable) {
                if(textbox.children.length === 0) {
                    textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                }
                textbox.children[0].classList.add("editable-border")
            }
            else {
                if(textbox.children.length === 0) {
                    textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                }
                textbox.children[0].classList.remove("editable-border")
            }
        }


    }

    checkForSuccess() {
        let outputTable = document.getElementById("output-table")
        let tableRows = outputTable.rows.length
        let isCorrect = true;
        for(let i = 1; i < tableRows; i++) {
            let cells = outputTable.rows.item(i).cells
            let output = cells.item(1).innerText;
            let desired = cells.item(2).innerText;
            if(output !== desired) {
                isCorrect = false
                break
            }

        }
        let fanfareToggleChecked = document.getElementById("FanfareToggle").checked
        let fanfareHidden =  document.getElementById("congrats-msg").hidden
        let outputToggleChecked = document.getElementById("OutputToggle").checked
        if(fanfareToggleChecked && outputToggleChecked) {
            if(fanfareHidden) {
                if(isCorrect) {
                    alert("Congrats! You reached the desired output!")
                    document.getElementById("congrats-msg").hidden = false;
                    display.outputLine.position()
                    for(let i = 0; i < demo.weightLines.length; i++)
                    {
                        demo.weightLines[i].position();
                    }

                }
                else {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for(let i = 0; i < demo.weightLines.length; i++)
                    {
                        demo.weightLines[i].position();
                    }
                }

            }
            else { //congrats not hidden, but could have possibly made incorrect
                if(!isCorrect) {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for(let i = 0; i < demo.weightLines.length; i++)
                    {
                        demo.weightLines[i].position();
                    }

                }

            }
        }
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
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        // edit buttons hover functionality
        this.initializeButtonHover(inputTable);
        //$( ".weight_label" ).draggable();
        //$( ".weight" ).draggable();
        $( ".draggable" ).draggable();

    }

    checkCorrectness(tableData) {
        let rows = tableData.rows;
        for(let i = 0; i < rows; i++) {
            if(tableData.data[i][1] !== tableData.data[i][2]) //the actual output and desired output do not match
                return false
        }
        return true
    }
    alignTables() {
        let adjustment = 0
        let maxHeight = 0
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            let headerInput = headerCells[c];
            if (headerInput.id.startsWith("tblinput")) {
                let heightOfTH = headerInput.offsetHeight
                if(heightOfTH > maxHeight)
                    maxHeight = heightOfTH
            }
            else
                console.log("missing input")
        }
        //based on the header's height, we adjust the output table
        //let adjustment = 0
        if(maxHeight > 115)
            adjustment = 50*maxHeight/100


        console.log("max height: " + maxHeight)

        document.getElementById("output-table").style.marginTop = adjustment + "px";

    }

    displayWeightFromData(wID, idx){
        let weight = document.getElementById(wID);
        if(!weight) {
            let wDiv = document.createElement('div');
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
        for (let r=0; r<selections.rows.length; r++){
            selections.rows[r].cells[0].innerHTML = demo.selectedInput[r];
        }
    }

    updateSelectedInput() {
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
        demo.weightLines.forEach(line => line.remove());
        //empties lines array
        demo.weightLines = []

        const length = demo.selectedInput.length

        //percentage values for weight lines for x-axis
        let percentsX = []
        let intervalX = 1/length
        let startX = 0
        switch(length) {
            case 1:
                percentsX = [-3]
                break
            case 2:
                percentsX = [0, 0]
                break
            case 3:
                percentsX = [0, -2.5, 0]
                break
            case 4:
                percentsX = [0, -4, -4.5, -3.5]
                break
            case 5:
                percentsX = [0, -3, -5, -5, -4]
                break
            default:
                for(let i = 0; i < Math.floor(length/2); i++) {
                    percentsX.push(startX);
                    startX -= intervalX;
                }
                startX += intervalX;
                for(let i = Math.floor(length/2); i < length; i++) {
                    percentsX.push(startX);
                    startX += intervalX;
                }
        }


        //percentage values for weight lines for y-axis
        let percentsY = [];
        let intervalY = 16/length
        let startY = 42;
        if(length === 1)
            percentsY = [50]
        else if(length === 2)
            percentsY = [42, 58]
        else if(length === 3)
            percentsY = [42, 50, 58]

        else {
            for(let i = 0; i < length; i++ ) {
                percentsY.push(startY);
                startY += intervalY;
            }
        }

        //TODO : line.position()
        //TODO: line.setOptions()

        const min = 0.0
        const max = 6.0
        const new_min = 2.0
        const new_max = 10.0

        let weight_labels = document.getElementById("input-link-text").children;

        //TODO: x values should also be variable
        for(let i = 0; i < demo.selectedInput.length; i++) {
            let xposition = 6+ percentsX[i]
            // if(i !== 0 && i !== demo.selectedInput.length-1)
            //     xposition = 3;
            demo.weightLines[i] = new LeaderLine(
                LeaderLine.pointAnchor(selections.rows[i].cells[0], {x: '110%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("perceptron1"), {x: xposition+'%', y: percentsY[i]+'%'})
            );

            let splitup = weight_labels[i].textContent.split(" ")
            let num = splitup[splitup.length-1]
            if(!demo.stringToValidFloat(num)[1]) {
                demo.weightLines[i].color = '#ffbfcb'
                demo.weightLines[i].path = 'straight'
                demo.weightLines[i].position();
            }
            else {
                if(demo.stringToValidFloat(num)[0] === 0)
                    demo.weightLines[i].color = 'blue';
                else if(demo.stringToValidFloat(num)[0] < 0)
                    demo.weightLines[i].color = '#c91a0e';
                else
                    demo.weightLines[i].color = 'black';
                demo.weightLines[i].path = 'straight';
                demo.weightLines[i].position();
                if(demo.stringToValidFloat(num)[1]) { //value is a valid number
                    let line_size = ((new_max-new_min)*(Math.abs(demo.stringToValidFloat(num)[0])-min))/(max-min)+new_min
                    if(line_size >= 10.0)
                        line_size = 10.0;
                    demo.weightLines[i].size = line_size;
                }
            }

        }
        let parentElement = document.getElementById("input-link-text");
        const childCount = parentElement.children.length

        for (let i = 0; i < childCount; i++) {
            let child = parentElement.children[i]
            let text = child.textContent

            let splitup = child.textContent.split(" ")
            let num = splitup[splitup.length-1]

            let numConvertedArray = demo.stringToValidFloat(num)
            if(!numConvertedArray[1]) { //if weight is invalid
                child.style.color = '#fc496b'
            }
            else {
                if (numConvertedArray[0] === 0) //value is zer0
                    child.style.color = 'blue'
                else if (numConvertedArray[0] < 0) //negative weight
                    child.style.color = '#c91a0e'
                else
                    child.style.color = 'black'
            }
        }

        $( ".draggable" ).draggable();
        //$( ".weight_label" ).draggable();
        //$( ".weight" ).draggable();
    }

    // set display panel output
    displaySelectedOutput() {
        // replace variable names in selected output display with values on hover (#3)
        let table = document.getElementById("selected-output");
        //console.log("displaySelectedOutput, selections = " + table.outerHTML);
        //console.log("displaySelectedOutput, selectedOutput = " + demo.selectedOutput);
        for (let r=0; r<table.rows.length; r++){
            let cell = table.rows[r].cells[0];
            cell.innerHTML = `<mark>${demo.selectedOutput[1]}</mark>`;
        }
    }

    isInputTable(tblId) {
        return tblId === "input-table";
    }
    // respond to user hovering over table
    hoverInput(row, tblId, mode) {
        const isOutputToggleChecked = document.getElementById("OutputToggle").checked
        let rowIdx = row.rowIndex || 0;
        if(!this.isInputTable(tblId)) //output table, convert to corresponding input row index
            rowIdx += 1;
        //console.log(`hoverInput tblId=${tblId },input row=${rowIdx}, mode=${mode}`);

        const inputRow = document.querySelector(`#input-table > tbody > tr:nth-child(${rowIdx+1})`)
        //let outputRowIndex = (rowIdx <= 0) ? 1 : rowIdx;
        let outputRowIndex = rowIdx - 1;
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${outputRowIndex + 1})`)

        if(rowIdx < 2) //headers, or leave
        {
            this.handleHoverExit();
            return;
        }

        if (mode === "enter"){
            // update the active inputs and outputs to display in perceptron diagram
            demo.selectedInput = inputs.data[rowIdx-2];
            demo.selectedOutput = outputs.data[rowIdx-2];
            //console.log("enter: set demo.selectedInput =" + demo.selectedInput);
            //console.log("enter: set demo.selectedOutput =" + demo.selectedOutput);
            // highlight input and output rows corresponding to the hovered input row
            inputRow.style.background = "lightblue";
            for(let i = 0; i < outputRow.children.length; i++) {
                outputRow.children[i].style.background = "lightblue";
            }

            //console.log("enter: set outputRow =" + outputRow);
        }
        else {
            if(rowIdx % 2 === 0) {
                this.handleHoverExit(inputRow, outputRow );
                if(isOutputToggleChecked)
                    this.checkDesiredOutput(outputRow.children[1], outputRow.children[2])

            }

            else {
                this.handleHoverExit(inputRow, outputRow, true ); //if it is odd, reset to gray
                if(isOutputToggleChecked)
                    this.checkDesiredOutput(outputRow.children[1], outputRow.children[2])
            }


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
        for (let r=0; r<selections.rows.length; r++) {
            if (this.hovering) {
                selections.rows[r].cells[0].innerHTML = `<div class="input-content">${demo.selectedInput[r]}</div>`;
                //console.log(demo.selectedInput[r])
                //draws line
                demo.lines[r] = new LeaderLine(
                    LeaderLine.pointAnchor(inputRow.children[r+1], {x: '70%', y: '50%'}),
                    LeaderLine.pointAnchor(selections.rows[r].cells[0], {x: '10%', y: '50%'}),
                    {dash: {animation: true}}
                );
                demo.lines[r].setOptions({startSocket: 'right', endSocket: 'left'});
            }
            else {
                selections.rows[r].cells[0].innerHTML = `<div class="input-content">${demo.selectedInput[r]}</div>`;
            }
        }
    }

    handleHoverExit(inputRow, outputRow, isOdd = false) {
        // reset display panel inputs to user-defined inputs (#11)
        let headerRowVals = [];
        this.getHeaderRowVals(headerRowVals);

        // reset displayed input to header row values
        demo.selectedInput = headerRowVals;
        // reset displayed output to default
        demo.selectedOutput = demo.defaultSelectedOutput;

        if (isOdd) { //if odd reset color to gray
            if(inputRow)
                inputRow.style.background = "#f2f2f2"; //color gray
            if(outputRow) {
                outputRow.children[0].style.background =  "#f2f2f2"
                outputRow.children[1].style.background = "#f8ffcf"
                outputRow.children[2].style.background =  "#f2f2f2"
            }

        }
        else {
            if(inputRow)
                inputRow.style.background = "none";
            if(outputRow) {
                for(let i = 0; i < outputRow.children.length; i++) {
                    outputRow.children[0].style.background = "none";
                    this.checkDesiredOutput(outputRow.children[1], outputRow.children[2])
                }
            }

        }
        //this.createOutputTableColors();
        this.updateSelectedInput();


    }

    getHeaderRowVals(headerRowVals) {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            //var headerInput = document.getElementById(`tblinput${c}`);
            let headerInput = headerCells[c];
            //var headerInput = document.querySelector(`#input-table> tbody > tr:nth-child(${2}) > td:nth-child(${c} > div:nth-child(${1}))`);
            if (headerInput.id.startsWith("tblinput")) {
                /*if(headerInput.children[0]) {
                    headerRowVals.push(headerInput.children[0].innerHTML);
                }
                else*/

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

    setHeaderRowVals (headerRowVals) {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            //var headerInput = document.getElementById(`tblinput${c}`);
            let headerInput = headerCells[c];
            //var headerInput = document.querySelector(`#input-table> tbody > tr:nth-child(${2}) > td:nth-child(${c} > div:nth-child(${1}))`);
            if (headerInput.id.startsWith("tblinput")) {
                /*if(headerInput.children[0]) {
                    headerRowVals.push(headerInput.children[0].innerHTML);
                }
                else*/

                headerInput.innerHTML = headerRowVals[c-1];
            }
            else {
                console.log("missing input")
            }
        }
    }

    UpdateInputToggle() {
        let checkbox = document.getElementById("InputToggle");

        //display.createOutputTableColors();
        this.updateSelectedInput();
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
            //document.getElementById("generateTruthTable").disabled = true;
            document.getElementById("output-table").style.marginTop = "0px";
            document.getElementById("FanfareToggleBody").hidden = true;
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
            //document.getElementById("generateTruthTable").disabled = false;
            document.getElementById("output-table").style.marginTop = "50px";
            document.getElementById("FanfareToggleBody").hidden = false;
        }

        for(let i = 0; i < demo.weightLines.length; i++)
        {
            demo.weightLines[i].position();
        }

    }

    UpdateOutputToggle() {
        let checkbox = document.getElementById("OutputToggle");
        display.showDesiredOutput(checkbox.checked);
        let outputCol = document.getElementById("output-table");
        let n = outputCol.rows.length;
        display.createOutputTableColors();

        let isCorrect = true;

        for(let i = 1; i < n; i++) {
            //var tr = outputCol.rows[i];
            let output = outputCol.rows[i].cells[1];
            let desired = outputCol.rows[i].cells[2];

            let currCorrect = this.checkDesiredOutput(output, desired);
            if(!currCorrect)
                isCorrect = false;
        }

        // if(checkbox.checked) {
        //     let fanfareToggleChecked = document.getElementById("FanfareToggle")
        //     if(!isCorrect && fanfareToggleChecked) {
        //         alert("Congrats! Desired outputs reached!")
        //     }
        // }

        for(let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }

        display.outputLine.position();
    }

    UpdateBinaryToggle() {
        let checkbox = document.getElementById("BinaryToggle");
        display.createOutputTableColors();

        if(checkbox.checked) {
            setupGenerateTruthTable();
        }
        else { //leave table how it is, but make contenteditable
            for (let r = 2, n = inputTable.table.rows.length; r < n; r++) {
                for (let c = 1, m = inputTable.table.rows[r].cells.length; c < m; c++) {
                    const cell = inputTable.table.rows[r].cells[c];
                    //cell.innerHTML = Object.values(truthData[r - 2])[(c-1)].toString();
                    dataOp.makeEditable(cell);
                }
            }
        }
        display.createInputTableEditBorder();

    }

    UpdateFanfareToggle() {
        let checkbox = document.getElementById("FanfareToggle")
        if(!checkbox.checked) {
            document.getElementById("congrats-msg").hidden = true;
        } else {
            display.checkForSuccess()
        }

    }

    checkDesiredOutput(output, desired) {
        //TODO: do extra testing with the regex and make changes if necessary

        const regex = '/^0*1?$/gm'; //detects trailing zeros

        const outputInt = output.innerText;
        let [outputParsedValue, outputIsValid] = demo.stringToValidFloat(outputInt);

        const desiredInt = desired.innerText;
        let [parsedValue, isValid] = demo.stringToValidFloat(desiredInt);

        if(parsedValue === 1.0) desired.innerHTML = '<span class="editable-border">1</span>';
        if(parsedValue === 0.0) desired.innerHTML = '<span class="editable-border">0</span>';
        if(desiredInt.match(regex)) desired.innerHTML = '<span class="editable-border">1</span>';
        //console.log("parsed: " + parsedValue);
        if(parsedValue !== 1 && parsedValue !== 0 ) {
            isValid = false;
        }
        display.highlightInvalidText(desired, isValid);

        if (outputParsedValue !== parsedValue && document.getElementById("OutputToggle").checked) {
            output.style.background = "#ffbfcb"; //pink (error)
            return false
        }
        else {
            //output.style.removeProperty('background-color');
            output.style.background = "#f8ffcf"
            return true
        }
    }

// update display panel
    updateDisplay() {
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        this.UpdateInputToggle();
        this.UpdateOutputToggle();
        this.alignTables();

    }

    //highlight invalid inputs, reset as soon as they are valid (#6)
    highlightInvalidText(cell, isValid) {
        if (!isValid){
            cell.style.background = "pink";
        }
        else{
            cell.style.removeProperty('background-color');
        }
    }

    initializeButtonHover(tableObj) {
        // hide all at initialization
        const buttonRows = document.getElementsByClassName("row-buttons-container");
        buttonRows.forEach(element => {
            element.style.display = "none";
        });
        const buttonColumns = document.getElementsByClassName("column-buttons-container");
        buttonColumns.forEach(element => {
            element.style.display = "none";
        });
        tableObj.table.addEventListener("mouseleave", function(event){
            display.updateDisplay();
        });
    }
    showDesiredOutput (show) {
        outputTable.showColumn(2, show, show);
        display.createOutputTableEditBorder()
    }
}

class Demo {
    constructor() {
        // initialize parameters for the first time
        this.setDefaultValues();
    }

    // initial default values for demo
    setDefaultValues() {
        this.mode = "regular";
        //this.numFeat = 2;
        //this.numEg = 4;
        this.inputData = [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ];
        this.weights = [1,-2];
        this.threshold = 0;
        this.defaultSelectedInput = [`x<sub>1</sub>`, `x<sub>2</sub>`];
        this.defaultSelectedOutput = ["activation", "y"];
        this.selectedInput = this.defaultSelectedInput;
        this.selectedOutput = this.defaultSelectedOutput;
        this.lines = [];
        this.weightLines = [];
        this.desiredOutput = [0, 0, 0, 0];
    }

    // calculate row to insert at, from html button address
    getRowLocation(button) {
        return button.parentNode.parentNode.parentNode.rowIndex + 1;
    }

    getColLocation(button) {
        return button.parentNode.parentNode.cellIndex;
    }

    // add new row at specific location on button click
    insertRow(button) {
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
    removeRow(button) {
        const r = this.getRowLocation(button) - 1;
        inputTable.removeTableRow(r);
        dataOp.removeDataRow(inputs, r);
        outputTable.removeTableRow(r-1);
        dataOp.removeDataRow(outputs, r);
        demo.lines.forEach(line => line.remove());
        demo.lines = []
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
        demo.weights.splice(n, 0, 0); //add a weight
        let wDiv = document.createElement('div');
        wDiv.id = `weight-${n+1}`;
        wDiv.className = "weight_label";
        wDiv.innerHTML = `<text fill="black" class="weights">w<sub>${n+1}</sub> =</text> <text contenteditable="true" onkeypress="if (keyCode == 13) return false;" id="w${n+1}" fill="black" class="weights">0</text>`;
        parentElement.insertBefore(wDiv, parentElement.children[n+1]);
        const weightText = document.getElementById(`w${n+1}`);
        dataOp.makeEditable(weightText);
        this.updateWeightUI(parentElement);
    }

    updateWeightUI(parentElement) {
        //TODO: make code less messy
        let childCount = parentElement.children.length;
        if(childCount === 1) {
            let child = parentElement.children[0];
            const top = 40;
            child.style = "top:" + top + "%;";
            child.innerHTML = `<text>w<sub>${1}</sub> =</text> <text contenteditable="true" id="w${1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[0]}</text>`;
        }
        else if(childCount === 3) {
            let first = 20;
            let last = 70;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "left:" + -20 + "%;" + "top:" + top + "%;";
                child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
            }
            let child = parentElement.children[1];
            const top = 38;
            child.style = "left: -20%;" +  "top:" + top + "%;";
            child.innerHTML = `<text>w<sub>${2}</sub> =</text> <text contenteditable="true" id="w${2}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[1]}</text>`;

        }
        else if(childCount === 4) {
            let first = 10;
            let last = 80;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                //child.style = "left:" + -10 + "%;";
                child.style = "left:" + -50 + "%;" + "top:" + top + "%;";
                child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
            }

        }
        else if(childCount === 5) {
            let first = 10;
            let last = 80;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "left:" + -20 + "%;" + "top:" + top + "%;";
                child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
            }
             let child = parentElement.children[1];
             const left = -40;
             const top = 10 + 17.5
             child.style = "left:" + left + "%;" + "top:" + top + "%;";
             child.innerHTML = `<text>w<sub>${2}</sub> =</text> <text contenteditable="true" id="w${2}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[1]}</text>`;

            let child1 = parentElement.children[2];
            const left1 = -80;
            const top1 = 10 + 17.5*2 - 5
            child1.style = "left:" + left1 + "%;" + "top:" + top1 + "%;";
            child1.innerHTML = `<text>w<sub>${3}</sub> =</text> <text contenteditable="true" id="w${3}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[2]}</text>`;

            let child2 = parentElement.children[3];
            const left2 = -40;
            const top2 = 10 + 17.5*2 + 8
            child2.style = "left:" + left2 + "%;" + "top:" + top2 + "%;";
            child2.innerHTML = `<text>w<sub>${4}</sub> =</text> <text contenteditable="true" id="w${4}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[3]}</text>`;
        }
        else {
            let first = 20;
            let last = 70;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "top:" + top + "%;";
                child.innerHTML = `<text>w<sub>${i + 1}</sub> =</text> <text contenteditable="true" id="w${i + 1}" onkeypress="if (keyCode == 13) return false;" fill="black" class="weights">${demo.weights[i]}</text>`;
            }

        }
    }

    removeWeightCol(n) {
        demo.weights.splice(n, 1);
        let parentElement = document.getElementById("input-link-text");
        //let child = document.getElementById(`weight-${n+1}`);
        let child = parentElement.children[n];
        if(child && parentElement)
        {
            parentElement.removeChild(child);
        }
        this.updateWeightUI(parentElement);
    }

    removeAllWeightCol() {
        let parentElement = document.getElementById("input-link-text");
        parentElement.innerHTML = ""
        // for(let i = demo.weights.length-1; i <= 0; i--) {
        //     this.removeWeightCol(i);
        // }
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
    removeCol(button) {
        const c = this.getColLocation(button) - 1;
        if(inputTable.numCols <= 1) {
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
        //console.log('mode set as', this.mode)
    }

    // update entire demo
    update(sender = undefined){
        if(sender && sender.tagName === 'TH') { //header changed

            //update selected input so it update immediately
            let headerRowVals = [];
            display.getHeaderRowVals(headerRowVals);
            demo.selectedInput = headerRowVals;
        }
        let bEditOutput = false;
        if(sender && sender.closest('table')?.id === "output-table") { //must be the desired output cell, no need to calculate
            bEditOutput = true;
            display.checkDesiredOutput(sender.previousSibling, sender);
            //dataOp.updateDesiredOutput(demo.desiredOutput, outputTable);
            return;
        }
        dataOp.updateDataFromTable(inputs, inputTable);
        if(document.getElementById("OutputToggle").checked) {
            dataOp.updateDataFromTable(outputs, outputTable);
        }

        perceptron.updateWeightsFromUI();
        perceptron.updateThreshold();
        perceptron.computeOutputs();
        // TODO: ineffecient 2 steps, update step needed:
        //outputs.update(perceptron.outputData);
        for(let i = 0; i < perceptron.outputData.length; i++) {
            for(let j = 0; j < perceptron.outputData[0].length-1; j++ ) {
                outputs.data[i][j] = perceptron.outputData[i][j]
            }
        }
        outputTable.dataObj = outputs;
        outputTable.updateTable();
        display.updateDisplay();
        display.outputLine.position();
        display.alignTables()
        //let isCorrect = display.checkCorrectness(outputs)
        //console.log("isCorrect: " + isCorrect)
        display.outputLine.position()

    }

    // convert to valid inputs for processing and keep track of invalid parts of input
    stringToValidFloat(str) {
        let float = parseFloat(str.replace(/(\r\n|\n|\r)/gm, "")); // allow floating point numbers (#6)
        if (isNaN(float)){
            float = 0; // convert NaN to 0 (#6)
        }
        const isValid = (str == float)
        return [float, isValid];
    }

    async main() {
    }
}

async function downloadFile() {
    let inputToggleChecked=document.getElementById("InputToggle").checked;
    let outputToggleChecked=document.getElementById("OutputToggle").checked;
    //console.log("in download: "+  demo.inputData);
    let headerRows = [];
    display.getHeaderRowVals(headerRows);
    let modelname = document.getElementById("fname").innerText
    //if(modelname.length == 0)  modelname = "model"

    const handle = await showSaveFilePicker({
        suggestedName: modelname + '.json',
        types: [{
            description: 'Neuron Sandbox model',
            accept: {'application/json': ['.json']},
        }],
    });

    let table = document.getElementById("output-table");
    //console.log(table);
    for(let i = 1; i < table.rows.length; i++ ) {
        let tr = table.rows[i];
        let td = tr.cells[2];
        desiredOutputs.data[i-1] = td.innerText;
        //console.log("desired output: " + desiredOutputs.data[i-1]);
    }
    desiredOutputs.rows = table.rows.length-1;

    //dataOp.updateDataFromTable(outputs, outputTable);
    let newName = handle.name.substring(0, handle.name.length - 5)
    document.getElementById("fname").textContent = newName

    demo.threshold = perceptron.threshold;
    let dict = {
        "model-name" : newName,
        "input": demo.inputData,
        "weight": demo.weights,
        "threshold": demo.threshold,
        "desired-output": desiredOutputs,
        "input-toggle-checked" : inputToggleChecked,
        "output-toggle-checked" : outputToggleChecked,
        "input-header": headerRows,
    };



    const blob = new Blob([JSON.stringify(dict)]);
    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
}

function uploadFromUrl(url) {
    fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            accept: '*/*',
        }
    })
        .then(res => res.text())
        .then(text => {
            console.log('Downloaded this JSON! ', text);
            uploadJson(text);
        })
        .catch(err => {
            throw err
        });
}

async function uploadFileCombined(event) {
    let url = document.getElementById("url").value;
    if(url) {
        uploadFromUrl(url);
    }
    else {
        const fileInput = document.getElementById('upload-file');
        fileInput.value = '';
        fileInput.click();
    }
}

function uploadJson(text) {
    if (!text)
        return;
    demo.removeAllInputDataRows(false);
    demo.removeAllInputDataCols(false);
    demo.removeAllWeightCol();

    let dict = JSON.parse(text);
    demo.inputData = dict["input"];
    //demo.weights = dict["weight"];
    demo.weights = []; //clear weight array first, due to the insertWeightCol below
    demo.threshold = dict["threshold"];
    desiredOutputs = dict["desired-output"];
    document.getElementById('fname').innerText  = dict["model-name"]

    inputs = new Data(demo.inputData);

    for (let c = inputTable.numCols; c < inputs.data[0]?.length; c++) {
        inputTable.insertTableCol(1);
    }

    let parentElement = document.getElementById("input-link-text");
    for (let c = 0; c < inputs.data[0]?.length; c++) {
        demo.insertWeightCol(c);
    }

    demo.weights = dict["weight"];
    for (let r = 0, n = inputs.data.length; r < n; r++) {
        inputTable.insertTableRow(2);
        outputTable.insertTableRow(1);
        dataOp.insertDataRow(outputs, 0);
    }

    //dataOp.updateTableFromDesired(desiredOutputs, outputTable);

    demo.inputData = dict["input"];
    inputs = new Data(demo.inputData);
    // outputs = new Data(perceptron.outputData);
    // //outputs.data.rows = desiredOutputs.rows;
    // for (let i = 0; i < desiredOutputs.rows; i++) {
    //     outputs.data[i][2] = parseInt(desiredOutputs.data[i]);
    // }
    dataOp.updateTableFromData(inputs, inputTable);
    perceptron = new Perceptron(inputs, demo.weights, demo.threshold);
    perceptron.setWeightsUI();
    perceptron.computeOutputs();
    display.createOutputTableColors();

    outputs = new Data(perceptron.outputData);
    //outputs.data.rows = desiredOutputs.rows;
    for (let i = 0; i < desiredOutputs.rows; i++) {
        outputs.data[i][2] = parseInt(desiredOutputs.data[i]);
    }

    display.displayThresholdFromData(perceptron);
    //document.getElementById('InputToggle').checked = dict["input-toggle-checked"];
    document.getElementById('InputToggle').checked = false;
    document.getElementById('OutputToggle').checked = dict["output-toggle-checked"];
    display.handleHoverExit();
    demo.update();
    let headerRows = dict["input-header"];
    if(headerRows?.length) {
        display.setHeaderRowVals(headerRows);
    }
    dataOp.updateTableFromDesired(desiredOutputs, outputTable);

    let outputCol = document.getElementById("output-table");
    let outputTableLength = outputCol.rows.length;

    for(let i = 1; i < outputTableLength; i++)
    {
        //var tr = outputCol.rows[i];
        let output = outputCol.rows[i].cells[1];
        let desired = outputCol.rows[i].cells[2];
        display.checkDesiredOutput(output, desired);
    }
    display.handleHoverExit();

    display.outputLine.position();
    display.createInputTableEditBorder();


}

async function uploadFile(event) {
    const file = event.target.files.item(0)
    if (!file) {
        return;
    }
    const text = await file.text();
    uploadJson(text);
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
uploadFromUrl("SampleModel.json");
display.createOutputTableColors();
display.createInputTableEditBorder();

document.addEventListener("DOMContentLoaded", () => {
    demo.main().catch(e => console.error(e));
});

$('#InputToggle').change(function() { //toggle edit
    display.UpdateInputToggle();
    display.outputLine.position();
});

$('#OutputToggle').change(function() { //toggle output
    display.UpdateOutputToggle();
    display.outputLine.position();
    display.checkForSuccess()
});

$('#BinaryToggle').change(function() { //toggle output
    display.UpdateBinaryToggle();
    display.outputLine.position();
});

$('#FanfareToggle').change(function() { //toggle output
    display.UpdateFanfareToggle();
    display.outputLine.position();
});
