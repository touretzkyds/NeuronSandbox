class PerceptronVisualizer {
    constructor() {
        this.container = document.getElementById('network');
        this.weights = [0.5, 1.0, 1.0];
        this.lines = [];
        
        this.init();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('randomize').addEventListener('click', () => {
            this.updateWeights();
        });

        let timeout;
        window.addEventListener('resize', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.updateLines(), 100);
        });
    }

    init() {
        this.drawConnections();
    }

    removeExistingLines() {
        this.lines.forEach(line => line.remove());
        this.lines = [];
    }
    
    drawConnections() {
        this.removeExistingLines();
        
        const inputElements = this.container.querySelectorAll('.input-item');
        const perceptron = this.container.querySelector('.circle');
        const output = this.container.querySelector('.output-value');
    
        // Get circle dimensions
        const circleRect = perceptron.getBoundingClientRect();
        const radius = circleRect.width / 2;
    
        // Draw input connections
        inputElements.forEach((input, index) => {
            const line = new LeaderLine(
                input,
                LeaderLine.pointAnchor(perceptron, {
                    x: '50%',
                    y: '50%',
                    intersectR: radius  // This makes the line stop at circle boundary
                }),
                {
                    color: '#333',
                    size: 2,
                    startSocket: 'right',
                    endSocket: 'left',
                    path: 'straight',
                    startSocketGravity: 50,
                    endSocketGravity: 50,
                    endPlug: 'arrow1',
                }
            );
    
            const weight = this.weights[index];
            line.setOptions({
                middleLabel: LeaderLine.pathLabel({
                    text: `w=${weight.toFixed(1)}`,
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    backgroundColor: 'white',
                    padding: [3, 6]
                })
            });
    
            this.lines.push(line);
        });
    
        // Draw output connection
        const outputLine = new LeaderLine(
            LeaderLine.pointAnchor(perceptron, {
                x: '50%',
                y: '50%',
                intersectR: radius  // This makes the line stop at circle boundary
            }),
            output,
            {
                color: '#333',
                size: 2,
                startSocket: 'right',
                endSocket: 'left',
                path: 'straight',
                startSocketGravity: 50,
                endSocketGravity: 50,
                endPlug: 'arrow1'
            }
        );
        this.lines.push(outputLine);
    }

    updateLines() {
        this.lines.forEach(line => line.position());
    }

    updateWeights() {
        this.weights = this.weights.map(() => Math.random() * 2 - 1);
        this.drawConnections();
    }

    setInputs(inputLabels) {
        const inputCell = document.getElementById('inputs');
        inputCell.innerHTML = '';
        
        inputLabels.forEach(label => {
            const inputItem = document.createElement('div');
            inputItem.className = 'input-item';
            
            inputItem.title = label;
            
            const displayText = this.formatInputLabel(label);
            const textNode = document.createTextNode(displayText);
            inputItem.appendChild(textNode);
            
            inputCell.appendChild(inputItem);
        });
        
        this.weights = new Array(inputLabels.length).fill(1);
        this.drawConnections();
    }

    formatInputLabel(label, maxLength = 20) {
        if (label.length <= maxLength) return label;
        
        const words = label.split(' ');
        
        if (words.length === 1) {
            return label.substring(0, maxLength - 3) + '...';
        }
        
        let result = words[0];
        let i = 1;
        
        while (i < words.length) {
            const nextWord = words[i];
            const potential = result + ' ' + nextWord;
            
            if (potential.length <= maxLength) {
                result = potential;
                i++;
            } else {
                if (i < words.length - 1) {
                    result += '...';
                }
                break;
            }
        }
        
        return result;
    }
}