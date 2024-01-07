
function saveDesiredValues() {
    desired_values = []
    const outputTable = document.getElementById("output-table");
    for(i = 1; i < outputTable.rows.length; i++) {
        desired_values.push(outputTable.rows[i].cells[DESIRED_OUTPUT_COLUMN].innerText);
    }
    return desired_values
}

function restoreDesiredValues( desired_values)
{
    const outputTable = document.getElementById("output-table");
    for(i = 1; i < outputTable.rows.length; i++) {
        outputTable.rows[i].cells[DESIRED_OUTPUT_COLUMN].innerText = desired_values[i-1];
    }

    let activationCol = document.getElementById("activation-table");
    let outputTableLength = outputTable.rows.length;

    for (let i = 1; i < outputTableLength; i++) {
        //var tr = outputCol.rows[i];
        let output = outputTable.rows[i].cells[OUTPUT_COLUMN];
        let desired = outputTable.rows[i].cells[DESIRED_OUTPUT_COLUMN];
        let activation = activationCol.rows[i].cells[ACTIVATION_COLUMN]

        display.checkDesiredOutput(output, desired, activation);
    }
}

function setupGenerateTruthTable(columnChanged) {
    vars = []
    // document.getElementById('generateTruthTable').addEventListener('click', ()=>{
    //save desired value before update
    let desire_values = saveDesiredValues();
    var truthData = dataOp.createBinaryData(inputTable.numCols);
    demo.removeAllInputDataRows(false);
    writeTruthTable(truthData);
    if(!columnChanged) {
        restoreDesiredValues(desire_values);
    }

    //restore desired value
    // });
}

function writeTruthTable(truthData) {
    for (let r = 0, n = 2**(inputTable.table.rows[1].cells.length-1); r < n; r++) {
        inputTable.insertTableRow(2, false);
        dataOp.insertDataRow(inputs, 0);
        outputTable.insertTableRow(1);
        activationTable.insertTableRow(1);
        dataOp.insertDataRow(outputs, 0);
    }

    for (let r = 2, n = inputTable.table.rows.length; r < n; r++) {
        for (let c = 1, m = inputTable.table.rows[r].cells.length; c < m; c++) {
            const cell = inputTable.table.rows[r].cells[c];
            //cell.innerHTML = Object.values(truthData[r - 2])[(c-1)].toString();
            cell.innerHTML = `<span>`+truthData[r-2][c-1]+'</span>';

        }
    }

    demo.update();
    checkAnswerCorrect();
}