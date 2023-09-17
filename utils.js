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
        });
}

// --- FUNCTIONS FOR DIFFICULTY SLIDER ---
// if difficulty slider changes value, update progress bar and text

// DIFFICULTY STUFF HERE


//Automatically adjusts arrows and table headers to fit the screen
window.onresize = function(event) {
    display.updateSelectedInput()
    display.createInputLabelLines()

};

//Goes to Instructions page
function goToAboutPage() {
    window.open(
        'about.html',
        '_blank'
    );
}