"use strict";

const ACTIVATION_COLUMN = 0;
const OUTPUT_COLUMN = 0;
const DESIRED_OUTPUT_COLUMN = 1;

const ERROR_COLOR = '#ffbfcb';
const OUTPUT_COLOR = '#f8ffcf';
const INVALID_WEIGHT = '#fc496b';
const NEGATIVE_WEIGHT = '#c91a0e';
const ZERO_WEIGHT = 'blue';
const DEFAULT_LINE_COLOR = 'black';
const HOVER_COLOR = 'lightblue';
const HOVER_ERROR = '#c2abc9';

class DesiredOutputData {
    constructor(desired) {
        this.update(desired);
    }
    update(inputData) {
        this.data = inputData;
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
        this.activationData = new Array(this.dataObj.rows).fill(0).map(() => new Array(1).fill(0));
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
        this.activationData = new Array(this.dataObj.rows).fill(0).map(() => new Array(1).fill(0));
        for (let r=0; r<this.dataObj.rows; ++r){
            for (let c=0; c<this.dataObj.cols; ++c){
                const prod = this.inputData[r][c] * this.weights[c];
                // simple float operations give precision problems (#6)
                const affineOutput = this.correctPrecision(this.affineOutput[r] + prod);
                this.affineOutput[r] = affineOutput;
                this.activationData[r][ACTIVATION_COLUMN] = affineOutput;
            }
        }
    }

    // compute activation column of output table
    computeActivnOutput(activation = "threshold"){
        this.activationOutput = new Array(this.dataObj.rows).fill(0);
        if (activation === "threshold") {
            for (let r=0; r<this.dataObj.rows; ++r){
                const res = (this.affineOutput[r] > this.threshold ? 1 : 0);
                this.activationOutput[r] = res;
                this.outputData[r][OUTPUT_COLUMN] = res;
            }
        }
    }

    computeOutputs(){
        this.activationData = new Array(this.dataObj.rows).fill(0).map(() => new Array(1).fill(0));
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

    setWeightsUI() {
        let childNodes = document.getElementById("input-link-text").childNodes;
        for (let i = 0; i < demo.weights.length; i++){
            //const cell = document.getElementById(`w${i+1}`);
            const cell = childNodes[i].childNodes[2];
            if (cell) {
                cell.innerHTML = this.weights[i];
                if (this.weightLabels)
                    childNodes[i].childNodes[0].innerHtml = ConvertToWeightSubscript(this.weightLabels[i]);
            }
        }
    }
    setBiasUI() {
        const cell = document.getElementById("bias_weight");
        if(document.getElementById("biasToggle").checked) {
            document.getElementById("bias-link-text").style.display = "inline-block";

            if (cell) {
                cell.innerHTML = `<div padding="10px" id="bias-text">`+(-1)*perceptron.threshold + "" + `</div>`;
                cell.innerHTML += `<span id="bias-edit-toggle" class="edit-toggle edit-toggle-on">
                              <i class="fas fa-pencil-alt"></i>
                              <i class="fas fa-lock"></i> </span>`
                cell.style.background = "none";
                let image = document.getElementById("bias-edit-toggle");
                let thresholdToggle = document.getElementById("threshold_toggleBtn");
                let text = document.getElementById("bias-text");


                if (thresholdToggle.classList.contains("edit-toggle-on")) {
                    if(!image.classList.contains("edit-toggle-on")) {
                        image.classList.add("edit-toggle-on");
                    }
                    if(image.classList.contains("edit-toggle-off")) {
                        image.classList.remove("edit-toggle-off");
                    }
                    dataOp.makeEditable(text);

                }
                else {
                    if(image.classList.contains("edit-toggle-on")) {
                        image.classList.remove("edit-toggle-on");
                    }
                    if(!image.classList.contains("edit-toggle-off")) {
                        image.classList.add("edit-toggle-off");
                    }
                    dataOp.makeEditable(text, false);
                    text.style.background = "none";

                }

                if(!text.classList.contains('weight-edit-text')) {
                    text.classList.add('weight-edit-text');
                }
                if(!text.classList.contains('weights')) {
                    text.classList.add('weights');
                }

                let weightButtonHandler = function () {
                    if (image.classList.contains("edit-toggle-on")) {
                        image.classList.add("edit-toggle-off");
                        image.classList.remove("edit-toggle-on")
                        thresholdToggle.classList.add("edit-toggle-off");
                        thresholdToggle.classList.remove("edit-toggle-on")

                    }
                    else {
                        image.classList.remove("edit-toggle-off");
                        image.classList.add("edit-toggle-on")
                        thresholdToggle.classList.remove("edit-toggle-off");
                        thresholdToggle.classList.add("edit-toggle-on")
                    }

                    let editable = image.classList.contains("edit-toggle-on");
                    text.contentEditable = editable;
                    if (editable) {
                        if (!text.classList.contains("weights")) {
                            text.classList.add("weights");
                        }
                    }
                    else {
                        if (text.classList.contains("weights")) {
                            text.classList.remove("weights");
                        }
                    }
                    dataOp.makeEditable(text, editable);
                    setupQuestionFields();
                };


                image.onclick = weightButtonHandler;

                let editToggle = document.getElementById("InputToggle");
                let span = document.getElementById("bias-edit-toggle");
                if (span) {
                    if (!editToggle.checked) {
                        span.style.display = "none";
                    } else {
                        span.style.display = "inline-block";
                    }
                }
                thresholdToggle.style.display = "none";
            }
            //we should set the threshold value to 0, and also make it not editable
            const threshold = document.getElementById("th1");
            threshold.innerText = 0;
            threshold.contentEditable = false;
            if (threshold.classList.contains("edit-handler"))
                threshold.classList.remove("edit-handler");
            if (threshold.classList.contains("editable-border"))
                threshold.classList.remove("editable-border");
            if (threshold.classList.contains("comment-editable-border"))
                threshold.classList.remove("comment-editable-border");
            threshold.style.background = 'none';
        }
        else {
            document.getElementById("bias-link-text").style.display = "none";
            const threshold = document.getElementById("th1");
            threshold.innerText = perceptron.threshold;
            if (demo.biasLine) {
                demo.biasLine.remove();
                demo.biasLine = null;
            }
            let thresholdToggle = document.getElementById("threshold_toggleBtn");
            let image = document.getElementById("bias-edit-toggle");
            if (thresholdToggle.classList.contains("edit-toggle-on")) {
                if (!threshold.classList.contains("editable-border"))
                    threshold.classList.add("editable-border");
                if (thresholdToggle.classList.contains("edit-toggle-off"))
                    thresholdToggle.classList.remove("edit-toggle-off")
                if (!thresholdToggle.classList.contains("edit-toggle-on"))
                    thresholdToggle.classList.add("edit-toggle-on")
                threshold.contentEditable = true;
            }
            else {
                if (threshold.classList.contains("editable-border"))
                    threshold.classList.remove("editable-border");
                if (!thresholdToggle.classList.contains("edit-toggle-off"))
                    thresholdToggle.classList.add("edit-toggle-off")
                if (thresholdToggle.classList.contains("edit-toggle-on"))
                    thresholdToggle.classList.remove("edit-toggle-on")
                threshold.contentEditable = false;
            }

            let editToggle = document.getElementById("InputToggle");
            if (editToggle.checked)
                thresholdToggle.style.display = "inline-block";

        }
        if (demo.biasLine) {
            demo.biasLine.position();
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

                let [parsedValue, isValid] = demo.stringToValidFloat(cell.innerHTML);
                if(isValid) {
                    //check for leading zeroes
                    const regex = '^-?0+[0-9]+$';
                    if (new RegExp(regex).test(cell.innerHTML)) {
                        cell.innerHTML = parseInt(cell.innerHTML)
                    }
                }
                //display.highlightInvalidText(cell, isValid);
                if(!isValid) {
                    if(parsedValue > 0)
                        parsedValue = 1
                    else
                        parsedValue = 0
                }

                cell.innerText = parsedValue.toString();
                this.weights[i] = parsedValue;
                this.weightLabels.push(childNodes[i].childNodes[0].innerText);
            }
        }
    }

