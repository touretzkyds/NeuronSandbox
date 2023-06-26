class HintProvider {
    constructor(parameters, inputData, desiredOutput, editableList) {
        this.parameters = parameters; // includes weights + threshold at the end
        this.inputData = inputData; //input data
        //this.outputData = outputData; //output data
        this.editableList = editableList; //keeps track of which parameters are editable
        this.desiredOutput = desiredOutput //keeps track of desired outputs
    }

    getAllSubsets(editable=this.editableList) {
        const subsets = [[]];

        let editableFields = []
        for (let i = 0; i < this.parameters.length; i++) {
            if (editable[i]) {
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
                            adjustedWeights[k] += (this.inputData[j][k] * 0.1)
                    }
                    if (selectedParams.includes(adjustedWeights.length-1))
                        adjustedWeights[adjustedWeights.length-1] += 0.1;
                }
                if (actualOutput > desiredOutput) {
                    hasSolution = false
                    for (let k = 0; k < adjustedWeights.length-1; k++) {
                        if (selectedParams.includes(k))
                            adjustedWeights[k] -= (this.inputData[j][k] * 0.1)
                    }
                    if (selectedParams.includes(adjustedWeights.length-1))
                        adjustedWeights[adjustedWeights.length-1] -= 0.1;
                }

            }
            if (hasSolution) {
                adjustedWeights[adjustedWeights.length - 1] *= -1;// we want to transform threshold back into positive
                return adjustedWeights;
            }

        }
        return [Number.MIN_VALUE];

    }

    provideHintHelper(subsets) {
        let hint = "";
        let indexHint = "";
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
                    hint = `Try decreasing weight ${paramIndex + 1}.`;
                else
                    hint = `Try decreasing the threshold.`;
            }
            else {
                if (paramIndex !== solution.length-1)
                    hint = `Try increasing weight ${paramIndex + 1}.`;
                else
                    hint = `Try increasing the threshold.`;
            }
            return [hint, -1, selectedParams];
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
                            hint = `Try changing weight ${indexHint + 1}.`;
                        else
                            hint = `Try changing the threshold.`;

                        return [hint, -1, subset];

                    }
                    else {
                        //pick a random parameter
                        //in this case, need to keep track of which param we told them to change
                        indexHint = Math.floor(Math.random() * subset.length);
                        if (subset[indexHint] !== solution.length - 1)
                            hint =`Try changing weight ${subset[indexHint] + 1}.`;
                        else
                            hint = `Try changing the threshold`;

                        return [hint, subset[indexHint], subset];
                    }
                }

            }
        }
    }
    provideHint(prevHintIndex, prevSubset) {
        let hint = "";
        let indexHint = "";
        //create subsets
        let subsets = this.getAllSubsets();
        if(prevHintIndex === -1) { //previous hint not relevant
            return this.provideHintHelper(subsets);
        }
        else {
            //previous hint was at a particular weight/threshold
            /*
            step 1. check if a solution is present without changing this particular weight/threshold
            this suggests that the user has correctly followed the previous hint, and we can continue
            giving new hints
            */
            let tempEditableList = [...this.editableList];
            tempEditableList[prevHintIndex] = false; //make it uneditable
            let subsets = this.getAllSubsets(tempEditableList);
            subsets.sort(function (a, b) {
                return a.length - b.length;
            });
            for (let i = 0; i < subsets.length; i++) {
                let subset = subsets[i];
                let len = subset.length; //depending on this, we show diff hints
                let solution = this.checkForSolution(subset)
                if (!solution.includes(Number.MIN_VALUE)) { //solution present!
                    //this means they followed the hint properly and got a correct
                    //answer for one of the params.
                    //If that is the case, we give new hint.
                    let subsets = this.getAllSubsets(this.editableList);
                    subsets.sort(function (a, b) {
                        return a.length - b.length;
                    });
                    return this.provideHintHelper(subsets)
                }

            }
            //they followed the hint improperly
            // compare to solution, what needs to be changed?
            let hint = ""
            let sol = this.checkForSolution(prevSubset)
            let correctValue = sol[prevHintIndex];
            if (this.parameters[prevHintIndex] > correctValue) {
                if (prevHintIndex !== sol.length-1)
                    hint = `Try decreasing weight ${prevHintIndex + 1}.`;
                else
                    hint = `Try decreasing the threshold.`;
            }
            else {
                if (prevHintIndex !== sol.length-1)
                    hint = `Try increasing weight ${prevHintIndex + 1}.`;
                else
                    hint = `Try increasing the threshold.`;
            }
            return [hint, prevHintIndex, prevSubset]



        }

        return "";

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