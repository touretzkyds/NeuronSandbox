document.addEventListener("DOMContentLoaded", function() {

    // let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    // let colorBars = document.getElementsByClassName("color-bar");
    // let sliderValueDisplays = document.getElementsByClassName("slider-value");
    //
    //
    // // var slider = document.getElementById("myRange");
    // // var colorBar = document.getElementById("colorBar");
    // // var sliderValueDisplay = document.getElementById("sliderValue");
    //
    // function updateSlider(slider, colorBar, sliderValueDisplay) {
    //     var value = parseFloat(slider.value);
    //     var percentage = Math.abs(value * 10); // Scale the percentage for 200-unit range
    //
    //     // Update color bar
    //     if (value >= 0) {
    //         colorBar.style.left = '50%';
    //         colorBar.style.right = (50 - percentage) + '%';
    //         colorBar.style.backgroundColor = value === 0 ? 'blue' : 'black'; // Black for positive, blue for zero
    //     } else {
    //         colorBar.style.right = '50%';
    //         colorBar.style.left = (50 - percentage) + '%';
    //         colorBar.style.backgroundColor = 'red'; // Red for negative
    //     }
    //
    //     // Update slider value and color
    //     sliderValueDisplay.textContent = value;
    //     sliderValueDisplay.style.color = value === 0 ? 'blue' : (value > 0 ? 'black' : 'red');
    //
    //     // Calculate the position for the value display
    //     var sliderWidth = slider.offsetWidth;
    //     var newLeft = ((10 * value + 50) / 100) * sliderWidth;
    //     if (value > 0) {
    //         newLeft = ((10 * value + 40) / 100) * sliderWidth;
    //     }
    //     sliderValueDisplay.style.left = newLeft + 'px';
    // }
    //
    //
    // for (let i = 0; i < sliders.length; i++) {
    //     updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]); // Initial setup
    //     sliders[i].oninput = function() {
    //         updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);
    //     };
    // }
    //
    // function updateAllSliders() {
    //     let sliders = document.getElementsByClassName("slider-plotly"); // gets all sliders
    //     let colorBars = document.getElementsByClassName("color-bar");
    //     let sliderValueDisplays = document.getElementsByClassName("slider-value");
    //
    //     for (let i = 0; i < sliders.length; i++) {
    //         updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]); // Initial setup
    //         sliders[i].oninput = function() {
    //             updateSlider(sliders[i], colorBars[i], sliderValueDisplays[i]);
    //         };
    //     }
    // }



});
;
