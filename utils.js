///////////////////////////////////////////////////////////////////////////////
// --- AUDIO FUNCTIONS ---
///////////////////////////////////////////////////////////////////////////////
function PlayHooraySound() {
    //document.getElementById("popup").classList.toggle('active');
    let fanfareToggleChecked = document.getElementById("FanfareToggle").checked;
    if(!fanfareToggleChecked)
        return;
    const audio = document.getElementById("hooray_sound");
    if (audio) {
        audio.play();
    }
}

function PlayBuzzSound() {
    //document.getElementById("popup").classList.toggle('active');
    let fanfareToggleChecked = document.getElementById("FanfareToggle").checked;
    if(!fanfareToggleChecked)
        return;
    const audio = document.getElementById("buzz_sound");
    if (audio) {
        audio.play();
    }
}

function PlayDingSound() {
    //document.getElementById("popup").classList.toggle('active');
    let fanfareToggleChecked = document.getElementById("FanfareToggle").checked;
    if(!fanfareToggleChecked)
        return;
    const audio = document.getElementById("ding_sound");
    if (audio) {
        audio.play();
    }
}
///////////////////////////////////////////////////////////////////////////////
// --- TOGGLE LISTENERS ---
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// --- UTIL FUNCTIONS FOR LOADING/DOWNLOADING PROBLEMS ---
///////////////////////////////////////////////////////////////////////////////
function fileExists(url) {
    let http = new XMLHttpRequest();
    http.open('HEAD', encodeURI(url), false);
    http.send();
    return http.status !== 404;
}

async function downloadFile() {
    let inputToggleChecked=document.getElementById("InputToggle").checked;
    let outputToggleChecked=document.getElementById("OutputToggle").checked;
    let fanfareToggleChecked = document.getElementById("FanfareToggle").checked;

    let headerRowVariables = [];
    display.getHeaderRowVariables(headerRowVariables);

    let modelname = document.getElementById("fname").innerText

    const handle = await showSaveFilePicker({
        suggestedName: modelname + '.sandbox',
        types: [{
            description: 'Neuron Sandbox model',
            accept: {'application/sandbox': ['.sandbox']},
        }],
    });

    let table = document.getElementById("output-table");
    for (let i = 1; i < table.rows.length; i++ ) {
        let tr = table.rows[i];
        let td = tr.cells[DESIRED_OUTPUT_COLUMN];
        desiredOutputs.data[i-1] = td.innerText;
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
    let difficultyLevel = document.getElementById("difficulty_slide").value;
    let guessToggleChecked = document.getElementById("DisplayToggle").value === '1'

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
        "guessToggleChecked" : guessToggleChecked,
        "difficultyLevel": difficultyLevel,
        "question" : question
        //"input-header": headerRows,
    };

    const blob = new Blob([JSON.stringify(dict)]);
    // Create a new JSZip instance
    const zip = new JSZip();
    // Add the file to the zip archive
    zip.file("model.json", blob);
    zip.file("ImageMapping.json", new Blob([JSON.stringify(dictImageMapping)]))
    display.saveGuessComment();
    zip.file("CommentMapping.json", new Blob([JSON.stringify(dictCommentMapping)]))
    for (const key in dictImageMapping) {
        let keyStorage = dictImageMapping[key];
        // console.log("localstorage key:" + key);
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

async function uploadFromZipUrl(url, isProblem = false) {
    try {
        const urlRegex = /[\w\.\/&]+\.sandbox$/i;
        if(!urlRegex.test(url)) {
            alert("Please enter a valid URL ends with sandbox extension");
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
        await uploadZip(blob, isProblem);
    } catch (err) {
        alert("An error occurred when loading model: Please enter valid URL.");
    }
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
        if(options.length === problemNum+1) {
            options.remove(options.length-1);
        }
    }
}

let selectedProblemListValue = null;

// Loads problem list
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
                //console.log(`User selected item with ID ${selectedItemId}`);
                data.items.forEach(item => {
                    if (item.id.toString() === selectedItemId) {
                        //console.log(`Selected item: ${JSON.stringify(item)}`);
                        //const questiontext = document.getElementById("questiontext");
                        //questiontext.innerText = item.question;
                        //load the model associated with the question
                        let filePath = "problems/" + item.model_name+".sandbox"
                        if (fileExists(filePath)) {
                            uploadFromZipUrl(encodeURI(filePath), true);

                        }
                    }
                });
            });
            // dropdown.addEventListener('mousedown', event => {
            //     selectedProblemListValue = dropdown.value;
            // });
            //
            // dropdown.addEventListener('mouseup', event => {
            //     if (selectedProblemListValue === dropdown.value) //select the same problem again
            //     {
            //         data.items.forEach(item => {
            //             if (item.id.toString() === dropdown.value) {
            //                 let filePath = "problems/" + item.model_name+".sandbox"
            //                 if (fileExists(filePath)) {
            //                     uploadFromZipUrl(encodeURI(filePath), true);
            //                 }
            //             }
            //         });
            //     }
            // });

        });
}

// --- FUNCTIONS FOR DIFFICULTY SLIDER ---
// if difficulty slider changes value, update progress bar and text

// DIFFICULTY STUFF HERE


//Automatically adjusts arrows and table headers to fit the screen
window.onresize = function(event) {
    display.updateSelectedInput()
    display.createInputLabelLines()

    if(demo.activationLines && demo.activationLines[0])
        demo.activationLines[0].position();

};

//Goes to Instructions page
function goToInstructionsPage() {
    window.open(
        'instructions.html',
        '_blank'
    );
}
