class Display {
    constructor(inpObj=null, percepObj=null, outObj=null){
        this.hovering = false;
        this.initializeDisplay();
        this.recreateOutputLine();
        this.createOutputTableColors();
        this.createInputTableEditBorder();
        this.createOutputTableEditBorder();
    }

    recreateOutputLine() {
        if(this.outputLine) {
            this.outputLine.remove()
            this.outputLine = null;
        }
        this.outputLine = new LeaderLine(
            LeaderLine.pointAnchor(document.getElementById("circle"), {x: '99%', y: '53%'}),
            LeaderLine.pointAnchor(document.getElementById("seloutput"), {x: '-50%', y: 52+'%'})
        );

        this.outputLine.color = DEFAULT_LINE_COLOR;
        this.outputLine.path = 'straight';
        this.outputLine.position();
    }
    alignTables() {
        let heights = []

        const headerCells = document.getElementById("input-table").rows[1].cells;
        const headerCellsHeight = getComputedStyle(headerCells[1]).height;

        const outputHeaderCells = document.getElementById("output-table").rows[0].cells;
        const outputHeaderCellsHeight = getComputedStyle(outputHeaderCells[0]).height;

        const guessOutputHeaderCells = document.getElementById("guess-output-table").rows[0].cells;
        const guessOutputHeaderCellsHeight = getComputedStyle(guessOutputHeaderCells[0]).height;

        const activationHeaderCells = document.getElementById("activation-table").rows[0].cells;
        const activationHeaderCellsHeight = getComputedStyle(activationHeaderCells[0]).height;

        heights.push(headerCellsHeight);
        heights.push(outputHeaderCellsHeight);
        heights.push(guessOutputHeaderCellsHeight);
        heights.push(activationHeaderCellsHeight);

        let maxHeight = 0;
        for (let i = 0; i < heights.length; i++) {
            let height = parseFloat(heights[i].replace("px", ""))
            if (height > maxHeight)
                maxHeight = height;
        }

        headerCells[1].style.height = maxHeight + 'px';
        outputHeaderCells[0].style.height = maxHeight + 'px';
        guessOutputHeaderCells[0].style.height = maxHeight + 'px';
        activationHeaderCells[0].style.height = maxHeight + 'px';
    }

    updateTableOutputColumn() {
        let outputTable = document.getElementById("output-table");
        let outputColumn = outputTable.rows[0].cells[OUTPUT_COLUMN];

        let biasToggle = document.getElementById("biasToggle");
        let sigma = 0;
        if (!biasToggle.checked) {
            sigma = parseFloat(document.getElementById("th1").innerText);
        }
        else {
            //sigma = parseFloat(document.getElementById("bias-text").innerText) * -1;
            sigma = 0;
        }
        outputColumn.innerHTML = `Current Output<br>&Sigma; > ` + sigma.toString();
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
        const activationTable = document.getElementById("activation-table");
        let n = outputTable.rows.length;
        for (let i = 1; i < n; i++) {
            let tr = outputTable.rows[i];
            let tr_activation = activationTable.rows[i];
            let td1 = tr_activation.cells[ACTIVATION_COLUMN];
            let td2 = tr.cells[OUTPUT_COLUMN];
            td1.style.fontWeight = 'normal';

            td2.style.fontWeight = 'bold';
            // if (td2.style.background !== ERROR_COLOR) //error
            //     td2.style.background = ERROR_COLOR
            // td2.style.background = 'none'
        }
    }

    createGuessOutputTableColors() {
        const guessOutputTable = document.getElementById("guess-output-table");
        let n = guessOutputTable.rows.length;
        for (let i = 1; i < n; i++) {
            const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${i+1})`)
            const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${i+1})`)
            let desired = outputRow.children[DESIRED_OUTPUT_COLUMN].innerText;
            var radioButtonGroup = document.getElementsByName(`guess-radio-${i-1}`);
            let guessed;
            for (let j = 0; j < radioButtonGroup.length; j++) {
                if (radioButtonGroup[j].checked) {
                    guessed = radioButtonGroup[j].value;
                    break;
                }
            }

