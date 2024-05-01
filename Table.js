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
    createRowButtons(all=true, r=null){
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
    createColumnButtons(all=true, columnNum=null){
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
                style += '; animation-delay: 0.1s;'
                $(this).attr('style',style);
            }
            else
                $(this).css('animation-delay',0.1 +'s');
            $(this).classList?.remove("animation");
        });
        display.createInputTableEditBorder()
        display.createOutputTableEditBorder();
    }

    //finds available indices for es
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
        let newNameIndex = tuple[0];
        //make the variable label to match with weight label
        if (newCol < 0 || newNameIndex < 0)
            return;
        let th = document.createElement('th'); //column
        th.innerHTML = "<div lang=\"en\" class=\"input-content\">" + "x<sub>" + newNameIndex + "</sub>" + "</div>";
        th.setAttribute("id", `tblinput${newCol}`);
        dataOp.makeEditable(th, makeEditable);

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
                style += '; animation-delay: 0.1s;'
                $(this).attr('style',style);
            }
            else
                $(this).css('animation-delay',0.1+'s');
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
            }


            cells[columnNum].style.display = visible? "table-cell" : "none";

            let desiredOutput = document.getElementById("desired");
            desiredOutput.contentEditable = false;
            if (desiredOutput.classList.contains("edit-handler"))
                desiredOutput.classList.remove("edit-handler");
        }
    }
}