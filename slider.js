export default function updateSlider(event, slider){
    const bounds = slider.getBoundingClientRect();

    let yPos = event.clientY - bounds.top;
    yPos = Math.max(0, Math.min(yPos, bounds.height)); //0 is top of screen, min of yPos and bounds.height is either position of finger, or bottom of slider

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const step = parseFloat(slider.step);

    let value = min + ((1 - yPos/bounds.height) * (max - min));

    slider.value = value;
}