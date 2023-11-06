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
        if(dataObj.data.length !== table.rows.length)
        {
            for (let i = 0; i < table.rows.length; i++) {
                dataObj.data[i] = Array(table.rows[0].cells.length).fill(0);
            }
        }
        for (let n = table.rows.length; row < n; row++) {
            for (let c = startCol, m = table.rows[row].cells.length; c < m; c++) {
                const cell = table.rows[row].cells[c];
                const rawValue = cell.innerText;
                let [parsedValue, isValid] = demo.stringToValidFloat(rawValue);
                if (table.id === 'output-table' && c === DESIRED_OUTPUT_COLUMN && (parsedValue !== 1 && parsedValue !== 0) ) {
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
                if (table.id === 'output-table' && c === DESIRED_OUTPUT_COLUMN && (parsedValue !== 1 && parsedValue !== 0) ) {
                    isValid = false;
                }
                const regex = '^-?0+$';
                if (new RegExp(regex).test(rawValue)) {
                    isValid = false;
                }
                const regex1 = '^00+1$';
                if (new RegExp(regex1).test(rawValue)) {
                    isValid = false;
                }
                if(!isValid) {
                    if(parsedValue > 0)
                        parsedValue = 1
                    else
                        parsedValue = 0
                }
                display.highlightInvalidText(cell, isValid);
                dataObj.data[row-start][c-startCol] = parsedValue;
            }
        }
        display.createOutputTableColors()
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
    }

    updateTableFromDesired(desiredOutput, tableObj){ //TODO: make more efficient by passing specific location to update
        let table = tableObj.table;
        // skip header row and button column of table, start from 1
        let start = 1;
        //let row = start;
        for (let row = start; row < table.rows.length; row++) {
            const cell = table.rows[row].cells[DESIRED_OUTPUT_COLUMN];
            cell.innerText = desiredOutput.data[row-1];
        }
    }

    // make editable and update demo on edit
    makeEditable(textbox, editable = true, setFocusoutHandler = true){
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
            if(setFocusoutHandler) {
                textbox.addEventListener("focusout", function (event) {
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
            }
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
        textbox.onkeydown = function(event){
            if (event.which === 13 || event.which === 27 || event.keyCode === 13 || event.keyCode === 27) {
                event.target.blur(); // focus out of text box
                demo.update(this);
            }
        };

    }

    setFocusoutEventListener(textbox) {
        if(textbox && !textbox.classList.contains("focus-listener-installed"))
        {
            textbox.classList.add("focus-listener-installed");
            textbox.addEventListener("focusout", function (event) {
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
        }
    }
}
