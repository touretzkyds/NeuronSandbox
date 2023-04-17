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

class VariableData {
    constructor(my_name, my_html, my_weight_editable) {
        this.update(my_name, my_html,my_weight_editable);
    }

    update(my_name, my_html, my_weight_editable) {
        this.name = my_name;
        this.html = my_html;
        this.weight_editable = my_weight_editable;
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

    insertDataCol(dataObj, n=1){
        const cols = Array(dataObj.rows).fill(0);
        for (let r = 0; r < dataObj.data.length; r++) {
            dataObj.data[r].splice(n, 0, cols[r]);
            //dataObj.weights[r].splice(n,0,0);
        }
        dataObj.cols++;
    }

    removeDataCol(dataObj, n=1, pos){
        for (let r = 0; r < dataObj.data.length; r++) {
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
            while (binaryString.length < dim) {
                binaryString = "0" + binaryString;
            }
            for (let j = 0; j < binaryString.length; j++ ) {
                binaryArray[i][j] = Number(binaryString.substring(j, j+1));
            }
        }
        return binaryArray;
    }

    updateDataFromTableNoDisplay(dataObj, tableObj) {
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
                if (table.id === 'output-table' && c === 2 && (parsedValue !== 1 && parsedValue !== 0) ) {
                    isValid = false;
                }
                dataObj.data[row-start][c-startCol] = parsedValue;
            }
        }
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
                if (table.id === 'output-table' && c === 2 && (parsedValue !== 1 && parsedValue !== 0) ) {
                    isValid = false;
                }
                display.highlightInvalidText(cell, isValid);
                dataObj.data[row-start][c-startCol] = parsedValue;
            }
        }
        display.createOutputTableColors()
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
        for (let row = start; row < table.rows.length; row++) {
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
        if (textbox.id === "activation" || textbox.id === "output" || textbox.id === "desired")
            return
        textbox.contentEditable = editable;
        // add event listener to update demo with table changes
        // add a class to textbox to keep track of an eventlistener already being added
        if (editable && !textbox.classList.contains("edit-handler")) {
            textbox.classList.add("edit-handler");
            if (textbox.id.startsWith("tblinput")) {
                if (!textbox.classList.contains("input-table-th"))
                    textbox.classList.add("input-table-th");
            }
            if (textbox.innerText.length === 0)
            {
                if (editable)
                    textbox.innerHTML = `<span class="editable-border">` + 0 + `</span>`
                else
                    textbox.innerHTML = `<span>` + 0 + `</span>`
            }

            if (document.getElementById('OutputToggle').checked)
                demo.hasNoSolution();


            //console.trace()
            textbox.addEventListener("focusout", function(event){
                demo.update(this);
                display.checkForSuccess();
                let identify = this?.id
                if (identify !== "th1" && !(new RegExp('^w[0-9]+$', 'gm').test(identify))) { //checks if not threshold, or any of the weight textboxes
                    if (this?.tagName !== 'TH' && this.parentNode?.tagName !== 'TH') {
                        if (!textbox.innerHTML)
                            textbox.innerHTML = 0;
                    }
                }
            });
            textbox.addEventListener("keydown", function(event){
                if (event.keyCode === 13 || event.keyCode === 27) {
                    textbox.blur(); // focus out of text box
                    demo.update(this);
                }
            });
        }
        if (editable) {
            if (textbox.nodeName !== "TH" && !textbox.classList.contains("editable-border"))
                textbox.classList.add("editable-border");
            if (textbox.nodeName !== "TH" && !textbox.classList.contains("edit-handler"))
                textbox.classList.add("edit-handler");
        }
        else {
            if (textbox.classList.contains("editable-border"))
                textbox.classList.remove("editable-border");
            if (textbox.classList.contains("edit-handler"))
                textbox.classList.remove("edit-handler");
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
        for (let r=0; r<array.length; r++) {
            let newRow = table.insertRow(table.length);
            // update displayed selections on hover
            this.makeHoverable(newRow, tblId);
            for (let c=0; c<array[r].length; c++) {
                let cell = newRow.insertCell(c);
                cell.innerHTML = `<span class="editable-border">`+array[r][c]+`</span>`;
                if (this.isEditable) {
                    dataOp.makeEditable(cell.firstChild);
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
        if (all) {
            newRow = this.table.insertRow(0);
            this.makeHoverable(newRow, "input-table");
            newRow.insertCell(0);
        }
        if (columnNum) {
            let cell = this.table.rows[0].insertCell(columnNum);
            cell.innerHTML = content;
            return;
        }
        else {
            for (let j = 1; j <= this.numCols; j++)
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

        if (document.getElementById("BinaryToggle").checked)
            makeEditable = false
        else
            makeEditable = true
        //console.log("insertTableRow, trying to add new row at row=" + r);
        let newRow = this.table.insertRow(r);
        this.makeHoverable(newRow, this.tblId);
        for (let c = 0; c < this.numCols; c++) {
            let cell = newRow.insertCell(c);
            cell.innerHTML = `<span class="editable-border">0</span>`
            //cell.innerText = 0;
            cell.classList.add("animation");
            if (this.isEditable && makeEditable){
                dataOp.makeEditable(cell.firstChild);
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
            if (style)
            {
                style += '; animation-delay: 0.2s;'
                $(this).attr('style',style);
            }
            else
                $(this).css('animation-delay',0.2 +'s');
            $(this).classList?.remove("animation");
        });
        display.createInputTableEditBorder()
        display.createOutputTableEditBorder();
    }

    //finds available indices for variables
    findAvailableIndex()
    {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        let index = -1;
        let nameIndex = -1;
        for (let i = 1; i < 10; i++) {
            let foundIndex = false;
            let foundNameIndex = false;
            for (let c = 1; c < headerCells.length; c++) {
                let headerInput = headerCells[c];
                if (headerInput.id === ("tblinput" + i)) {
                    foundIndex = true;
                }
                let match = headerInput.innerText.match(/\d$/);
                if (match && match[0] === (''+i)) {
                    foundNameIndex = true;
                }
            }
            if (index < 0 && !foundIndex) {
                index = i;
            }
            if (nameIndex < 0 && !foundNameIndex) {
                nameIndex = i;
            }

            if (index > 0 && nameIndex > 0 )
            {
                return [index, nameIndex];
            }
        }
        return [-1, -1];
    }

    insertTableCol(c){
        let makeEditable = true

        if (document.getElementById("BinaryToggle").checked)
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
            cell.innerHTML = `<span class="editable-border">0</span>`
            cell.classList.add("animation");
            if (this.isEditable){
                dataOp.makeEditable(cell.firstChild);
            }
        }
        this.createColumnButtons(false, this.numCols + 1);
        //this.createColumnButtons(false, 0);
        this.numCols++;
        //animation
        $(".animation").each(function () {
            let style = $(this).attr('style');
            if (style)
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
        //update the image mapping
        for (let col = this.numCols; col >= c; col--)
        {
            const imageKey_0 = JSON.stringify({table_name: "input-table", column: col, value: "0_Image"});
            if (imageKey_0 in dictImageMapping) {
                let value = dictImageMapping[imageKey_0];
                const newImageKey = JSON.stringify({table_name: "input-table", column: col+1, value: "0_Image"});
                dictImageMapping[newImageKey] = value;
                delete dictImageMapping[imageKey_0];
            }
            const imageKey_1 = JSON.stringify({table_name: "input-table", column: col, value: "1_Image"});
            if (imageKey_1 in dictImageMapping) {
                let value = dictImageMapping[imageKey_1];
                const newImageKey = JSON.stringify({table_name: "input-table", column: col+1, value: "1_Image"});
                dictImageMapping[newImageKey] = value;
                delete dictImageMapping[imageKey_1];
            }
        }
        display.createInputTableEditBorder()
        display.createOutputTableEditBorder();
    }

    removeTableCol(c){
        for (let r = 0; r < this.numRows + 2; r++) { //skip column buttons + row headers
            this.table.rows[r]?.deleteCell(c+1);
        }
        this.numCols--;
        let cols = []
        display.getHeaderRowVals(cols);
        this.defaultSelectedInput = cols;
        //delete the current mapping if exists
        delete dictImageMapping[JSON.stringify({table_name: "input-table", column: c+1, value: "0_Image"})];
        delete dictImageMapping[JSON.stringify({table_name: "input-table", column: c+1, value: "1_Image"})];
        //shift the column image mapping to the left
        for (let col = c+2; col <= this.numCols + 1; col++) {
            const imageKey_0 = JSON.stringify({table_name: "input-table", column: col, value: "0_Image"});
            if (imageKey_0 in dictImageMapping) {
                let value = dictImageMapping[imageKey_0];
                const newImageKey = JSON.stringify({table_name: "input-table", column: col-1, value: "0_Image"});
                dictImageMapping[newImageKey] = value;
                delete dictImageMapping[imageKey_0];
            }
            const imageKey_1 = JSON.stringify({table_name: "input-table", column: col, value: "1_Image"});
            if (imageKey_1 in dictImageMapping) {
                let value = dictImageMapping[imageKey_1];
                const newImageKey = JSON.stringify({table_name: "input-table", column: col-1, value: "1_Image"});
                dictImageMapping[newImageKey] = value;
                delete dictImageMapping[imageKey_1];
            }
        }
    }

    removeTableRow(r){
        this.table.deleteRow(r);
        this.numRows--;
    }

    showColumn(columnNum, visible=true, editable=true, startingRow = 0) { //output table (desired)
        for (let r = startingRow; r < this.numRows + 1; r++) {
            const cells = this.table.rows[r].cells;
            if (r !== 0) {
                if (cells[columnNum].querySelector(".editable-border")) {
                    dataOp.makeEditable(cells[columnNum].firstChild, editable);
                }
                // else {
                //     dataOp.makeEditable(cells[columnNum], editable);
                // }
            }


            cells[columnNum].style.display = visible? "table-cell" : "none";

            let desiredOutput = document.getElementById("desired");
            desiredOutput.contentEditable = false;
            if (desiredOutput.classList.contains("edit-handler"))
                desiredOutput.classList.remove("edit-handler");
        }
    }
}

// perceptron: holds a data object, weights, threshold
class Perceptron {
    constructor(dataObj, weights, threshold, weight_labels) {
        this.dataObj = dataObj;
        this.inputData = dataObj.data;
        this.weights = weights;
        this.weightLabels = weight_labels;
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
        let childNodes = document.getElementById("input-link-text").childNodes;
        for (let i = 0; i < demo.weights.length; i++){
            //const cell = document.getElementById(`w${i+1}`);
            const cell = childNodes[i].childNodes[2];
            if (cell) {
                cell.innerHTML = this.weights[i];
                if (this.weightLabels)
                    childNodes[i].childNodes[0].innerText = this.weightLabels[i];
            }
        }
    }
    updateWeightsFromUI(){
        let childNodes = document.getElementById("input-link-text").childNodes;
        this.weightLabels = [];
        for (let i=0; i<demo.weights.length; i++){
            //const cell = document.getElementById(`w${i+1}`);
            const cell = childNodes[i].childNodes[2];
            if (cell) {
                //dataOp.makeEditable(cell);

                const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
                if(isValid) {
                    //check for leading zeroes
                    const regex = '^-?0+[0-9]+$';
                    if (new RegExp(regex).test(cell.innerHTML)) {
                        cell.innerHTML = parseInt(cell.innerHTML)
                    }
                }
                display.highlightInvalidText(cell, isValid);
                this.weights[i] = parsedValue;
                this.weightLabels.push(childNodes[i].childNodes[0].innerText);
            }
        }
    }

    updateThreshold(){
        const cell = document.getElementById(`th${1}`);
        const [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
        if(isValid) {
            //check for leading zeroes
            const regex = '^-?0+[0-9]+$';
            if (new RegExp(regex).test(cell.innerHTML)) {
                cell.innerHTML = parseInt(cell.innerHTML)
            }
        }
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
        this.createOutputTableEditBorder();
    }

    alignTables() {
        let maxHeight = 0

        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            let headerInput = headerCells[c];
            if (headerInput.id.startsWith("tblinput")) {

                let heightOfTH = headerInput.offsetHeight
                //let heightOfTH = parseInt(heightOfTHtext.substring(0, heightOfTHtext.length-2))
                if (heightOfTH > maxHeight)
                    maxHeight = heightOfTH
            }
            else
                console.log("missing input")
        }
        const outputHeaderCells = document.getElementById("output-table").rows[0].cells;
        outputHeaderCells[0].style.height = maxHeight + 'px';
    }

    toggleProblemDisplay() {
        let checked = document.getElementById("InputToggle").checked;
        let qPrompt = document.getElementById("questionprompt");
        let qText =  document.getElementById("questiontext");
        if (checked) { //word problem is now editable
            qPrompt.hidden = false;
            //qPrompt.style.display = "block"
            qPrompt.value= qText.innerText;

            qText.hidden = true;
        }
        else {
            qText.hidden = false;
            qText.innerText = qPrompt.value;

            qPrompt.hidden = true;
        }
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
            if (td2.style.background !== '#ffbfcb') //error
                td2.style.background = '#f8ffcf'
            //td2.classList.add("bold-td");


        }
    }

    createOutputTableEditBorder() {
        return;

        const outputTable = document.getElementById("output-table")
        let binaryCheckbox = document.getElementById("BinaryToggle");
        let editCheckbox = document.getElementById("InputToggle");
        let nonBinaryMode = false
        if (!binaryCheckbox.checked)
            nonBinaryMode = true
        let n = outputTable.rows.length;
        for (let i = 1; i < n; i++) {
            let tr = outputTable.rows[i];
            for (let j = 1; j < tr.cells.length; j++) {
                let textbox = tr.cells[j]
                //textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                if (nonBinaryMode) {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    if(j == 2) { //desired output
                        textbox.children[0].classList.add("editable-border")
                        dataOp.makeEditable(textbox.firstChild)
                    }

                    while (textbox.children.length > 1) {
                        textbox.removeChild(textbox.children[1]);
                    }
                }
                else {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.remove("editable-border")
                    if(j == 2)
                    {
                        dataOp.makeEditable(textbox.firstChild, false)
                    }
                    while (textbox.children.length > 1) {
                        textbox.removeChild(textbox.children[1]);
                    }

                    const img = document.createElement("img");
                    if (textbox.innerText === "1") {
                        img.alt = "1_Image";
                        const imageKey = JSON.stringify({table_name: 'output-table', column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "1_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "1_image.svg";
                        }
                    }
                    else {
                        img.alt = "0_Image";
                        const imageKey = JSON.stringify({table_name: 'output-table', column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "0_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "0_image.svg";
                        }
                    }
                    img.width = 48;
                    img.height = 48;
                    img.classList.add("myimage");
                    if (document.getElementById("InputToggle").checked)
                        img.classList.add("editable-border")
                    else {
                        if (img.classList.contains("editable-border"))
                            img.classList.remove("editable-border")
                    }
                    textbox.appendChild(img);
                }
            }
        }
        if (!nonBinaryMode && editCheckbox.checked)
        {
            setImageEditOptions();
        }
        else
        {
            hideCameraImages();
        }
    }

    createInputTableEditBorder() {
        const inputTable = document.getElementById("input-table")

        let binaryCheckbox = document.getElementById("BinaryToggle");
        let editCheckbox = document.getElementById("InputToggle");
        let editable = false
        if (!binaryCheckbox.checked)
            editable = true
        let n = inputTable.rows.length;
        for (let i = 2; i < n; i++) {
            let tr = inputTable.rows[i];
            for (let j = 1; j < tr.cells.length; j++) {
                let textbox = tr.cells[j]
                //textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                if (editable) {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.add("editable-border")
                    dataOp.makeEditable(textbox.firstChild)
                    while (textbox.children.length > 1) {
                        textbox.removeChild(textbox.children[1]);
                    }

                }
                else {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.remove("editable-border")
                    dataOp.makeEditable(textbox.firstChild, false)
                    while (textbox.children.length > 1) {
                        textbox.removeChild(textbox.children[1]);
                    }

                    const img = document.createElement("img");

                    if (textbox.innerText === "1") {
                        img.alt = "1_Image";
                        const imageKey = JSON.stringify({table_name: "input-table", column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "1_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "1_image.svg";
                        }


                    }
                    else {
                        img.alt = "0_Image";
                        const imageKey = JSON.stringify({table_name: "input-table", column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "0_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "0_image.svg";
                        }
                    }
                    img.width = 48;
                    img.height = 48;
                    img.classList.add("myimage");
                    if (document.getElementById("InputToggle").checked)
                        img.classList.add("editable-border")
                    else {
                        if (img.classList.contains("editable-border"))
                            img.classList.remove("editable-border")
                    }
                    textbox.appendChild(img);
                }
            }
        }
        if (!editable && editCheckbox.checked)
        {
            setImageEditOptions();
        }
        else
        {
            hideCameraImages();
        }
    }
    checkForSuccess() {
        let outputTable = document.getElementById("output-table")
        let tableRows = outputTable.rows.length
        let isCorrect = true;
        for (let i = 1; i < tableRows; i++) {
            let cells = outputTable.rows.item(i).cells
            let output = cells.item(1).innerText;
            let desired = cells.item(2).innerText;
            if (output !== desired) {
                isCorrect = false
                break
            }

        }
        let fanfareToggleChecked = document.getElementById("FanfareToggle").checked
        let fanfareHidden =  document.getElementById("congrats-msg").hidden
        let outputToggleChecked = document.getElementById("OutputToggle").checked
        if (fanfareToggleChecked && outputToggleChecked) {
            if (fanfareHidden) {
                if (isCorrect) {
                    PlaySound();
                    if (!document.getElementById("popup").classList.contains("active"))
                        document.getElementById("popup").classList.toggle('active');

                    const questionDropDown = document.getElementById("problem-list");
                    const selectedIndex = questionDropDown.selectedIndex;
                    const nextIndex = selectedIndex + 1;
                    let button = document.getElementById("next-question-btn");
                    button.style.display = nextIndex < questionDropDown.options.length - 1 ? "inline-block" : "none";
                    //document.getElementById("congrats-msg").hidden = false;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++)
                    {
                        demo.weightLines[i].position();
                    }
                }
                else {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++)
                    {
                        demo.weightLines[i].position();
                    }
                }

            }
            else { //congrats not hidden, but could have possibly made incorrect
                if (!isCorrect) {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++)
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
            //dataOp.makeEditable(weight);
        });
        this.displayThresholdFromData(perceptron);
        //const threshold = document.getElementById(`th${1}`);
        //dataOp.makeEditable(threshold);
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
        for (let i = 0; i < rows; i++) {
            if (tableData.data[i][1] !== tableData.data[i][2]) //the actual output and desired output do not match
                return false
        }
        return true
    }

    adjustSelectedInputFontSize() {
        let maxLength = 0;
        let maxHeaderIndex = 0;

        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            let headerInput = headerCells[c];
            let newFontSize;
            if (headerInput.id.startsWith("tblinput")) {
                let length = headerInput.innerText.length

                if (length <= 10) {
                    newFontSize = 40;
                }
                else if (length >= 30){
                    newFontSize = 30;
                }
                else {
                    newFontSize = 40 - (length-10)
                }
            }
            const selections = document.getElementById("selected-inputs");
            selections.rows[c-1].cells[0].style.fontSize = newFontSize + "px"
        }
        //
        // let newFontSize;
        // if(maxLength <= 10) {
        //     newFontSize = 40;
        // }
        // else if(maxLength >= 30){
        //     newFontSize = 30;
        // }
        // else {
        //     newFontSize = 40 - (maxLength-10)
        // }
        //
        // //console.log("fontSize: " + newFontSize)
        // const selections = document.getElementById("selected-inputs");
        // for (let r=0; r<selections.rows.length; r++){
        //     selections.rows[r].cells[0].style.fontSize = newFontSize + "px"
        // }

        for (let i = 0; i < demo.weightLines.length; i++)
        {
            demo.weightLines[i].position();
        }


    }

    displayWeightFromData(wID, idx){
        let weight = document.getElementById(wID);
        if (!weight) {
            let wDiv = document.createElement('div');
            wDiv.id = `weight-${idx+1}`;
            wDiv.innerHTML = `<text fill="black" class="weight-edit-text weights">w<sub>${idx+1}</sub> =</text> <text contenteditable="true" onkeypress="if (keyCode == 13) return false;" id="w${idx+1}" fill="black" class="weights"></text>`;
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
        if (!demo.selectedInput)
            return;
        let selections = document.getElementById("selected-inputs");
        selections.innerHTML = "";
        for (let i = 0; i < demo.selectedInput.length; i++)
        {
            let newRow = selections.insertRow(i);
            let newCell = newRow.insertCell(0);
            //newCell.innerHTML = `<div class=\"input-content\">${demo.selectedInput[i]}</div>`;
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
                for (let i = 0; i < Math.floor(length/2); i++) {
                    percentsX.push(startX);
                    startX -= intervalX;
                }
                startX += intervalX;
                for (let i = Math.floor(length/2); i < length; i++) {
                    percentsX.push(startX);
                    startX += intervalX;
                }
        }


        //percentage values for weight lines for y-axis
        let percentsY = [];
        let intervalY = 16/length
        let startY = 42;
        if (length === 1)
            percentsY = [50]
        else if (length === 2)
            percentsY = [42, 58]
        else if (length === 3)
            percentsY = [42, 50, 58]

        else {
            for (let i = 0; i < length; i++ ) {
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
        for (let i = 0; i < demo.selectedInput.length; i++) {
            let xposition = 6+ percentsX[i]
            // if(i !== 0 && i !== demo.selectedInput.length-1)
            //     xposition = 3;
            demo.weightLines[i] = new LeaderLine(
                LeaderLine.pointAnchor(selections.rows[i].cells[0], {x: '110%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("perceptron1"), {x: xposition+'%', y: percentsY[i]+'%'})
            );

            let splitup = weight_labels[i].children[1].textContent.split(" ")
            let num = splitup[splitup.length-1]
            if (!demo.stringToValidFloat(num)[1]) {
                demo.weightLines[i].color = '#ffbfcb'
                demo.weightLines[i].path = 'straight'
                demo.weightLines[i].position();
            }
            else {
                if (demo.stringToValidFloat(num)[0] === 0)
                    demo.weightLines[i].color = 'blue';
                else if (demo.stringToValidFloat(num)[0] < 0)
                    demo.weightLines[i].color = '#c91a0e';
                else
                    demo.weightLines[i].color = 'black';
                demo.weightLines[i].path = 'straight';
                demo.weightLines[i].position();
                if (demo.stringToValidFloat(num)[1]) { //value is a valid number
                    let line_size = ((new_max-new_min)*(Math.abs(demo.stringToValidFloat(num)[0])-min))/(max-min)+new_min
                    if (line_size >= 10.0)
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

            let splitup = child.children[1].textContent.split(" ")
            let num = splitup[splitup.length-1]

            let numConvertedArray = demo.stringToValidFloat(num)
            if (!numConvertedArray[1]) { //if weight is invalid
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
        this.adjustSelectedInputFontSize();
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
        if (!this.isInputTable(tblId)) //output table, convert to corresponding input row index
            rowIdx += 1;
        //console.log(`hoverInput tblId=${tblId },input row=${rowIdx}, mode=${mode}`);

        const inputRow = document.querySelector(`#input-table > tbody > tr:nth-child(${rowIdx+1})`)
        //let outputRowIndex = (rowIdx <= 0) ? 1 : rowIdx;
        let outputRowIndex = rowIdx - 1;
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${outputRowIndex + 1})`)

        if (rowIdx < 2) //headers, or leave
        {
            this.handleHoverExit();
            display.adjustSelectedInputFontSize();
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
            for (let i = 0; i < outputRow.children.length; i++) {
                outputRow.children[i].style.background = "lightblue";
            }
            display.adjustSelectedInputFontSize();

            //console.log("enter: set outputRow =" + outputRow);
        }
        else {
            if (rowIdx % 2 === 0) {
                this.handleHoverExit(inputRow, outputRow );
                if (isOutputToggleChecked)
                    this.checkDesiredOutput(outputRow.children[1], outputRow.children[2])

            }

            else {
                this.handleHoverExit(inputRow, outputRow, true ); //if it is odd, reset to gray
                if (isOutputToggleChecked)
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
        display.alignTables()
        display.createOutputTableEditBorder();
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
            if (inputRow)
                inputRow.style.background = "#f2f2f2"; //color gray
            if (outputRow) {
                outputRow.children[0].style.background =  "#f2f2f2"
                outputRow.children[1].style.background = "#f8ffcf"
                outputRow.children[2].style.background =  "#f2f2f2"
            }

        }
        else {
            if (inputRow)
                inputRow.style.background = "none";
            if (outputRow) {
                for (let i = 0; i < outputRow.children.length; i++) {
                    outputRow.children[0].style.background = "none";
                    this.checkDesiredOutput(outputRow.children[1], outputRow.children[2])
                }
            }

        }
        //this.createOutputTableColors();
        this.updateSelectedInput();
        display.adjustSelectedInputFontSize();
        display.alignTables();
        display.createOutputTableEditBorder();
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
                if (!headerInputHtml.length) {
                    headerInputHtml = "<br>";
                }
                headerRowVals.push(headerInputHtml);
            }
            else
                console.log("missing input")
        }
    }

    getHeaderRowVariables(headerRowVals) {
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
                if (!headerInputHtml.length) {
                    headerInputHtml = "<br>";
                }
                //we cannot use the getElementByID since the ID will not be accurate when deleting cols
                let weight_parent = document.getElementById(`input-link-text`);
                let divNode = weight_parent.childNodes[c-1];
                let editToggle = divNode.querySelector('.edit-toggle');
                //const checkbox = divNode.querySelector('input[type="checkbox"]');
                //let weightCheckbox = document.getElementById(`checkbox_weight_editable${c}`);
                headerRowVals.push(new VariableData(headerInput.innerText, headerInputHtml, editToggle.classList.contains("edit-toggle-on")));
            }
            else
                console.log("missing input")
        }
    }

    setHeaderRowVariables (headerRowVals) {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        if (headerCells) {
            for (let c = 1; c < headerCells.length; c++) {
                //var headerInput = document.getElementById(`tblinput${c}`);
                let headerInput = headerCells[c];
                //var headerInput = document.querySelector(`#input-table> tbody > tr:nth-child(${2}) > td:nth-child(${c} > div:nth-child(${1}))`);
                if (headerInput.id.startsWith("tblinput")) {
                    /*if(headerInput.children[0]) {
                        headerRowVals.push(headerInput.children[0].innerHTML);
                    }
                    else*/
                    headerInput.innerHTML = headerRowVals[c-1].html;
                    //set the checkbox for weight editable
                    let weight_parent = document.getElementById(`input-link-text`);
                    let divNode = weight_parent.childNodes[c-1];
                    const editToggle = divNode.querySelector('.edit-toggle');
                    //let weightCheckbox = document.getElementById(`checkbox_weight_editable${c}`);
                    if (headerRowVals[c-1].weight_editable) {
                        editToggle.classList.add("edit-toggle-off"); //reversed
                        editToggle.classList.remove("edit-toggle-on");
                    }
                    else {
                        editToggle.classList.add("edit-toggle-on"); //reversed
                        editToggle.classList.remove("edit-toggle-off");
                    }
                    editToggle.dispatchEvent(new Event("click"));
                }
                else {
                    console.log("missing input")
                }
            }
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
        let checkboxBinary = document.getElementById(("BinaryToggle"));
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
                element.style.display = checkboxBinary.checked? "none" : "flex";
            });
            const buttonColumns = document.getElementsByClassName("column-buttons-container");
            buttonColumns.forEach(element => {
                element.style.display = "flex";
            });
            //document.getElementById("generateTruthTable").disabled = false;
            document.getElementById("output-table").style.marginTop = "40px";
            document.getElementById("FanfareToggleBody").hidden = false;
        }

        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }
        this.UpdateOutputToggle()

    }

    UpdateOutputToggle() {
        let checkbox = document.getElementById("OutputToggle");
        let checkboxEditable = document.getElementById("InputToggle");
        display.showDesiredOutput(checkbox.checked, checkboxEditable.checked);
        let outputCol = document.getElementById("output-table");
        let n = outputCol.rows.length;
        display.createOutputTableColors();

        let isCorrect = true;

        // if(checkbox.checked) {
        //     document.getElementById("output-table").style.marginTop = "-20px";
        // }
        // else {
        //     document.getElementById("output-table").style.marginTop = "7px";
        //     document.getElementById("congrats-msg").hidden = true;
        // }

        for (let i = 1; i < n; i++) {
            //var tr = outputCol.rows[i];
            let output = outputCol.rows[i].cells[1];
            let desired = outputCol.rows[i].cells[2];

            let currCorrect = this.checkDesiredOutput(output, desired);
            if (!currCorrect)
                isCorrect = false;
        }

        // if(checkbox.checked) {
        //     let fanfareToggleChecked = document.getElementById("FanfareToggle")
        //     if(!isCorrect && fanfareToggleChecked) {
        //         alert("Congrats! Desired outputs reached!")
        //     }
        // }

        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }

        display.outputLine.position();
        display.createOutputTableEditBorder();
        handleDesiredOutputColumn()
    }

    UpdateBinaryToggle(columnChanged) {
        let checkbox = document.getElementById("BinaryToggle");
        display.createOutputTableColors();
        if (checkbox.checked) {
            setupGenerateTruthTable(columnChanged);
        }
        else { //leave table how it is, but make contenteditable
            for (let r = 2, n = inputTable.table.rows.length; r < n; r++) {
                for (let c = 1, m = inputTable.table.rows[r].cells.length; c < m; c++) {
                    const cell = inputTable.table.rows[r].cells[c];
                    //cell.innerHTML = Object.values(truthData[r - 2])[(c-1)].toString();
                    dataOp.makeEditable(cell.firstChild);
                }
            }
        }
        display.createInputTableEditBorder();
        display.createOutputTableEditBorder();
        this.UpdateInputToggle();
    }

    UpdateFanfareToggle() {
        let checkbox = document.getElementById("FanfareToggle")
        if (!checkbox.checked) {
            //document.getElementById("congrats-msg").hidden = true;
            display.outputLine.position()
        } else {
            display.checkForSuccess()
        }
    }

    checkDesiredOutput(output, desired) {
        //TODO: do extra testing with the regex and make changes if necessary
        if (!output)
            return
        const regex = '/^0*1?$/gm'; //detects leading zeros

        let checkboxEdit = document.getElementById("InputToggle");
        let editable = checkboxEdit.checked;

        const outputInt = output.innerText;
        let [outputParsedValue, outputIsValid] = demo.stringToValidFloat(outputInt);

        const desiredInt = desired.innerText;
        let [parsedValue, isValid] = demo.stringToValidFloat(desiredInt);

        if (parsedValue === 1.0)  {
            if (editable) {
                desired.innerHTML = '<span class="editable-border">1</span>';
            }
            else {
                desired.innerHTML = '<span>1</span>';
            }
            dataOp.makeEditable(desired.firstChild, editable);
        }

        if (parsedValue === 0.0) {
            if (editable) {
                desired.innerHTML = '<span class="editable-border">0</span>';
            }
            else {
                desired.innerHTML = '<span>0</span>';
            }
            dataOp.makeEditable(desired.firstChild, editable);
        }
        if (desiredInt.match(regex)) {
            if (editable) {
                desired.innerHTML = '<span class="editable-border">1</span>';
            }
            else {
                desired.innerHTML = '<span>1</span>';
            }
            dataOp.makeEditable(desired.firstChild, editable);
        }
        //console.log("parsed: " + parsedValue);
        if (parsedValue !== 1 && parsedValue !== 0 ) {
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
        display.createOutputTableEditBorder();
    }

// update display panel
    updateDisplay() {
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        this.UpdateInputToggle();
        this.UpdateOutputToggle();
        this.adjustSelectedInputFontSize()
        this.alignTables()

    }

    //highlight invalid inputs, reset as soon as they are valid (#6)
    highlightInvalidText(cell, isValid) {
        if (!isValid){
            // cell.style.background = "pink";
            let n = parseInt(cell.innerText);
            if(n > 0) {
                //cell.innerText = 1;
                cell.innerHTML = cell.innerHTML.replace(cell.innerText, "1")
            }
            else {
                cell.innerHTML = cell.innerHTML.replace(cell.innerText, "0")
            }

        }
        else {
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
    showDesiredOutput (show, editable) {
        outputTable.showColumn(2, show, editable);
        //display.createOutputTableEditBorder()
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

    hasNoSolution() {
        if (!document.getElementById("OutputToggle").checked)
            return
        if(isLoading)
            return;
        //uses perceptron learning rule
        dataOp.updateDataFromTableNoDisplay(outputs, outputTable);
        //uses perceptron learning rule
        //let outputData = perceptron.outputData;
        let outputData = outputs.data;
        //second column is output
        let adjustedWeights = []; //these weights will be adjusted throughout
        for (let i = 0; i < this.weights.length; i++) {
            adjustedWeights.push(this.weights[i])
        }
        adjustedWeights.push(this.threshold * -1);
        //iterate through inputs 20 times, if still not correct then we assume no solution
        for (let i = 0; i < 100; i++) {
            let hasSolution = true
            for (let j = 0; j < this.inputData.length; j++) {
                let input = this.inputData[j];
                let actualOutput = 0
                for (let w = 0; w < adjustedWeights.length-1; w++) {
                    actualOutput += input[w]*adjustedWeights[w]
                }
                actualOutput += adjustedWeights[adjustedWeights.length-1];
                actualOutput = actualOutput > this.threshold ? 1 : 0
                let desiredOutput = outputData[j][2]
                if (actualOutput < desiredOutput) {
                    hasSolution = false
                    for (let k = 0; k < adjustedWeights.length-1; k++) {
                        adjustedWeights[k] += this.inputData[j][k]
                    }
                    adjustedWeights[adjustedWeights.length-1]++;
                }
                if (actualOutput > desiredOutput) {
                    hasSolution = false
                    for (let k = 0; k < adjustedWeights.length-1; k++) {
                        adjustedWeights[k] -= this.inputData[j][k]
                    }
                    adjustedWeights[adjustedWeights.length-1]--;
                }

            }
            if (hasSolution) {
                document.getElementById("unlearnable-msg").hidden = true;
                return
            }

        }
        document.getElementById("unlearnable-msg").hidden = false;


        //alert("this desired output cannot be achieved!")




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
        if (needUpdate)
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
        while ( inputTable.numCols > 1) {
            inputTable.removeTableCol(1);
        }
        if (needUpdate) demo.update();
    }

    removeAllInputDataRows(needUpdate = true) {
        while ( inputTable.numRows > 0) {
            inputTable.removeTableRow(2);
            dataOp.removeDataRow(inputs, 0);
            outputTable.removeTableRow(1);
            dataOp.removeDataRow(outputs, 0);
        }
        if (needUpdate) demo.update();
    }

    generateUniqueID(prefix) {
        let count = 1;
        let id;
        do {
            id = prefix + count;
            count++;
        } while (document.getElementById(id) !== null);
        return count - 1;
    }

    insertWeightCol(n) {
        let parentElement = document.getElementById("input-link-text");
        demo.weights.splice(n, 0, 0); //add a weight
        let wDiv = document.createElement('div');
        //wDiv.id = `weight-${n+1}`;
        let unique_id = this.generateUniqueID("weight-");
        wDiv.id = `weight-${unique_id}`;
        wDiv.className = "weight_label";
        wDiv.innerHTML = `<text fill="black">w<sub>${unique_id}</sub> =</text> <text contenteditable="true" 
                            onkeypress="if (keyCode == 13) return false;" id="w${unique_id}" fill="black" class="weight-edit-text weights">0</text>
                           <span class="edit-toggle edit-toggle-on">
                              <i class="fas fa-pencil-alt"></i>
                              <i class="fas fa-lock"></i>
                           </span>
      `;

        parentElement.insertBefore(wDiv, parentElement.children[n]);
        const weightText = document.getElementById(`w${unique_id}`);
        dataOp.makeEditable(weightText);
        this.updateWeightUI(parentElement);
    }

    showWeightToggle(show) {
        let parentElement = document.getElementById("input-link-text");
        let weightElement = parentElement.children;
        for (let i = 0; i < weightElement.length; i++) {
            let toggleBtn = weightElement[i].children[2]
            if (!show)
                toggleBtn.style.display = 'none';
            else
                toggleBtn.style.display = 'inline-block';
            console.log(weightElement[i].children[2].innerHTML);
        }
        let thresholdToggleBtn = document.getElementById("threshold_toggleBtn");
        if (!show)
            thresholdToggleBtn.style.display = 'none';
        else
            thresholdToggleBtn.style.display = 'inline-block';
    }

    updateWeightUI(parentElement) {
        //TODO: make code less messy
        let childCount = parentElement.children.length;

        if (childCount === 1) {
            let child = parentElement.children[0];
            const top = 40;
            child.style = "top:" + top + "%;";
            addEditOption(0);
        }
        else if (childCount === 3) {
            let first = 20;
            let last = 70;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "left:" + -20 + "%;" + "top:" + top + "%;";
                addEditOption(i);
            }
            let child = parentElement.children[1];
            const top = 38;
            child.style = "left: -20%;" +  "top:" + top + "%;";
        }
        else if (childCount === 4) {
            let first = 10;
            let last = 80;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                //child.style = "left:" + -10 + "%;";
                child.style = "left:" + -50 + "%;" + "top:" + top + "%;";
                addEditOption(i);
            }

        }
        else if (childCount === 5) {
            let first = 10;
            let last = 80;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "left:" + -20 + "%;" + "top:" + top + "%;";
                addEditOption(i);
            }
            let child = parentElement.children[1];
            const left = -40;
            const top = 10 + 17.5
            child.style = "left:" + left + "%;" + "top:" + top + "%;";
            let child1 = parentElement.children[2];
            const left1 = -80;
            const top1 = 10 + 17.5*2 - 5
            child1.style = "left:" + left1 + "%;" + "top:" + top1 + "%;";
            let child2 = parentElement.children[3];
            const left2 = -40;
            const top2 = 10 + 17.5*2 + 8
            child2.style = "left:" + left2 + "%;" + "top:" + top2 + "%;";
        }
        else {
            let first = 20;
            let last = 70;
            let interval = (last - first) / (childCount - 1);
            for (let i = 0; i < parentElement.children.length; i++) {
                let child = parentElement.children[i];
                let top = Math.floor(first + i * interval);
                child.style = "top:" + top + "%;";
                addEditOption(i);
            }
        }
        setupCloseButtons();
    }

    removeWeightCol(n) {
        demo.weights.splice(n, 1);
        let parentElement = document.getElementById("input-link-text");
        //let child = document.getElementById(`weight-${n+1}`);
        let child = parentElement.children[n];
        if (child && parentElement)
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
        if (inputTable.numCols >= 5) {
            alert("Cannot have more than 5 inputs!")
            return;
        }
        const c = this.getColLocation(button);
        inputTable.insertTableCol(c+1);
        dataOp.insertDataCol(inputs, c);
        this.insertWeightCol(c);
        display.handleHoverExit();
        perceptron.updateWeightsFromUI();
        if (document.getElementById("BinaryToggle").checked)
            display.UpdateBinaryToggle(true);
        demo.update(); //TODO: check if efficient
    }


    // remove row at specific location on button click
    removeCol(button) {
        const c = this.getColLocation(button) - 1;
        if (inputTable.numCols <= 1) {
            alert("Cannot remove all inputs!")
            return;
        }
        inputTable.removeTableCol(c);
        dataOp.removeDataCol(inputs, c);
        this.removeWeightCol(c);
        display.handleHoverExit();
        if (document.getElementById("BinaryToggle").checked)
            display.UpdateBinaryToggle(true);
        demo.update(); //TODO: check if efficient
    }

    // switch between binary and regular mode
    switchMode(buttonId){
        if (this.mode==="binary"){
            this.mode = "regular";
        }
        else {
            this.mode = "binary";
        }
        //console.log('mode set as', this.mode)
    }

    // update entire demo
    update(sender = undefined){
        if (sender && sender.tagName === 'TH') { //header changed

            //update selected input so it update immediately
            let headerRowVals = [];
            display.getHeaderRowVals(headerRowVals);
            display.adjustSelectedInputFontSize();
            demo.selectedInput = headerRowVals;
        }
        let bEditOutput = false;
        if (sender && sender.closest('table')?.id === "output-table") { //must be the desired output cell, no need to calculate
            bEditOutput = true;
            //console.log(sender.previousSibling)
            display.checkDesiredOutput(sender.previousSibling, sender);
            //dataOp.updateDesiredOutput(demo.desiredOutput, outputTable);
            return;
        }
        dataOp.updateDataFromTable(inputs, inputTable);
        if (document.getElementById("OutputToggle").checked) {
            dataOp.updateDataFromTable(outputs, outputTable);
        }

        perceptron.updateWeightsFromUI();
        perceptron.updateThreshold();
        perceptron.computeOutputs();
        // TODO: ineffecient 2 steps, update step needed:
        //outputs.update(perceptron.outputData);
        for (let i = 0; i < perceptron.outputData.length; i++) {
            for (let j = 0; j < perceptron.outputData[0].length-1; j++ ) {
                outputs.data[i][j] = perceptron.outputData[i][j]
            }
        }
        outputTable.dataObj = outputs;
        outputTable.updateTable();
        display.updateDisplay();
        display.outputLine.position();
        display.alignTables()
        display.adjustSelectedInputFontSize()
        //let isCorrect = display.checkCorrectness(outputs)
        //console.log("isCorrect: " + isCorrect)
        display.outputLine.position()
        display.createOutputTableEditBorder();
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
    let fanfareToggleChecked = document.getElementById("FanfareToggle").checked;
    //console.log("in download: "+  demo.inputData);
    // let headerRows = [];
    // display.getHeaderRowVals(headerRows);

    let headerRowVariables = [];
    display.getHeaderRowVariables(headerRowVariables);

    let modelname = document.getElementById("fname").innerText
    //if(modelname.length == 0)  modelname = "model"

    const handle = await showSaveFilePicker({
        suggestedName: modelname + '.sandbox',
        types: [{
            description: 'Neuron Sandbox model',
            accept: {'application/sandbox': ['.sandbox']},
        }],
    });

    let table = document.getElementById("output-table");
    //console.log(table);
    for (let i = 1; i < table.rows.length; i++ ) {
        let tr = table.rows[i];
        let td = tr.cells[2];
        desiredOutputs.data[i-1] = td.innerText;
        //console.log("desired output: " + desiredOutputs.data[i-1]);
    }
    desiredOutputs.rows = table.rows.length-1;

    //dataOp.updateDataFromTable(outputs, outputTable);
    //let newName = handle.name.substring(0, handle.name.length - 4)
    let newName = (handle.name).replace(".sandbox", "")
    document.getElementById("fname").textContent = newName

    demo.threshold = perceptron.threshold;
    let binaryToggleChecked = document.getElementById("BinaryToggle").checked;
    //let thresholdToggleChecked = document.getElementById("checkbox_threshold_editable").checked;
    let thresholdToggleChecked = document.getElementById("threshold_toggleBtn").classList.contains("edit-toggle-on");

    const editToggle = document.getElementById("InputToggle").checked;
    let question = "";
    if (editToggle) {
        question = document.getElementById("questionprompt").value;
    }
    else {
        question = document.getElementById("questiontext").innerText;
    }

    let dict = {
        "model-name" : newName,
        "input": demo.inputData,
        "weight": demo.weights,
        "weight_labels": perceptron.weightLabels,
        "threshold": demo.threshold,
        "threshold-editable" : thresholdToggleChecked,
        "desired-output": desiredOutputs,
        "input-toggle-checked" : inputToggleChecked,
        "output-toggle-checked" : outputToggleChecked,
        "fanfare-toggle-checked": fanfareToggleChecked,
        "input-header-vars" : headerRowVariables,
        "binaryToggleChecked" : binaryToggleChecked,
        "question" : question
        //"input-header": headerRows,
    };

    const blob = new Blob([JSON.stringify(dict)]);
    // Create a new JSZip instance
    const zip = new JSZip();
    // Add the file to the zip archive
    zip.file("model.json", blob);
    zip.file("ImageMapping.json", new Blob([JSON.stringify(dictImageMapping)]))

    for (const key in dictImageMapping) {
        let keyStorage = dictImageMapping[key];
        console.log("localstorage key:" + key);
        const dataURLImage = localStorage.getItem(keyStorage);
        if (dataURLImage !== null) {
            // Convert the data URL to an array buffer
            const response = await fetch(dataURLImage);
            const arrayBuffer = await response.arrayBuffer();
            // Add the file to the zip archive
            zip.file(keyStorage, arrayBuffer);
        }
    }
    // Generate the zip file as a data URL
    const zipData = await zip.generateAsync({ type: "blob" });
    const writableStream = await handle.createWritable();
    await writableStream.write(zipData);
    await writableStream.close();
}

async function uploadFromZipUrl(url) {
    try {
        const urlRegex = /[\w\.\/&]+\.sandbox$/i;
        if(!urlRegex.test(url)) {
            alert("Please enter a valid URL ends with zip extension");
            isLoading = false;
            return;
        }

        const response = await fetch(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                accept: "*/*",
            },
        });

        if (!response.ok) {
            throw new Error("Please enter valid URL.");
        }

        const blob = await response.blob();
        await uploadZip(blob);
    } catch (err) {
        alert("An error occurred when loading model: Please enter valid URL.");
    }
}

function uploadFromUrl(url) { //TODO: doesn't work if running from hard drive
    fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            accept: '*/sandbox',
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
    if (url) {
        uploadFromZipUrl(url);
    }
    else {
        // const fileInput = document.getElementById('upload-file');
        // fileInput.value = '';
        // fileInput.click();
        alert("No URL provided.")
    }
}

async function uploadFileComputer(event) {
    const fileInput = document.getElementById('upload-file');
    fileInput.value = '';
    fileInput.click();
}

function addEditOption(c) {
    //cannot use getElementById since it is not accurate
    let weight_parent = document.getElementById(`input-link-text`);
    let divNode = weight_parent.childNodes[c];
    const toggleBtn = divNode.querySelector('.edit-toggle');
    let weightButtonHandler = function () {
        if (toggleBtn.classList.contains("edit-toggle-on")) {
            toggleBtn.classList.add("edit-toggle-off");
            toggleBtn.classList.remove("edit-toggle-on")
        }
        else {
            toggleBtn.classList.remove("edit-toggle-off");
            toggleBtn.classList.add("edit-toggle-on")
        }
        let editable = toggleBtn.classList.contains("edit-toggle-on");
        const textbox = divNode.querySelector(`.weight-edit-text`);
        textbox.contentEditable = editable;
        if (editable) {
            if (!textbox.classList.contains("weights")) {
                textbox.classList.add("weights");
            }
        }
        else {
            if (textbox.classList.contains("weights")) {
                textbox.classList.remove("weights");
            }
        }
        dataOp.makeEditable(textbox, editable);
    };
    toggleBtn.onclick = weightButtonHandler;
}

function addThresholdEditOption() {
    const toggleBtn = document.getElementById(`threshold_toggleBtn`);
    let thresholdButtonHandler = function () {
        if (toggleBtn.classList.contains("edit-toggle-on")) {
            toggleBtn.classList.add("edit-toggle-off");
            toggleBtn.classList.remove("edit-toggle-on")
        }
        else {
            toggleBtn.classList.remove("edit-toggle-off");
            toggleBtn.classList.add("edit-toggle-on")
        }
        const textbox = document.getElementById(`th1`);
        let editable = toggleBtn.classList.contains("edit-toggle-on");
        textbox.contentEditable = editable;
        if (editable) {
            if (!textbox.classList.contains("weights")) {
                textbox.classList.add("weights");
            }
        }
        else {
            if (textbox.classList.contains("weights")) {
                textbox.classList.remove("weights");
            }
        }
        dataOp.makeEditable(textbox, editable);
    };
    toggleBtn.onclick = thresholdButtonHandler;
}

function hideCameraImages() {
    let images = document.querySelectorAll(`.myimage`);
    images.forEach((image) => {
        if(image.src.endsWith("1_image.svg") || image.src.endsWith("0_image.svg"))
            image.style.display = "none";
    });
}

function setImageEditOptions() {
    let images = document.querySelectorAll(`.myimage`);
    images.forEach((image) => {
        //console.log(image);
        image.style.display = "inline-block";
        let tdElement = image;
        while (tdElement && tdElement.tagName !== 'TD') {
            tdElement = tdElement.parentNode;
        }
        let imageMenuHandler = function (event) {
            //make the dialog box visible
            if (document.getElementById("InputToggle").checked) {
                let table = tdElement.closest('table');
                event.preventDefault();
                showMenu(event, this, tdElement.cellIndex, table)
            }
            //handleImageClick(this, tdElement.cellIndex);
        };
        //toggleBtn.addEventListener("click", weightButtonHandler);
        //image.oncontextmenu = imageMenuHandler;
        image.onmouseover = imageMenuHandler;

    });
}


function setupCloseButtons() {
    let closeIcons = document.querySelectorAll('.close-icon');

    closeIcons.forEach(function (closeIcon) {
        closeIcon.addEventListener('click', function () {
            const popup = this.parentElement;
            popup.style.display = 'none';
            if (popup.classList.contains("active"))
                popup.classList.remove("active");
        });
    });
}

async function uploadZip(zipFile) {
    // Assume the zip file is stored in a variable called "zipFile" and is a binary string
    try {
        localStorage.clear();
        const zipObj = new JSZip();
        let jsonModelContent = ""
        await zipObj.loadAsync(zipFile).then(function (zip) {
            // Iterate over each file in the zip
            zip.forEach(function (relativePath, zipEntry) {
                // Get the content of the file
                if (relativePath === "ImageMapping.json") {
                    zipEntry.async('text').then(function (content) {
                        console.log(content);
                        dictImageMapping = JSON.parse(content);
                    });
                }
                else if (relativePath.endsWith(".json")) {
                    zipEntry.async('text').then(function (content) {
                        console.log(content);
                        jsonModelContent = content;
                        uploadJson(jsonModelContent);
                    });
                }
                else {
                    zipEntry.async("arraybuffer").then(function (content) {
                        //save to localStorage
                        const binaryString = arrayBufferToString(content, 1024)
                        const base64String = btoa(binaryString);
                        // Use the binary content in the arrayBuffer
                        const dataURL = `data:image/png;base64,${base64String}`;
                        localStorage.setItem(relativePath, dataURL);
                        display.createInputTableEditBorder();
                        display.createOutputTableEditBorder();
                    });
                }
            });
        }).catch(function (error)
        {
            alert("An error occurred when loading model: Please enter valid URL.");
        });
    }
    catch (e)
    {
        alert("An error occurred when loading model: Please enter valid URL");
    }
}
function arrayBufferToString(arrayBuffer, chunkSize) {
    var result = '';
    var uint8Array = new Uint8Array(arrayBuffer);
    var len = uint8Array.length;

    for (var i = 0; i < len; i += chunkSize) {
        var chunk = uint8Array.subarray(i, i + chunkSize);
        result += String.fromCharCode.apply(null, chunk);
    }

    return result;
}

function uploadJson(text) {
    if (!text)
        return;
    isLoading = true;
    demo.removeAllInputDataRows(false);
    demo.removeAllInputDataCols(false);
    demo.removeAllWeightCol();

    let dict = JSON.parse(text);
    demo.inputData = dict["input"];
    //demo.weights = dict["weight"];
    demo.weights = []; //clear weight array first, due to the insertWeightCol below
    demo.threshold = dict["threshold"];
    desiredOutputs = dict["desired-output"];
    document.getElementById('fname').innerText  = dict["model-name"];
    document.getElementById("questiontext").innerText = dict["question"];
    document.getElementById("questionprompt").hidden = true;
    document.getElementById("questiontext").hidden = false;



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
    perceptron = new Perceptron(inputs, demo.weights, demo.threshold, dict["weight_labels"]);
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
    document.getElementById("FanfareToggle").checked = dict["fanfare-toggle-checked"];

    display.handleHoverExit();
    demo.update();
    // let headerRows = dict["input-header"];
    // if(headerRows?.length) {
    //     display.setHeaderRowVals(headerRows);
    // }

    let headerRowVars = dict["input-header-vars"];
    if (headerRowVars?.length) {
        display.setHeaderRowVariables(headerRowVars);
    }

    dataOp.updateTableFromDesired(desiredOutputs, outputTable);

    let outputCol = document.getElementById("output-table");
    let outputTableLength = outputCol.rows.length;

    for (let i = 1; i < outputTableLength; i++)
    {
        //var tr = outputCol.rows[i];
        let output = outputCol.rows[i].cells[1];
        let desired = outputCol.rows[i].cells[2];
        display.checkDesiredOutput(output, desired);
    }
    display.handleHoverExit();

    display.outputLine.position();
    display.createInputTableEditBorder();
    display.createOutputTableEditBorder();
    display.alignTables();

    if (document.getElementById('OutputToggle').checked)
        demo.hasNoSolution()
    setupCloseButtons();

    demo.showWeightToggle(false);
    document.getElementById("BinaryToggle").checked = dict["binaryToggleChecked"];
    display.UpdateBinaryToggle(false);
    addThresholdEditOption();
    const thresholdToggle = document.getElementById("threshold_toggleBtn");
    if (dict["binaryToggleChecked"] && document.getElementById('InputToggle').checked)
    {
        thresholdToggle.style.display = 'inline-block';
    }
    else {
        thresholdToggle.style.display = "none";
    }
    if (dict["threshold-editable"]) {
        thresholdToggle.classList.remove("edit-toggle-on"); //reversed here since we will dispatch a click event
        thresholdToggle.classList.add("edit-toggle-off");
    }
    else {
        thresholdToggle.classList.remove("edit-toggle-off"); //reversed here since we will dispatch a click event
        thresholdToggle.classList.add("edit-toggle-on");
    }
    thresholdToggle.dispatchEvent(new Event("click"));
    handleDesiredOutputColumn();
    isLoading = false;
}

async function uploadFile(event) {
    const file = event.target.files.item(0)
    if (!file) {
        return;
    }
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (event) => {
        const blob = event.target.result;
        uploadZip(blob);
        // Use the file buffer as needed
    };
}

async function uploadImageFile(event) {
    const file = event.target.files.item(0)
    if (!file) {
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    // const reader = new FileReader();
    // reader.onload = function() {
    //     const image = new Image();
    //     image.onload = () => {
    //         // Resize the image to 32x32 using the canvas
    //         canvas.width = 32;
    //         canvas.height = 32;
    //         ctx.drawImage(image, 0, 0, 32, 32);
    //         let dataURL = canvas.toDataURL("image/png", 0.9);
    //         dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})] = file.name;
    //         localStorage.setItem(file.name, dataURL);
    //         display.createInputTableEditBorder();
    //         display.createOutputTableEditBorder();
    //     };
    //     image.src = reader.result;
    // };
    // reader.readAsDataURL(file);


    //Load the image file into an image object
    const img = new Image();
    img.onload = () => {
        try {
            // Resize the image to 48x48 using the canvas
            canvas.width = 48;
            canvas.height = 48;
            ctx.drawImage(img, 0, 0, 48, 48);
            let dataURL = canvas.toDataURL("image/png", 0.9);
            dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})] = file.name;
            localStorage.setItem(file.name, dataURL);
            display.createInputTableEditBorder();
            display.createOutputTableEditBorder();
        }
        catch (e)
        {
            alert("An error occurred: Try uploading a smaller image or convert the image file to a valid type (.bmp, .gif, .jpg, .jpeg, .png, .webp).");
            localStorage.removeItem(file.name);
            delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
        }
    };
    img.onerror = function() {
        //console.log('Error loading image');
        //console.log('Image URL:', img.src);
        //console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        alert("This is not a valid image. Valid types are: .bmp, .gif, .jpg, .jpeg, .png, .webp. Apple .HEIC files are not supported.");
        localStorage.removeItem(file.name);
        delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
    };
    img.src = URL.createObjectURL(file);

    // const reader = new FileReader();
    // reader.onload = function(event) {
    //     try {
    //         const arrayBuffer = event.target.result;
    //         const binaryString = arrayBufferToString(arrayBuffer, 1024);
    //         const base64String = btoa(binaryString);
    //         // Use the binary content in the arrayBuffer
    //         const dataURL = `data:image/png;base64,${base64String}`;
    //         dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})] = file.name;
    //         localStorage.setItem(file.name, dataURL);
    //             display.createInputTableEditBorder();
    //             display.createOutputTableEditBorder();
    //     }
    //     catch (e)
    //     {
    //         alert("An error occurred: Try uploading a smaller image.");
    //         localStorage.removeItem(file.name);
    //             delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
    //     }
    //
    // };
    // reader.readAsArrayBuffer(file);
}


window.onload = function(){
    console.log("window loaded")
    $("#input-table tr:first").hide();
    $("#input-table tr td:nth-child(1)").hide();
    //$("#OutputButton").hide();
}

// initialize all classes
const demo = new Demo();
var currentImageType = "";
var currentImage;
var currentColumn = -1;
var currentTable = "input-table";
var dictImageMapping = {}
var isLoading = false;
let inputs = new Data(demo.inputData);
let desiredOutputs = new Data(demo.desiredOutput);
const dataOp = new DataOperator();
const inputTable = new Table(inputs, "input-table", true);
let perceptron = new Perceptron(inputs, demo.weights, demo.threshold, null);
perceptron.computeOutputs();
let outputs = new Data(perceptron.outputData);
const outputTable = new Table(outputs, "output-table", false);
dataOp.createBinaryData(2);
perceptron.displayPerceptron();
const display = new Display();
display.updateDisplay();
//uploadFromUrl("SampleModel.json");
uploadFromZipUrl("Problem 1.sandbox");
display.createOutputTableColors();
display.createInputTableEditBorder();
display.createOutputTableEditBorder();
addThresholdEditOption();
handleDesiredOutputColumn();
loadQuestionsAndModels();


function addTooltips()
{
    tippy('#BinarySwitch', {
        content: 'restrict inputs to binary',
        className: 'my-tooltip-class'
    });

    tippy('#InputSwitch', {
        content: 'edit model',
        className: 'my-tooltip-class'
    });

    tippy('#FanfareSwitch', {
        content: 'celebrate when correct answer reached',
        className: 'my-tooltip-class'
    });
}

document.addEventListener("DOMContentLoaded", () => {
    demo.main().catch(e => console.error(e));
    addTooltips();
});

$('#InputToggle').change(function() { //toggle edit
    display.UpdateInputToggle();
    display.outputLine.position();
    const show = document.getElementById("InputToggle").checked;
    demo.showWeightToggle(show);
    display.createInputTableEditBorder();
    display.createOutputTableEditBorder();
    display.toggleProblemDisplay();
    for (let i = 0; i < demo.weightLines.length; i++) {
        demo.weightLines[i].position();
    }
});

$('#OutputToggle').change(function() { //toggle output
    display.UpdateOutputToggle();
    display.outputLine.position();
    display.checkForSuccess();
    demo.hasNoSolution();
});

$('#BinaryToggle').change(function() { //toggle output
    display.UpdateBinaryToggle(false);
    display.outputLine.position();
});

function PlaySound() {
    //document.getElementById("popup").classList.toggle('active');
    const audio = document.getElementById("hooray_sound");
    if (audio) {
        audio.play();
    }
}

$('#FanfareToggle').change(function() { //toggle output
    display.UpdateFanfareToggle();
    display.outputLine.position();
    for (let i = 0; i < demo.weightLines.length; i++)
    {
        demo.weightLines[i].position();
    }
});

function showMenu(event, img, col, table) {
    if (document.getElementById("InputToggle").checked) {
        currentImage = img;
        currentImageType = img.alt;
        currentColumn = col;
        currentTable = table.id;
        const menu = document.getElementById("popup-menu");
        menu.style.display = "block";
        const imageKey_0 = JSON.stringify({table_name: currentTable, column: col, value: img.alt});
        if (imageKey_0 in dictImageMapping) { //existing image
            document.querySelector(".existing_image_menu").style.display = "block";
            document.querySelector(".new_image_menu").style.display = "none";
        }
        else {
            document.querySelector(".existing_image_menu").style.display = "none";
            document.querySelector(".new_image_menu").style.display = "block";
        }

        var rect = img.getBoundingClientRect();
        menu.style.top = rect.top + window.pageYOffset + event.offsetY + "px";
        menu.style.left = rect.left + window.pageXOffset + event.offsetX + "px";
        document.addEventListener('click', handleClickOutsideContextMenu);
    }
}

function menuItemClicked(item) {
    let menu = document.getElementById("popup-menu");
    menu.style.display = "none";
    switch (item) {
        case 1:
            const fileInput = document.getElementById('upload-image_file');
            fileInput.value = '';
            fileInput.click();
            break;
        case 2:
            delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
            display.createInputTableEditBorder();
            display.createOutputTableEditBorder();
            break;
        default:
        // Do something when an invalid menu item is clicked
    }
}

function handleClickOutsideContextMenu(e) {
    let myContextMenu = document.getElementById("popup-menu");
    if (!myContextMenu.contains(e.target) && !currentImage.contains(e.target)) {
        myContextMenu.style.display = 'none';
        document.removeEventListener('click', handleClickOutsideContextMenu);
    }
}

function handleDesiredOutputColumn() {
    let table = document.getElementById('output-table');

    let thirdColumnTds = table.querySelectorAll('tr td:nth-child(3)');

    thirdColumnTds.forEach(function(td) {
        td.onkeydown = handleKeyDown;
    });

    function handleKeyDown(event) {
        if (event.keyCode === 13) {
            const rawValue = event.target.innerText;
            let [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
            if (parsedValue !== 1 && parsedValue !== 0 ) {
                isValid = false;
            }
            display.highlightInvalidText(event.target, isValid);
        }
    }
}
function fileExists(url) {
    let http = new XMLHttpRequest();
    http.open('HEAD', encodeURIComponent(url), false);
    http.send();
    return http.status !== 404;
}
function loadQuestionsAndModels() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('problem-list');
            dropdown.innerHTML = "";
            data.items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.label;
                dropdown.appendChild(option);
            });
            dropdown.addEventListener('change', event => {
                const selectedItemId = event.target.value;
                console.log(`User selected item with ID ${selectedItemId}`);
                data.items.forEach(item => {
                    if (item.id.toString() === selectedItemId) {
                        console.log(`Selected item: ${JSON.stringify(item)}`);
                        //const questiontext = document.getElementById("questiontext");
                        //questiontext.innerText = item.question;
                        //load the model associated with the question
                        if (fileExists(item.model_name+".sandbox")) {
                            uploadFromZipUrl(encodeURIComponent(item.model_name+".sandbox"));

                        }
                    }
                });
            });
        });
}



