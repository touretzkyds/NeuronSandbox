class PerceptronVisualizer {
    constructor() {
        this.container = document.getElementById('network');
        this.weights = [0.5, 1.0, 1.0];
        this.lines = [];

        // Create a container for weight labels that sits above everything
        this.labelContainer = document.createElement('div');
        this.labelContainer.style.position = 'absolute';
        this.labelContainer.style.top = '0';
        this.labelContainer.style.left = '0';
        this.labelContainer.style.width = '100%';
        this.labelContainer.style.height = '100%';
        this.labelContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.labelContainer.style.zIndex = '10000';
        document.body.appendChild(this.labelContainer);

        this.threshold = 0.5;
        this.setupThresholdBox();
        
        this.init();
        this.setupEventListeners();
    }
    setupThresholdBox() {
        const thresholdBox = document.querySelector('.threshold-box');

        // Initialize with current threshold
        thresholdBox.innerText = this.threshold.toFixed(1);

        // Handle threshold updates
        thresholdBox.addEventListener('input', (event) => {
            const newValue = parseFloat(event.target.innerText);
            if (!isNaN(newValue)) {
                this.threshold = newValue;
            }
        });

        // Make sure the content stays centered when window resizes
        const updatePerceptronContent = () => {
            const circle = document.querySelector('.circle');
            const content = document.querySelector('.perceptron-content');
            if (circle && content) {
                const circleRect = circle.getBoundingClientRect();
                const originalWidth = 200; // Assuming this is the original circle width
                const scale = circleRect.width / originalWidth;
                
                content.style.position = 'absolute';
                content.style.left = '50%';
                content.style.top = '50%';
                content.style.transform = `translate(-50%, -50%) scale(${scale})`;
                content.style.transformOrigin = 'center center';
                
                // Scale all elements inside the content
                const elements = content.querySelectorAll('*');
                elements.forEach(element => {
                    if (element.style.fontSize) {
                        const originalSize = parseFloat(element.style.fontSize);
                        element.style.fontSize = `${originalSize * scale}px`;
                    }
                });
            }
        };

        // Add resize handler
        let rafId;
        window.addEventListener('resize', () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(updatePerceptronContent);
        });

        // Initial positioning
        updatePerceptronContent();
    }

    setupEventListeners() {
        document.getElementById('randomize').addEventListener('click', () => {
            this.updateWeights();
        });

        // document.getElementById('switch_textbox').addEventListener('click', () => {
        //     this.
        // })

        // Replace the timeout-based resize handler with requestAnimationFrame
        let rafId;
        window.addEventListener('resize', () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                this.lines.forEach(line => {
                    if (line.updateIntersection) {
                        line.updateIntersection();
                    }
                    if (line.updateBoxPosition) {
                        line.updateBoxPosition();
                    }
                    if (line.updateOutputPosition) {
                        line.updateOutputPosition();
                    }
                    line.position();
                });
            });
        });

        // let timeout;
        // window.addEventListener('resize', () => {
        //     clearTimeout(timeout);
        //     timeout = setTimeout(() => this.updateLines(), 100);
        // });
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
            const calculateIntersection = () => {
                const circleRect = perceptron.getBoundingClientRect();
                const radius = circleRect.width / 2;

                const circleCenter = {
                    x: circleRect.left + circleRect.width / 2,
                    y: circleRect.top + circleRect.height / 2,
                };

                const inputRect = input.getBoundingClientRect();
                const inputCenter = {
                    x: inputRect.left + inputRect.width / 2,
                    y: inputRect.top + inputRect.height / 2,
                };

                const dx = inputCenter.x - circleCenter.x;
                const dy = inputCenter.y - circleCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                return {
                    x: `${((circleCenter.x + (dx / distance) * radius - circleRect.left) / circleRect.width) * 100}%`,
                    y: `${((circleCenter.y + (dy / distance) * radius - circleRect.top) / circleRect.height) * 100}%`
                };
            };

            const line = new LeaderLine(
                input,
                LeaderLine.pointAnchor(perceptron, calculateIntersection()),
                {
                    color: '#333',
                    size: 2,
                    startSocket: 'right',
                    endSocket: 'left', //left
                    path: 'straight',
                    startSocketGravity: 50,
                    endSocketGravity: 50,
                    endPlug: 'arrow1',
                    zIndex: 1 // Add lower z-index for the line
                }
            );

            // Store the update function with the line
            line.updateIntersection = () => {
                const newIntersection = calculateIntersection();
                line.end = LeaderLine.pointAnchor(perceptron, newIntersection);
            };
    
            const weight = this.weights[index];
            const initialColor = weight < 0 ? 'red' : (weight > 0 ? '#333' : 'blue');
            const initialThickness = Math.abs(weight) <= 0.5 ? 2 : 3;

            line.setOptions({
                color: initialColor,
                size: initialThickness
            });

            // create a div to hold the editable weights box and w= text label
            const weightContainer = document.createElement('div');
            weightContainer.style.display = 'flex';
            weightContainer.style.alignItems = 'center';
            weightContainer.style.position = 'absolute';
            weightContainer.style.pointerEvents = 'auto';

            //uneditable w= text label
            const label = document.createElement('span');
            //label.innerText = 'w=';
            label.innerHTML = `w<sub>${index + 1}</sub>=`;
            label.style.fontWeight = 'bold';
            label.style.fontSize = '14px';
            label.style.fontFamily = 'Arial';
            label.style.marginRight = '2px';
            label.style.position = 'relative';  // Add this to ensure proper positioning


            // creating the edit weights box
            const editableBox = document.createElement('div');
            editableBox.contentEditable = "true";
            editableBox.innerText = weight.toFixed(1); //`w=${weight.toFixed(1)}`;
            editableBox.style.fontSize = '14px';
            editableBox.style.fontFamily = 'Arial';
            editableBox.style.backgroundColor = 'white';
            editableBox.style.padding = '3px 6px';
            editableBox.style.border = '1px solid #ccc';
            editableBox.style.borderRadius = '4px';
            editableBox.style.minWidth = '50px';
            editableBox.style.position = 'absolute';
            editableBox.style.pointerEvents = 'auto'; // Make this element clickable
            editableBox.style.position = 'relative';  // Add this to ensure proper positioning

            // Add both elements (uneditable w= label and editableBox) to the container
            weightContainer.appendChild(label);
            weightContainer.appendChild(editableBox);
            this.labelContainer.appendChild(weightContainer);

            // Function to update the box position based on the line
            const updateBoxPosition = () => {
                const startPoint = input.getBoundingClientRect();
                const endPoint = perceptron.getBoundingClientRect();

                // calc the midpoint of the line
                const midX = (startPoint.left + startPoint.width/2 + endPoint.left + endPoint.width/2) / 2;
                
                // calc y position 30% down the line from start to end
                const startY = startPoint.top + startPoint.height/2;
                const endY = endPoint.top + endPoint.height/2;
                const midY = startY + (endY - startY) * 0.3;
                
                // calc the slope of the line
                const slope = (endY - startY) / (endPoint.left - startPoint.left);
                
                // calc offset based on slope magnitude
                const baseOffset = 20; // minimum offset
                const scalingFactor = 40; // how much to scale the offset by slope
                const maxOffset = 60; // maximum offset to prevent extreme values
                
                // calc scaled offset based on absolute slope value
                let yOffset = Math.min(baseOffset + Math.abs(slope) * scalingFactor, maxOffset);
                // offset is negative if slope >= 0 (shift up), positive if slope < 0 (shift down)
                yOffset = slope >= 0 ? -yOffset : yOffset;
                
                weightContainer.style.left = `${midX}px`;
                weightContainer.style.top = `${midY + yOffset}px`;
                weightContainer.style.transform = 'translate(-50%, -50%)';
            };

            // Initial position
            updateBoxPosition();

            // Store the update function with the line for later use
            line.updateBoxPosition = updateBoxPosition;

            // event listener to handle updates
            editableBox.addEventListener('input', (event) => {
                const newValue = parseFloat(event.target.innerText);
                if (!isNaN(newValue)) {
                    this.weights[index] = newValue; // Update the corresponding weight
                    
                    // Update line color based on weight value
                    let lineColor;
                    if (newValue < 0) {
                        lineColor = 'red';
                    } else if (newValue > 0) {
                        lineColor = '#333'; // black
                    } else {
                        lineColor = 'blue';
                    }
                    
                    // Linear scaling for line thickness
                    // Map weight magnitude to thickness range [1, 5
                    const minThickness = 1;
                    const maxThickness = 10;
                    // const maxWeight = 2; // Maximum expected weight magnitude
                    const thickness = Math.abs(newValue) === 0 ? 2 : minThickness + (Math.abs(newValue) * (maxThickness - minThickness))/5;
                    // const thickness = minThickness +
                    //     (Math.min(Math.abs(newValue), maxWeight) / maxWeight) * (maxThickness - minThickness);
                    
                    // Update the line's appearance
                    line.setOptions({
                        color: lineColor,
                        size: thickness
                    });
                }
            });

            // line.setOptions({
            //     middleLabel: LeaderLine.pathLabel({
            //         element: editableBox,
            //         // text: `w=${weight.toFixed(1)}`,
            //         // fontSize: '14px',
            //         // fontFamily: 'Arial',
            //         // backgroundColor: 'white',
            //         // padding: [3, 6]
            //     })
            // });
            // line.setOptions({
            //     middleLabel: LeaderLine.pathLabel({
            //         element: editableBox,
            //         zIndex: 10000 // Ensure the label has high z-index
            //     })
            // });

            // Also update positions when the leader line moves
            //setInterval(updateEditableBoxPosition, 100);

            this.lines.push(line);
        });
    
        // Draw output connection
        const outputLine = new LeaderLine(
            LeaderLine.pointAnchor(perceptron, {
                x: '100%',  // Start from right edge of circle
                y: '50%',   // Stay at vertical center
                intersectR: radius  // This makes the line stop at circle boundary
            }),
            output,
            {
                color: '#333',
                size: 3, // Changed from 2 to 3 to match input lines with weight 1.0
                startSocket: 'right',
                endSocket: 'left',
                path: 'straight',
                startSocketGravity: 50,
                endSocketGravity: 50,
                endPlug: 'arrow1',
                zIndex: 1  // Make sure this is lower than the circle's z-index
            }
        );

        // Function to update output position
        const updateOutputPosition = () => {
            const container = this.container;
            const containerRect = container.getBoundingClientRect();
            const circleRect = perceptron.getBoundingClientRect();
        };

        // Initial position
        updateOutputPosition();


        this.lines.push(outputLine);
    }
    updateLines() {
        this.lines.forEach(line => {
            line.position();
            if (line.updateBoxPosition) {
                line.updateBoxPosition();
            }
        });
    }

    removeExistingLines() {
        this.lines.forEach(line => line.remove());
        this.lines = [];
        this.labelContainer.innerHTML = ''; // Clear all labels
    }

    // updateLines() {
    //     this.lines.forEach(line => line.position());
    // }

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

        requestAnimationFrame(() => {
            this.lines.forEach(line => {
                if (line.updateOutputPosition) {
                    line.updateOutputPosition();
                }
            });
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