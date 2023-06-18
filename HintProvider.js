class HintProvider {
    constructor(parameters, inputData, desiredOutput, editableList) {
        this.parameters = parameters; // includes weights + threshold at the end
        this.inputData = inputData; //input data
        //this.outputData = outputData; //output data
        this.editableList = editableList; //keeps track of which parameters are editable
        this.desiredOutput = desiredOutput //keeps track of desired outputs
    }

    getAllSubsets() {
        const subsets = [[]];

        let editableFields = []
        for (let i = 0; i < parameters.length; i++) {
            if (editableList[i]) {
                editableFields.push(i)
            }
        }

        //https://stackoverflow.com/questions/42773836/how-to-find-all-subsets-of-a-set-in-javascript-powerset-of-array
        for (const field of editableFields) {
            const last = subsets.length-1;
            for (let i = 0; i <= last; i++) {
                subsets.push( [...subsets[i], field] );
            }
        }
        return subsets;
    }

    checkForSolution(selectedParams) { //uses perceptron learning algo

        //second column is output
        let adjustedWeights = []; //these weights will be adjusted throughout
        for (let i = 0; i < this.parameters.length-1; i++) {
            //note: we remove the last one because it needs to be negative
            adjustedWeights.push(this.parameters[i])
        }
        adjustedWeights.push(this.parameters[this.parameters.length-1] * -1); //added threshold * -1
        //iterate through inputs 100 times, if still not correct then we assume no solution
        for (let i = 0; i < 100; i++) {
            let hasSolution = true
            for (let j = 0; j < this.inputData.length; j++) {
                let input = this.inputData[j];
                let actualOutput = 0
                for (let w = 0; w < adjustedWeights.length-1; w++) {
                    actualOutput += input[w]*adjustedWeights[w]
                }
                actualOutput += adjustedWeights[adjustedWeights.length-1]; //threshold
                actualOutput = actualOutput > 0 ? 1 : 0
                let desiredOutput = this.desiredOutput[j]
                if (actualOutput < desiredOutput) {
                    hasSolution = false
                    for (let k = 0; k < adjustedWeights.length-1; k++) {
                        if (selectedParams.includes(k))
                            adjustedWeights[k] += this.inputData[j][k]
                    }
                    if (selectedParams.includes(adjustedWeights.length-1))
                        adjustedWeights[adjustedWeights.length-1]++;
                }
                if (actualOutput > desiredOutput) {
                    hasSolution = false
                    for (let k = 0; k < adjustedWeights.length-1; k++) {
                        if (selectedParams.includes(k))
                            adjustedWeights[k] -= this.inputData[j][k]
                    }
                    if (selectedParams.includes(adjustedWeights.length-1))
                        adjustedWeights[adjustedWeights.length-1]--;
                }

            }
            if (hasSolution) {
                return "yay solution!"
            }

        }
        return "no solution :("

    }

    provideHint() {
        // Logic to calculate hint based on weights, thresholds, and editableList
        let hint = "Hint: ";
        for (let i = 0; i < this.parameters.length; i++) {
            if (this.editableList[i]) {
                if (this.parameters[i] >= this.inputData[i]) {
                    hint += `Increase weight ${i + 1}. `;
                } else {
                    hint += `Decrease weight ${i + 1}. `;
                }
            }
        }

        return hint;
    }
}

// Usage example:
const parameters = [1, 1, 0]
const inputData = [[0, 0], [0, 1], [1, 0], [1, 1]]
const editableList = [true, true, true]
const desiredOutput = [0, 0, 0, 1]


const hintProvider = new HintProvider(parameters, inputData, desiredOutput, editableList);
//const hintMessage = hintProvider.provideHint();
let subsets = hintProvider.getAllSubsets()
const sol = hintProvider.checkForSolution(subsets[5])

console.log(subsets)
console.log(sol)