            this.updateGuessTableCommentRow(i);
            if(desired !== guessed) {
                guessOutputRow.style.background = ERROR_COLOR;
            }
            else {
                guessOutputRow.style.background = '';
            }
        }
    }

    removeGuessTableColors() {
        const guessOutputTable = document.getElementById("guess-output-table");
        let n = guessOutputTable.rows.length;
        for (let i = 1; i < n; i++) {
            const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${i+1})`)
            guessOutputRow.style.background = '';
        }
        if(document.getElementById("InputToggle").checked) {
            return;
        }
        const comments = document.querySelectorAll('.guess-comment');
        comments.forEach((comment) => {
            comment.style.display = "none";
        });
    }

    createOutputTableEditBorder() {
        const outputTable = document.getElementById("output-table")
        let binaryCheckbox = document.getElementById("BinaryToggle");
        let editCheckbox = document.getElementById("InputToggle");
        let nonBinaryMode = false;
        if (!binaryCheckbox.checked)
            nonBinaryMode = true
        let n = outputTable.rows.length;
        for (let i = 1; i < n; i++) {
            let tr = outputTable.rows[i];
            for (let j = OUTPUT_COLUMN; j < tr.cells.length; j++) {
                let textbox = tr.cells[j]
                if (textbox.children.length === 0) {
                    textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                }
                if(j === DESIRED_OUTPUT_COLUMN) { //desired output
                    textbox.children[0].classList.add("editable-border")
                    dataOp.makeEditable(textbox.firstChild, editCheckbox.checked)
                }

                while (textbox.children.length > 1) {
                    textbox.removeChild(textbox.children[1]);
                }
                //textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                if (true) {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.remove("editable-border")
                    if(j === DESIRED_OUTPUT_COLUMN)
                    {
                        dataOp.makeEditable(textbox.firstChild, editCheckbox.checked)
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
                                img.src = "media/1_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "media/1_image.svg";
                        }
                    }
                    else {
                        img.alt = "0_Image";
                        const imageKey = JSON.stringify({table_name: 'output-table', column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "media/0_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "media/0_image.svg";
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
        if (editCheckbox.checked) {
            setImageEditOptions();
        }
        else  {
            hideCameraImages();
        }
    }

    updateHintButton() {
        const hintButton = document.getElementById("hintButton");
        // hintButton.style.display = !document.getElementById("DemoToggle").checked? "inline-block" : "none";
        hintButton.style.display = !(document.getElementById("DisplayToggle").value === '1') ? "inline-block" : "none";
    }

    createInputTableEditBorder() {
        const inputTable = document.getElementById("input-table")

        let binaryCheckbox = document.getElementById("BinaryToggle");
        let editCheckbox = document.getElementById("InputToggle");
        let editable = false
        if (!binaryCheckbox.checked )
            editable = true
        let n = inputTable.rows.length;
        for (let i = 2; i < n; i++) {
            let tr = inputTable.rows[i];
            for (let j = 1; j < tr.cells.length; j++) {
                let textbox = tr.cells[j];

                if (editable) {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`;
                    }
                    textbox.children[0].classList.add("editable-border");
                    dataOp.makeEditable(textbox.firstChild, true, false);
                    while (textbox.children.length > 1) {
                        textbox.removeChild(textbox.children[1]);
                    }

                }
                else {
                    if (textbox.children.length === 0) {
                        textbox.innerHTML = `<span>` + textbox.innerHTML + `</span>`
                    }
                    textbox.children[0].classList.remove("editable-border")
                    dataOp.makeEditable(textbox.firstChild, false, false)
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
                                img.src = "media/1_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "media/1_image.svg";
                        }


                    }
                    else {
                        img.alt = "0_Image";
                        const imageKey = JSON.stringify({table_name: "input-table", column: j, value: img.alt});
                        if (imageKey in dictImageMapping) {
                            let image_src = localStorage.getItem(dictImageMapping[imageKey]);
                            if (image_src === null) {
                                img.src = "media/0_image.svg";
                            }
                            else {
                                img.src = image_src;
                            }
                        }
                        else {
                            img.src = "media/0_image.svg";
                        }
                    }
                    img.width = 48;
                    img.height = 48;
                    img.classList.add("myimage");
                    if (document.getElementById("InputToggle").checked && (document.getElementById("DisplayToggle").value === '0')) {
                        img.classList.add("editable-border")
                    }
                    else {
                        if (img.classList.contains("editable-border"))
                            img.classList.remove("editable-border")
                    }
                    if(!(document.getElementById("DisplayToggle").value === '1' && (img.src.endsWith("media/0_image.svg") ||img.src.endsWith("media/1_image.svg")))) {
                        textbox.appendChild(img);
                    }
                }
                dataOp.setFocusoutEventListener(textbox);
            }
        }
        if (!editable && editCheckbox.checked) {
            setImageEditOptions();
        }
        else {
            hideCameraImages();
        }
    }


    getCommentControl(row) {
        let label = document.createElement("span");
        label.classList.add("guess-comment");
        label.style.display = "none";
        label.addEventListener("focus", function() {
            if (label.textContent === "Text") {
                label.textContent = "";
                label.style.color = "rgba(0, 0, 0)";
            }
        });

        label.addEventListener("blur", function() {
            if (label.textContent === "") {
                label.textContent = "Text";
                label.style.color = "rgba(0, 0, 0, 0.5)";
            }
        });
        const imageKey = JSON.stringify({table_name: 'guess-output-table', row: row});
        if (imageKey in dictCommentMapping) {
            let htmlText = dictCommentMapping[imageKey].replace(/\n/g, '<br>');
            label.innerHTML = htmlText;
        }
        else {
            let labelText = document.createTextNode("");
            label.appendChild(labelText);
        }

        return label;
    }

    getOutputImageHtml(value) {
        const img = document.createElement("img");
        if(value === 1) {
            img.alt = "1_Image";
            img.src = "media/1_image.svg";
            img.style.visibility = "hidden";

            img.width = 48;
            img.height = 48;
            img.classList.add("myimage");
            return img.outerHTML;
        }
        else if( value === 0) {
            img.alt = "0_Image";
            const imageKey = JSON.stringify({table_name: 'output-table', column: 2, value: img.alt});
            img.src = "media/0_image.svg";
            img.style.visibility = "hidden";
            img.width = 48;
            img.height = 48;
            img.classList.add("myimage");
        }
        return img.outerHTML;
    }

    updateGuessTableImageRow(row) {
        let guessTable = document.getElementById("guess-output-table");
        var cell = guessTable.rows[row].cells[0];
        let radioButtonGroup = document.getElementsByName(`guess-radio-${row-1}`);
        //get the selected value and show the corresponding image if available
        let guessed;
        for (let j = 0; j < radioButtonGroup.length; j++) {
            if (radioButtonGroup[j].checked) {
                guessed = radioButtonGroup[j].value;
                break;
            }
        }
        if(guessed !== undefined) {
            guessed = Number(guessed);

            let images = cell.querySelectorAll(".myimage");
            for( let i = 0; i < images.length; i++) {
                if( i === guessed) {
                    const imageKey = JSON.stringify({table_name: 'output-table', column: DESIRED_OUTPUT_COLUMN, value: ""+i + "_Image"});
                    if (imageKey in dictImageMapping) {
                        images[i].src = localStorage.getItem(dictImageMapping[imageKey]);
                        images[i].style.visibility = "visible";
                    }
                    else {
                        images[i].style.visibility = "hidden";
                    }
                }
                else {
                    images[i].style.visibility = "hidden";
                }
            }
        }
    }

    updateGuessTableCommentRow(row) {
        let guessTable = document.getElementById("guess-output-table");
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${row+1})`)
        const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${row+1})`)
        let editCheckbox = document.getElementById("InputToggle");
        if(editCheckbox.checked) {
            let comments = guessOutputRow.querySelectorAll(".guess-comment");
            for( let i = 0; i < comments.length; i++) {
                comments[i].style.display = "inline-block";
                comments[i].contentEditable = true;
                if (!comments[i].classList.contains("edit-handler"))
                    comments[i].classList.add("edit-handler");
                if (!comments[i].classList.contains("comment-editable-border"))
                    comments[i].classList.add("comment-editable-border");
            }
            return;
        }
        //non-edit mode, we will display the comment for the wrong answer, in read only mode
        if(!outputRow)
            return;
        let desired = outputRow.children[DESIRED_OUTPUT_COLUMN].innerText;

        var cell = guessTable.rows[row].cells[0];
        let radioButtonGroup = document.getElementsByName(`guess-radio-${row-1}`);
        //get the selected value and show the corresponding image if available
        let guessed;
        for (let j = 0; j < radioButtonGroup.length; j++) {
            if (radioButtonGroup[j].checked) {
                guessed = radioButtonGroup[j].value;
                break;
            }
        }
        if(guessed != desired ) {
            let comments = guessOutputRow.querySelectorAll(".guess-comment");
            for( let i = 0; i < comments.length; i++) {
                comments[i].style.display = "inline-block";
                comments[i].contentEditable = false;
                if (comments[i].classList.contains("edit-handler"))
                    comments[i].classList.remove("edit-handler");
                if (comments[i].classList.contains("comment-editable-border"))
                    comments[i].classList.remove("comment-editable-border");
            }
        }
        if(!checkAnswerButtonPressed) {
            let comments = guessOutputRow.querySelectorAll(".guess-comment");
            for( let i = 0; i < comments.length; i++) {
                comments[i].style.display = "none";
            }
        }
    }

    updateGuessTable() {
        let guessTable = document.getElementById("guess-output-table");
        let tableRows = guessTable.rows.length;
        for (let row = 1; row < tableRows; row++) {
            this.updateGuessTableCommentRow(row);
        }
    }

    saveGuessComment() {
        dictCommentMapping = {};
        let guessTable = document.getElementById("guess-output-table");
        let tableRows = guessTable.rows.length;
        for (let row = 1; row < tableRows; row++) {

            const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${row+1})`)
            let comments = guessOutputRow.querySelectorAll(".guess-comment");
            for( let i = 0; i < comments.length; i++) {
                dictCommentMapping[JSON.stringify({table_name: "guess-output-table", row: row})] = comments[i].innerText;
            }
        }
    }
    createGuessTable() {
        let outputTable = document.getElementById("output-table")
        let guessTable = document.getElementById("guess-output-table");
        guessTable.innerHTML = ' <tr>\n' +
            '                                    <th id="guessoutput" class="edit-handler input-table-th">Predicted Output<br>(0=No, 1=Yes)</th>\n' +
            '                                    <th id="guesscomment" class="edit-handler input-table-th">Hint</th>\n' +
            '                                </tr>';
        let tableRows = outputTable.rows.length
        for (let i = 0; i < tableRows - 1; i++) {
            let newRow = guessTable.insertRow(i+1);
            let cell = guessTable.rows[i+1].insertCell(-1);
            cell.innerHTML = '<div className="radio-buttons"> ' + this.getOutputImageHtml(0) +
                '<label class="radio-button">\n' +
                `    <input type="radio" name="guess-radio-${i}" value="0" onclick="display.updateGuessTableImageRow(${i + 1})">\n` +
                '    0\n' +
                '  </label>\n' +
                '  <label class="radio-button">\n' +
                `    <input type="radio" name="guess-radio-${i}" value="1" onclick="display.updateGuessTableImageRow(${i + 1})">\n` +
                '    1\n' +
                '  </label>\n' +
                this.getOutputImageHtml(1) +
                '</div>'
            ;

            let commentCell = guessTable.rows[i+1].insertCell(-1);
            commentCell.append(this.getCommentControl(i + 1));
        }

        for (let row = 1; row < tableRows; row++) {
            this.updateGuessTableCommentRow(row);
        }
    }

    checkGuessResult() {
        let isCorrect = checkAnswerCorrect();
        if(isCorrect) {
            PlayDingSound();
            if(!document.getElementById("guess-popup").classList.contains("active")) {
                document.getElementById("guess-popup").classList.toggle('active');
            }
        }
        else {
            PlayBuzzSound();
            checkAnswerButtonPressed = true;
            display.createGuessOutputTableColors();
        }
    }

    removeGuessHighlight() {
        checkAnswerButtonPressed = false;
        display.removeGuessTableColors();
    }

    getCellInfo(cell, tableName) {
        let table = document.getElementById(tableName);
        for (let r = 0; r < table.rows.length; r++) {
            for (let c = 0; c < table.rows[r].cells.length; c++) {
                if (table.rows[r].cells[c] === cell) {
                    return {row:r, col: c};
                }
            }
        }
        return null;
    }

    checkForSuccess() {
        let isCorrect = checkAnswerCorrect();
        let autoProgressChecked = document.getElementById("AutoProgressToggle").checked;
        let fanfareHidden =  document.getElementById("congrats-msg").hidden
        let outputToggleChecked = document.getElementById("OutputToggle").checked
        if (outputToggleChecked) {
            if (fanfareHidden) {
                if (isCorrect) {
                    PlayHooraySound();
                    if (!document.getElementById("popup").classList.contains("active"))
                        document.getElementById("popup").classList.toggle('active');

                    const questionDropDown = document.getElementById("problem-list");
                    const selectedIndex = questionDropDown.selectedIndex;
                    const nextIndex = selectedIndex + 1;
                    let button = document.getElementById("next-question-btn");
                    button.style.display = (nextIndex < questionDropDown.options.length - 1) && autoProgressChecked ? "inline-block" : "none";
                    //document.getElementById("congrats-msg").hidden = false;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++) {
                        demo.weightLines[i].position();
                    }
                    if (demo.biasLine) {
                        demo.biasLine.position();
                    }
                }
                else {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++) {
                        demo.weightLines[i].position();
                    }
                    if (demo.biasLine) {
                        demo.biasLine.position();
                    }
                }

            }
            else { //congrats not hidden, but could have possibly made incorrect
                if (!isCorrect) {
                    document.getElementById("congrats-msg").hidden = true;
                    display.outputLine.position()
                    for (let i = 0; i < demo.weightLines.length; i++) {
                        demo.weightLines[i].position();
                    }
                    if (demo.biasLine) {
                        demo.biasLine.position();
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
        });
        this.displayThresholdFromData(perceptron);
        this.updateSelectedInput();
        this.displaySelectedOutput();
        // edit buttons hover functionality
        this.initializeButtonHover(inputTable);
        $( ".draggable" ).draggable();

    }

    createInputLabelLines() {
        //input table and input text
        let inputTable = document.getElementById("input-table");
        let inputText = document.getElementById("input-text");

        //output table and output text
        let outputTable = document.getElementById("output-table");
        let activationTable = document.getElementById("activation-table");
        let outputText = document.getElementById("output-text");

        let outputHeaderContainer = document.getElementById("output-header-container");

        //compute width for input table
        let widthInputTable = getComputedStyle(inputTable).width
        widthInputTable = parseInt(widthInputTable.substring(0, widthInputTable.length -2))
        let widthInputText = getComputedStyle(inputText).width
        widthInputText = parseInt(widthInputText.substring(0, widthInputText.length -2))

        //compute width for entire output/activation width + output text
        let rightOutputTable = outputTable.getBoundingClientRect().right
        let leftActivTable =  activationTable.getBoundingClientRect().left
        let widthOutputText = getComputedStyle(outputText).width
        widthOutputText = parseInt(widthOutputText.substring(0, widthOutputText.length -2))

        let inputLineWidth = (widthInputTable - widthInputText)/2

        let outputTotalWidth = rightOutputTable - leftActivTable
        let outputLineWidth = (outputTotalWidth - widthOutputText)/2

        outputHeaderContainer.style.width = (rightOutputTable - leftActivTable) + 'px';

        // let plotlySlider = document.getElementById("PlotlyToggle");
        let displaySlider = document.getElementById("DisplayToggle");
        if (displaySlider.value === "3") {
            let plotlyDisplay = document.getElementById('plotly-container');
            rightOutputTable = plotlyDisplay.getBoundingClientRect().right + 90;
            leftActivTable =  plotlyDisplay.getBoundingClientRect().left;
            widthOutputText = getComputedStyle(outputText).width;
            widthOutputText = parseInt(widthOutputText.substring(0, widthOutputText.length -2));


            outputTotalWidth = rightOutputTable - leftActivTable;
            outputLineWidth = (outputTotalWidth - widthOutputText)/2;

            outputHeaderContainer.style.width = (rightOutputTable - leftActivTable) + 'px';
            outputHeaderContainer.style.marginRight = '20px';
        }

        //INPUT LINES
        let inputLine1 = document.getElementById("line1")
        let inputLine2 = document.getElementById("line2")

        inputLine1.innerText = ""
        let line1Width = getComputedStyle(inputLine1).width
        line1Width = parseInt(line1Width.substring(0, line1Width.length - 2))

        while (line1Width < inputLineWidth - 20) {
            inputLine1.innerText += "━"
            line1Width = getComputedStyle(inputLine1).width
            line1Width = parseInt(line1Width.substring(0, line1Width.length - 2))
        }

        inputLine2.innerText = ""
        let line2Width = getComputedStyle(inputLine2).width
        line2Width = parseInt(line2Width.substring(0, line2Width.length - 2))
        while (line2Width < inputLineWidth - 20) {
            inputLine2.innerText += "━"
            line2Width = getComputedStyle(inputLine2).width
            line2Width = parseInt(line2Width.substring(0, line2Width.length - 2))
        }

        //OUTPUT LINES
        let outputLine1 = document.getElementById("line1o");
        let outputLine2 = document.getElementById("line2o");

        outputLine1.innerText = "";
        let oline1Width = getComputedStyle(outputLine1).width;
        oline1Width = parseInt(oline1Width.substring(0, oline1Width.length - 2));

        const repeatNum = Math.floor((outputLineWidth - oline1Width - 20)/15);
        if (repeatNum > 0) {
            outputLine1.innerText = "━".repeat(repeatNum);
        }


        outputLine2.innerText = "";
        let oline2Width = getComputedStyle(outputLine2).width;
        oline2Width = parseInt(oline2Width.substring(0, oline2Width.length - 2));

        const repeatNum2 = Math.floor((outputLineWidth - oline2Width - 20)/15);
        if (repeatNum2 > 0) {
            outputLine2.innerText = "━".repeat(repeatNum2);
        }
    }

    adjustSelectedInputFontSize() {
        let maxLength = 0;
        let maxHeaderIndex = 0;

        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            let headerInput = headerCells[c];
            if (headerInput.id.startsWith("tblinput")) {
                let length = headerInput.innerText.length

                if (length > maxLength) {
                    maxLength = length;
                    maxHeaderIndex = c;
                }
            }
        }

        let newFontSize = 0;
        if (maxLength <= 10) {
            newFontSize = 40;
        }
        else {
            newFontSize = 40 - (maxLength-10);
            if (newFontSize < 20)
                newFontSize = 20;
        }

        const selections = document.getElementById("selected-inputs");

        for (let c = 1; c < headerCells.length; c++) {
            if (!document.getElementById("biasToggle").checked) {
                if(selections.rows[c-1] && selections.rows[c-1].cells[0] )
                    selections.rows[c-1].cells[0].style.fontSize = newFontSize + "px"
            }
            else {
                if(selections.rows[c] && selections.rows[c].cells[0] )
                    selections.rows[c].cells[0].style.fontSize = newFontSize + "px"
            }
        }

        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }
        if (demo.biasLine) {
            demo.biasLine.position();
        }
    }
    displayWeightFromData(wID, idx){
        let weight = document.getElementById(wID);
        if (!weight) {
            let wDiv = document.createElement('div');
            wDiv.id = `weight-${idx+1}`;
            wDiv.innerHTML = `<text fill="black" class="weight-edit-text weights">w<sub>${idx+1}</sub> =</text> <text contenteditable="true" onkeypress="if (event.which === 13 || event.keyCode === 13) return false;" id="w${idx+1}" fill="black" class="weights"></text>`;
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
        if(document.getElementById("DisplayToggle").value === '1')
            return;
        let selections = document.getElementById("selected-inputs");
        selections.innerHTML = "";
        for (let i = 0; i < demo.selectedInput.length; i++) {
            let newRow = selections.insertRow(i);
            let newCell = newRow.insertCell(0);
            //newCell.innerHTML = `<div class=\"input-content\">${demo.selectedInput[i]}</div>`;
            newCell.innerHTML = `<div lang=\"en\" class=\"input-content\">${demo.selectedInput[i]}</div>`;
        }
        if(document.getElementById("biasToggle").checked) {
            let newRow = selections.insertRow(0);
            let newCell = newRow.insertCell(0);

            let bias_value = 1;
            if(typeof demo.selectedInput[0] === "string")
            {
                bias_value = "";
            }
            newCell.innerHTML = `<div class=\"bias-content\"><span style=\"color: black; margin-right: 25%\">Bias</span><img src="media/ground.png" height="33px" style="transform: rotate(-90deg); margin-top: 25%; margin-right: 10%" ></div>`;
        }
        //removes lines when not hovered
        demo.weightLines.forEach(line => line.remove());
        //empties lines array
        demo.weightLines = []

        const length = document.getElementById("biasToggle").checked ? demo.selectedInput.length + 1 : demo.selectedInput.length

        const circle = document.getElementById("circle");

        const minLineSize = 0.0
        const maxLineSize = 6.0
        const newMinLineSize = 2.0
        const newMaxLineSize = 10.0

        let weight_labels = document.getElementById("input-link-text").children;

        let height = circle.getBoundingClientRect().height
        let width = circle.getBoundingClientRect().width
        let left = circle.getBoundingClientRect().left;
        let top = circle.getBoundingClientRect().top;
        let centerX = left + width/2;
        let centerY = top +  height/2;

        if(document.getElementById('biasToggle').checked) {
            let biasContent = document.querySelector(".bias-content")

            let x = biasContent.getBoundingClientRect().left +  biasContent.offsetWidth
            let y = biasContent.getBoundingClientRect().top + biasContent.offsetHeight/2

            let lengthLine = Math.sqrt((centerX-x)*(centerX-x) + (centerY-y)*(centerY-y))
            let lengthSubLine = lengthLine - width/2
            let ratio = lengthSubLine / lengthLine
            let xPoint = x + ratio * (centerX - x)
            let yPoint = y + ratio * (centerY - y)

            let minX = left
            let maxX = centerX
            let minY = top
            let maxY = top + height

            let rangeMinX = 0
            let rangeMaxX = 50
            let rangeMinY = 0
            let rangeMaxY = 100
            // range should be 0 - 50 (in percent), we want to scale that so that xPoint and yPoint fit in that
            let percentX = ((xPoint - minX) / (maxX - minX)) * (rangeMaxX - rangeMinX) + rangeMinX
            let percentY = ((yPoint - minY) / (maxY - minY)) * (rangeMaxY - rangeMinY) + rangeMinY
            if(demo.biasLine) {
                demo.biasLine.remove()
                demo.biasLine = null;
            }
            demo.biasLine = new LeaderLine(
                LeaderLine.pointAnchor(document.querySelector(".bias-content"), {x: '96%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("circle"), {
                    x: percentX + '%',
                    y: percentY + '%'
                })
            );
            demo.biasLine.path = "straight";
            let biasValue = parseFloat(document.getElementById("bias-text").innerText)
            if (biasValue === 0)
                demo.biasLine.color = ZERO_WEIGHT;
            else if (biasValue > 0)
                demo.biasLine.color = DEFAULT_LINE_COLOR;
            else
                demo.biasLine.color = NEGATIVE_WEIGHT;
        }
        else {
            if (demo.biasLine) {
                demo.biasLine.remove()
                demo.biasLine = null;
            }
        }

        for (let i = 0; i < demo.selectedInput.length; i++) {

            let real_i = i;
            if(document.getElementById('biasToggle').checked) {
                real_i += 1;
            }

            //TODO: take into account 110% offset
            let x = selections.rows[real_i].getBoundingClientRect().right
            let y = selections.rows[real_i].getBoundingClientRect().top + selections.rows[real_i].offsetHeight/2

            let lengthLine = Math.sqrt((centerX-x)*(centerX-x) + (centerY-y)*(centerY-y))
            let lengthSubLine = lengthLine - width/2
            let ratio = lengthSubLine / lengthLine
            let xPoint = x + ratio * (centerX - x)
            let yPoint = y + ratio * (centerY - y)

            let minX = left
            let maxX = centerX
            let minY = top
            let maxY = top + height

            let rangeMinX = 0
            let rangeMaxX = 50
            let rangeMinY = 0
            let rangeMaxY = 100
            // range should be 0 - 50 (in percent), we want to scale that so that xPoint and yPoint fit in that
            let percentX = ((xPoint - minX) / (maxX - minX)) * (rangeMaxX - rangeMinX) + rangeMinX
            let percentY = ((yPoint - minY) / (maxY - minY)) * (rangeMaxY - rangeMinY) + rangeMinY

            demo.weightLines[i] = new LeaderLine(
                LeaderLine.pointAnchor(selections.rows[real_i].cells[0], {x: '100%', y: '50%'}),
                LeaderLine.pointAnchor(document.getElementById("circle"), {x: percentX+'%', y: percentY+'%'})
            );

            let splitup = weight_labels[i].children[1].textContent.split(" ")
            let num = splitup[splitup.length-1]
            if (!demo.stringToValidFloat(num)[1]) {
                demo.weightLines[i].color = ERROR_COLOR;
                demo.weightLines[i].path = 'straight';
                demo.weightLines[i].position();
            }
            else {
                if (demo.stringToValidFloat(num)[0] === 0)
                    demo.weightLines[i].color = ZERO_WEIGHT;
                else if (demo.stringToValidFloat(num)[0] < 0)
                    demo.weightLines[i].color = NEGATIVE_WEIGHT;
                else
                    demo.weightLines[i].color = DEFAULT_LINE_COLOR;
                demo.weightLines[i].path = 'straight';
                demo.weightLines[i].position();
                if (demo.stringToValidFloat(num)[1]) { //value is a valid number
                    let line_size = ((newMaxLineSize-newMinLineSize)*(Math.abs(demo.stringToValidFloat(num)[0])-minLineSize))/(maxLineSize-minLineSize)+newMinLineSize
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
                child.style.color = INVALID_WEIGHT
            }
            else {
                if (numConvertedArray[0] === 0) //value is zer0
                    child.style.color = ZERO_WEIGHT
                else if (numConvertedArray[0] < 0) //negative weight
                    child.style.color = NEGATIVE_WEIGHT
                else
                    child.style.color = DEFAULT_LINE_COLOR
            }
        }

        $( ".draggable" ).draggable();
        this.adjustSelectedInputFontSize();


    }

    // set display panel output
    displaySelectedOutput() {
        // replace variable names in selected output display with values on hover (#3)
        let table = document.getElementById("selected-output");
        if(document.getElementById("seloutput-mark")) {
            document.getElementById("seloutput-mark").textContent = demo.selectedOutput[OUTPUT_COLUMN];
        }
        else {
            for (let r=0; r<table.rows.length; r++){
                let cell = table.rows[r].cells[0];
                cell.innerHTML = `<mark id='seloutput-mark' class="mark">${demo.selectedOutput[OUTPUT_COLUMN]}</mark>`;
            }
        }
    }

    isInputTable(tblId) {
        return tblId === "input-table";
    }
    // respond to user hovering over table

    findIndexOfPlotlyTrace(plotlyData, name) {
        for (let i = 0; i < plotlyData.length; i++) {
            if (plotlyData[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    includesLines(plotlyData) {
        for (let i = 0; i < plotlyData.length; i++) {
            if (plotlyData[i].nsLine) {
                return true;
            }
        }
        return false;

    }

    hoverInput(row, tblId, mode) {
        const isOutputToggleChecked = document.getElementById("OutputToggle").checked

        let rowIdx = row.rowIndex || 0;
        if (!this.isInputTable(tblId)) //output table, convert to corresponding input row index
            rowIdx += 1;

        const inputRow = document.querySelector(`#input-table > tbody > tr:nth-child(${rowIdx+1})`)
        //let outputRowIndex = (rowIdx <= 0) ? 1 : rowIdx;
        let outputRowIndex = rowIdx - 1;
        const outputRow = document.querySelector(`#output-table > tbody > tr:nth-child(${outputRowIndex + 1})`)
        const guessOutputRow = document.querySelector(`#guess-output-table > tbody > tr:nth-child(${outputRowIndex + 1})`)
        const activationRow = document.querySelector(`#activation-table > tbody > tr:nth-child(${outputRowIndex + 1})`)

        if (rowIdx < 2) {  //headers, or leave
            this.handleHoverExit();
            display.adjustSelectedInputFontSize();
            return;
        }

        if (mode === "enter") {
            // update the active inputs and outputs to display in perceptron diagram
            demo.selectedInput = inputs.data[rowIdx-2];
            demo.selectedOutput = outputs.data[rowIdx-2];

            // highlight input and output rows corresponding to the hovered input row
            inputRow.style.background = HOVER_COLOR;
            for (let i = 0; i < outputRow.children.length; i++) {
                if (outputRow.children[i].style.background === "rgb(255, 191, 203)")
                    outputRow.children[i].style.background = HOVER_ERROR;
                else {
                    outputRow.children[i].style.background = HOVER_COLOR;
                }
                activationRow.children[0].style.background = HOVER_COLOR;
            }
            if(guessOutputRow)
                guessOutputRow.style.background = HOVER_COLOR;
            display.adjustSelectedInputFontSize();

            //show the activation number
            perceptron.computeAffineOutput();
            let showDetail = document.getElementById("detailButton").innerText === "Hide details";
            if (showDetail) {
                let headerRowVals = [];
                this.getHeaderRowVals(headerRowVals);
                //document.getElementById("perceptron-detail").style.visibility = "visible";
                let activation = perceptron.affineOutput[rowIdx-2];
                let detail_line = `∑ =`;
                for(let i = 0; i < headerRowVals.length; i++) {
                    let variable_name = headerRowVals[i];
                    detail_line += ` (<span class="span-work" style=\"color: red;\">${variable_name}</span> <span class="span-work" style=\"color: blue;\"> &times; </span>w<sub>${i+1}</sub>)`;
                    if(i !== headerRowVals.length - 1) {
                        detail_line += " + ";
                    }
                }
                if(document.getElementById("biasToggle").checked) {
                    detail_line += " + Bias";
                }

                detail_line += `<p>∑ = `;
                for(let i = 0; i < headerRowVals.length; i++) {
                    let variable_value = perceptron.inputData[rowIdx-2][i];
                    detail_line += `(<span class="span-work" style=\"color: red;\">${variable_value}</span> <span class="span-work" style=\"color: blue;\"> &times; </span>${perceptron.weights[i]}</sub>)`;
                    if(i !== headerRowVals.length - 1) {
                        detail_line += " + ";
                    }
                }
                if(document.getElementById("biasToggle").checked) {
                    detail_line += ` + (${-perceptron.threshold})`;
                }

                if(document.getElementById("biasToggle").checked) {
                    let newVal = activation - perceptron.threshold;
                    detail_line += ` = ${newVal}`;
                }
                else {
                    detail_line += ` = ${activation}`;
                }
                document.getElementById("perception_detail_line").innerHTML = detail_line;
            }
            else {
                //document.getElementById("perceptron-detail").style.visbility = "hidden";
                display.UpdateDetailToggle();
            }

            let affineValue = document.getElementById("activation-table").rows[rowIdx-1].cells[0].innerText;
            document.getElementById("sigma").innerText = affineValue + "> ";
        }
        else {
            if (rowIdx % 2 === 0) {
                this.handleHoverExit(inputRow, outputRow, guessOutputRow, activationRow );
                if (isOutputToggleChecked)
                    this.checkDesiredOutput(outputRow.children[OUTPUT_COLUMN], outputRow.children[DESIRED_OUTPUT_COLUMN], activationRow.children[ACTIVATION_COLUMN])

            }

            else {
                this.handleHoverExit(inputRow, outputRow, guessOutputRow, activationRow, true ); //if it is odd, reset to gray
                if (isOutputToggleChecked)
                    this.checkDesiredOutput(outputRow.children[OUTPUT_COLUMN], outputRow.children[DESIRED_OUTPUT_COLUMN], activationRow.children[ACTIVATION_COLUMN])
            }
            document.getElementById("sigma").innerText = "∑> ";
            display.UpdateDetailToggle();
            //document.getElementById("perceptron-detail").style.visibility= "hidden";
            document.getElementById("perceptron-normal").style.display = "inline-flex";

        }
        //this.displaySelectedInput();
        this.updateSelectedInput();
        this.displaySelectedOutput();
        display.recreateOutputLine();
        display.outputLine.position();

        // const isDemoMode = document.getElementById("DemoToggle").checked;
        const isDemoMode2 = document.getElementById("DisplayToggle").value === '1';
        if(isDemoMode2) {
            return;
        }
        //removes lines when not hovered
        demo.lines.forEach(line => line.remove());
        //empties lines array
        demo.lines = [];

        demo.activationLines?.forEach(line => line.remove());
        demo.activationLines = [];

        demo.outputLines?.forEach(line => line.remove());
        demo.outputLines = [];

        const selections = document.getElementById("selected-inputs");
        for (let r=0; r<demo.selectedInput.length; r++) {
            let real_r = r;
            if(document.getElementById("biasToggle").checked)
            {
                real_r += 1;
            }
            if (this.hovering) {
                selections.rows[real_r].cells[0].innerHTML = `<div lang="en" class="input-content">${demo.selectedInput[r]}</div>`;
                demo.lines[r] = new LeaderLine(
                    LeaderLine.pointAnchor(inputRow.children[r+1], {x: '70%', y: '50%'}),
                    LeaderLine.pointAnchor(selections.rows[real_r].cells[0], {x: '40%', y: '50%'}),
                    {dash: {animation: true}}
                );
                demo.lines[r].setOptions({startSocket: 'right', endSocket: 'left'});
            }
            else {
                selections.rows[real_r].cells[0].innerHTML = `<div lang="en" class="input-content">${demo.selectedInput[r]}</div>`;
            }
        }
        if (this.hovering) {
            if (!(document.getElementById("DisplayToggle").value === '3')) {
                demo.activationLines[0] = new LeaderLine(
                    LeaderLine.pointAnchor(document.getElementById("sigma"), {x: '20%', y: '80%'}),
                    LeaderLine.pointAnchor(activationRow.cells[0], {x: '48%', y: '50%'}),
                    {dash: {animation: true}}
                );
                // demo.activationLines[0].path = "arc";
                demo.activationLines[0].setOptions({startSocket: 'bottom', endSocket: 'left'});
                demo.outputLines[0] = new LeaderLine(
                    LeaderLine.pointAnchor(document.getElementById("seloutput"), {x: '90%', y: '50%'}),
                    LeaderLine.pointAnchor(outputRow.cells[0], {x: '48%', y: '50%'}),
                    {dash: {animation: true}}
                );
                demo.outputLines[0].path = "arc";
                // document.getElementById("activation-container").style.display = "inline-flex";
                // document.getElementById("output-container").style.display = "inline-flex";
            } else {
                let numInputs = document.getElementById('input-table').rows[0].cells.length - 1;
                if (numInputs === 1) {
                    if (document.getElementById('plotly-div').style.display === 'none')
                        return;
                    let x = '48%', y = '50%';
                    let fullPlot = document.getElementsByClassName('scatterlayer')[1];

                    let plotlyData = document.getElementById('plotly-1d').data;
                    let falseIdx = display.findIndexOfPlotlyTrace(plotlyData, "falsePoints");
                    let trueIdx = display.findIndexOfPlotlyTrace(plotlyData, "truePoints");

                    let allTraces = fullPlot.children;
                    console.log(allTraces)
                    let falsePoints = fullPlot.children[falseIdx].children[3].children;
                    let truePoints = fullPlot.children[trueIdx].children[3].children;

                    let desiredOutputForPoint = parseFloat(outputRow.children[DESIRED_OUTPUT_COLUMN].innerText);

                    let inputsData = inputs.data[rowIdx - 2]

                    let falsePointsPlotly = plotlyData[falseIdx];
                    let truePointsPlotly = plotlyData[trueIdx];

                    let pointsUsed = desiredOutputForPoint === 0 ? falsePoints : truePoints;
                    console.log(pointsUsed)
                    let pointsUsedPlotly = desiredOutputForPoint === 0 ? falsePointsPlotly : truePointsPlotly;

                    // for now, the order of points [0, 0], [0, 1], [1, 0], [1, 1]
                    let pointedTo = null;

                    for (let i = 0; i < pointsUsed.length; i++) {
                        console.log(inputsData)
                        console.log(pointsUsedPlotly)
                        if (pointsUsedPlotly.x[i] === inputsData[0]) {
                            console.log("IN!!!")
                            pointedTo = pointsUsed[i];
                            break;
                        }
                    }
                    demo.activationLines[0] = new LeaderLine(
                        LeaderLine.pointAnchor(document.getElementById("output-links"), {x: '20%', y: '50%'}),
                        LeaderLine.pointAnchor(pointedTo),
                        {dash: {animation: true}}
                    );
                }
                if (numInputs === 2) {
                    if (document.getElementById('plotly-div').style.display === 'none')
                        return;
                    let x = '48%', y = '50%';
                    let fullPlot = document.getElementsByClassName('scatterlayer')[0];

                    let plotlyData = document.getElementById('tester').data;
                    let falseIdx = display.findIndexOfPlotlyTrace(plotlyData, "falsePoints");
                    let trueIdx = display.findIndexOfPlotlyTrace(plotlyData, "truePoints");

                    let allTraces = fullPlot.children;
                    // console.log(allTraces)
                    let falsePoints = fullPlot.children[falseIdx].children[3].children;
                    let truePoints = fullPlot.children[trueIdx].children[3].children;
                    if (fullPlot.children.length < 9) {
                        falsePoints = fullPlot.children[falseIdx-2].children[3].children;
                        truePoints = fullPlot.children[trueIdx-2].children[3].children;
                    }

                    let desiredOutputForPoint = parseFloat(outputRow.children[DESIRED_OUTPUT_COLUMN].innerText);

                    let inputsData = inputs.data[rowIdx - 2]

                    let falsePointsPlotly = plotlyData[falseIdx];
                    let truePointsPlotly = plotlyData[trueIdx];

                    let pointsUsed = desiredOutputForPoint === 0 ? falsePoints : truePoints;
                    let pointsUsedPlotly = desiredOutputForPoint === 0 ? falsePointsPlotly : truePointsPlotly;

                    // for now, the order of points [0, 0], [0, 1], [1, 0], [1, 1]
                    let pointedTo = null;

                    for (let i = 0; i < pointsUsed.length; i++) {
                        if (pointsUsedPlotly.x[i] === inputsData[0] && pointsUsedPlotly.y[i] === inputsData[1]) {
                            pointedTo = pointsUsed[i];
                            break;
                        }
                    }
                    demo.activationLines[0] = new LeaderLine(
                        LeaderLine.pointAnchor(document.getElementById("output-links"), {x: '20%', y: '50%'}),
                        LeaderLine.pointAnchor(pointedTo),
                        {dash: {animation: true}}
                    );
                }


            }

        }
        display.alignTables()
        display.createOutputTableEditBorder();
    }

    handleHoverExit(inputRow, outputRow, guessOutputRow, activationRow,  isOdd = false) {
        // reset display panel inputs to user-defined inputs (#11)
        let headerRowVals = [];
        this.getHeaderRowVals(headerRowVals);

        // reset displayed input to header row values
        demo.selectedInput = headerRowVals;
        // reset displayed output to default
        demo.selectedOutput = demo.defaultSelectedOutput;

        if (inputRow)
            inputRow.style.background = "none";
        if (outputRow) {
            for (let i = 0; i < outputRow.children.length; i++) {
                outputRow.children[0].style.background = "none";
                activationRow.children[0].style.background = "none";
                this.checkDesiredOutput(outputRow.children[OUTPUT_COLUMN], outputRow.children[DESIRED_OUTPUT_COLUMN], activationRow.children[ACTIVATION_COLUMN])
            }
        }
        if(guessOutputRow) {
            guessOutputRow.style.background = "none";
        }

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
                let headerInputHtml = headerInput.innerHTML;
                if (!headerInputHtml.length) {
                    headerInputHtml = "<br>";
                }
                headerRowVals.push(headerInputHtml);
            }

        }
    }

    getHeaderRowVariables(headerRowVals) {
        const headerCells = document.getElementById("input-table").rows[1].cells;
        for (let c = 1; c < headerCells.length; c++) {
            //var headerInput = document.getElementById(`tblinput${c}`);
            let headerInput = headerCells[c];
            //var headerInput = document.querySelector(`#input-table> tbody > tr:nth-child(${2}) > td:nth-child(${c} > div:nth-child(${1}))`);
            if (headerInput.id.startsWith("tblinput")) {
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

                headerInput.innerHTML = headerRowVals[c-1];
            }
        }
    }

    UpdateInputToggle() {
        let checkbox = document.getElementById("InputToggle");
        let checkboxBinary = document.getElementById(("BinaryToggle"));
        //let checkboxDemo = document.getElementById("DemoToggle")
        let checkboxDemo = document.getElementById("DisplayToggle").value === '1'
        // checkboxBinary.style.display = checkbox.checked? "inline-block" : "none";
        // document.getElementById("OutputToggle").style.display =  checkbox.checked? "inline-block" : "none";

        //display.createOutputTableColors();
        this.updateSelectedInput();
        if (!checkbox.checked || checkboxDemo) {
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
            document.getElementById("guess-output-table").style.marginTop = "0px";
            document.getElementById("activation-table").style.marginTop = "0px";
            document.getElementById("AutoProgressToggleBody").style.display = "none";
            document.getElementById("BinaryToggleBody").style.display= "none";
            document.getElementById("ShowDesiredToggleBody").style.display= "none";
            document.getElementById("ShowBiasToggleBody").style.display= "none";
            document.getElementById("ShowProgressBarToggleBody").style.display= "none";
            document.getElementById("difficultySlide").style.display = "none";
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
            document.getElementById("output-table").style.marginTop = "32px";
            document.getElementById("guess-output-table").style.marginTop = "32px";
            document.getElementById("activation-table").style.marginTop = "32px";
            document.getElementById("AutoProgressToggleBody").style.display = "flex";
            document.getElementById("BinaryToggleBody").style.display= "flex";
            document.getElementById("ShowDesiredToggleBody").style.display= "flex";
            document.getElementById("ShowBiasToggleBody").style.display= "flex";
            document.getElementById("difficultySlide").style.display = "flex";
            document.getElementById("ShowProgressBarToggleBody").style.display= "flex";
        }

        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }
        //this.UpdateOutputToggle()
        this.UpdateShowBiasToggle();
        this.UpdateShowProgressBarToggle();
    }

    UpdateShowBiasToggle () {
        if(document.getElementById("ShowBiasToggle").checked) {
            document.getElementById("bias-toggle").style.display = "flex";

        }
        else {
            document.getElementById("bias-toggle").style.display = "none";
        }
    }

    UpdateShowProgressBarToggle() {
        if(document.getElementById("ShowProgressBarToggle").checked) {
            document.getElementById("progress-bar").style.display = "flex";
        }
        else {
            document.getElementById("progress-bar").style.display = "none";
        }
    }

    UpdateOutputToggle() {
        let checkbox = document.getElementById("OutputToggle");
        let checkboxEditable = document.getElementById("InputToggle");
        display.showDesiredOutput(checkbox.checked, checkboxEditable.checked);
        let activationCol = document.getElementById("activation-table");
        let outputCol = document.getElementById("output-table");
        let n = outputCol.rows.length;
        display.createOutputTableColors();

        let isCorrect = true;

        for (let i = 1; i < n; i++) {
            //var tr = outputCol.rows[i];
            let output = outputCol.rows[i].cells[OUTPUT_COLUMN];
            let desired = outputCol.rows[i].cells[DESIRED_OUTPUT_COLUMN];
            let activation = activationCol.rows[i].cells[ACTIVATION_COLUMN];

            let currCorrect = this.checkDesiredOutput(output, desired, activation);
            if (!currCorrect)
                isCorrect = false;
        }

        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }

        display.outputLine.position();
        display.createOutputTableEditBorder();
        handleDesiredOutputColumn()
    }

    UpdateDetailToggle() {
        let detailButton = document.getElementById("detailButton");
        if(detailButton.innerText === "Hide details") {
            //we should display the details
            let headerRowVals = [];
            this.getHeaderRowVals(headerRowVals);
            document.getElementById("perceptron-detail").style.visibility = "visible";
            let detail_line = `∑ =`;
            for(let i = 0; i < headerRowVals.length; i++) {
                let variable_name = headerRowVals[i];
                detail_line += ` (<span class="span-work" style=\"color: red;\">${variable_name} </span> <span class="span-work" style=\"color: blue;\">&times;</span> w<sub>${i+1}</sub>)`;
                if(i !== headerRowVals.length - 1) {
                    detail_line += " + ";
                }
            }
            if(document.getElementById("biasToggle").checked) {
                detail_line += " + Bias";
            }

            document.getElementById("perception_detail_line").innerHTML = detail_line;
        }
        else {
            document.getElementById("perceptron-detail").style.visibility = "hidden";
        }
        this.UpdateDemoToggle();
        this.updateTableOutputColumn();
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
        checkAnswerCorrect();
        display.createInputTableEditBorder();
        display.createOutputTableEditBorder();
        this.UpdateInputToggle();
    }

    UpdateDemoToggle() {

        let hintText = document.getElementById("hintText");
        // let checkbox = document.getElementById("DemoToggle");
        let displaySlider = document.getElementById("DisplayToggle");
        const otherHeaders = document.querySelectorAll('.top-table th:not(:first-child):not(:last-child)');
        if (displaySlider.value === '1') {
            document.getElementById("guess-output-container").style.display = "inline-block";

            document.getElementById("CheckAnswerBtn").style.display = "inline-block";
            document.getElementById("network-container").style.display = "none";
            document.getElementById("output-container").style.display = "none";
            document.getElementById("activation-container").style.display = "none";
            document.getElementById("bias-toggle").style.display = "none";
            document.getElementById("hintText").style.display = "none";
            document.getElementById("perceptron-detail").style.visibility = "hidden";
            document.getElementById("output-header-container").style.visibility = "hidden";
            otherHeaders.forEach(header => {
                header.hidden = true;
            });
            const buttonRows = document.getElementsByClassName("row-buttons-container");
            buttonRows.forEach(element => {
                element.style.display = "none";
            });

            if(this.outputLine) {
                this.outputLine.remove();
                this.outputLine = null;
            }
        }
        else {
            document.getElementById("guess-output-container").style.display = "none";
            document.getElementById("CheckAnswerBtn").style.display = "none";
            document.getElementById("network-container").style.display = "inline-flex";
            document.getElementById("output-container").style.display = "inline-flex";
            document.getElementById("activation-container").style.display = "inline-flex";
            document.getElementById("bias-toggle").style.display = "inline-flex";
            document.getElementById("hintText").style.display = "inline-block";
            document.getElementById("output-header-container").style.visibility = "visible";
            if(document.getElementById("detailButton").innerText === "Hide details") {
                document.getElementById("perceptron-detail").style.visibility = "visible";
            }
            else {
                document.getElementById("perceptron-detail").style.visibility = "hidden";
            }

            //document.getElementById("edit-menu-section").style.display = "inline-block";
            otherHeaders.forEach(header => {
                header.hidden = false;
            });
            let binaryCheck = document.getElementById("BinaryToggle");
            const buttonRows = document.getElementsByClassName("row-buttons-container");
            buttonRows.forEach(element => {
                element.style.display = binaryCheck.checked? "none" : "flex";
            });
            this.recreateOutputLine();
        }
        this.UpdateInputToggle();
        display.updateGuessTable();
        demo.adjustWeightPlacement();
        FixCheckAnswerButtonPosition();
        display.createInputTableEditBorder();
        display.updateHintButton();
        checkAnswerCorrect();
        display.createInputLabelLines();

        //reposition lines
        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }
        if (demo.biasLine) {
            demo.biasLine.position();
        }
        display.outputLine.position()
        display.alignTables();

        if (displaySlider.value === '3') {
            document.getElementById("output-container").style.display = "none";
            document.getElementById("activation-container").style.display = "none";
        }

    }

    updateBiasToggle() {
        perceptron.setBiasUI();
        display.updateSelectedInput();
        demo.update();
        //demo.adjustWeightPlacement();
        setupQuestionFields();
        display.UpdateDetailToggle();
    }

    UpdateFanfareToggle() {
        let checkbox = document.getElementById("FanfareToggle");
        if (!checkbox.checked) {
            //document.getElementById("congrats-msg").hidden = true;
            display.outputLine.position();
        } else {
            display.checkForSuccess();
        }
    }

    UpdatePlotlyToggle() {
        // currently only supports 2D
        let inputTable = document.getElementById('input-table');
        let numVariables = inputTable.rows[0].cells.length;


        // let plotlyToggle = document.getElementById("PlotlyToggle");
        let displaySlider = document.getElementById("DisplayToggle");
        let outputTable = document.getElementById("output-table");
        let activationTable = document.getElementById("activation-table");
        let plotlyContainer = document.getElementById("plotly-container");
        let outputContainer = document.getElementById("output-container");
        let activationContainer = document.getElementById("activation-container");
        if (displaySlider.value === '3') { // in graph mode
            // remove/make invisible output table

            outputTable.style.display = "none";
            activationTable.style.display = "none";
            outputContainer.style.display = "none";
            activationContainer.style.display = "none";
            plotlyContainer.style.display = "block";

            let plotlyDiv = document.getElementById('plotly-div');
            let sliders = document.getElementsByClassName('plotly-slider-class');
            let errorText = document.getElementById('plotly-error');

            if (numVariables > 3) {

                errorText.style.display =  "block";
                plotlyDiv.style.display = "none";

                for (let i = 0; i < sliders.length; i++) {
                    sliders[i].style.display = "none";
                }
                demo.activationLines?.forEach(line => line.remove());
                demo.activationLines = [];


            } else {
                errorText.style.display =  "none";
                plotlyDiv.style.display = "block";
                for (let i = 0; i < sliders.length; i++) {
                    sliders[i].style.display = "flex";
                }
                initialize();
            }
        } else {
            outputTable.style.display = "block";
            activationTable.style.display = "block";
            plotlyContainer.style.display = "none";
            outputContainer.style.display = "inline-flex";
            activationContainer.style.display = "inline-flex";
        }

        if (this.outputLine != null)
            this.outputLine.position();
        for (let i = 0; i < demo.weightLines.length; i++) {
            demo.weightLines[i].position();
        }
        if (demo.biasLine) {
            demo.biasLine.position();
        }
    }

    checkDesiredOutput(output, desired, activation) {
        //TODO: do extra testing with the regex and make changes if necessary
        if (!output)
            return;
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
        if (parsedValue !== 1 && parsedValue !== 0 ) {
            isValid = false;
        }
        display.highlightInvalidText(desired, isValid);

        if (outputParsedValue !== parsedValue && document.getElementById("OutputToggle").checked) {
            output.style.background = ERROR_COLOR; //pink (error)
            //activation.style.background = ERROR_COLOR;
            return false;
        }
        else {
            //output.style.removeProperty('background-color');
            output.style.background = OUTPUT_COLOR;
            //activation.style.background = "none";
            return true;
        }
        // display.createOutputTableEditBorder();
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
            if(n > 0)
                n = 1;
            else
                n = 0;
            cell.innerHTML = cell.innerHTML.replace(cell.innerText, n.toString());
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
        outputTable.showColumn(DESIRED_OUTPUT_COLUMN, show, editable);
    }
}