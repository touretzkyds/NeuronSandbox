function setupGenerateTruthTable() {
    vars = []
    // document.getElementById('generateTruthTable').addEventListener('click', ()=>{
        var truthData = dataOp.createBinaryData(inputTable.numCols);
        demo.removeAllInputDataRows(false);
        writeTruthTable(truthData);
    // });
}

function writeTruthTable(truthData) {
    for (let r = 0, n = 2**(inputTable.table.rows[1].cells.length-1); r < n; r++) {
        inputTable.insertTableRow(2, false);
        dataOp.insertDataRow(inputs, 0);
        outputTable.insertTableRow(1);
        dataOp.insertDataRow(outputs, 0);
    }

    for (let r = 2, n = inputTable.table.rows.length; r < n; r++) {
        for (let c = 1, m = inputTable.table.rows[r].cells.length; c < m; c++) {
            const cell = inputTable.table.rows[r].cells[c];
            //cell.innerHTML = Object.values(truthData[r - 2])[(c-1)].toString();
            cell.innerHTML = truthData[r-2][c-1];

        }
    }

    demo.update();
}