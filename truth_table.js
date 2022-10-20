function setupGenerateTruthTable() {
    vars = []
    document.getElementById('generateTruthTable').addEventListener('click', ()=>{
        for(let i = 0; i < inputTable.numCols; i++) {
            vars.push((i+1).toString());
        }

        var len = vars.length
            ,splitBy = Math.round(len/2)
            ,trueSet
            ,trues = []
            ,falses = []
            ,truthData = [];

        truthData.push(truth(vars, vars, true));
        for(var i=1; i<=splitBy; i++) {
            trueSet = reduceToCombinations(permut(vars, i));

            trueSet.forEach((truthSrc)=>{
                trues = truth(vars, truthSrc);
                truthData.push(trues);
            });
        }
        truthData.push(truth(vars, vars));
        demo.removeAllInputDataRows(false);
        writeTruthTable(truthData);
    });
}

function truth(set, truths, reverse) {
    var w = {};

    set.forEach(v=>w[v]=(truths.indexOf(v)>=0 ? true : false)^reverse);

    return w;
}

function reduceToCombinations(arr) {
    var i=1
        ,lastEl;

    arr = arr.map(v=>{return v.split('').sort().join('')}).sort();

    lastEl = arr[0];
    while(i<arr.length) {
        if(arr[i] == lastEl) {
            arr.splice(i,1);
        } else {
            lastEl = arr[i];
            i++;
        }
    }

    arr = arr.map(v=>{return v.split('')});

    return arr;
}

function writeTruthTable(truthData) {
    let r = 2;
    truthData.forEach((v)=> {
        console.log(v);
        for(i in v){
            inputTable.insertTableRow(r);
            outputTable.insertTableRow(r-1);
            inputTable.table[r][i+1] = v[i];
            r++;
        };
    });
    demo.update();
}

function permut(arr, c) {
    var buf = []
        ,len
        ,arrSlice
        ,permArr
        ,proArr;
    if(c<=1) {
        return arr;
    } else {
        len = arr.length;
        for(var i=0;i<len;i++) {
            arrSlice = arr.slice(0,i).concat(arr.slice(i+1));
            permArr = permut(arrSlice,c-1);
            proArr = [];
            for(var y=0; y<permArr.length; y++) {
                proArr.push([arr[i]].concat(permArr[y]).join(''));
            }
            buf.push(...proArr);
        }
    }
    return buf;
}