    updateThreshold(){
        let biasMode = document.getElementById("biasToggle").checked;
        const cell = document.getElementById(`th${1}`);
        if(biasMode)
        {
            const biasCell = document.getElementById("bias_weight");
            let [parsedValue, isValid] = demo.stringToValidFloat(biasCell.innerText);
            if(isValid) {
                //check for leading zeroes
                const regex = '^-?0+[0-9]+$';
                if (new RegExp(regex).test(biasCell.innerText)) {
                    biasCell.innerText = parseInt(biasCell.innerText)
                }
            }
            biasCell.children[0].textContent = parsedValue.toString();
            this.threshold = (-1) * parsedValue;
        }
        else
        {
            let [parsedValue, isValid] = demo.stringToValidFloat(cell.innerText);
            if(isValid) {
                //check for leading zeroes
                const regex = '^-?0+[0-9]+$';
                if (new RegExp(regex).test(cell.innerText)) {
                    cell.innerText = parseInt(cell.innerText)
                }
            }
            if(!isValid) {
                if(parsedValue > 0)
                    parsedValue = 1
                else
                    parsedValue = 0
            }
            cell.innerText = parsedValue.toString();
            this.threshold = parsedValue;
        }
    }
}

function ConvertToWeightSubscript(weightLabel) {
    if(!weightLabel.match("/baseline-shift/")) {
        let firstChar = weightLabel.charAt(0);
        let spaceIndex = weightLabel.indexOf(' ');
        if(spaceIndex === -1){
            spaceIndex = weightLabel.length;
        }
        let remainder = weightLabel.substring(spaceIndex);
        let subscriptChars = "<sub>" + weightLabel.substring(1, spaceIndex) + "</sub>";
        weightLabel = `${firstChar}${subscriptChars}{$remainder}`;
    }
    return weightLabel;
}

