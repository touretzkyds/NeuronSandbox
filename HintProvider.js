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
        for (let i = 0; i < this.parameters.length; i++) {
            if (this.editableList[i]) {
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
                adjustedWeights[adjustedWeights.length - 1] *= -1;// we want to transform threshold back into positive
                return adjustedWeights;
            }

        }
        return [Number.MIN_VALUE];

    }

    provideHint() {
        let hint = "";
        let indexHint = "";
        //create subsets
        let subsets = this.getAllSubsets();
        if (subsets.length === 2) { // only one parameter can change
            //compare solution with current value
            const selectedParams = subsets[1];
            let solution = this.checkForSolution(selectedParams);
            const paramIndex = subsets[1][0];
            if (solution.includes(Number.MIN_VALUE)) {
                hint = `this seems impossible.`
            }
            else if (this.parameters[paramIndex] > solution[paramIndex]) {
                if (paramIndex !== solution.length-1)
                    hint = `try decreasing weight ${paramIndex + 1}`;
                else
                    hint = `try decreasing the threshold`;
            }
            else {
                if (paramIndex !== solution.length-1)
                    hint = `try increasing weight ${paramIndex + 1}`;
                else
                    hint = `try increasing the threshold`;
            }

                
        }
        else {
            //can change multiple parameters ==> we go through all possibilities
            //we start by trying changing only one parameter, so we sort list by lengths of sublists
            subsets.sort(function (a, b) {
                return a.length - b.length;
            });
            for(let i = 0; i < subsets.length; i++) {
                let subset = subsets[i];
                let len = subset.length; //depending on this, we show diff hints
                let solution = this.checkForSolution(subset)
                if (!solution.includes(Number.MIN_VALUE)) { //solution present!
                    if (len === 1) {
                        indexHint = subset[0]
                        if (indexHint !== solution.length - 1)
                            hint = `try changing weight ${indexHint}`;
                        else
                            hint = `try changing the threshold`;

                    }
                    else {
                        //pick a random parameter
                        indexHint = Math.floor(Math.random() * subset.length);
                        if (indexHint !== solution.length - 1)
                            hint =`try changing weight ${indexHint}`;
                        else
                            hint = `try changing the threshold`;
                    }
                }

            }
        }
        //TODO: return hint, and also return what "type" of hint
        return hint;

    }
}

// // Usage example:
// const parameters = [1, 1, 0]
// const inputData = [[0, 0], [0, 1], [1, 0], [1, 1]]
// const editableList = [true, true, true]
// const desiredOutput = [0, 0, 0, 1]
//
//
// const hintProvider = new HintProvider(parameters, inputData, desiredOutput, editableList);
// //const hintMessage = hintProvider.provideHint();
// //let subsets = hintProvider.getAllSubsets()
// //const sol = hintProvider.checkForSolution(subsets[4])
// const test = hintProvider.provideHint();
// console.log(test)