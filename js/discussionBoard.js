window.addEventListener('DOMContentLoaded', function () {
    adjustColouredLayerHeight();
    window.addEventListener('resize', adjustColouredLayerHeight);
});

function adjustColouredLayerHeight() {
    const colouredLayer = document.querySelector('.coloured-layer');
    const verticalRectangularContainer = document.querySelector('.vertical-rectangular-container');
    const verticalRectangularBoxes = document.querySelectorAll('.vertical-rectangular-box');

    // Calculate the total height of the vertical rectangular boxes
    const totalVerticalRectangularBoxesHeight = Array.from(verticalRectangularBoxes).reduce((acc, box) => acc + box.offsetHeight, 0);

    // Calculate the height of the content area including the top and bottom margin of the vertical rectangular container
    const contentHeight = verticalRectangularContainer.offsetTop + verticalRectangularContainer.offsetHeight;

    // Set the height of the coloured layer to cover the entire content
    colouredLayer.style.height = `${contentHeight}px`;
}