function checkAnswerCorrect() {
    let inputTable = document.getElementById("input-table")
    let outputTable = document.getElementById("output-table")
    let activationTable = document.getElementById("activation-table")
    let guessToggle = document.getElementById("DisplayToggle")
    let editToggle = document.getElementById("InputToggle")
    let thresholdText = document.getElementById("th1")
    let biasContent = document.getElementById("bias-text")

    let outputToggleChecked = document.getElementById("OutputToggle").checked
    let tableRows = outputTable.rows.length
    let isCorrect = true;
    let thresholdValue = parseFloat(thresholdText.textContent);
    if (thresholdValue > 0) {
        thresholdText.classList.remove('blue-text', 'red-text');
    } else if (thresholdValue < 0) {
        thresholdText.classList.remove('blue-text');
        thresholdText.classList.add('red-text');
    } else {
        thresholdText.classList.remove('red-text');
        thresholdText.classList.add('blue-text');
    }

    if(biasContent) {
        let biasValue = parseFloat(biasContent.textContent);
        if (biasValue > 0) {
            biasContent.classList.remove('blue-text', 'red-text');
        } else if (biasValue < 0) {
            biasContent.classList.remove('blue-text');
            biasContent.classList.add('red-text');
        } else {
            biasContent.classList.remove('red-text');
            biasContent.classList.add('blue-text');
        }
    }

    let inputTableHeaders = document.querySelectorAll('[id^="tblinput"]');
    if(inputTableHeaders) {
        for( let i = 0; i < inputTableHeaders.length; i++) {
            dataOp.makeEditable(inputTableHeaders[i], editToggle.checked, true);
        }
    }

    if(guessToggle.value !== '1') {
        for (let i = 1; i < tableRows; i++) {
            let row = outputTable.rows.item(i);
            let inputRow = inputTable.rows.item(i+1);
            let activationRow = activationTable.rows.item(i);
            let activationValue = parseFloat(activationRow.children[0].textContent);
            if (activationValue > 0) {
                activationRow.children[0].classList.remove('blue-text', 'red-text');
            } else if (activationValue < 0) {
                activationRow.children[0].classList.remove('blue-text');
                activationRow.children[0].classList.add('red-text');
            } else {
                activationRow.children[0].classList.remove('red-text');
                activationRow.children[0].classList.add('blue-text');
            }

            if (!document.getElementById("BinaryToggle").checked) {
                for(let j = 0; j < inputRow.children.length; j++)
                {
                    let inputValue = parseFloat(inputRow.children[j].textContent);
                    if (inputValue > 0) {
                        inputRow.children[j].classList.remove('blue-text', 'red-text');
                    } else if (inputValue < 0) {
                        inputRow.children[j].classList.remove('blue-text');
                        inputRow.children[j].classList.add('red-text');
                    } else {
                        inputRow.children[j].classList.remove('red-text');
                        inputRow.children[j].classList.add('blue-text');
                    }
                }
            }

            let cells = outputTable.rows.item(i).cells
            let output = cells.item(OUTPUT_COLUMN).innerText;
            let desired = cells.item(DESIRED_OUTPUT_COLUMN).innerText;
            if (output !== desired && outputToggleChecked) {
                //highlight the entire row
                if(!row.classList.contains("red-border")) {
                    row.classList.add("red-border");
                }
                if(!inputRow.classList.contains("red-border")) {
                    inputRow.classList.add("red-border");
                }
                if(!activationRow.classList.contains("red-border")) {
                    activationRow.classList.add("red-border");
                }
                isCorrect = false
            }
            else {
                if(row.classList.contains("red-border")) {
                    row.classList.remove("red-border");
                }
                if(inputRow.classList.contains("red-border")) {
                    inputRow.classList.remove("red-border");
                }
                if(activationRow.classList.contains("red-border")) {
                    activationRow.classList.remove("red-border");
                }
            }
        }
    }
    else {
        for (let i = 1; i < tableRows; i++) {
            let inputRow = inputTable.rows.item(i+1);
            if(inputRow.classList.contains("red-border")) {
                inputRow.classList.remove("red-border");
            }
        }
        for (let i = 1; i < tableRows; i++) {
            let cells = outputTable.rows.item(i).cells
            var radioButtonGroup = document.getElementsByName(`guess-radio-${i-1}`);
            let guess_output;

            for (let j = 0; j < radioButtonGroup.length; j++) {
                if (radioButtonGroup[j].checked) {
                    guess_output = radioButtonGroup[j].value;
                    break;
                }
            }

            let desired = cells.item(DESIRED_OUTPUT_COLUMN).innerText;
            if (guess_output !== desired) {

                isCorrect = false
                break
            }

        }
    }
    return isCorrect;
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
        this.defaultSelectedOutput = ["y", "y"];
        this.selectedInput = this.defaultSelectedInput;
        this.selectedOutput = this.defaultSelectedOutput;
        this.lines = [];
        this.weightLines = [];
        this.biasLine = null;
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
        activationTable.insertTableRow(r-1);
        dataOp.insertDataRow(activations, r-2);
        demo.update(); //TODO: check if efficient
    }

    insertRowAtIndex(r, needUpdate = false) {
        inputTable.insertTableRow(r);
        dataOp.insertDataRow(inputs, r-2);
        outputTable.insertTableRow(r-1);
        activationTable.insertTableRow(r-1);
        dataOp.insertDataRow(activations, r-2)
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
        activationTable.removeTableRow(r-1);
        dataOp.removeDataRow(outputs, r);
        dataOp.removeDataRow(activations, r);
        demo.lines.forEach(line => line.remove());
        demo.lines = []
        demo.activationLines = [];
        demo.outputLines = [];
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
            activationTable.removeTableRow(1);
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
                            onkeypress="if (event.which === 13 || event.keyCode === 13) return false;" id="w${unique_id}" fill="black" class="weight-edit-text weights">0</text>
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
        }
        let thresholdToggleBtn = document.getElementById("threshold_toggleBtn");
        if (!show)
            thresholdToggleBtn.style.display = 'none';
        else
            thresholdToggleBtn.style.display = 'inline-block';
    }

    adjustWeightPlacement() {
        if(document.getElementById("DisplayToggle").value === '1')
            return;
        // let headerRowVals = [];
        // display.getHeaderRowVals(headerRowVals);
        // this.selectedInput = headerRowVals;
        display.updateSelectedInput();

        let selections = document.getElementById("selected-inputs");
        let weights = document.getElementById("input-link-text");
        let dimensions = weights.getBoundingClientRect()

        let weightsList = []
        for (let i = 0; i < weights.children.length; i++) {
            weightsList.push(weights.children[i])
        }

        let biasToggleChecked = document.getElementById("biasToggle").checked
        if (biasToggleChecked) {
            let biasCell = document.getElementById(`bias-1`);
            weightsList.unshift(biasCell)
        }

        let length = weightsList.length

        if(length === 2) {
            for(let i = 0; i < length; i++) {
                let elem = selections.rows[i].cells[0];
                let rect = elem.getBoundingClientRect();

                let weight = weightsList[i];
                let height = elem.offsetHeight;
                weight.style.position = "absolute";
                if(i === 1) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top- dimensions.top + height/2) +'px';
                }
                else {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top + height/3 - dimensions.top) +'px';
                }

            }
        }
        else if(length === 3) {
            for(let i = 0; i < length; i++) {
                let elem = selections.rows[i].cells[0];
                let rect = elem.getBoundingClientRect();

                let weight = weightsList[i];
                let height = rect.height;
                weight.style.position = "absolute";
                if(i === 1) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    if(height < 150)
                        weight.style.top = (rect.top - dimensions.top - height/10) +'px';
                    else
                        weight.style.top = (rect.top - dimensions.top + height/5) +'px';
                }
                else if (i === 0) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }
                else {
                    weight.style.left = (rect.left - dimensions.left)*0.025 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }

            }
        }
        else if (length === 4) {
            for(let i = 0; i < length; i++) {
                let elem = selections.rows[i].cells[0];
                let rect = elem.getBoundingClientRect();

                let weight = weightsList[i];
                let height = rect.height;
                weight.style.position = "absolute";
                if(i === 1) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    if(height < 200)
                        weight.style.top = (rect.top - dimensions.top-height/10) +'px';
                    else
                        weight.style.top = (rect.top - dimensions.top+height/7) +'px';
                }
                else if (i === 0) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }
                else {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }

            }
        }
        else {
            for(let i = 0; i < length; i++) {
                let elem = selections.rows[i].cells[0];
                let rect = elem.getBoundingClientRect();

                let weight = weightsList[i];
                let height = rect.height;
                weight.style.position = "absolute";
                if(i === 1) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top+height/2) +'px';
                }
                else if (i === 0) {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }
                else {
                    weight.style.left = (rect.left - dimensions.left)*0.05 +'px';
                    weight.style.top = (rect.top - dimensions.top + height/3) +'px';
                }

            }
        }

    }
    updateWeightUI(parentElement) {
        let childCount = parentElement.children.length;

        for(let i = 0; i < childCount; i++) {
            addEditOption(i);
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
        demo.adjustWeightPlacement();
        perceptron.updateWeightsFromUI();
        if (document.getElementById("BinaryToggle").checked)
            display.UpdateBinaryToggle(true);
        demo.update(); //TODO: check if efficient
        display.saveGuessComment();
        display.createGuessTable();
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
        display.saveGuessComment();
        display.createGuessTable();
    }

    // switch between binary and regular mode
    switchMode(buttonId){
        if (this.mode==="binary"){
            this.mode = "regular";
        }
        else {
            this.mode = "binary";
        }
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
            display.checkDesiredOutput(sender.previousSibling, sender, sender.previousSibling.previousSibling);
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
        let biasMode = document.getElementById("biasToggle").checked;
        for (let i = 0; i < perceptron.activationData.length; i++) {
            for (let j = 0; j < perceptron.activationData[0].length; j++ ) {
                activations.data[i][j] = perceptron.activationData[i][j]
                if(biasMode) {
                    activations.data[i][j] += -1 * perceptron.threshold;
                    activations.data[i][j] = perceptron.correctPrecision(activations.data[i][j]);
                }
            }
        }

        outputTable.dataObj = outputs;
        activationTable.dataObj = activations;
        activationTable.updateTable();
        outputTable.updateTable();
        display.updateDisplay();
        display.outputLine.position();
        display.alignTables()
        display.adjustSelectedInputFontSize()
        display.outputLine.position()
        display.createInputTableEditBorder();
        display.createOutputTableEditBorder();
        demo.adjustWeightPlacement();
        display.saveGuessComment();
        display.createGuessTable();
        display.updateHintButton();
        display.updateTableOutputColumn();

        let hintText = document.getElementById("hintText");
        hintText.innerText = "";
        display.createInputLabelLines()

        //TODO: instead of initialize, change to an "update" function

        let inputTableObj = document.getElementById('input-table');
        // let numVariables = inputTableObj.rows[0].cells.length - 1;
        initialize();


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
            // console.log('Downloaded this JSON! ', text);
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

function getEditableList() {
    const thresholdToggleBtn = document.getElementById(`threshold_toggleBtn`);
    let editableList  = [];

    let weight_parent = document.getElementById(`input-link-text`);
    let weight_lebals = weight_parent.querySelectorAll('span.edit-toggle');
    for( let i = 0; i < weight_lebals.length; i++) {
        let weight_label = weight_lebals[i];
        if (weight_label.classList.contains("edit-toggle-on")) {
            editableList.push(true);
        }
        else {
            editableList.push(false);
        }
    }

    //threshold
    if (thresholdToggleBtn.classList.contains("edit-toggle-on")) {
        editableList.push(true);
    }
    else {
        editableList.push(false);
    }

    return editableList
}

async function provideHint() {
    //get all the input

    //dataOp.updateDataFromTableNoDisplay(outputs, outputTable);
    //let desiredOutputs = perceptron.outputData.map(row => row[row.length - 1]);
    let desiredOutputs = []
    let outputTable = document.getElementById("output-table")
    for (let i = 1; i < outputTable.rows.length; i++) {
        desiredOutputs.push(parseInt(outputTable.rows[i].cells[DESIRED_OUTPUT_COLUMN].innerText));
    }

    let editableList = getEditableList()
    let hintProvider = new hintprovider([...perceptron.weights].concat(perceptron.threshold), perceptron.inputData, desiredOutputs, editableList);
    let hintArr = hintProvider.provideHint(prevHintIndex, prevSubset, prevHintLevel);
    prevHintIndex = hintArr[1];
    prevSubset = hintArr[2];
    prevHintLevel = hintArr[3];
    let hintIndex = hintArr[4];
    let hintText = document.getElementById("hintText");
    let weightHolder = document.getElementById("input-link-text");
    let weightName = "";
    if (hintIndex < 0) { // no hint is needed, problem already solved
        hintText.innerHTML = hintArr[0];
    }
    else if (hintIndex < weightHolder.children.length) { //weight hint
        weightName = weightHolder?.children[hintIndex]?.children[0].innerHTML;
        weightName = weightName.replace("=", "");
        weightName = weightName.replace(" ", "");
        hintText.innerHTML = hintArr[0] + " " + weightName + ".";
    }
    else { //threshold hint
        hintText.innerHTML = hintArr[0];
    }



    display.outputLine.position()
    for (let i = 0; i < demo.weightLines.length; i++)
    {
        demo.weightLines[i].position();
    }
    if (demo.biasLine) {
        demo.biasLine.position();
    }
}

async function detailButtonClicked() {
    if(document.getElementById("detailButton").innerText === "Hide details") {
        document.getElementById("detailButton").innerText = "How does this work?";
    }
    else {
        document.getElementById("detailButton").innerText = "Hide details";
    }
    display.UpdateDetailToggle();

    display.outputLine.position()
    for (let i = 0; i < demo.weightLines.length; i++)
    {
        demo.weightLines[i].position();
    }
    if (demo.biasLine) {
        demo.biasLine.position();
    }

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
        setupQuestionFields();
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
        if (!textbox.classList.contains("weights")) {
            textbox.classList.add("weights");
        }
        dataOp.makeEditable(textbox, editable);
        setupQuestionFields();
    };
    toggleBtn.onclick = thresholdButtonHandler;
}

function findAncestorTable(element) {
    let ancestor = element.parentNode;
    while (ancestor && ancestor.tagName !== 'TABLE') {
        ancestor = ancestor.parentNode;
    }
    if (ancestor && ancestor.tagName === 'TABLE') {
        return ancestor;
    }
    return null; // If no ancestor table is found
}

function hideCameraImages() {
    let images = document.querySelectorAll(`.myimage`);
    let editToggleChecked = document.getElementById("InputToggle").checked;
    images.forEach((image) => {
        if(image.src.endsWith("media/1_image.svg") || image.src.endsWith("media/0_image.svg")) {
            if(findAncestorTable(image)?.id === "guess-output-table") {
                image.visibility = "hidden";
            }
            else if(findAncestorTable(image)?.id !== "output-table" || !editToggleChecked ) {
                image.style.display = "none";
            }
        }
    });
}

function setImageEditOptions() {
    let images = document.querySelectorAll(`.myimage`);
    images.forEach((image) => {
        if(findAncestorTable(image)?.id === "guess-output-table") {
            return;
        }
        image.style.display = "inline";
        let tdElement = image;
        while (tdElement && tdElement.tagName !== 'TD') {
            tdElement = tdElement.parentNode;
        }
        if(document.getElementById("InputToggle").checked && (document.getElementById("DisplayToggle").value === '2')) {
            if(!image.classList.contains("editable-border")) {
                image.classList.add("editable-border")
            }
        }
        else {
            if(image.classList.contains("editable-border")) {
                image.classList.remove("editable-border")
            }
        }
        let imageMenuHandler = function (event) {
            //make the dialog box visible
            if (document.getElementById("InputToggle").checked && (document.getElementById("DisplayToggle").value !== '1')) {
                let table = tdElement.closest('table');
                event.preventDefault();
                showMenu(event, this, tdElement.cellIndex, tdElement.rowIndex, table)
            }
            //handleImageClick(this, tdElement.cellIndex);
        };
        image.onmouseover = imageMenuHandler;

    });
}

function setupQuestionFields() {
    let editableList = getEditableList()

    let weightHolder = document.getElementById("input-link-text");

    let fields = [];
    for (let i = 0; i < editableList.length; i++) {
        let field = editableList[i];
        let fieldName = '';
        if (field) { //editable
            if (i !== editableList.length - 1) { //weight
                fieldName = weightHolder?.children[i]?.children[0].innerHTML;
                fieldName = fieldName.replace("=", "");
                fieldName = fieldName.replace(" ", "");
            }
            else { //threshold
                let biasToggle = document.getElementById("biasToggle");
                fieldName = biasToggle.checked ? "the bias" : "the threshold";
            }
            fields.push(fieldName)
        }
    }

    let logic_operator = "and";
    let hp = new hintprovider([...perceptron.weights].concat(perceptron.threshold), perceptron.inputData, desiredOutputs.data, editableList);
    let subsets = hp.getAllSubsets(editableList);
    // let use_or = true;

    let sols = 0;
    for (let i = 0; i < subsets.length ; i++) {
        let subset = subsets[i];
        let hasSolution = hp.checkForSolution(subset);
        if (!hasSolution.includes(Number.MIN_VALUE) && subset.length === 1) {
            sols++;
        }
    }

    if (sols > 1) {
        logic_operator = "or";
    }

    let fieldText = document.getElementById("hintText");
    // set up the text
    if(fields && fields.length > 0) {
        fieldText.innerHTML = "Adjust "
        if (fields.length === 1) {
            fieldText.innerHTML += fields[0]
        }
        else if (fields.length === 2) {
            fieldText.innerHTML += fields[0] + ` ${logic_operator} ` + fields[1]
        }
        else {
            for (let i = 0; i < fields.length - 1; i++) {
                fieldText.innerHTML += fields[i] + ", "
            }
            fieldText.innerHTML += `${logic_operator} ` + fields[fields.length - 1]
        }
        fieldText.innerHTML += " to solve the problem."
    }
    else {
        fieldText.innerHTML = "";
    }
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

async function clearCommentsUI() {
    let guessTable = document.getElementById("guess-output-table");
    let tableRows = guessTable.rows.length;
    for (let row = 1; row < tableRows; row++) {
        const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${row+1})`)
        let comments = guessOutputRow.querySelectorAll(".guess-comment");
        for( let i = 0; i < comments.length; i++) {
            comments[i].innerText = "";
        }
    }
}
async function uploadZip(zipFile, isProblem = false) {
    // Assume the zip file is stored in a variable called "zipFile" and is a binary string
    try {
        let options = document.getElementById("problem-list").options
        if(!isProblem) {
            if(options.length === problemNum) {
                let option = document.createElement("option");
                option.text = "---";
                options.add(option);
                let index = options.length-1;
                options[index].selected = true;
            }

        }
        else {
            if(options.length === problemNum + 1) {
                options.remove(options.length-1);
            }
        }
        localStorage.clear();
        const zipObj = new JSZip();
        let jsonModelContent = ""
        dictCommentMapping = {};
        await clearCommentsUI();
        await zipObj.loadAsync(zipFile).then(function (zip) {
            // Iterate over each file in the zip
            zip.forEach(function (relativePath, zipEntry) {
                // Get the content of the file
                if (relativePath === "ImageMapping.json") {
                    zipEntry.async('text').then(function (content) {
                        // console.log(content);
                        dictImageMapping = JSON.parse(content);
                    });
                }
                else if (relativePath === "CommentMapping.json") {
                    zipEntry.async('text').then(function (content) {
                        // console.log(content);
                        dictCommentMapping = JSON.parse(content);
                    });
                }
                else if (relativePath.endsWith(".json")) {
                    zipEntry.async('text').then(function (content) {
                        // console.log(content);
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
                        display.createGuessTable();
                        display.checkForSuccess();
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
    document.getElementById('fname').innerText = dict["model-name"];
    document.getElementById("questiontext").innerText = dict["question"];
    document.getElementById("questionprompt").hidden = true;
    document.getElementById("questiontext").hidden = false;

    document.getElementById("biasToggle").checked = false;
    document.getElementById("hintText").innerText = "";


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
        activationTable.insertTableRow(1);
        dataOp.insertDataRow(activations, 0);
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

    let headerRowVals = [];
    display.getHeaderRowVals(headerRowVals);
    demo.selectedInput = headerRowVals;

    display.displayThresholdFromData(perceptron);
    //document.getElementById('InputToggle').checked = dict["input-toggle-checked"];
    document.getElementById('InputToggle').checked = false;
    document.getElementById('OutputToggle').checked = dict["output-toggle-checked"];
    document.getElementById("FanfareToggle").checked = dict["fanfare-toggle-checked"];



    document.getElementById("DisplayToggle").value = dict["guessToggleChecked"] ? '1' : '2';
    let difficultyLevel = 50;
    if (dict["difficultyLevel"]) {
        difficultyLevel = dict["difficultyLevel"];
    }
    document.getElementById("difficulty_slide").value = difficultyLevel;
    document.getElementById("difficulty_level").innerText = "Level: " + difficultyLevel;
    updateProgressBar(difficultyLevel);
    display.UpdateDemoToggle();

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
    let activationCol = document.getElementById("activation-table");
    let outputTableLength = outputCol.rows.length;

    for (let i = 1; i < outputTableLength; i++) {
        //var tr = outputCol.rows[i];
        let output = outputCol.rows[i].cells[OUTPUT_COLUMN];
        let desired = outputCol.rows[i].cells[DESIRED_OUTPUT_COLUMN];
        let activation = activationCol.rows[i].cells[ACTIVATION_COLUMN]

        display.checkDesiredOutput(output, desired, activation);
    }
    display.handleHoverExit();
    display.updateBiasToggle();
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
    if (dict["binaryToggleChecked"] && document.getElementById('InputToggle').checked) {
        thresholdToggle.style.display = 'inline-block';
    } else {
        thresholdToggle.style.display = "none";
    }
    if (dict["threshold-editable"]) {
        thresholdToggle.classList.remove("edit-toggle-on"); //reversed here since we will dispatch a click event
        thresholdToggle.classList.add("edit-toggle-off");
    } else {
        thresholdToggle.classList.remove("edit-toggle-off"); //reversed here since we will dispatch a click event
        thresholdToggle.classList.add("edit-toggle-on");
    }
    thresholdToggle.dispatchEvent(new Event("click"));
    handleDesiredOutputColumn();
   // document.getElementById("DemoToggle").dispatchEvent(new Event("click"));
    document.getElementById("DisplayToggle").dispatchEvent(new Event("change"));
    isLoading = false;
    perceptron.setBiasUI();
    setupQuestionFields();

    prevHintLevel = 0;
    prevHintIndex = -1;
    prevSubset = [];
    checkAnswerCorrect();
    document.getElementById("ShowProgressBarToggle").checked = true
    display.UpdateShowProgressBarToggle();

    // document.getElementById("PlotlyToggle").checked = false;
    document.getElementById("DisplayToggle").value = '2';
    display.UpdatePlotlyToggle();
    // initialize();
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
            display.updateGuessTable();
        }
        catch (e)
        {
            alert("An error occurred: Try uploading a smaller image or convert the image file to a valid type (.bmp, .gif, .jpg, .jpeg, .png, .webp).");
            localStorage.removeItem(file.name);
            delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
        }
    };
    img.onerror = function() {
        alert("This is not a valid image. Valid types are: .bmp, .gif, .jpg, .jpeg, .png, .webp. Apple .HEIC files are not supported.");
        localStorage.removeItem(file.name);
        delete dictImageMapping[JSON.stringify({table_name: currentTable, column: currentColumn, value: currentImageType})];
    };
    img.src = URL.createObjectURL(file);
}


window.onload = function(){
    //console.log("window loaded")
    document.getElementById("difficulty_level").innerText = "Level: " + document.getElementById("difficulty_slide").value;
    $("#input-table tr:first").hide();
    $("#input-table tr td:nth-child(1)").hide();
    $(".dropbtn").click(function(){
        $(".dropdown-content").toggle();
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('.dropdown').length) {
            $(".dropdown-content").hide();
        }
    });

    $('.dropbtn').on('keydown', function (event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            $(".dropdown-content").hide();
        }
    })

    $(".dropdown-content").click(function(event) {
        event.stopPropagation();
    });
}

// initialize all classes
const demo = new Demo();
var checkAnswerButtonLocationInitialized = false;
var currentImageType = "";
var currentImage;
var currentRow = -1;
var currentColumn = -1;
var currentTable = "input-table";
var dictImageMapping = {}
var dictCommentMapping = {}
var isLoading = false;
var checkAnswerButtonPressed = false;
let inputs = new Data(demo.inputData);
let desiredOutputs = new Data(demo.desiredOutput);
const dataOp = new DataOperator();
const inputTable = new Table(inputs, "input-table", true);
let perceptron = new Perceptron(inputs, demo.weights, demo.threshold, null);
perceptron.computeOutputs();
let outputs = new Data(perceptron.outputData);
const outputTable = new Table(outputs, "output-table", false);
let activations = new Data(perceptron.activationData);
const activationTable = new Table(activations, "activation-table", false);
dataOp.createBinaryData(2);
perceptron.displayPerceptron();
const display = new Display();
display.updateDisplay();
//uploadFromUrl("SampleModel.json");
uploadFromZipUrl(encodeURI("problems/Problem 1.sandbox"), true);
display.createOutputTableColors();
display.createInputTableEditBorder();
display.createOutputTableEditBorder();
addThresholdEditOption();
handleDesiredOutputColumn();
loadQuestionsAndModels();
// document.getElementById("DemoToggle").checked = true;
display.UpdateDemoToggle();
document.getElementById("AutoProgressToggle").checked = true;




const problemNum = 18;

let prevHintIndex = -1;
let prevSubset = [];
let prevHintLevel = 0;

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
    tippy('#DemoSwitch', {
        content: 'Solve for output or solve for weight',
        className: 'my-tooltip-class'
    });
    tippy('#OutputSwitch', {
        content: 'Show desired output column',
        className: 'my-tooltip-class'
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addTooltips();
});

$('#InputToggle').change(function() { //toggle edit
    display.UpdateInputToggle();
    display.outputLine.position();
    const show = document.getElementById("InputToggle").checked;
    demo.showWeightToggle(show);
    display.createInputTableEditBorder();
    display.createOutputTableEditBorder();
    display.updateGuessTable();
    display.toggleProblemDisplay();
    display.outputLine.position()
    display.updateBiasToggle()


    let displaySlider = document.getElementById("DisplayToggle");
    if (displaySlider.value === '3') {
        document.getElementById("output-container").style.display = "none";
        document.getElementById("activation-container").style.display = "none";
    }

    for (let i = 0; i < demo.weightLines.length; i++) {
        demo.weightLines[i].position();
    }
    if (demo.biasLine) {
        demo.biasLine.position();
    }
    if (display.outputLine) {
        display.outputLine.position();
    }
});

$('#OutputToggle').change(function() { //toggle output
    display.UpdateOutputToggle();
    display.outputLine.position();
    display.checkForSuccess();
    demo.hasNoSolution();
});

$('#ShowBiasToggle').change(function() { //toggle output
    display.UpdateShowBiasToggle();
});


$('#BinaryToggle').change(function() { //toggle output
    display.UpdateBinaryToggle(false);
    display.outputLine.position();
});

// $('#DemoToggle').change(function() { //toggle output
//     display.UpdateDemoToggle();
// });

$('#DisplayToggle').change(function() {

    display.UpdatePlotlyToggle();
    display.createInputLabelLines();
    if (document.getElementById("DisplayToggle").value !== '3')
        display.UpdateDemoToggle();
})

$('#biasToggle').change(function() { //toggle bias
    display.updateBiasToggle();

    for (let i = 0; i < demo.weightLines.length; i++) {
        demo.weightLines[i].position();
    }
    if (demo.biasLine) {
        demo.biasLine.position();
    }
    display.outputLine.position();

    let displaySlider = document.getElementById("DisplayToggle");
    if (displaySlider.value === '3') {
        document.getElementById("output-container").style.display = "none";
        document.getElementById("activation-container").style.display = "none";
        initialize1d();
    }



});

$('#ShowProgressBarToggle').change(function() { //toggle bias
    display.UpdateShowProgressBarToggle();
});

$('#FanfareToggle').change(function() { //toggle output
    display.UpdateFanfareToggle();
    display.outputLine.position();
    for (let i = 0; i < demo.weightLines.length; i++)
    {
        demo.weightLines[i].position();
    }
    if ($('#DisplayToggle').value === '1') {
        demo.biasLine.position();
    }
});

$('#difficulty_slide').change(function() {
    //document.getElementById("difficulty_level").innerText = "Level: " + document.getElementById("difficulty_slide").value;
    $('#difficulty_level').text("Level: " + $('#difficulty_slide').val());
    updateProgressBar($('#difficulty_slide').val());
});

function showMenu(event, img, col, row, table) {
    if (document.getElementById("InputToggle").checked) {
        currentImage = img;
        currentImageType = img.alt;
        currentColumn = col;
        currentRow = row;
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
        //document.addEventListener('click', handleClickOutsideContextMenu);
        document.addEventListener('mouseout', handleMouseOutsideContextMenu);
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

function handleMouseOutsideContextMenu(e) {
    let myContextMenu = document.getElementById("popup-menu");
    if (!myContextMenu.contains(e.target) && !currentImage.contains(e.target)) {
        myContextMenu.style.display = 'none';
        document.removeEventListener('mouseout', handleMouseOutsideContextMenu);
    }
}

function handleDesiredOutputColumn() {
    let table = document.getElementById('output-table');

    let thirdColumnTds = table.querySelectorAll('tr td:nth-child(3)');

    thirdColumnTds.forEach(function(td) {
        td.onkeydown = handleKeyDown;
    });

    function handleKeyDown(event) {
        if (event.which === 13 || event.keyCode === 13 ) {
            const rawValue = event.target.innerText;
            let [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
            if (parsedValue !== 1 && parsedValue !== 0 ) {
                isValid = false;
            } //00+
            const regex = '^-?0+$';
            if (new RegExp(regex).test(rawValue)) {
                isValid = false;
            }
            const regex1 = '^00+1$';
            if (new RegExp(regex1).test(rawValue)) {
                isValid = false;
            }
            display.highlightInvalidText(event.target, isValid);
        }
    }
}
function FixCheckAnswerButtonPosition() {
    var button = document.getElementById('CheckAnswerBtn');
    var referenceSwitch = document.getElementById('label-reference');

    // Get the initial position of the button relative to the document
    var buttonRect = button.getBoundingClientRect();
    var initialLeft = buttonRect.left;
    var initialTop = buttonRect.top;

    // // Set the initial position of the button
    // button.style.position = 'relative';
    // button.style.left = initialLeft + 'px';
    // button.style.top = initialTop + 'px';

    // Get the updated position of the button relative to the viewport
    var updatedButtonRect = referenceSwitch.getBoundingClientRect();
    var updatedLeft = updatedButtonRect.left;
    var updatedTop = updatedButtonRect.top;

    // Calculate the screen coordinates by adding the scroll offsets
    var screenLeft = updatedLeft + window.pageXOffset;
    var screenTop = updatedTop + window.pageYOffset;

    // Set the button's position to fixed
    button.style.position = 'fixed';
    let biasToggleDisplay = document.getElementById("bias-toggle")?.style.display;
    if(biasToggleDisplay !== "none" && biasToggleDisplay !== "") {
        button.style.left = screenLeft + 400 + 'px';
    }
    else {
        button.style.left = screenLeft + 200 + 'px';
    }

    button.style.top = screenTop - 10 + 'px';
    button.style.marginTop = "10px";


}

function updateProgressBar(value) {
    var progressBar = document.querySelector('.progress-bar');
    var progressBarFill = progressBar.querySelector('.progress-bar-fill');
    var progressBarText = progressBar.querySelector('.progress-bar-text');
    progressBarFill.style.width = value + '%';
    progressBarText.textContent = value;
}